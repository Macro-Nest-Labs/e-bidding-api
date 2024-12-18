import { ClientSession } from 'mongoose';

import { LotItemModel } from '../../models/lot-item';
import { ILotItemCreateRequestBody } from '../../types/LotItem';

export async function generateLotItem(lotItemData: ILotItemCreateRequestBody, session?: ClientSession) {
  try {
    const lotItem = new LotItemModel(lotItemData);
    await lotItem.validate();
    await lotItem.save({ session: session });
    await lotItem.populate('product');

    return lotItem;
  } catch (error) {
    throw new Error(`Error creating lot item: ${error.message}`);
  }
}
