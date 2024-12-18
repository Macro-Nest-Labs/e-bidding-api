import { Document } from 'mongoose';

export interface IBuyer extends Document {
  uuid: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface IBuyerCreateRequestBody {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface IBuyerUpdateRequestBody {
  firstName?: string;
  lastName?: string;
}

export interface IBuyerRequestParams {
  id?: string;
}
