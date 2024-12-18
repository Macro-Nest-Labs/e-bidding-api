import { Types } from 'mongoose';

import { CurrencyCode } from '../utils/currency';
import { ListingStatus } from '../utils/models/listing.utils';

export enum TypeOfListing {
  CLASSIC = 'classic',
}

export interface IListing {
  uuid: string;
  buyer: Types.ObjectId;
  name: string;
  slug: string;
  region: string;
  departmentCode: string;
  businessUnit: string;
  currency: CurrencyCode;
  startDate: Date;
  startTime: string;
  duration: string;
  description?: string;
  typesOfListing: TypeOfListing;
  projectOwner?: string;
  mobileNumber?: number;
  contractDuration?: string;
  bidDecrementPercentage: number;
  rules: Types.ObjectId[];
  requiresSupplierLogin: boolean;
  suppliers: Types.ObjectId[];
  lots: Types.ObjectId[];
  status: ListingStatus;
  activeLot: Types.ObjectId;
  activeLotEndTime: Date;
  activeLotEndTimeout: NodeJS.Timeout;
  startTimeTimeout: NodeJS.Timeout;
  nextLot: Types.ObjectId | null;
}

export interface IListingCreateRequestBody {
  listing: {
    buyer: Types.ObjectId;
    name: string;
    region: string;
    departmentCode: string;
    businessUnit: string;
    currency: CurrencyCode;
    startDate: Date;
    startTime: string;
    duration: string;
    description?: string;
    typesOfListing: TypeOfListing;
    projectOwner?: string;
    mobileNumber?: number;
    contractDuration?: number;
    bidDecrementPercentage: number;
    rules: Types.ObjectId[];
    requiresSupplierLogin: boolean;
    suppliers: Types.ObjectId[];
    status: ListingStatus;
  };
  lots: {
    category: Types.ObjectId;
    lotPrice: number;
    lotItems: {
      product: {
        name: string;
        description?: string;
      };
      qty: number;
      uom: string;
    }[];
  }[];
  TCData:{
    listing:Types.ObjectId;
    priceBasis:string;
    taxesAndDuties:string;
    delivery:string;
    paymentTerms:string;
    warrantyGurantee:string;
    inspectionRequired:boolean;
    otherTerms:string;
    awardingDecision:string;
  };

}

export interface IListingUpdateRequestBody {
  name?: string;
  region?: string;
  departmentCode?: string;
  businessUnit?: string;
  currency?: CurrencyCode;
  startDate?: Date;
  startTime?: string;
  duration?: string;
  description?: string;
  typesOfListing?: TypeOfListing;
  projectOwner?: string;
  mobileNumber?: number;
  contractDuration?: number;
  bidDecrementPercentage?: number;
  rules?: Types.ObjectId[];
  requiresSupplierLogin?: boolean;
  suppliers?: Types.ObjectId[];
  lots?: Types.ObjectId[];
  status?: ListingStatus;
}

export interface IListingRequestParams {
  slug: string;
}

export interface IListingMutateRequestParams {
  id: string;
}

export interface IListingsByBuyerRequestParams {
  buyerId: string;
}

export interface IListingsBySupplierRequestParams {
  supplierId: string;
}

export interface IListingsByStatusRequestQuery {
  status?: ListingStatus;
  buyer?: Types.ObjectId;
  supplier?: Types.ObjectId;
}
