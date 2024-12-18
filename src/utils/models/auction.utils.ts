import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { Types } from 'mongoose';

import BidModel from '../../models/bid';
import { ListingModel } from '../../models/listing';
import { SupplierModel } from '../../models/supplier';
import { TypeOfListing } from '../../types/Listing';
import { log } from '../console';
import { sendEmailToBuyer, sendEmailToSupplier } from '../email';
import { SOCKET_EVENTS } from '../socket-events';
import { ListingStatus } from './listing.utils';
import { calculateLotEndTime } from './lot.utils';
import { getAuctionStartTimeWithStartDate } from '../date';
import { auctionQueue } from '../../cron';
import { LotItemModel } from '../../models/lot-item';
import { auctionNamespaceInstance } from '../../socket/auction-namespace';

dayjs.extend(duration);
dayjs.extend(utc);
dayjs.extend(timezone);

export async function endAuction(roomId: Types.ObjectId) {
  log(`Attempting to close the auction for roomId=${roomId}`, 'CYAN');

  try {
    const listing = await ListingModel.findById(roomId).populate([
      'buyer',
      'rules',
      'suppliers',
      {
        path: 'lots',
        populate: {
          path: 'lotItems',
          model: 'LotItem',
          populate: {
            path: 'product',
            model: 'Product',
          },
        },
      },
    ]);
    if (!listing) {
      log(`Could not find the auction=${roomId} to close`, 'RED');
      return;
    }
    log(`Auction found for roomId=${roomId} slug=${listing.slug}`, 'GREEN');

    const auctionSummary = { lots: [] };

    // Perform end of auction logic, such as determining the winning bid
    if (listing.typesOfListing === TypeOfListing.CLASSIC) {
      for (const lot of listing.lots) {
        const bids = await BidModel.find({ lot: lot._id }).sort({ amount: 1 }); // Sort bids by amount in ascending order
        const lotSummary = {
          lotId: lot._id,
          lotItems: [], // Array to hold lot item details
          winningBid: null,
          winningSupplier: null,
        };

        if (bids.length > 0) {
          const winningBid = bids[0];
          const winningSupplier = await SupplierModel.findById(winningBid.supplier);
          if (winningSupplier) {
            lotSummary.winningBid = winningBid.amount;
            lotSummary.winningSupplier = `${winningSupplier.firstName} ${winningSupplier.lastName}`;
          }
        }

        // Populate lot item details
        // @ts-expect-error attrs present after populating the doc
        for (const itemId of lot.lotItems) {
          const item = await LotItemModel.findById(itemId).populate('product');
          if (item) {
            lotSummary.lotItems.push({
              // @ts-expect-error attrs present after populating the doc
              productName: item.product.name,
              qty: item.qty,
              uom: item.uom,
            });
          }
        }

        auctionSummary.lots.push(lotSummary);
      }

      // Send an email to all suppliers notifying the end of the auction
      for (const supplierId of listing.suppliers) {
        const supplier = await SupplierModel.findById(supplierId);
        if (supplier) {
          await sendEmailToSupplier(supplier, 'Auction Ended', listing.name);
          log(`Email sent to supplier ${supplier.firstName} ${supplier.lastName}`, 'BLUE');
        }
      }

      // Send a comprehensive summary of the auction to the buyer
      if (listing.buyer) {
        await sendEmailToBuyer(
          // @ts-expect-error attrs present after populating the doc
          listing.buyer,
          'Auction Summary',
          listing.name,
          auctionSummary,
        );
        log(
          // @ts-expect-error attrs present after populating the doc
          `Comprehensive auction summary sent to buyer ${listing.buyer.firstName} ${listing.buyer.lastName}`,
          'GREEN',
        );
      }
    }

    // Update the listing status to 'ended' in the database
    listing.status = ListingStatus.CLOSED;
    await listing.save();
    log(`Auction status updated to CLOSED for slug=${listing.slug}`, 'YELLOW');

    // Notify all clients in the room that the auction has ended
    auctionNamespaceInstance.to(roomId.toString()).emit(SOCKET_EVENTS.AUCTION_CLOSED, {
      listingId: listing._id,
      status: listing.status,
    });
    log(`[SOCK] Auction close event emitted to room=${roomId}`, 'MAGENTA');

    auctionNamespaceInstance.emit(SOCKET_EVENTS.AUCTION_CLOSED, {
      listingId: listing._id,
      status: listing.status,
    });
    log('[SOCK] Auction close event emitted to all in /auction namespace', 'MAGENTA');
  } catch (error) {
    log(`Error ending auction for roomId=${roomId}: ${error.message}`, 'RED');
    console.error(error);
  }
}

