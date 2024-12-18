import { model, Schema } from 'mongoose';

import { ISupplier } from '../types/Supplier';
import { State } from '../utils/state-city-mapping-complete';

const SupplierSchema = new Schema<ISupplier>({
  uuid: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  address: { type: String },
  state: { type: String, enum: Object.values(State), required: false },
  city: { type: String, required: false },
  vendorCode: { type: String, required: false },
});

export const SupplierModel = model('Supplier', SupplierSchema);
