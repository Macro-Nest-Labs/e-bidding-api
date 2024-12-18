import { Router } from 'express';

import {
  createBuyer,
  deleteBuyer,
  getAllBuyers,
  getBuyerDetails,
  getBuyerDetailsByEmail,
  updateBuyer,
} from '../controllers/buyer.controller';

const buyerRouter = Router();

// Create buyer
buyerRouter.post('/', createBuyer);
// Get all buyers
buyerRouter.get('/', getAllBuyers);
// Get buyer by id
buyerRouter.get('/:id', getBuyerDetails);
// Get buyer details by email
buyerRouter.get('/email/:email', getBuyerDetailsByEmail);
// Update buyer by id
buyerRouter.put('/:id', updateBuyer);
// Delete buyer by id
buyerRouter.delete('/:id', deleteBuyer);

export default buyerRouter;
