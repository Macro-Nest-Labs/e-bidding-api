import dayjs from 'dayjs';
import { Types } from 'mongoose';
import { Namespace, Server, Socket } from 'socket.io';

import { auctionQueue } from '../../cron';
import BidModel from '../../models/bid';
import { ListingModel } from '../../models/listing';
import redisService from '../../services/redis-service';
import { log } from '../../utils/console';
import { validateBid } from '../../utils/models/bid.utils';
import { SOCKET_EVENTS } from '../../utils/socket-events';
import { roomMembers, socketToUserMap } from '../socket.controller';
import { ISupplier } from '../../types/Supplier';
import { SupplierModel } from '../../models/supplier';

let auctionNamespaceInstance: Namespace | null = null;

const auctionNamespace = (io: Server): Namespace => {
  const namespace = io.of('/auction');
  auctionNamespaceInstance = namespace;

  namespace.on('connection', (socket: Socket) => {
    log('[SOCK] Client connected to auction', 'MAGENTA');

    socket.on('disconnecting', async () => {
      for (const room of socket.rooms) {
        if (room !== socket.id) {
          redisService.publishToChannel('roomUpdates', { action: 'leave', roomId: room, socketId: socket.id });
        }
        if (roomMembers.has(room)) {
          roomMembers.get(room).delete(socket.id);
          if (roomMembers.get(room).size === 0) {
            roomMembers.delete(room);
          }
        }
      }
    });

    // Request current users
    socket.on(SOCKET_EVENTS.REQUEST_CURRENT_USERS, async (roomId: string) => {
      // Logic to get all connected users in the room
      const usersInRoom: Set<string> = roomMembers.get(roomId) || new Set();
      const userPromises: Promise<ISupplier | undefined>[] = [];

      for (const socketId of usersInRoom) {
        const supplierId = socketToUserMap.get(socketId);
        log(`[SOCK] socketId=[${socketId}] userId=[${supplierId}]`, 'YELLOW');
        // Fetch user record
        const userPromise = SupplierModel.findById(supplierId).exec();
        userPromises.push(userPromise);
      }

      const users = await Promise.all(userPromises);
      const validUsers = users.filter((user): user is ISupplier => user !== undefined);

      log(`[SOCK] Users ${validUsers}`, 'YELLOW');

      socket.emit('current-users', { users: validUsers });
    });

    // ---- Join Room ----
    socket.on(SOCKET_EVENTS.JOIN_ROOM, async (roomId: Types.ObjectId, userId: Types.ObjectId, isBuyer?: Types.ObjectId) => {
      log('[SOCK] Attempting to join room', 'MAGENTA');
      try {
        const listing = await ListingModel.findById(roomId).populate(['suppliers', 'buyer']);

        if (!listing) {
          log('[SOCK] Listing not found', 'RED');
          socket.emit(SOCKET_EVENTS.JOIN_ERROR, 'Listing not found');
          return;
        }

        // Check if current time is before the listing start time
        if (dayjs().isBefore(dayjs(listing.startDate))) {
          log('[SOCK] Auction has not started yet', 'RED');
          socket.emit(SOCKET_EVENTS.JOIN_ERROR, 'Auction has not started yet');
          return;
        }

        if (isBuyer) {
          // Check if buyer is allowed to join this listing
          const isBuyerAllowed = listing.buyer._id.toString() === userId.toString();
          if (!isBuyerAllowed) {
            log(`[SOCK] Buyer id=${userId} is not allowed to join this auction`, 'RED');
            socket.emit(SOCKET_EVENTS.JOIN_ERROR, 'You are not allowed to join this auction');
            return;
          }
        } else {
          // Check if supplier is allowed to join this listing
          const isSupplierAllowed = listing.suppliers.some((supplier) => supplier._id.toString() === userId.toString());
          if (!isSupplierAllowed) {
            log(`[SOCK] Supplier id=${userId} is not allowed to join this auction`, 'RED');
            socket.emit(SOCKET_EVENTS.JOIN_ERROR, 'You are not allowed to join this auction');
            return;
          }
        }

        // If all checks passed, join the room
        socket.join(roomId.toString());
        log(`[SOCK] userId=${userId} isBuyer=${isBuyer} joined room=${roomId}`);
        socket.emit(SOCKET_EVENTS.JOINED_ROOM, roomId); // Notify of successful join

        // Publish room join event to Redis
        redisService.publishToChannel('roomUpdates', {
          action: 'join',
          roomId,
          userId,
          socketId: socket.id,
          isBuyer: isBuyer ? true : false,
        });
      } catch (error) {
        socket.emit(SOCKET_EVENTS.JOIN_ERROR, 'Failed to join room');
      }
    });

    // ---- Bid ----
    socket.on(
      SOCKET_EVENTS.BID,
      async (data: { roomId: Types.ObjectId; lotId: Types.ObjectId; supplierId: Types.ObjectId; amount: number }) => {
        log('[SOCK] Creating new bid', 'MAGENTA');
        try {
          const listing = await ListingModel.findById(data.roomId);
          if (!listing) {
            socket.emit(SOCKET_EVENTS.BID_ERROR, 'Listing not found');
            return;
          }

          // Validate the bid
          const { isValid, errors } = await validateBid(data.lotId, data.supplierId, data.amount);

          if (!isValid) {
            socket.emit(SOCKET_EVENTS.BID_ERROR, errors);
            return;
          }

          // Check if bid is placed in the last 3 minutes of the lot's end time
          const now = dayjs().tz('Asia/Kolkata');
          const timeLeft = dayjs(listing.activeLotEndTime).tz('Asia/Kolkata').diff(now, 'minute');

          if (timeLeft < 3) {
            // Extend the auction by 5 minutes
            const newEndTime = dayjs(listing.activeLotEndTime).tz('Asia/Kolkata').add(5, 'minute');
            listing.activeLotEndTime = newEndTime.toDate();
            log(`Auction extended listingId=${listing.id}`, 'YELLOW');

            const jobId = `transition-${listing._id}-${data.lotId}`;
            await auctionQueue.removeJobs(jobId);

            await auctionQueue.add(
              {
                listingId: listing._id.toString(),
                lotId: data.lotId.toString(),
                action: 'transitionToNextLot',
              },
              {
                delay: newEndTime.diff(now),
                jobId: jobId,
              },
            );

            // Notify clients about the auction extension
            namespace.to(data.roomId.toString()).emit(SOCKET_EVENTS.AUCTION_EXTENDED, {
              newEndTime: newEndTime.toDate(),
              serverTime: dayjs().tz('Asia/Kolkata').toDate(),
            });
            log(`Auction extend event emitted to room+${listing.id}`, 'MAGENTA');
          }

          // Handle the bid normally if not in the last 3 minutes
          const newBid = new BidModel({
            lot: data.lotId,
            supplier: data.supplierId,
            amount: data.amount,
          });

          await newBid.save();
          await newBid.populate('supplier');
          await listing.save();

          // Broadcast the new bid to all clients in the room
          namespace.to(data.roomId.toString()).emit(SOCKET_EVENTS.NEW_BID, newBid);
        } catch (error) {
          socket.emit(SOCKET_EVENTS.BID_ERROR, 'Failed to place bid');
          log('Error placing bid:', error);
        }
      },
    );

    // TODO: Add more auction related events here
  });

  return namespace;
};

export { auctionNamespace, auctionNamespaceInstance };
