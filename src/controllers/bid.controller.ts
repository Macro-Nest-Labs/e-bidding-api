import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { Request, Response } from 'express';

import BidModel from '../models/bid';
import { IBidByLotRequestParams, IBidCreateRequestBody, IBidRequestParams, IBidUpdateRequestBody } from '../types/Bid';
import { log } from '../utils/console';
import { validateBid } from '../utils/models/bid.utils';

dayjs.extend(utc);
dayjs.extend(timezone);

export const createBid = async (req: Request<Record<string, never>, Record<string, never>, IBidCreateRequestBody>, res: Response) => {
  log('Creating bid');
  log(`req.originalURL: ${req.originalUrl}`, 'CYAN');

  const { lot: lotId, supplier, amount } = req.body;

  try {
    const { isValid, errors } = await validateBid(lotId, supplier, amount);

    if (!isValid) {
      return res.status(400).json({ errors });
    }

    // All validations passed; create the bid
    const bid = new BidModel(req.body);

    await bid.save();
    res.status(201).json({ data: bid });
  } catch (error) {
    console.error('Bid.create', error);
    res.status(500).json({ error: '[+] Error creating the bid.' });
  }
};

export const getAllBids = async (req: Request, res: Response) => {
  log('Getting all bids');
  log(`req.originalURL: ${req.originalUrl}`, 'CYAN');

  try {
    const bids = await BidModel.find({});
    res.status(200).json({ data: bids });
  } catch (error) {
    console.error('Bid.getAll', error);
    res.status(500).json({ error: '[+] Error getting all bids.' });
  }
};

export const getBidsByLot = async (req: Request<IBidByLotRequestParams>, res: Response) => {
  const { lotId } = req.params;

  try {
    const bids = await BidModel.find({ lot: lotId }).sort({ amount: 1 }).populate('supplier');

    // Convert timestamps to IST for each bid
    const bidsWithISTTime = bids.map((bid) => {
      const bidObj = bid.toObject(); // Convert Mongoose document to plain object
      bidObj.createdAt = dayjs(bid.createdAt).tz('Asia/Kolkata').toDate();
      bidObj.updatedAt = dayjs(bid.updatedAt).tz('Asia/Kolkata').toDate();
      return bidObj;
    });

    res.status(200).json({ data: bidsWithISTTime });
  } catch (error) {
    if (error instanceof Error && error.name === 'CastError') {
      res.status(400).json({ error: '[+] Invalid lot ID format.' });
    } else {
      console.error(`Bid.getByLot lotId=[${lotId}]`, error);
      res.status(500).json({ error: '[+] Error getting bids by lot.' });
    }
  }
};

export const getBidDetails = async (req: Request<IBidRequestParams>, res: Response) => {
  const id = req.params.id;
  log(`Getting bid details for id=[${id}]`);
  log(`req.originalURL: ${req.originalUrl}`, 'CYAN');

  try {
    const bid = await BidModel.findById(id);
    if (!bid) {
      return res.status(404).json({ error: 'Bid not found.' });
    }

    const createdAtIST = dayjs(bid.createdAt).tz('Asia/Kolkata').format();
    const updatedAtIST = dayjs(bid.updatedAt).tz('Asia/Kolkata').format();

    const responseBid = {
      ...bid.toObject(),
      createdAt: createdAtIST,
      updatedAt: updatedAtIST,
    };

    res.status(200).json({ data: responseBid });
  } catch (error) {
    console.error(`Bid.get id=[${id}]`, error);
    res.status(500).json({ error: '[+] Error getting bid details.' });
  }
};

export const updateBid = async (req: Request<IBidRequestParams, Record<string, never>, IBidUpdateRequestBody>, res: Response) => {
  const id = req.params.id;
  const body = req.body;
  log(`Updating bid with id=[${id}]`);
  log(`req.originalURL: ${req.originalUrl}`, 'CYAN');

  try {
    const updatedBid = await BidModel.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!updatedBid) {
      return res.status(404).json({ error: 'Bid not found.' });
    }

    res.status(200).json({ data: updatedBid });
  } catch (error) {
    console.error(`Bid.update id=[${id}]`, error);
    res.status(500).json({ error: '[+] Error updating the bid.' });
  }
};

export const deleteBid = async (req: Request<IBidRequestParams>, res: Response) => {
  const id = req.params.id;
  log(`Deleting bid with id=[${id}]`);
  log(`req.originalURL: ${req.originalUrl}`, 'CYAN');

  try {
    const bid = await BidModel.findByIdAndDelete(id);
    if (!bid) {
      return res.status(404).json({ error: 'Bid not found.' });
    }
    res.status(204).send();
  } catch (error) {
    console.error(`Bid.delete id=[${id}]`, error);
    res.status(500).json({ error: '[+] Error deleting the bid.' });
  }
};

export const deleteBidsByLot = async (req: Request<IBidByLotRequestParams>, res: Response) => {
  const { lotId } = req.params;
  log(`Deleting bids for lotId=[${lotId}]`);
  log(`req.originalURL: ${req.originalUrl}`, 'CYAN');

  try {
    // Delete all bids associated with the given lot ID
    const result = await BidModel.deleteMany({ lot: lotId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'No bids found for the specified lot.' });
    }

    res.status(200).json({ message: `Successfully deleted ${result.deletedCount} bids.` });
  } catch (error) {
    console.error(`Bid.deleteByLot lotId=[${lotId}]`, error);
    res.status(500).json({ error: '[+] Error deleting bids by lot.' });
  }
};
