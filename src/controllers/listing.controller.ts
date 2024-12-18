import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { NextFunction, Request, Response } from 'express';
import fs from 'fs';
import handlebars from 'handlebars';
import mongoose, { Types } from 'mongoose';
import path from 'path';
import puppeteer from 'puppeteer';

import { auctionQueue } from '../cron';
import BidModel from '../models/bid';
import { BuyerModel } from '../models/buyer';
import { ListingModel } from '../models/listing';
import { ListingInviteModel } from '../models/listing-invite';
import { LotModel } from '../models/lot';
import { TermsAndConditionsModel } from "../models/terms-and-conditions";

import {
  IListingCreateRequestBody,
  IListingMutateRequestParams,
  IListingRequestParams,
  IListingsByBuyerRequestParams,
  IListingsByStatusRequestQuery,
  IListingsBySupplierRequestParams,
  IListingUpdateRequestBody,
} from '../types/Listing';
import { log } from '../utils/console';
import { getAuctionStartTimeWithStartDate } from '../utils/date';
import { sendListingInvitesToSuppliers } from '../utils/models/listing-invite.utils';
import { deleteRelatedBids, deleteRelatedListingInvites, deleteRelatedLotItemsAndLots, ListingStatus } from '../utils/models/listing.utils';
import { generateLotItem } from '../utils/models/lot-item.utils';
import { generateLot, LotStatus } from '../utils/models/lot.utils';
import { generateProduct } from '../utils/models/product.utils';
import { sanitize, textToSlug } from '../utils/stringUtils';
import { uuidFromString } from '../utils/uuid';

dayjs.extend(utc);
dayjs.extend(timezone);

