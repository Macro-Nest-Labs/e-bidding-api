import { Request, Response } from 'express';

import { LotModel } from '../models/lot';
import { ILotCreateRequestBody, ILotRequestParams, ILotUpdateRequestBody } from '../types/Lot';
import { log } from '../utils/console';
import { generateLot } from '../utils/models/lot.utils';

export const createLot = async (req: Request<Record<string, never>, Record<string, never>, ILotCreateRequestBody>, res: Response) => {
  log('Creating lot');
  log(`req.originalURL: ${req.originalUrl}`, 'CYAN');

  const body = req.body;

  try {
    const lot = await generateLot(body);

    const response = {
      data: lot,
    };

    res.status(201).json(response);
  } catch (error) {
    console.error(' Lot.create', error);
    res.status(500).json({ error: '[+] Error creating the lot.' });
  }
};

export const getAllLots = async (req: Request, res: Response) => {
  log('Getting all lots');
  log(`req.originalURL: ${req.originalUrl}`, 'CYAN');

  try {
    const lots = await LotModel.find({}).populate('lotItems');
    const response = {
      data: lots,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error(' Lot.getAll', error);
    res.status(500).json({ error: '[+] Error getting all lots.' });
  }
};

export const getLotDetails = async (req: Request<ILotRequestParams>, res: Response) => {
  const id = req.params.id;

  log(`Getting lot details for id=[${id}]`);
  log(`req.originalURL: ${req.originalUrl}`, 'CYAN');

  try {
    const lot = await LotModel.findById(id).populate('lotItems');
    const response = {
      data: lot,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error(` Lot.get id=[${id}]`, error);
    res.status(500).json({ error: '[+] Error getting lot details.' });
  }
};

export const updateLot = async (req: Request<ILotRequestParams, Record<string, never>, ILotUpdateRequestBody>, res: Response) => {
  const id = req.params.id;
  const body = req.body;

  log(`Updating lot with id=[${id}]`);
  log(`req.originalURL: ${req.originalUrl}`, 'CYAN');

  try {
    const updatedLot = await LotModel.findByIdAndUpdate(id, body, {
      new: true, // Return the updated document
      runValidators: true, // Run schema validation
    });

    if (!updatedLot) {
      return res.status(404).json({ error: 'Lot not found.' });
    }

    const response = {
      data: updatedLot,
    };

    res.status(200).json(response);
  } catch (error) {
    log(`Error updating lot: ${error.message}`);
    res.status(500).json({ error: 'Error updating the lot.' });
  }
};

export const deleteLot = async (req: Request<ILotRequestParams>, res: Response) => {
  const id = req.params.id;

  log(`Deleting lot with id=[${id}]`);
  log(`req.originalURL: ${req.originalUrl}`, 'CYAN');

  try {
    const existingLot = await LotModel.findById(id);

    if (!existingLot) {
      return res.status(404).json({ error: 'Lot not found.' });
    }

    await existingLot.deleteOne();

    res.status(204).end(); // Respond with a 204 status (No Content) for a successful deletion
  } catch (error) {
    console.error(` Lot.delete id=[${id}]`, error);
    res.status(500).json({ error: '[+] Error deleting the lot.' });
  }
};
