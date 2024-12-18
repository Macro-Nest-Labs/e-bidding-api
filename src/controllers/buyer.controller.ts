import { Request, Response } from 'express';

import { BuyerModel } from '../models/buyer';
import { IBuyerCreateRequestBody, IBuyerRequestParams, IBuyerUpdateRequestBody } from '../types/Buyer';
import { log } from '../utils/console';
import { sanitize } from '../utils/stringUtils';
import { uuidFromString } from '../utils/uuid';
import { sendBuyerInviteEmail } from '../utils/models/buyer-invite.utils';

// Create buyer Logic
export const createBuyer = async (req: Request<Record<string, never>, Record<string, never>, IBuyerCreateRequestBody>, res: Response) => {
  log('Creating buyer');
  log(`req.originalURL: ${req.originalUrl}`, 'CYAN');

  const sanitizedName = sanitize(req.body.firstName + req.body.lastName);
  const uuid = uuidFromString(BuyerModel.name, sanitizedName);
  const body = req.body;

  try {
    const buyer = new BuyerModel({
      uuid,
      ...body,
    });
    const response = {
      data: buyer,
    };

    await buyer.save();

    sendBuyerInviteEmail(req.body.email, req.body.password, req.body.firstName);

    res.status(201).json(response);
  } catch (error) {
    console.error(` Buyer.create name=[${sanitizedName}] uuid=[${uuid}]`, error);
    res.status(500).json({ error: '[+] Error creating the buyer.' });
  }
};

// Fetch all buyers Logic
export const getAllBuyers = async (req: Request, res: Response) => {
  log('Getting all buyers');
  log(`req.originalURL: ${req.originalUrl}`, 'CYAN');

  try {
    const buyer = await BuyerModel.find({});
    const response = {
      data: buyer,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error(' Buyer.getAll', error);
    res.status(500).json({ error: '[+] Error getting all buyers.' });
  }
};

// Fetch buyer details by ID Logic
export const getBuyerDetails = async (req: Request<IBuyerRequestParams>, res: Response) => {
  const id = req.params.id;

  log(`Getting buyer details for id=[${id}]`);
  log(`req.originalURL: ${req.originalUrl}`, 'CYAN');

  try {
    const buyer = await BuyerModel.findById(id);

    if (!buyer) {
      return res.status(404).json({ error: '[+] Buyer not found.' });
    }

    const response = {
      data: buyer,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error(` Buyer.get id=[${id}]`, error);
    res.status(500).json({ error: '[+] Error getting Buyer details.' });
  }
};

// Fetch buyer details by Email
export const getBuyerDetailsByEmail = async (req: Request<{ email: string }>, res: Response) => {
  const email = req.params.email;

  log(`Getting buyer details for email=[${email}]`);
  log(`req.originalURL: ${req.originalUrl}`, 'CYAN');

  try {
    const buyer = await BuyerModel.findOne({ email: email });

    if (!buyer) {
      return res.status(404).json({ error: '[+] Buyer not found.' });
    }

    const response = {
      data: buyer,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error(`Buyer.getByEmail email=[${email}]`, error);
    res.status(500).json({ error: '[+] Error getting Buyer details by email.' });
  }
};

// Update buyer by ID Logic
export const updateBuyer = async (req: Request<IBuyerRequestParams, Record<string, never>, IBuyerUpdateRequestBody>, res: Response) => {
  const id = req.params.id;
  const body = req.body;

  log(`Updating buyer with id=[${id}]`);
  log(`req.originalURL: ${req.originalUrl}`, 'CYAN');

  try {
    const updatedBuyer = await BuyerModel.findByIdAndUpdate(id, body, {
      new: true,
    });

    if (!updatedBuyer) {
      return res.status(404).json({ error: '[+] Buyer not found.' });
    }

    const response = {
      data: updatedBuyer,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error(` Buyer.update id=[${id}]`, error);
    res.status(500).json({ error: '[+] Error updating the buyer.' });
  }
};

// Delete buyer by ID Logic
export const deleteBuyer = async (req: Request<IBuyerRequestParams>, res: Response) => {
  const id = req.params.id;

  log(`Deleting buyer with id=[${id}]`);
  log(`req.originalURL: ${req.originalUrl}`, 'CYAN');

  try {
    const existingBuyer = await BuyerModel.findById(id);

    if (!existingBuyer) {
      return res.status(404).json({ error: '[+] Buyer not found.' });
    }

    await existingBuyer.deleteOne();

    res.status(204).end(); // Respond with a 204 status (No Content) for a successful deletion
  } catch (error) {
    console.error(` Buyer.delete id=[${id}]`, error);
    res.status(500).json({ error: '[+] Error deleting the buyer.' });
  }
};
