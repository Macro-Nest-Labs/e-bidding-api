import { model, Schema } from 'mongoose';

import { ICategory } from '../types/Category';

const CategorySchema = new Schema<ICategory>({
  uuid: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
});

export const CategoryModel = model('Category', CategorySchema);
