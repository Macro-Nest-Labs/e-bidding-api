import { Types } from 'mongoose';

export interface ILotItem {
  product: Types.ObjectId;
  qty: number;
  uom: string;
}

export interface ILotItemCreateRequestBody {
  product: Types.ObjectId;
  qty: number;
  uom: string;
}

export interface ILotItemRequestParams {
  id: string;
}

export interface ILotItemDeleteByLotRequestParams {
  lotId: string;
}

export interface ILotItemUpdateRequestBody {
  product?: Types.ObjectId;
  qty?: number;
  uom?: string;
}
