import { Types } from 'mongoose';

export interface IListingInvite {
  listing: Types.ObjectId;
  supplier: Types.ObjectId;
  email: string;
  inviteToken: string;
  accepted: boolean;
}

export interface IListingInviteCreateRequestBody {
  listing: Types.ObjectId;
  supplier: Types.ObjectId;
  email: string;
  accepted?: boolean;
}

export interface IListingInviteUpdateRequestBody {
  listing?: Types.ObjectId;
  supplier?: Types.ObjectId;
  email?: string;
  accepted?: boolean;
}

export interface IListingInviteRequestParams {
  id: string;
}
