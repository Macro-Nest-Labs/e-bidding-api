import redis from '../redis-config';
import { auctionNamespaceInstance } from '../socket/auction-namespace';
import { roomMembers, socketToUserMap } from '../socket/socket.controller';
import { TRoomUpdateData } from '../types/RedisServiceMessage';
import { SOCKET_EVENTS } from '../utils/socket-events';

const redisSubscriber = redis.duplicate();

class RedisService {
  constructor() {
    this.subscribeToChannels();
  }

  subscribeToChannels() {
    redisSubscriber.subscribe('roomUpdates');
    redisSubscriber.on('message', this.handleMessage);
  }

  handleMessage(channel: string, message: string) {
    // Implement your logic to handle messages from the subscribed channel
    if (channel === 'roomUpdates') {
      const data: TRoomUpdateData = JSON.parse(message);

      switch (data.action) {
        case 'join':
          socketToUserMap.set(data.socketId, data.userId);
          if (!data.isBuyer) {
            if (!roomMembers.has(data.roomId)) {
              roomMembers.set(data.roomId, new Set());
            }
            roomMembers.get(data.roomId).add(data.socketId);
            auctionNamespaceInstance.to(data.roomId).emit(SOCKET_EVENTS.CLIENT_CONNECT, { socketId: data.socketId, userId: data.userId });
          }
          break;
        case 'leave':
          auctionNamespaceInstance
            .to(data.roomId)
            .emit(SOCKET_EVENTS.CLIENT_DISCONNECT, { socketId: data.socketId, userId: socketToUserMap.get(data.socketId) });
          socketToUserMap.delete(data.socketId);
          break;
        default:
          console.error('Unknown action:', data);
      }
    }
  }

  publishToChannel(channel, message) {
    const messageString = JSON.stringify(message);
    redis.publish(channel, messageString);
  }
}

const redisService = new RedisService();

export default redisService;
