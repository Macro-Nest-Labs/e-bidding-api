import { model, Schema } from 'mongoose';

import { IListingInvite } from '../types/ListingInvite';

const ListingInviteSchema = new Schema<IListingInvite>({
  listing: { type: Schema.Types.ObjectId, ref: 'Listing', required: true },
  supplier: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Supplier',
      required: true,
    },
  ],
  email: { type: String, required: true },
  inviteToken: { type: String, required: true },
  accepted: { type: Boolean, default: false },
});

export const ListingInviteModel = model('ListingInvite', ListingInviteSchema);
