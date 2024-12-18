import { Router } from 'express';

import { sendListingInviteEmail } from '../controllers/email.controller';

const emailRouter = Router();

// Send ListingInvite mail
emailRouter.post('/listing-invite', sendListingInviteEmail);

export default emailRouter;
