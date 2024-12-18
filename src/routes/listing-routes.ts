import { Router } from 'express';

import {
  createListing,
  deleteListing,
  generateAuctionReportPDF,
  getAllListings,
  getLisitingsByStatus,
  getListingDetails,
  getListingsByBuyer,
  getListingsForSupplierWithInvite,
  updateListing,
} from '../controllers/listing.controller';

const listingRouter = Router();

// Create Listing
listingRouter.post('/', createListing);
// Get all Listings
// This route will also handle filtering by status and buyerId if provided in query params
listingRouter.get('/', getLisitingsByStatus, getAllListings);
// Get all listings for a buyer
listingRouter.get('/buyer/:buyerId', getListingsByBuyer);
// Get all listings for a suplier with invites
listingRouter.get('/supplier/:supplierId', getListingsForSupplierWithInvite);
// Get Listing by id
listingRouter.get('/:slug', getListingDetails);
// Get PDF report for a listing
listingRouter.get('/:slug/report', generateAuctionReportPDF);
// Update Listing by id
listingRouter.put('/:id', updateListing);
// Delete Listing by id
listingRouter.delete('/:id', deleteListing);

export default listingRouter;