export async function reinitializeAuctionsOnServerStart() {
  log('Reinitializing all active auctions...', 'CYAN');
  try {
    const listings = await ListingModel.find({
      status: { $in: [ListingStatus.UPCOMING, ListingStatus.IN_PROGRESS] },
      startDate: { $lte: dayjs().tz('Asia/Kolkata').toDate() },
    }).populate('lots');

    listings.forEach(async (listing) => {
      const now = dayjs().tz('Asia/Kolkata');

      // Check if the active lot is still ongoing
      if (listing.activeLot && now.isBefore(listing.activeLotEndTime)) {
        const transitionJobId = `transition-${listing._id}-${listing.activeLot}`;
        const timeoutDuration = dayjs(listing.activeLotEndTime).diff(now);
        await auctionQueue.add(
          {
            listingId: listing._id.toString(),
            action: 'transitionToNextLot',
            lotId: listing.activeLot.toString(),
          },
          {
            delay: timeoutDuration,
            jobId: transitionJobId,
          },
        );
      } else {
        // If the current lot's time has passed or no active lot, check for next steps
        if (listing.nextLot) {
          await transitionToNextLot(listing._id);
        } else {
          // If no next lot, end the auction
          await endAuction(listing._id);
        }
      }

      if (listing.status === ListingStatus.UPCOMING) {
        const startJobId = `start-${listing._id}`;
        const startTime = getAuctionStartTimeWithStartDate(dayjs(listing.startDate).toISOString(), listing.startTime);
        const timeoutDuration = startTime.diff(now);
        await auctionQueue.add(
          {
            listingId: listing._id.toString(),
            action: 'startAuction',
          },
          {
            delay: timeoutDuration,
            jobId: startJobId,
          },
        );
      }
    });
  } catch (dbError) {
    console.error('Error fetching listings during server start:', dbError);
  }
}

/**
 * Transitions to the next lot in a listing auction. If the current lot is not
 * the last one in the listing, this function updates the auction to move to the
 * next lot, setting its start time and calculating its end time. If the current
 * lot is the last one, it marks the listing's auction status as closed.
 *
 * @param {Types.ObjectId} listingId - The unique identifier of the listing whose
 *                                      auction is in progress.
 * @param {Namespace} namespace - The auction namespace to emit the events.
 *
 * @throws Will throw an error if the listing cannot be found.
 *
 * Note: This function assumes that the listing model has a `lots` array with
 * each lot containing `_id`, and possibly `startTime`, and other relevant fields.
 * The `calculateNextLotStartTime` and `calculateLotEndTime` functions are used
 * to set the start time of the next lot and to calculate the end time of the
 * current lot, respectively. These functions should be implemented accordingly.
 *
 * @example
 * await transitionToNextLot(listingId, namespace);
 */
export async function transitionToNextLot(listingId: Types.ObjectId) {
  try {
    const listing = await ListingModel.findById(listingId).populate('lots');
    listing.status = ListingStatus.IN_PROGRESS;

    if (!listing) {
      console.error(`Listing.transitionToNextLot Listing with ID ${listingId} not found.`);
      return;
    }

    const currentLotIndex = listing.lots.findIndex((lot) => lot._id.equals(listing.activeLot));

    if (currentLotIndex < listing.lots.length - 1) {
      const nextLot = listing.lots[currentLotIndex + 1];

      // @ts-expect-error attrs present after populating the doc
      nextLot.startTime = calculateNextLotStartTime(dayjs(listing.activeLotEndTime).toDate());
      // @ts-expect-error attrs present after populating the doc
      await nextLot.save();

      // Update the listing with the next active lot and its end time
      listing.activeLot = nextLot._id;

      const nextLotEndTime = await calculateLotEndTime(nextLot._id);
      // @ts-expect-error attrs present after populating the doc
      listing.activeLotEndTime = nextLotEndTime;

      // Set timeout for the current lot
      const now = dayjs().tz('Asia/Kolkata');
      const timeoutDuration = nextLotEndTime.diff(now);
      const transitionJobId = `transition-${listing._id}-${nextLot._id}`;
      await auctionQueue.removeJobs(transitionJobId);
      await auctionQueue.add(
        {
          listingId: listing._id.toString(),
          lotId: nextLot._id.toString(),
          action: 'transitionToNextLot',
        },
        {
          delay: timeoutDuration,
          jobId: transitionJobId,
        },
      );

      await listing.save();

      // Notify the clients in the room about the lot transition
      auctionNamespaceInstance.to(listingId.toString()).emit(SOCKET_EVENTS.LOT_TRANSITION, {
        nextLotId: nextLot._id,
        // @ts-expect-error attrs present after populating the doc
        startTime: nextLot.startTime,
        endTime: nextLotEndTime,
      });
      log(`[SOCK] Auction lot-transition event emitted to room=${listingId} at ${dayjs().tz('Asia/Kolkata').format('HH:mm')}`, 'MAGENTA');
    } else {
      // No more lots, end the auction
      endAuction(listing.id);
    }
  } catch (error) {
    log(`Listing.transitionToNextLot listingId=${listingId}`, 'RED');
    console.error(`Error fetching listing with ID ${listingId}: `, error);
  }
}

function calculateNextLotStartTime(previousLotEndTime: Date) {
  return new Date(previousLotEndTime.getTime());
}

export async function startAuction(listingId: Types.ObjectId) {
  log(`Starting the auction listingId=${listingId}`, 'CYAN');
  try {
    const listing = await ListingModel.findById(listingId);

    if (!listing) {
      console.error(`Listing.transitionToNextLot Listing with ID ${listingId} not found.`);
      return;
    }

    listing.status = ListingStatus.IN_PROGRESS;

    // Notify the clients in the room about the lot transition
    auctionNamespaceInstance.to(listingId.toString()).emit(SOCKET_EVENTS.AUCTION_STARTED, {
      listingId: listingId,
    });
    log(`[SOCK] Started the auction listingId=${listingId}`, 'MAGENTA');

    listing.save();
  } catch (error) {
    log(`Listing.startAuction listingId=${listingId}`, 'RED');
    console.error(error);
  }
}