export const createListing = async (
  req: Request<Record<string, never>, Record<string, never>, IListingCreateRequestBody>,
  res: Response,
) => {
  log('Creating listing');
  log(`req.originalURL: ${req.originalUrl}`, 'CYAN');

  const body = req.body.listing;
  const { lots: lotsData } = req.body;
  const { TCData } = req.body;

  const buyer = await BuyerModel.findById(body.buyer);

  const sanitizedListing = sanitize(body.name);
  const uuid = uuidFromString(ListingModel.name, sanitizedListing);
  const slug = textToSlug(body.name);
  const { requiresSupplierLogin } = body;

  // Start transaction for Atomicity
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const existingListing = await ListingModel.find({ slug }).session(session);

    if (existingListing.length > 0) {
      await session.abortTransaction();
      return res.status(409).json({ error: '[+] Listing already exists!' });
    }

    // Create lots and lot items
    const createdLotIds: Types.ObjectId[] = [];
    for (const lotData of lotsData) {
      const createdLotItems: Types.ObjectId[] = [];
      for (const lotItem of lotData.lotItems) {
        const createdProduct = await generateProduct(lotItem.product, session);
        const lotItemPayload = {
          ...lotItem,
          product: createdProduct._id,
        };
        const createdLotItem = await generateLotItem(lotItemPayload, session);
        createdLotItems.push(createdLotItem._id);
      }

      const createdLot = await generateLot({
        ...lotData,
        lotItems: createdLotItems,
        duration: body.duration,
        status: LotStatus.PENDING,
      });
      createdLotIds.push(createdLot._id);
    }

    // Calculate startTime for first lot
    const now = dayjs().tz('Asia/Kolkata');
    const startTime = getAuctionStartTimeWithStartDate(dayjs(body.startDate).tz('Asia/Kolkata').toISOString(), body.startTime);
    const firstLotId = createdLotIds.length > 0 ? createdLotIds[0] : null;
    const firstLot = await LotModel.findById(firstLotId);
    firstLot.startTime = startTime.toDate();

    const [hours, minutes] = body.duration.split(':').map(Number);
    const firstLotEndTime = dayjs(startTime).add(hours, 'hour').add(minutes, 'minute');

    if (now.isAfter(firstLotEndTime)) {
      console.error(`Listing.create buyer=[${buyer.id}]`, 'Start time + Duration should exceed current time');
      return res.status(422).json({ error: 'Start time + Duration should exceed current time' });
    }

    const listing = new ListingModel({
      ...body,
      uuid,
      slug,
      lots: createdLotIds,
      activeLot: firstLotId,
      nextLot: createdLotIds.length > 1 ? createdLotIds[1] : null,
      activeLotEndTime: firstLotEndTime.toDate(),
    });

    await listing.populate([
      'buyer',
      'rules',
      'suppliers',
      {
        path: 'lots',
        populate: {
          path: 'lotItems',
          model: 'LotItem',
          populate: {
            path: 'product',
            model: 'Product',
          },
        },
      },
    ]);

    if (now.isAfter(startTime) && listing.status !== ListingStatus.CLOSED) {
      listing.status = ListingStatus.IN_PROGRESS;
    } else {
      listing.status = ListingStatus.UPCOMING;
    }

    const timeoutDuration = firstLotEndTime.diff(now);
    auctionQueue.add(
      {
        listingId: listing._id.toString(),
        action: 'transitionToNextLot',
      },
      {
        delay: timeoutDuration,
        jobId: `transition-${listing._id}-${firstLotId}`,
      },
    );

    const startTimeoutDuration = startTime.diff(now);
    auctionQueue.add(
      {
        listingId: listing._id.toString(),
        action: 'startAuction',
      },
      {
        delay: startTimeoutDuration,
        jobId: `start-${listing._id}`,
      },
    );

    try {
      await listing.validate();
    } catch (validationError) {
      await session.abortTransaction();
      console.error(`Listing.create buyer=[${buyer.id}]`, validationError);
      return res.status(400).json({ error: validationError.message });
    }

    const response = {
      data: listing,
    };

    await listing.save();
    await firstLot.save();

    const termsAndConditions = new TermsAndConditionsModel({
      listing: listing._id,
      priceBasis: TCData.priceBasis,
      taxesAndDuties: TCData.taxesAndDuties,
      delivery: TCData.delivery,
      paymentTerms: TCData.paymentTerms,
      warrantyGurantee: TCData.warrantyGurantee,
      inspectionRequired: TCData.inspectionRequired,
      otherTerms: TCData.otherTerms,
      awardingDecision: TCData.awardingDecision,
    });

    try {
      await termsAndConditions.validate();
    } catch (validationError) {
      await session.abortTransaction();
      console.error(` validation error`, validationError);
      return res.status(400).json({ error: validationError.message });
    }

    // Commit the transaction
    await session.commitTransaction();
    await termsAndConditions.save();

    // Calling Invite function after listing save to fetch listing id
    await sendListingInvitesToSuppliers(listing, requiresSupplierLogin);

    res.status(201).json(response);
  } catch (error) {
    // Rollback the transaction
    await session.abortTransaction();
    console.error(` Listing.create buyer=[${buyer.id}]`, error);
    res.status(500).json({ error: '[+] Error creating the listing.' });
  } finally {
    // End the session
    session.endSession();
  }
};

