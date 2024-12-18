import dayjs from 'dayjs';
import mongoose, { Schema } from 'mongoose';

import { IBid } from '../types/Bid';

const BidSchema = new Schema<IBid>(
  {
    supplier: { type: Schema.Types.ObjectId, required: true, ref: 'Supplier' },
    lot: { type: Schema.Types.ObjectId, required: true, ref: 'Lot' },
    amount: { type: Number, required: true },
  },
  {
    timestamps: true,
  },
);

const convertToIST = (date) => dayjs(date).tz('Asia/Kolkata').format();

BidSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.createdAt = convertToIST(ret.createdAt);
    ret.updatedAt = convertToIST(ret.updatedAt);
    return ret;
  },
});

BidSchema.set('toObject', {
  transform: (doc, ret) => {
    ret.createdAt = convertToIST(ret.createdAt);
    ret.updatedAt = convertToIST(ret.updatedAt);
    return ret;
  },
});

const BidModel = mongoose.model('Bid', BidSchema);

export default BidModel;
