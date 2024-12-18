import { model, Schema } from 'mongoose';

import { ILot } from '../types/Lot';
import { LotStatus } from '../utils/models/lot.utils';

const LotSchema = new Schema<ILot>({
  lotItems: [
    {
      type: Schema.Types.ObjectId,
      ref: 'LotItem',
      required: true,
    },
  ],
  lotPrice: { type: Number, required: true },
  category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  duration: {
    type: String,
    required: true,
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
  startTime: { type: Date, required: false },
  status: {
    type: String,
    enum: Object.values(LotStatus),
    default: LotStatus.PENDING,
  },
});

export const LotModel = model('Lot', LotSchema);
