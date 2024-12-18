import { model, Schema } from 'mongoose';

import { IBuyer } from '../types/Buyer';

const BuyerSchema: Schema<IBuyer> = new Schema<IBuyer>({
  uuid: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
});

export const BuyerModel = model<IBuyer>('Buyer', BuyerSchema);
