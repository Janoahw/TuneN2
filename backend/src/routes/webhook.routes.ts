import { Router } from 'express';
import type { Request, Response } from 'express';
import { stripe } from '../config/stripe.js';
import { env } from '../config/env.js';
import { ArtistService } from '../services/artist.service.js';
import { logger } from '../utils/logger.js';

const router = Router();

router.post('/stripe', async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;

  if (!sig || !env.STRIPE_WEBHOOK_SECRET) {
    res.status(400).json({ error: 'Missing signature or webhook secret' });
    return;
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, env.STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    logger.warn({ err: err.message }, 'Stripe webhook signature verification failed');
    res.status(400).json({ error: 'Invalid signature' });
    return;
  }

  try {
    switch (event.type) {
      case 'invoice.paid':
      case 'invoice.payment_failed': {
        const invoice = event.data.object as any;
        await ArtistService.handleSubscriptionEvent(event.type, {
          id: invoice.subscription as string,
          customer: invoice.customer as string,
          status: invoice.status,
          current_period_end: invoice.lines?.data?.[0]?.period?.end,
        });
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any;
        await ArtistService.handleSubscriptionEvent(event.type, {
          id: subscription.id,
          customer: subscription.customer as string,
          status: subscription.status,
        });
        break;
      }
      default:
        logger.debug({ type: event.type }, 'Unhandled Stripe event');
    }
  } catch (err) {
    logger.error({ err, eventType: event.type }, 'Error processing Stripe webhook');
    res.status(500).json({ error: 'Webhook processing failed' });
    return;
  }

  res.json({ received: true });
});

export { router as webhookRouter };
