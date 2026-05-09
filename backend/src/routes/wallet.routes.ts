import { Router } from 'express';
import type { Request, Response } from 'express';
import { authenticate } from '../middleware/auth.js';
import { requireArtist } from '../middleware/requireArtist.js';
import { WalletService } from '../services/wallet.service.js';

const router = Router();

// GET /api/v1/wallet — S8.2
router.get('/', authenticate, requireArtist, async (req: Request, res: Response) => {
  const wallet = await WalletService.getWallet(req.user!.id);
  res.json({ wallet });
});

// GET /api/v1/wallet/transactions — S8.3
router.get('/transactions', authenticate, requireArtist, async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
  const type = req.query.type as string | undefined;

  const result = await WalletService.getTransactions(req.user!.id, { page, limit, type });
  res.json(result);
});

// POST /api/v1/wallet/withdraw — S8.5
router.post('/withdraw', authenticate, requireArtist, async (req: Request, res: Response) => {
  const { amount } = req.body;

  if (typeof amount !== 'number' || amount <= 0) {
    res.status(400).json({ error: 'Amount must be a positive number' });
    return;
  }

  const result = await WalletService.requestWithdrawal(req.user!.id, amount);
  res.status(201).json(result);
});

// GET /api/v1/wallet/withdrawals — S8.9
router.get('/withdrawals', authenticate, requireArtist, async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);

  const result = await WalletService.getWithdrawals(req.user!.id, { page, limit });
  res.json(result);
});

export { router as walletRouter };
