import { Types } from 'mongoose';

import BidModel from '../../models/bid';
import { ListingModel } from '../../models/listing';
import { ListingInviteModel } from '../../models/listing-invite';
import { LotModel } from '../../models/lot';

export const validateBid = async (lotId: Types.ObjectId, supplier: Types.ObjectId, amount: number) => {
  const errors = [];

  const lot = await LotModel.findById(lotId);
  if (!lot) {
    errors.push('Lot not found.');
    return { isValid: false, errors };
  }

  // Find the listing associated with the lot
  const listing = await ListingModel.findOne({ lots: lotId });
  if (!listing) {
    errors.push('Associated listing not found.');
    return { isValid: false, errors };
  }
  const listingId = listing._id;

  // Pre-bid logic
  if (listing.status === 'Upcoming') {
    const existingBid = await BidModel.findOne({ lot: lotId, supplier: supplier });
    if (existingBid) {
      errors.push('You have already placed a pre-bid. Please wait for the auction to start.');
      return { isValid: false, errors };
    }
  }

  // Check if the listing is in progress
  if (!(listing.status === 'In Progress' || listing.status === 'Upcoming')) {
    errors.push('The auction has not started or has already ended.');
    return { isValid: false, errors };
  }

  // Check if the lot is the active lot in the listing
  if (!listing.activeLot.equals(lotId)) {
    errors.push('This lot is not currently active for bidding.');
    return { isValid: false, errors };
  }

  const invite = await ListingInviteModel.findOne({
    supplier: supplier,
    listing: listingId,
    accepted: true,
  });

  if (!invite) {
    errors.push('Supplier has not accepted the listing invite.');
  }

  if (amount <= 0) {
    errors.push('Bid amount must be greater than 0.');
  }

  if (amount >= lot.lotPrice) {
    errors.push('Bid amount must be less than the lot price.');
  }

  const lowestBid = await BidModel.find({ lot: lotId }).sort({ amount: 1 }).limit(1);

  // Check if the new bid is lower than the lowest bid
  if (lowestBid.length && amount == lowestBid[0].amount) {
    errors.push('Bid amount must be lower than the current lowest bid.');
  }

  // Find the previous bid made by the same supplier for this lot
  const previousBid = await BidModel.findOne({
    lot: lotId,
    supplier: supplier,
  }).sort({ createdAt: -1 }); // Sort by creation time in descending order to get the most recent bid

  if (previousBid && amount >= previousBid.amount) {
    errors.push('Bid amount must be lower than your previous bid.');
  }

  if (previousBid) {
    // Calculate the minimum allowed bid based on the decrement percentage
    const decrementAmount = Math.ceil(previousBid.amount * (listing.bidDecrementPercentage / 100));
    const minAllowedBid = previousBid.amount - decrementAmount;

    if (amount >= minAllowedBid) {
      errors.push(`Bid amount must be at least ${listing.bidDecrementPercentage}% less than the current bid.`);
    }
  }

  return { isValid: errors.length === 0, errors };
};
