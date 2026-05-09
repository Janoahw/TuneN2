import { Router } from 'express';
import type { Request, Response } from 'express';
import { stripe } from '../config/stripe.js';
import { env } from '../config/env.js';
import { prisma } from '../config/database.js';
import { PurchaseService } from '../services/purchase.service.js';
import { WalletService } from '../services/wallet.service.js';
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

  // S8.11 / S8.12: Idempotency guard — skip already-processed events
  const alreadyProcessed = await prisma.processedWebhook.findUnique({
    where: { stripeEventId: event.id },
  });
  if (alreadyProcessed) {
    logger.debug({ eventId: event.id }, 'Duplicate webhook — skipping');
    res.json({ received: true });
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

      // ── Transfer events (S8.6) ──────────────
      case 'transfer.paid': {
        const transfer = event.data.object as any;
        await WalletService.handleTransferPaid(transfer.id);
        break;
      }
      case 'transfer.failed': {
        const transfer = event.data.object as any;
        await WalletService.handleTransferFailed(transfer.id);
        break;
      }

      default:
        logger.debug({ type: event.type }, 'Unhandled Stripe event');
    }

    // Mark event as processed (idempotency)
    await prisma.processedWebhook.create({
      data: {
        stripeEventId: event.id,
        eventType: event.type,
      },
    });
  } catch (err) {
    logger.error({ err, eventType: event.type }, 'Error processing Stripe webhook');
    res.status(500).json({ error: 'Webhook processing failed' });
    return;
  }

  res.json({ received: true });
});

export { router as webhookRouter };
