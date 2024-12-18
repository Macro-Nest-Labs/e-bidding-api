import mongoose, { ConnectOptions } from 'mongoose';

import { config } from './config';
import { log } from './utils/console';

const options: ConnectOptions = {};

const handleError = (error: string) => {
  log(`Coudn't connect to MongoDB, ${error}`, 'RED');
};

const logError = (err: string) => {
  log(`Error occurred: ${err}`, 'RED');
};

export const connectToMongo = async () => {
  try {
    log('Attempting to connect to MongoDB Atlas', 'CYAN');
    mongoose.connect(config.MONGO_URI, options);
  } catch (error) {
    handleError(error);
  }
};

mongoose.connection.on('open', () => {
  log('MongoDB Atlas Connection opened', 'GREEN');
});

mongoose.connection.on('error', (err) => {
  logError(err);
});
