import { model, Schema } from 'mongoose';

import { AwardingDecision } from '../types/TermsAndConditions';

const TermsAndConditionsSchema = new Schema({
  listing: { type: Schema.Types.ObjectId, required: true, ref: "Listing" },
  priceBasis: { type: String, required: true },
  taxesAndDuties: { type: String, required: true },
  delivery: { type: String, required: true },
  paymentTerms: { type: String, required: true },
  warrantyGurantee: { type: String, required: true },
  inspectionRequired: { type: Boolean, required: true },
  otherTerms: { type: String, required: true },
  awardingDecision: {
    type: String,
    required: true,
    enum: Object.values(AwardingDecision),
  },
});

export const TermsAndConditionsModel = model('TermsAndConditions', TermsAndConditionsSchema);
