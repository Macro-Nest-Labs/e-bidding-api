import { Types } from 'mongoose';
import { LotStatus } from '../utils/models/lot.utils';

export interface ILot {
  lotItems: Types.ObjectId[];
  lotPrice: number;
  category: Types.ObjectId;
  status: LotStatus;
  startTime: Date;
  duration: string;
}

export interface ILotCreateRequestBody {
  lotItems: Types.ObjectId[];
  lotPrice: number;
  category: Types.ObjectId;
  status: LotStatus;
  startTime?: Date;
  duration: string;
}

export interface ILotRequestParams {
  id: string;
}

export interface ILotUpdateRequestBody {
  lotItems?: Types.ObjectId[];
  lotPrice?: number;
  category?: Types.ObjectId;
}
