import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

import BidModel from '../../models/bid';
import { ListingInviteModel } from '../../models/listing-invite';
import { LotModel } from '../../models/lot';
import { LotItemModel } from '../../models/lot-item';

dayjs.extend(utc);
dayjs.extend(timezone);

export enum ListingStatus {
  UPCOMING = 'Upcoming',
  IN_PROGRESS = 'In Progress',
  CLOSED = 'Closed',
}

export async function deleteRelatedBids(listingId: string) {
  const lots = await LotModel.find({ listing: listingId }).select('_id');
  await BidModel.deleteMany({ lot: { $in: lots.map((lot) => lot._id) } });
}

export async function deleteRelatedLotItemsAndLots(listingId: string) {
  const lots = await LotModel.find({ listing: listingId }).select('_id');
  for (const lot of lots) {
    await LotItemModel.deleteMany({ lot: lot._id });
  }
  await LotModel.deleteMany({ _id: { $in: lots.map((lot) => lot._id) } });
}

export async function deleteRelatedListingInvites(listingId: string) {
  await ListingInviteModel.deleteMany({ listing: listingId });
}
