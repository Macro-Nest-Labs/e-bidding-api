import { Types } from 'mongoose';

export interface IBid {
  supplier: Types.ObjectId;
  lot: Types.ObjectId;
  amount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBidCreateRequestBody {
  supplier: Types.ObjectId;
  lot: Types.ObjectId;
  amount: number;
}

export interface IBidUpdateRequestBody {
  supplier?: Types.ObjectId;
  lot?: Types.ObjectId;
  amount?: number;
}

export interface IBidRequestParams {
  id: string;
}

export interface IBidByLotRequestParams {
  lotId: Types.ObjectId;
}
