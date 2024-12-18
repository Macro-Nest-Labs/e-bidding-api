import { Router } from 'express';

import { createRule, deleteRule, getAllRules, getRuleDetails, updateRule } from '../controllers/rule.controller';

const ruleRouter = Router();

// Create Rule
ruleRouter.post('/', createRule);
// Get All Rules
ruleRouter.get('/', getAllRules);
// Get rule by id
ruleRouter.get('/:id', getRuleDetails);
// Update rule by id
ruleRouter.put('/:id', updateRule);
// Delete rule by id
ruleRouter.delete('/:id', deleteRule);

export default ruleRouter;
