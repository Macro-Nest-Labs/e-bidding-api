import { model, Schema } from 'mongoose';

import { ILotItem } from '../types/LotItem';

const LotItemSchema = new Schema<ILotItem>({
  qty: { type: Number, required: true },
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  uom: {
    type: String,
    required: true,
  },
});

export const LotItemModel = model('LotItem', LotItemSchema);
