import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import { adminApi } from '../services/api';

export default function PayoutDetailPage() {
  const { withdrawalId } = useParams<{ withdrawalId: string }>();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-withdrawal', withdrawalId],
    queryFn: async () => {
      const response = await adminApi.content.withdrawals.get(withdrawalId!);
      return response.data.data;
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

  const feeAmount = data.feeAmount || 0;
  const netAmount = data.amount - feeAmount;

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-white text-2xl font-bold font-['Space_Grotesk']">
            Payout #{data.id.slice(0, 13).toUpperCase()}
          </h1>
          <button
            onClick={() => navigate('/financials')}
            className="text-[#00CCCC] text-sm font-normal hover:underline"
          >
            Back to Payouts
          </button>
        </div>

        {/* Main Details */}
        <div className="bg-[#111114] rounded-xl p-6 border border-[#1A1A1E]">
          <div className="grid grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="flex flex-col gap-4">
              <div>
                <div className="text-[#A0A0AB] text-sm font-semibold mb-1">Artist</div>
                <div className="flex items-center gap-3">
                  {data.artist?.user?.avatarUrl && (
                    <img
                      src={data.artist.user.avatarUrl}
                      alt={data.artist.user.displayName}
                      className="w-10 h-10 rounded-full"
                    />
                  )}
                  <div>
                    <div className="text-white font-medium">{data.artist?.user?.displayName}</div>
                    <div className="text-[#6E6E78] text-sm">{data.artist?.user?.email}</div>
                  </div>
                </div>
              </div>

              <div>
                <div className="text-[#A0A0AB] text-sm font-semibold mb-1">Amount Requested</div>
                <div className="text-white text-2xl font-bold">
                  ${(data.amount / 100).toFixed(2)}
                </div>
              </div>

              <div>
                <div className="text-[#A0A0AB] text-sm font-semibold mb-1">Platform Fee</div>
                <div className="text-white">${(feeAmount / 100).toFixed(2)}</div>
              </div>

              <div>
                <div className="text-[#A0A0AB] text-sm font-semibold mb-1">Net Payout</div>
                <div className="text-white text-xl font-bold">${(netAmount / 100).toFixed(2)}</div>
              </div>
            </div>

            {/* Right Column */}
            <div className="flex flex-col gap-4">
              <div>
                <div className="text-[#A0A0AB] text-sm font-semibold mb-1">Status</div>
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

              <div>
                <div className="text-[#A0A0AB] text-sm font-semibold mb-1">Requested On</div>
                <div className="text-white">{new Date(data.createdAt).toLocaleString()}</div>
              </div>

              {data.processedAt && (
                <div>
                  <div className="text-[#A0A0AB] text-sm font-semibold mb-1">Processed On</div>
                  <div className="text-white">{new Date(data.processedAt).toLocaleString()}</div>
                </div>
              )}

              {data.stripeTransferId && (
                <div>
                  <div className="text-[#A0A0AB] text-sm font-semibold mb-1">
                    Stripe Transfer ID
                  </div>
                  <div className="text-white font-mono text-sm">{data.stripeTransferId}</div>
                </div>
              )}

              {data.failureReason && (
                <div>
                  <div className="text-[#A0A0AB] text-sm font-semibold mb-1">Failure Reason</div>
                  <div className="text-red-400">{data.failureReason}</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Artist Balance Info */}
        {data.artist && (
          <div className="bg-[#111114] rounded-xl p-6 border border-[#1A1A1E]">
            <h2 className="text-white text-lg font-semibold font-['Space_Grotesk'] mb-4">
              Artist Balance
            </h2>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <div className="text-[#A0A0AB] text-sm font-semibold mb-1">Current Balance</div>
                <div className="text-white text-xl font-bold">
                  ${((data.artist.balance || 0) / 100).toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-[#A0A0AB] text-sm font-semibold mb-1">Total Withdrawn</div>
                <div className="text-white text-xl font-bold">
                  ${((data.artist.totalWithdrawn || 0) / 100).toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-[#A0A0AB] text-sm font-semibold mb-1">Total Earnings</div>
                <div className="text-white text-xl font-bold">
                  ${((data.artist.totalEarnings || 0) / 100).toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
