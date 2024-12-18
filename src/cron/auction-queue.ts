import Bull from 'bull';
import { Types } from 'mongoose';

import { config } from '../config';
import { log } from '../utils/console';
import { startAuction, transitionToNextLot } from '../utils/models/auction.utils';

export const auctionQueue = new Bull('auctionQueue', {
  redis: config.REDIS_URL,
});

auctionQueue.process(async (job) => {
  const { action, listingId } = job.data;
  switch (action) {
    case 'transitionToNextLot':
      await transitionToNextLot(new Types.ObjectId(listingId));
      break;
    case 'startAuction':
      await startAuction(new Types.ObjectId(listingId));
      break;
    // handle other actions...
    default:
      throw new Error(`Unhandled action: ${action}`);
  }
});

auctionQueue.on('ready', () => {
  log('Connected to Redis!', 'GREEN');
});

auctionQueue.on('error', (err) => {
  console.error('Redis connection error:', err);
});

auctionQueue.on('failed', (job, _err) => {
  console.error(`Job failed for listing ${job.data.listingId}`);
});
