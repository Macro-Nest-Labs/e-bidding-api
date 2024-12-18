import { ClientSession, Types } from 'mongoose';

import { LotModel } from '../../models/lot';
import { ILotCreateRequestBody } from '../../types/Lot';
import dayjs from 'dayjs';

export enum LotStatus {
  PENDING = 'Pending',
  IN_PROGRESS = 'In Progress',
  CLOSED = 'Closed',
}

export async function generateLot(lotData: ILotCreateRequestBody, session?: ClientSession) {
  try {
    const lot = new LotModel(lotData);

    await lot.validate();
    await lot.save({ session: session });

    return lot;
  } catch (error) {
    throw new Error(`Error creating lot: ${error.message}`);
  }
}

export async function calculateLotEndTime(lotId: Types.ObjectId) {
  const lot = await LotModel.findById(lotId);

  if (!lot) {
    throw new Error('Invalid Lot');
  } else if (!lot.startTime) {
    throw new Error('Invalid Lot Start Time');
  } else if (!lot.duration) {
    throw new Error('Invalid lot duration');
  }

  // Assuming duration is stored in format 'HH:MM'
  const [hours, minutes] = lot.duration.split(':').map(Number);
  const endTime = dayjs(lot.startTime).add(hours, 'hour').add(minutes, 'minute');

  return endTime;
}
