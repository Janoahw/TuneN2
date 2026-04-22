import { Router } from 'express';
import type { Request, Response } from 'express';
import { stripe } from '../config/stripe.js';
import { env } from '../config/env.js';
import { PurchaseService } from '../services/purchase.service.js';
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
      // ── Song purchase events ──────────────
      case 'payment_intent.succeeded': {
        const pi = event.data.object as any;
        if (pi.metadata?.type === 'song_purchase') {
          await PurchaseService.handlePaymentSuccess(pi.id);
        }
        break;
      }
      case 'payment_intent.payment_failed': {
        const pi = event.data.object as any;
        if (pi.metadata?.type === 'song_purchase') {
          await PurchaseService.handlePaymentFailed(pi.id);
        }
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
