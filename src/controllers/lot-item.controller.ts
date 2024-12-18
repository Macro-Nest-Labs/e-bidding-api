import { Request, Response } from 'express';

import { LotModel } from '../models/lot';
import { LotItemModel } from '../models/lot-item';
import {
  ILotItemCreateRequestBody,
  ILotItemDeleteByLotRequestParams,
  ILotItemRequestParams,
  ILotItemUpdateRequestBody,
} from '../types/LotItem';
import { log } from '../utils/console';
import { generateLotItem } from '../utils/models/lot-item.utils';

export const createLotItem = async (
  req: Request<Record<string, never>, Record<string, never>, ILotItemCreateRequestBody>,
  res: Response,
) => {
  log('Creating lot item');
  log(`req.originalURL: ${req.originalUrl}`, 'CYAN');

  const body = req.body;

  try {
    const lotItem = await generateLotItem(body);

    const response = {
      data: lotItem,
    };

    res.status(201).json(response);
  } catch (error) {
    console.error(' LotItem.create', error);
    res.status(500).json({ error: '[+] Error creating the lot item.' });
  }
};

export const getAllLotItems = async (req: Request, res: Response) => {
  log('Getting all lot items');
  log(`req.originalURL: ${req.originalUrl}`, 'CYAN');

  try {
    const lotItems = await LotItemModel.find({}).populate('product');
    const response = {
      data: lotItems,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error(' LotItem.getAll', error);
    res.status(500).json({ error: '[+] Error getting all lot items.' });
  }
};

export const getLotItemDetails = async (req: Request<ILotItemRequestParams>, res: Response) => {
  const id = req.params.id;

  log(`Getting lot item details for id=[${id}]`);
  log(`req.originalURL: ${req.originalUrl}`, 'CYAN');

  try {
    const lotItem = await LotItemModel.findById(id).populate('product');
    const response = {
      data: lotItem,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error(` LotItem.get id=[${id}]`, error);
    res.status(500).json({ error: '[+] Error getting lot item details.' });
  }
};

export const updateLotItem = async (
  req: Request<ILotItemRequestParams, Record<string, never>, ILotItemUpdateRequestBody>,
  res: Response,
) => {
  const id = req.params.id;
  const body = req.body;

  log(`Updating lot item with id=[${id}]`);
  log(`req.originalURL: ${req.originalUrl}`, 'CYAN');

  try {
    const updatedLotItem = await LotItemModel.findByIdAndUpdate(id, body, {
      new: true, // Return the updated document
      runValidators: true, // Run schema validation
    });

    if (!updatedLotItem) {
      return res.status(404).json({ error: 'Lot item not found.' });
    }

    const response = {
      data: updatedLotItem,
    };

    res.status(200).json(response);
  } catch (error) {
    log(`Error updating lot item: ${error.message}`);
    res.status(500).json({ error: 'Error updating the lot item.' });
  }
};

export const deleteLotItem = async (req: Request<ILotItemRequestParams>, res: Response) => {
  const id = req.params.id;

  log(`Deleting lot item with id=[${id}]`);
  log(`req.originalURL: ${req.originalUrl}`, 'CYAN');

  try {
    const existingLotItem = await LotItemModel.findById(id);

    if (!existingLotItem) {
      return res.status(404).json({ error: 'Lot item not found.' });
    }

    await existingLotItem.deleteOne();

    res.status(204).end(); // Respond with a 204 status (No Content) for a successful deletion
  } catch (error) {
    console.error(` LotItem.delete id=[${id}]`, error);
    res.status(500).json({ error: '[+] Error deleting the lot item.' });
  }
};

export const deleteLotItemsByLotId = async (req: Request<ILotItemDeleteByLotRequestParams>, res: Response) => {
  const lotId = req.params.lotId;

  try {
    const lot = await LotModel.findById(lotId);
    if (!lot) {
      return res.status(404).json({ error: 'Lot not found.' });
    }

    // Delete all lot items associated with this lot
    await LotItemModel.deleteMany({ _id: { $in: lot.lotItems } });

    res.status(204).end(); // No Content status
  } catch (error) {
    console.error(`Error deleting lot items by lot ID: ${error.message}`);
    res.status(500).json({ error: 'Error deleting lot items.' });
  }
};
