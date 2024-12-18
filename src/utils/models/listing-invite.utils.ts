import crypto from 'crypto';
import mongoose, { ClientSession, Types } from 'mongoose';

import { config } from '../../config';
import { ListingInviteModel } from '../../models/listing-invite';
import { IListing } from '../../types/Listing';
import { log } from '../console';
import { formattedDate, formatTime } from '../date';
import { sendEmail } from '../email';
import { ListingModel } from '../../models/listing';

export async function sendListingInvitesToSuppliers(
  listing: mongoose.Document<unknown, NonNullable<unknown>, IListing> &
    IListing & {
      _id: Types.ObjectId;
    },
  requiresSupplierLogin: boolean,
  session?: ClientSession,
) {
  const auctionData = await ListingModel.findById(listing?.id);
  if (!auctionData) {
    console.error('[+] Listing Not Found');
    return;
  }

  await auctionData.populate([
    'buyer',
    'rules',
    'suppliers',
    {
      path: 'lots',
      model: 'Lot',
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

  for (const supplier of auctionData.suppliers) {
    const inviteToken = crypto.randomBytes(16).toString('hex'); // Generate a unique token
    const acceptUrl = requiresSupplierLogin ? `${config.FRONTEND_URL}` : `${config.SERVER_URL}/listing-invites/accept/${inviteToken}`;

    // Create and save the invitation with the token
    const listingInvite = new ListingInviteModel({
      // @ts-expect-error attrs present after populating the doc
      email: supplier.email,
      inviteToken: inviteToken,
      listing: auctionData._id,
      supplier: supplier._id,
    });

    await listingInvite.save({ session: session });

    // Prepare and send the email
    const emailTemplate = requiresSupplierLogin ? 'dashboardInviteEmail' : 'listingInviteEmail';
    const emailSubject = requiresSupplierLogin ? 'You have a new invite!' : 'Invitation for an Auction | ARG Supply Tech';

    const formattedLots = auctionData.lots.map((lot) => ({
      ...lot,
      // @ts-expect-error attrs present after populating the doc
      lotItemsFormatted: lot.lotItems.map((item) => ({
        productName: item.product.name,
        qty: item.qty,
        uom: item.uom,
      })),
    }));

    const emailContext = {
      appLogoUrl: config.APP_LOGO_URL,
      acceptUrl: acceptUrl,
      // @ts-expect-error attrs present after populating the doc
      supplier_name: `${supplier.firstName} ${supplier.lastName}`,
      startDate: formattedDate(listing.startDate),
      startTime: formatTime(listing.startTime),
      lots: formattedLots,
      // @ts-expect-error attrs present after populating the doc
      buyerName: `${listing.buyer.firstName} ${listing.buyer.lastName}`,
      buyerContactNumber: listing.mobileNumber,
      // @ts-expect-error attrs present after populating the doc
      buyerContactEmail: listing.buyer.email,
      auctionName: listing.name,
      duration: listing.duration,
    };

    const emailResult = await sendEmail(
      // @ts-expect-error attrs present after populating the doc
      supplier.email,
      emailSubject,
      emailTemplate,
      emailContext,
    );

    if (emailResult.success) {
      // @ts-expect-error attrs present after populating the doc
      log(`Email successfully sent to ${supplier.email}`, 'GREEN');
    } else {
      console.error(
        // @ts-expect-error attrs present after populating the doc
        `Failed to send email to ${supplier.email}: ${emailResult.error}`,
      );
    }
  }
}
