import { model, Schema } from 'mongoose';

import { IListing, TypeOfListing } from '../types/Listing';
import { CurrencyCode } from '../utils/currency';
import { ListingStatus } from '../utils/models/listing.utils';

const ListingSchema = new Schema<IListing>({
  uuid: { type: String, required: true },
  buyer: {
    type: Schema.Types.ObjectId,
    ref: 'Buyer',
    required: true,
  },
  name: { type: String, required: true },
  slug: { type: String, required: true },
  region: { type: String, required: true },
  departmentCode: { type: String, required: true },
  businessUnit: { type: String, required: true },
  currency: {
    type: String,
    enum: CurrencyCode,
    default: CurrencyCode.INR,
  },
  startDate: { type: Date, required: true },
  startTime: {
    type: String,
    required: true,
  },
  duration: {
    type: String,
    validate: {
      validator: function (v) {
        if (!v) {
          return true;
        }
        return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: (props) => `${props.value} is not valid time!`,
    },
  },
  description: { type: String, required: false },
  typesOfListing: {
    type: String,
    enum: TypeOfListing,
    default: TypeOfListing.CLASSIC,
  },
  projectOwner: { type: String, required: false },
  mobileNumber: { type: Number, required: false },
  contractDuration: { type: String, required: false },
  bidDecrementPercentage: { type: Number, required: true },
  status: {
    type: String,
    enum: Object.values(ListingStatus),
    default: ListingStatus.UPCOMING,
  },
  rules: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Rule',
      required: true,
    },
  ],
  requiresSupplierLogin: { type: Boolean, required: true, default: false },
  suppliers: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Supplier',
      required: true,
    },
  ],
  lots: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Lot',
      required: true,
    },
  ],
  activeLot: {
    type: Schema.Types.ObjectId,
    ref: 'Lot',
    required: true,
  },
  activeLotEndTime: { type: Date, required: true },
  nextLot: {
    type: Schema.Types.ObjectId,
    ref: 'Lot',
    required: false,
  },
});

export const ListingModel = model('Listing', ListingSchema);
