import { Request, Response } from 'express';
import { Types } from 'mongoose';

import { TermsAndConditionsModel } from '../models/terms-and-conditions';
import { ITermsAndConditions } from '../types/TermsAndConditions';
import { log } from '../utils/console';

export const createTermsAndConditions = async (
  req: Request<Record<string, never>, Record<string, never>, ITermsAndConditions>,
  res: Response,
) => {
  log('Creating terms and conditions');
  log(`req.originalURL: ${req.originalUrl}`, 'CYAN');

  const body = req.body;

  try {
    const termsAndConditions = new TermsAndConditionsModel(body);
    await termsAndConditions.save();

    res.status(201).json({ data: termsAndConditions });
  } catch (error) {
    console.error('TermsAndConditions.create', error);
    res.status(500).json({ error: '[+] Error creating the terms and conditions.' });
  }
};

export const getAllTermsAndConditions = async (req: Request, res: Response) => {
  log('Getting all terms and conditions');
  log(`req.originalURL: ${req.originalUrl}`, 'CYAN');

  try {
    const terms = await TermsAndConditionsModel.find({});
    res.status(200).json({ data: terms });
  } catch (error) {
    console.error('TermsAndConditions.getAll', error);
    res.status(500).json({ error: '[+] Error getting all terms and conditions.' });
  }
};

export const getTermsAndConditionsDetails = async (req: Request<{ id: Types.ObjectId }>, res: Response) => {
  const id = req.params.id;
  log(`Getting terms and conditions details for id=[${id}]`);
  log(`req.originalURL: ${req.originalUrl}`, 'CYAN');

  try {
    const terms = await TermsAndConditionsModel.findOne({listing:id}).select('-_id -__v').exec();
    if (!terms) {
      return res.status(404).json({ error: '[+] Terms and conditions not found.' });
    }
    res.status(200).json({ data: terms });
  } catch (error) {
    console.error(`TermsAndConditions.get id=[${id}]`, error);
    res.status(500).json({ error: '[+] Error getting terms and conditions details.' });
  }
};

export const updateTermsAndConditions = async (
  req: Request<{ id: Types.ObjectId }, Record<string, never>, ITermsAndConditions>,
  res: Response,
) => {
  const id = req.params.id;
  const body = req.body;
  log(`Updating terms and conditions with id=[${id}]`);
  log(`req.originalURL: ${req.originalUrl}`, 'CYAN');

  try {
    const updatedTerms = await TermsAndConditionsModel.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!updatedTerms) {
      return res.status(404).json({ error: '[+] Terms and conditions not found.' });
    }

    res.status(200).json({ data: updatedTerms });
  } catch (error) {
    console.error(`TermsAndConditions.update id=[${id}]`, error);
    res.status(500).json({ error: '[+] Error updating the terms and conditions.' });
  }
};

export const deleteTermsAndConditions = async (req: Request<{ id: Types.ObjectId }>, res: Response) => {
  const id = req.params.id;
  log(`Deleting terms and conditions with id=[${id}]`);
  log(`req.originalURL: ${req.originalUrl}`, 'CYAN');

  try {
    const terms = await TermsAndConditionsModel.findByIdAndDelete(id);
    if (!terms) {
      return res.status(404).json({ error: '[+] Terms and conditions not found.' });
    }
    res.status(204).send();
  } catch (error) {
    console.error(`TermsAndConditions.delete id=[${id}]`, error);
    res.status(500).json({ error: '[+] Error deleting the terms and conditions.' });
  }
};
