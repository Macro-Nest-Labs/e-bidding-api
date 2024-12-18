import { Router } from 'express';

import {
  createLotItem,
  deleteLotItem,
  deleteLotItemsByLotId,
  getAllLotItems,
  getLotItemDetails,
  updateLotItem,
} from '../controllers/lot-item.controller';

const lotItemRouter = Router();

// Get all lot-items
lotItemRouter.get('/', getAllLotItems);
// Create lot-item
lotItemRouter.post('/', createLotItem);
// Get lot-items details
lotItemRouter.get('/:id', getLotItemDetails);
// Update lot-item
lotItemRouter.put('/:id', updateLotItem);
// Delete lot-item
lotItemRouter.delete('/:id', deleteLotItem);
// Route to delete all lot items by Lot ID
lotItemRouter.delete('/lot/:lotId', deleteLotItemsByLotId);

export default lotItemRouter;
