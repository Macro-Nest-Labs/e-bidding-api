import { model, Schema } from 'mongoose';

import { IRule } from '../types/Rule';

const RuleSchema = new Schema<IRule>({
  uuid: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: false },
});

export const RuleModel = model('Rule', RuleSchema);
