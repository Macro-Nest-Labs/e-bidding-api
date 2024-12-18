import { Router } from 'express';
import { getAllLots,getLotDetails,createLot,updateLot,deleteLot } from '../controllers/lot.controller';

const lotRouter = Router();

// Get all lots
lotRouter.get('/',getAllLots);
// Get lot details
lotRouter.get('/:id',getLotDetails);
// Create lot
lotRouter.post('/',createLot);
// Update lot
lotRouter.put('/:id',updateLot);
// Delete lot
lotRouter.delete('/:id',deleteLot);

export default lotRouter;