import { Router } from 'express';

import {
  acceptListingInvite,
  createListingInvite,
  deleteAllListingInvites,
  deleteListingInvite,
  getAllListingInvites,
  getListingInviteDetails,
  getListingInviteDetailsByListing,
  updateListingInvite,
} from '../controllers/listing-invite.controller';

const listingInviteRouter = Router();

// Get all listing invites
listingInviteRouter.get('/', getAllListingInvites);

// Get listing invite details
listingInviteRouter.get('/:id', getListingInviteDetails);

// Get listing invite details by listing ID
listingInviteRouter.get('/listing/:listingId', getListingInviteDetailsByListing);

// Create a new listing invite
listingInviteRouter.post('/', createListingInvite);

// Update an existing listing invite
listingInviteRouter.put('/:id', updateListingInvite);

// Delete a listing invite
listingInviteRouter.delete('/:id', deleteListingInvite);

// Delete all invites
listingInviteRouter.delete('/', deleteAllListingInvites);

// Accept a listing invite
listingInviteRouter.get('/accept/:token', acceptListingInvite);

export default listingInviteRouter;
