import { Types } from 'mongoose';

export enum AwardingDecision {
  ONE = 'one',
  TWO = 'two',
  MULTIPLE = 'multiple',
}

export interface ITermsAndConditions {
  lot: Types.ObjectId;
  priceBasis: string;
  taxesAndDuties: string;
  delivery: string;
  paymentTerms: string;
  warrantyGurantee: string;
  inspectionRequired: boolean;
  otherTerms: string;
  awardingDecision: AwardingDecision;
}

export interface ITermsAndConditionsCreateRequestBody {
  lot: Types.ObjectId;
  priceBasis: string;
  taxesAndDuties: string;
  delivery: string;
  paymentTerms: string;
  warrantyGurantee: string;
  inspectionRequired: boolean;
  otherTerms: string;
  awardingDecision: AwardingDecision;
}

export interface ITermsAndConditionsUpdateRequestBody {
  lot?: Types.ObjectId;
  priceBasis?: string;
  taxesAndDuties?: string;
  delivery?: string;
  paymentTerms?: string;
  warrantyGurantee?: string;
  inspectionRequired?: boolean;
  otherTerms?: string;
  awardingDecision?: AwardingDecision;
}

export interface ITermsAndConditionsRequestParams {
  id: string;
}
