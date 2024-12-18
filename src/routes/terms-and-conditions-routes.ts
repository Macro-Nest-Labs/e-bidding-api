import { Router } from 'express';

import {
  createTermsAndConditions,
  deleteTermsAndConditions,
  getAllTermsAndConditions,
  getTermsAndConditionsDetails,
  updateTermsAndConditions,
} from '../controllers/terms-and-conditions.controller';

const termsAndConditionsRouter = Router();

// Get all lots
termsAndConditionsRouter.get('/', getAllTermsAndConditions);
// Get lot details
termsAndConditionsRouter.get('/:id', getTermsAndConditionsDetails);
// Create lot
termsAndConditionsRouter.post('/', createTermsAndConditions);
// Update lot
termsAndConditionsRouter.put('/:id', updateTermsAndConditions);
// Delete lot
termsAndConditionsRouter.delete('/:id', deleteTermsAndConditions);

export default termsAndConditionsRouter;
