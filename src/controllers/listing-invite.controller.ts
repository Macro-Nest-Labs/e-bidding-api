import { Request, Response } from 'express';

import { ListingInviteModel } from '../models/listing-invite';
import { IListingInviteCreateRequestBody, IListingInviteRequestParams, IListingInviteUpdateRequestBody } from '../types/ListingInvite';
import { log } from '../utils/console';
import { config } from '../config';

export const createListingInvite = async (
  req: Request<Record<string, never>, Record<string, never>, IListingInviteCreateRequestBody>,
  res: Response,
) => {
  log('Creating listing invite');
  log(`req.originalURL: ${req.originalUrl}`, 'CYAN');

  const body = req.body;

  try {
    const listingInvite = new ListingInviteModel(body);

    await listingInvite.validate();
    await listingInvite.save();

    const response = {
      data: listingInvite,
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('ListingInvite.create', error);
    res.status(500).json({ error: '[+] Error creating the listing invite.' });
  }
};

export const acceptListingInvite = async (req: Request, res: Response) => {
  const token = req.params.token;

  try {
    const invite = await ListingInviteModel.findOneAndUpdate({ inviteToken: token, accepted: false }, { accepted: true }, { new: true });

    if (!invite) {
      return res.status(404).json({ error: 'Invite not found or already accepted.' });
    }

    res.redirect(`${config.FRONTEND_URL}/auctions`);
  } catch (error) {
    console.error('Error accepting invite', error);
    res.status(500).json({ error: 'Error processing your request.' });
  }
};

export const getAllListingInvites = async (req: Request, res: Response) => {
  log('Getting all listing invites');
  log(`req.originalURL: ${req.originalUrl}`, 'CYAN');

  try {
    const listingInvites = await ListingInviteModel.find({}).populate(['listing', 'supplier']);
    const response = {
      data: listingInvites,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error(' ListingInvite.getAll', error);
    res.status(500).json({ error: '[+] Error getting all listing invites.' });
  }
};

export const getListingInviteDetails = async (req: Request<IListingInviteRequestParams>, res: Response) => {
  const id = req.params.id;

  log(`Getting listing invite details for id=[${id}]`);
  log(`req.originalURL: ${req.originalUrl}`, 'CYAN');

  try {
    const listingInvite = await ListingInviteModel.findById(id).populate(['listing', 'supplier']);
    if (!listingInvite) {
      return res.status(404).json({ error: 'Listing invite not found.' });
    }

    const response = {
      data: listingInvite,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error(` ListingInvite.get id=[${id}]`, error);
    res.status(500).json({ error: '[+] Error getting listing invite details.' });
  }
};

export const getListingInviteDetailsByListing = async (req: Request, res: Response) => {
  const listingId = req.params.listingId;

  log(`Getting listing invite details for listingId=[${listingId}]`);
  log(`req.originalURL: ${req.originalUrl}`, 'CYAN');

  try {
    const listingInvite = await ListingInviteModel.findOne({
      listing: listingId,
    }).populate(['listing', 'supplier']);

    if (!listingInvite) {
      return res.status(404).json({
        error: 'Listing invite for the specified listing ID not found.',
      });
    }

    const response = {
      data: listingInvite,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error(`ListingInvite.getByListingId listingId=[${listingId}]`, error);
    res.status(500).json({ error: '[+] Error getting listing invite by listing ID.' });
  }
};

export const updateListingInvite = async (
  req: Request<IListingInviteRequestParams, Record<string, never>, IListingInviteUpdateRequestBody>,
  res: Response,
) => {
  const id = req.params.id;
  const body = req.body;

  log(`Updating listing invite with id=[${id}]`);
  log(`req.originalURL: ${req.originalUrl}`, 'CYAN');

  try {
    const updatedListingInvite = await ListingInviteModel.findByIdAndUpdate(id, body, {
      new: true, // Return the updated document
      runValidators: true, // Run schema validation
    });

    if (!updatedListingInvite) {
      return res.status(404).json({ error: 'Listing invite not found.' });
    }

    const response = {
      data: updatedListingInvite,
    };

    res.status(200).json(response);
  } catch (error) {
    log(`Error updating listing invite: ${error.message}`);
    res.status(500).json({ error: 'Error updating the listing invite.' });
  }
};

export const deleteListingInvite = async (req: Request<IListingInviteRequestParams>, res: Response) => {
  const id = req.params.id;

  log(`Deleting listing invite with id=[${id}]`);
  log(`req.originalURL: ${req.originalUrl}`, 'CYAN');

  try {
    const existingListingInvite = await ListingInviteModel.findById(id);

    if (!existingListingInvite) {
      return res.status(404).json({ error: 'Listing invite not found.' });
    }

    await existingListingInvite.deleteOne();

    res.status(204).end(); // Respond with a 204 status (No Content) for a successful deletion
  } catch (error) {
    console.error(` ListingInvite.delete id=[${id}]`, error);
    res.status(500).json({ error: '[+] Error deleting the listing invite.' });
  }
};

export const deleteAllListingInvites = async (req: Request, res: Response) => {
  log('Deleting alllisting invites');
  log(`req.originalURL: ${req.originalUrl}`, 'CYAN');

  try {
    await ListingInviteModel.deleteMany();

    res.status(204).end(); // Respond with a 204 status (No Content) for a successful deletions
  } catch (error) {
    console.error(' ListingInvite.deleteAll', error);
    res.status(500).json({ error: '[+] Error deleting the listing invites.' });
  }
};
