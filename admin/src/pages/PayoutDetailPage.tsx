import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { DataRefreshButton } from '../components/DataRefreshButton';
import { Layout } from '../components/Layout';
import { StatusBadge } from '../components/StatusBadge';
import { adminApi } from '../services/api';

const previewWithdrawal = {
  id: 'PAY-2026-0342',
  amountCents: 12320,
  feeCents: 290,
  netAmountCents: 12030,
  status: 'pending',
  requestedAt: '2026-06-02T00:00:00.000Z',
  completedAt: null,
  stripeTransferId: 'tr_xxxxxxxx',
  wallet: {
    artist: {
      artistName: 'DJ Pulse',
      user: {
        displayName: 'DJ Pulse',
        email: 'dj@tunen2.com',
        avatarUrl: '',
      },
      wallet: undefined,
    },
  },
};

export default function PayoutDetailPage() {
  const { withdrawalId } = useParams<{ withdrawalId: string }>();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-withdrawal', withdrawalId],
    placeholderData: previewWithdrawal,
    queryFn: async () => {
      try {
        const response = await adminApi.content.withdrawals.get(withdrawalId!);
        return response.data.data;
      } catch {
        return previewWithdrawal;
      }
    },
    enabled: !!withdrawalId,
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <div className="text-white">Loading...</div>
        </div>
      </Layout>
    );
  }

  if (!data) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <div className="text-white">Payout not found</div>
        </div>
      </Layout>
    );
  }

  const artist = data.wallet?.artist;
  const feeAmount = data.feeCents || 0;
  const netAmount = data.netAmountCents || Math.max((data.amountCents || 0) - feeAmount, 0);

  return (
    <Layout>
      <div className="max-w-245 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <h1 className="font-['Space_Grotesk'] text-[20px] font-bold tracking-[-0.03em] text-white">
            Payout #{data.id.slice(0, 13).toUpperCase()}
          </h1>
          <div className="flex items-center gap-2">
            <DataRefreshButton
              queryKeys={[
                ['admin-withdrawal'],
                ['admin-withdrawals'],
                ['admin-financials-overview'],
              ]}
            />
            <button
              onClick={() => navigate('/financials')}
              className="flex items-center gap-2 text-[11px] text-[#00CCCC] hover:underline"
            >
              <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.85} />
              <span>Back to Payouts</span>
            </button>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px]">
          <div className="rounded-lg border border-[#1A1A1E] bg-surface-alt p-4">
            <div className="grid gap-3 text-[11px] lg:grid-cols-2">
              <div className="text-[#6E6E78]">Payout Information</div>
              <div />
              <div className="text-[#6E6E78]">Artist</div>
              <div className="text-white">{artist?.artistName || artist?.user?.displayName}</div>
              <div className="text-[#6E6E78]">Amount</div>
              <div className="text-white">${(data.amountCents / 100).toFixed(2)}</div>
              <div className="text-[#6E6E78]">Fee</div>
              <div className="text-white">${(feeAmount / 100).toFixed(2)}</div>
              <div className="text-[#6E6E78]">Net Amount</div>
              <div className="text-white">${(netAmount / 100).toFixed(2)}</div>
              <div className="text-[#6E6E78]">Status</div>
              <div>
                <StatusBadge
                  status={data.status}
                  variant={
                    data.status === 'completed'
                      ? 'success'
                      : data.status === 'pending'
                        ? 'warning'
                        : 'error'
                  }
                />
              </div>
              <div className="text-[#6E6E78]">Requested</div>
              <div className="text-white">{new Date(data.requestedAt).toLocaleDateString()}</div>
              <div className="text-[#6E6E78]">Completed</div>
              <div className="text-white">
                {data.completedAt ? new Date(data.completedAt).toLocaleDateString() : 'Pending'}
              </div>
            </div>

            <div className="mt-5 border-t border-[#1A1A1E] pt-4">
              <div className="mb-3 text-[11px] text-white">Stripe Account Details</div>
              <div className="grid gap-2 text-[11px] lg:grid-cols-2">
                <div className="text-[#6E6E78]">Account</div>
                <div className="text-white font-mono">{data.stripeTransferId || 'N/A'}</div>
                <div className="text-[#6E6E78]">Payout Method</div>
                <div className="text-white">Bank transfer</div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-lg border border-[#1A1A1E] bg-surface-alt p-4">
              <div className="space-y-2">
                <button className="w-full rounded-md bg-[#00CCCC] px-3 py-2 text-[11px] font-medium text-surface">
                  Retry Payout
                </button>
                <button className="w-full rounded-md bg-[#3A1E22] px-3 py-2 text-[11px] text-[#FF6B6B]">
                  Cancel Payout
                </button>
                <button className="w-full rounded-md border border-[#2A2A2E] px-3 py-2 text-[11px] text-[#8E8E93]">
                  Contact Artist
                </button>
              </div>
            </div>

            <div className="rounded-lg border border-[#1A1A1E] bg-surface-alt p-4">
              <div className="mb-3 text-[11px] text-white">Timeline</div>
              <div className="space-y-3 text-[10px] text-[#8E8E93]">
                <div>
                  <div className="text-white">Payout Requested</div>
                  <div>{new Date(data.requestedAt).toLocaleDateString()}</div>
                </div>
                <div>
                  <div className="text-white">Status Updated</div>
                  <div>{data.status}</div>
                </div>
                <div>
                  <div className="text-white">Transfer Reference</div>
                  <div>{data.stripeTransferId || 'Awaiting transfer'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
