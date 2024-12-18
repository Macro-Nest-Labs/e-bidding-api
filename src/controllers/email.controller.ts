import { Request, Response } from 'express';

import { config } from '../config';
import { IListingInviteEmailSendRequestBody } from '../types/Email';
import { log } from '../utils/console';
import { sendEmail } from '../utils/email';

export const sendListingInviteEmail = async (
  req: Request<Record<string, never>, Record<string, never>, IListingInviteEmailSendRequestBody>,
  res: Response,
) => {
  log('Sending listing invite email');
  log(`req.originalURL: ${req.originalUrl}`, 'CYAN');

  const body = req.body;
  const { receiverEmail, emailSubject } = body;

  try {
    const result = await sendEmail(receiverEmail, emailSubject, 'listingInviteEmail', {
      appLogoUrl: config.APP_LOGO_URL,
    });

    if (result.success) {
      res.status(200).json({
        status: 'Success',
        message: 'Email sent',
      });
    } else {
      res.status(500).json({
        error: '[+] Error sending the listing invite.',
        details: result.error,
      });
    }
  } catch (error) {
    console.error(' ListingInvite.create', error);
    res.status(500).json({ error: '[+] Error creating the listing invite.' });
  }
};
