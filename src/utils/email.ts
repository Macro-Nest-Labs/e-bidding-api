import { Document, Types } from 'mongoose';
import nodemailer from 'nodemailer';
import hbs from 'nodemailer-express-handlebars';
import path from 'path';

import { config } from '../config';
import { IBuyer } from '../types/Buyer';
import { ISupplier } from '../types/Supplier';
import { log } from './console';

export const sendEmail = async (to: string, subject: string, templateName: string, templateContext: { [key: string]: unknown }) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp-relay.sendinblue.com',
    port: 587,
    secure: false,
    auth: {
      user: config.ADMIN_EMAIL,
      pass: config.BREVO_PASSWORD,
    },
  });

  transporter.use(
    'compile',
    hbs({
      viewEngine: {
        extname: '.handlebars',
        partialsDir: path.resolve('src/email-templates'),
        layoutsDir: path.resolve('src/email-templates/layouts'),
        defaultLayout: 'main', // assuming main.handlebars is your default layout file
      },
      viewPath: path.resolve('src/email-templates'),
      extName: '.handlebars',
    }),
  );

  try {
    transporter.sendMail({
      from: config.ADMIN_EMAIL,
      to: to,
      subject: subject,
      // @ts-expect-error not present
      template: templateName,
      context: templateContext,
    });

    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
};

export const sendEmailToSupplier = async (
  supplier: Document<unknown, NonNullable<unknown>, ISupplier> &
    ISupplier & {
      _id: Types.ObjectId;
    },
  subject: string,
  auctionName: string,
) => {
  const emailTemplate = 'supplierNotificationEmail'; // Assuming you have a template for supplier notifications
  const emailContext = {
    appLogoUrl: config.APP_LOGO_URL,
    name: `${supplier.firstName} ${supplier.lastName}`,
    auctionName: auctionName,
  };

  const emailResult = await sendEmail(supplier.email, subject, emailTemplate, emailContext);

  if (emailResult.success) {
    log(`Email successfully sent to ${supplier.email}`, 'GREEN');
  } else {
    console.error(`Failed to send email to ${supplier.email}: ${emailResult.error}`);
  }
};

export const sendEmailToBuyer = async (
  buyer: Document<unknown, NonNullable<unknown>, IBuyer> &
    IBuyer & {
      _id: Types.ObjectId;
    },
  subject: string,
  auctionName: string,
  auctionSummary: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    lots: any[];
  },
) => {
  const emailTemplate = 'buyerAuctionSummaryEmail'; // Assuming you have a template for the auction summary
  const emailContext = {
    appLogoUrl: config.APP_LOGO_URL,
    buyerName: `${buyer.firstName} ${buyer.lastName}`,
    auctionName: auctionName,
    auctionSummary: auctionSummary,
  };

  const emailResult = await sendEmail(buyer.email, subject, emailTemplate, emailContext);

  if (emailResult.success) {
    log(`Auction summary email successfully sent to ${buyer.email}`, 'GREEN');
  } else {
    console.error(`Failed to send auction summary email to ${buyer.email}: ${emailResult.error}`);
  }
};
