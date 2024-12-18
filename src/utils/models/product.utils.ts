import { ClientSession, Document, Types } from 'mongoose';

import { ProductModel } from '../../models/product';
import { IProduct, IProductCreateRequestBody } from '../../types/Product';
import { log } from '../console';
import { sanitize } from '../stringUtils';
import { uuidFromString } from '../uuid';

export async function generateProduct(
  productData: IProductCreateRequestBody,
  session?: ClientSession,
): Promise<
  Document<unknown, NonNullable<unknown>, IProduct> &
    IProduct & {
      _id: Types.ObjectId;
    }
> {
  const sanitizedName = sanitize(productData.name);
  const uuid = uuidFromString(ProductModel.name, sanitizedName);

  try {
    const existingProduct = await ProductModel.findOne({ uuid: uuid });

    if (existingProduct) {
      log(`Product uuid=${uuid} name=${productData.name} already exists`);
      return existingProduct;
    }

    const product = new ProductModel({
      ...productData,
      uuid,
    });

    await product.save({ session: session });
    return product;
  } catch (error) {
    throw new Error(`Error creating product: ${error.message}`);
  }
}
