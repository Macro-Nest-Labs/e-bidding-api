import { Router } from 'express';

import { createBid, deleteBid, deleteBidsByLot, getAllBids, getBidDetails, getBidsByLot, updateBid } from '../controllers/bid.controller';

const bidRouter = Router();

// Create a new bid
bidRouter.post('/', createBid);
// Get all bids
bidRouter.get('/', getAllBids);
// Get bids by lot
bidRouter.get('/lot/:lotId', getBidsByLot);
// Get a single bid details by bid ID
bidRouter.get('/:id', getBidDetails);
// Update a bid
bidRouter.put('/:id', updateBid);
// Delete a bid
bidRouter.delete('/:id', deleteBid);
// Delete bids by lot
bidRouter.delete('/lot/:lotId', deleteBidsByLot);

export default bidRouter;
