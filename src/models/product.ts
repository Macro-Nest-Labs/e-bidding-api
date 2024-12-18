import { model, Schema } from 'mongoose';

import { IProduct } from '../types/Product';

const ProductSchema = new Schema<IProduct>({
  uuid: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: false },
});

export const ProductModel = model('Product', ProductSchema);
