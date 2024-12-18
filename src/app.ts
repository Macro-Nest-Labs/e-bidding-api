import './cron';

import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express, { Express, Request, Response } from 'express';
import { createServer, IncomingMessage, Server, ServerResponse } from 'http';

import { config } from './config';
import { connectToMongo } from './database';
import { ErrorHandler, handleError } from './middlewares';
import bidRouter from './routes/bid-routes';
import buyerRouter from './routes/buyer-routes';
import categoryRouter from './routes/category-routes';
import emailRouter from './routes/email-routes';
import listingInviteRouter from './routes/listing-invite-routes';
import listingRouter from './routes/listing-routes';
import lotItemRouter from './routes/lot-item-routes';
import lotRouter from './routes/lot-routes';
import productRouter from './routes/product-routes';
import ruleRouter from './routes/rule-routes';
import supplierRouter from './routes/supplier-routes';
import termsAndConditionsRouter from './routes/terms-and-conditions-routes';
import sock, { setupSocket } from './socket/socket.controller';
import { log } from './utils/console';
import { reinitializeAuctionsOnServerStart } from './utils/models/auction.utils';

dotenv.config();

const app: Express = express();
const server: Server<typeof IncomingMessage, typeof ServerResponse> = createServer(app);

export const io = sock(server);

setupSocket(io);

app.use(express.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  }),
);
app.use(cors());
await connectToMongo();

reinitializeAuctionsOnServerStart();

// Prefix URL routes
app.use('/suppliers', supplierRouter);
app.use('/products', productRouter);
app.use('/buyers', buyerRouter);
app.use('/rules', ruleRouter);
app.use('/categories', categoryRouter);
app.use('/listings', listingRouter);
app.use('/listing-invites', listingInviteRouter);
app.use('/lot-items', lotItemRouter);
app.use('/lots', lotRouter);
app.use('/bids', bidRouter);
app.use('/terms-and-conditions', termsAndConditionsRouter);

// Email sending logic
app.use('/email', emailRouter);

app.get('/health-check', (req: Request, res: Response) => {
  res.status(200).send('OK');
});

app.get('/server-time', (req: Request, res: Response) => {
  res.json({ serverTime: new Date() });
});

app.use((error: ErrorHandler, _request: never, response: Response, _: never) => {
  handleError(error, response);
});

const PORT = process.env.PORT || config.PORT;

server.listen(PORT, () => {
  log(`🚀 Server and Socket.IO listening on port ${PORT}!`, 'BLUE');
});