export const getAllListings = async (req: Request, res: Response) => {
  log('Getting all listings');
  log(`req.originalURL: ${req.originalUrl}`, 'CYAN');

  try {
    const listings = await ListingModel.find({}).populate(['buyer', 'rules', 'suppliers', 'lots']);
    const response = {
      data: listings,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error(' Listing.getAll', error);
    res.status(500).json({ error: '[+] Error getting all listings.' });
  }
};

export const getListingsByBuyer = async (req: Request<IListingsByBuyerRequestParams>, res: Response) => {
  const buyerId = req.params.buyerId;

  log(`Getting listings for buyerId=[${buyerId}] in recent first order`);
  log(`req.originalURL: ${req.originalUrl}`, 'CYAN');

  try {
    const listings = await ListingModel.find({ buyer: buyerId })
      .sort({ startDate: -1 }) // Sort by startDate in descending order
      .populate(['buyer', 'rules', 'suppliers', 'lots']);

    if (!listings || listings.length === 0) {
      return res.status(404).json({ error: '[+] No listings found for this buyer.' });
    }

    const response = {
      data: listings,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error(`Error fetching listings for buyerId=[${buyerId}]`, error);
    res.status(500).json({ error: '[+] Error fetching listings.' });
  }
};

export const getListingsForSupplierWithInvite = async (req: Request<IListingsBySupplierRequestParams>, res: Response) => {
  const supplierId = req.params.supplierId; // assuming you're getting the supplier's ID from the route parameters

  log(`Getting listings with invites for supplierId=[${supplierId}]`);
  log(`req.originalURL: ${req.originalUrl}`, 'CYAN');

  try {
    // First, find all invites for the supplier
    const invites = await ListingInviteModel.find({ supplier: supplierId }).sort({ startDate: -1 });
    if (!invites || invites.length === 0) {
      return res.status(404).json({ error: '[+] No invites found for this supplier.' });
    }

    // Extract listing IDs from the invites
    const listingIds = invites.map((invite) => invite.listing);

    // Now, find all listings corresponding to these invites
    const listings = await ListingModel.find({
      _id: { $in: listingIds },
    }).populate(['buyer', 'rules', 'suppliers', 'lots']);

    if (!listings || listings.length === 0) {
      return res.status(404).json({ error: '[+] No listings found for this supplier.' });
    }

    const response = {
      data: listings,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error(`Error fetching listings for supplierId=[${supplierId}] with invites`, error);
    res.status(500).json({ error: '[+] Error fetching listings.' });
  }
};

export const getListingDetails = async (req: Request<IListingRequestParams>, res: Response) => {
  const slug = req.params.slug;

  log(`Getting listing details for name=[${slug}]`);
  log(`req.originalURL: ${req.originalUrl}`, 'CYAN');

  try {
    const listing = await ListingModel.findOne({ slug }).populate([
      'buyer',
      'rules',
      'suppliers',
      {
        path: 'lots',
        populate: [
          {
            path: 'lotItems',
            model: 'LotItem',
            populate: { path: 'product', model: 'Product' },
          },
          'category',
        ],
      },
    ]);
    if (!listing) {
      return res.status(404).json({ error: '[+] Listing not found.' });
    }
    const response = {
      data: listing,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error(` Listing.get name=[${slug}]`, error);
    res.status(500).json({ error: '[+] Error getting listing details.' });
  }
};

export const updateListing = async (
  req: Request<IListingMutateRequestParams, Record<string, never>, IListingUpdateRequestBody>,
  res: Response,
) => {
  const id = req.params.id;
  const body = req.body;

  log(`Updating listing with id=[${id}]`);
  log(`req.originalURL: ${req.originalUrl}`, 'CYAN');

  try {
    const existingListing = await ListingModel.findById(id);

    if (!existingListing) {
      return res.status(404).json({ error: '[+] Listing not found.' });
    }

    const updatedListing = await existingListing.updateOne(body);
    const response = {
      data: updatedListing,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error(` Listing.update id=[${id}]`, error);
    res.status(500).json({ error: '[+] Error updating the listing.' });
  }
};

export const deleteListing = async (req: Request<IListingMutateRequestParams>, res: Response) => {
  const id = req.params.id;

  log(`Deleting listing with id=[${id}]`);
  log(`req.originalURL: ${req.originalUrl}`, 'CYAN');

  try {
    const existingListing = await ListingModel.findById(id);

    if (!existingListing) {
      return res.status(404).json({ error: '[+] Listing not found.' });
    }

    // Clear any ongoing timeout for the listing
    if (existingListing.activeLotEndTimeout) {
      clearTimeout(existingListing.activeLotEndTimeout);
    }

    // Delete related documents
    await deleteRelatedBids(id);
    await deleteRelatedLotItemsAndLots(id);
    await deleteRelatedListingInvites(id);

    await existingListing.deleteOne();

    res.status(204).end(); // Respond with a 204 status (No Content) for a successful deletion
  } catch (error) {
    console.error(`Listing.delete id=[${id}]`, error);
    res.status(500).json({ error: '[+] Error deleting the listing.' });
  }
};

export const getLisitingsByStatus = async (
  req: Request<Record<string, never>, Record<string, never>, Record<string, never>, IListingsByStatusRequestQuery>,
  res: Response,
  next: NextFunction,
) => {
  const { status, buyer, supplier } = req.query;

  // If status and buyerId or supplierId is not provided, call next to use the getAllListings function
  if (!status && !buyer && !supplier) {
    return next();
  }

  const userId = buyer || supplier;
  const userType = buyer ? 'buyer' : 'supplier';

  if (!userId) {
    log('Invalid or missing user id', 'RED');
    return res.status(422).json({ error: '[+] Invalid or missing user id' });
  }

  log(`Getting listings with Status=[${status}] and ${userType}Id=[${userId}]`);
  log(`req.originalURL: ${req.originalUrl}`, 'CYAN');

  try {
    const query: {
      status?: string;
      buyer?: Types.ObjectId;
      suppliers?: { $in: Types.ObjectId[] };
    } = {};
    if (status) query.status = status;
    if (buyer) query.buyer = buyer;
    if (supplier) {
      query.suppliers = { $in: [supplier] }; // This checks if the supplier is part of the suppliers array
    }

    const listings = await ListingModel.find(query).populate(['buyer', 'rules', 'suppliers', 'lots']);

    if (!listings || listings.length === 0) {
      return res.status(404).json({
        error: '[+] No listings found with the provided criteria.',
      });
    }

    const response = {
      data: listings,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error(`Error fetching listings with status=[${status}] and ${userType}Id=[${userId}]`, error);
    res.status(500).json({ error: '[+] Error fetching listings.' });
  }
};

export const generateAuctionReportPDF = async (req: Request<IListingRequestParams>, res: Response) => {
  const slug = req.params.slug;

  log(`Creating listing report slug=[${slug}]`);
  log(`req.originalURL: ${req.originalUrl}`, 'CYAN');

  try {
    const listing = await ListingModel.findOne({ slug: slug }).populate([
      'buyer',
      'rules',
      'suppliers',
      {
        path: 'lots',
        populate: {
          path: 'lotItems',
          model: 'LotItem',
          populate: {
            path: 'product',
            model: 'Product',
          },
        },
      },
    ]);

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    const invites = await ListingInviteModel.find({ listing: listing._id });

    const suppliersData = await Promise.all(
      listing.suppliers.map(async (supplier) => {
        const invite = invites.find((inv) => inv.supplier.toString() === supplier._id.toString());
        const status = invite ? (invite.accepted ? 'Accepted' : 'Declined') : 'No Response';
        // @ts-expect-error attrs present after populating the doc
        return { name: `${supplier.firstName} ${supplier.lastName}`, status };
      }),
    );

    // Prepare data for lots and bids
    const lotsData = await Promise.all(
      listing.lots.map(async (lot) => {
        const bids = await BidModel.find({ lot: lot._id }).sort({ amount: 1 }).populate('supplier');

        const bidsData = bids.map((bid) => ({
          amount: bid.amount,
          bidder: bid.supplier
            ? // @ts-expect-error attrs present after populating the doc
              `${bid.supplier.firstName} ${bid.supplier.lastName}`
            : 'Anonymous',
          createdAt: dayjs(bid.createdAt).tz('Asia/Kolkata').format('HH:mm:ss'),
        }));

        const lowestBid = await BidModel.find({ lot: lot._id }).sort({ amount: 1 }).limit(1).populate('supplier');

        const lowestBidInfo =
          lowestBid.length > 0
            ? {
                amount: lowestBid[0].amount,
                bidder: lowestBid[0].supplier
                  ? // @ts-expect-error attrs present after populating the doc
                    `${lowestBid[0].supplier.firstName} ${lowestBid[0].supplier.lastName}`
                  : 'No bidder',
              }
            : { amount: 'No bids', bidder: '' };

        return {
          id: lot._id,
          // @ts-expect-error attrs present after populating the doc
          items: lot.lotItems.map((item) => ({
            name: item.product.name,
            qty: item.qty,
            uom: item.uom,
          })),
          bids: bidsData,
          lowestBid: lowestBidInfo,
        };
      }),
    );

    // Read and compile the Handlebars template
    const templatePath = path.join(__dirname, 'email-templates/auctionReportTemplate.hbs');
    const templateHtml = fs.readFileSync(templatePath, 'utf8');
    const template = handlebars.compile(templateHtml);
    const html = template({
      auctionName: listing.name,
      suppliers: suppliersData,
      lots: lotsData,
    });

    // Generate PDF using Puppeteer
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      executablePath: process.env.CHROME_EXECUTABLE_PATH || null, // CHROME_EXECUTABLE_PATH is set by the puppeteer-heroku-buildpack
    });

    const page = await browser.newPage();
    await page.setContent(html);
    const pdf = await page.pdf({ format: 'A4' });
    await browser.close();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=auction-report-${slug}.pdf`);
    res.send(pdf);
  } catch (error) {
    console.error('Error generating auction report PDF:', error);
    res.status(500).json({ error: 'Error generating auction report PDF' });
  }
};
