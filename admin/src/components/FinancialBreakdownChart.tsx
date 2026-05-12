interface BreakdownSlice {
  key: string;
  label: string;
  valueCents: number;
}

interface FinancialBreakdownChartProps {
  data: BreakdownSlice[];
}

const sliceColors = ['#7CF7FF', '#00CCCC', '#0D8B8E'];

function polarToCartesian(cx: number, cy: number, radius: number, angle: number) {
  const radians = ((angle - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(radians),
    y: cy + radius * Math.sin(radians),
  };
}

function describeArc(cx: number, cy: number, radius: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, radius, endAngle);
  const end = polarToCartesian(cx, cy, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
}

export function FinancialBreakdownChart({ data }: FinancialBreakdownChartProps) {
  const total = Math.max(
    data.reduce((sum, item) => sum + item.valueCents, 0),
    1,
  );
  let currentAngle = 0;

  return (
    <div className="rounded-lg border border-[#1A1A1E] bg-surface-alt p-4">
      <div className="mb-3 text-[11px] text-white">Revenue Breakdown</div>
      <div className="flex flex-col gap-4 rounded-lg bg-surface p-4 lg:flex-row lg:items-center">
        <div className="flex justify-center lg:w-55">
          <svg viewBox="0 0 180 180" className="h-45 w-45">
            <defs>
              <filter id="breakdown-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <circle
              cx="90"
              cy="90"
              r="54"
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="18"
            />
            {data.map((slice, index) => {
              const angle = (slice.valueCents / total) * 360;
              const startAngle = currentAngle;
              const endAngle = currentAngle + angle;
              currentAngle = endAngle;

              return (
                <path
                  key={slice.key}
                  d={describeArc(90, 90, 54, startAngle, endAngle)}
                  fill="none"
                  stroke={sliceColors[index % sliceColors.length]}
                  strokeWidth="18"
                  strokeLinecap="round"
                  filter="url(#breakdown-glow)"
                />
              );
            })}
            <text x="90" y="82" textAnchor="middle" fontSize="10" fill="#8E8E93">
              Total
            </text>
            <text x="90" y="102" textAnchor="middle" fontSize="16" fontWeight="700" fill="#FFFFFF">
              ${Math.round(total / 100).toLocaleString()}
            </text>
          </svg>
        </div>

        <div className="flex-1 space-y-3">
          {data.map((slice, index) => {
            const percentage = (slice.valueCents / total) * 100;

            return (
              <div
                key={slice.key}
                className="rounded-lg border border-[#1A1A1E] bg-surface-alt/40 px-3 py-2"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: sliceColors[index % sliceColors.length] }}
                    />
                    <span className="text-[11px] text-white">{slice.label}</span>
                  </div>
                  <span className="text-[10px] text-[#8E8E93]">{percentage.toFixed(1)}%</span>
                </div>
                <div className="mt-1 text-[12px] font-medium text-white">
                  $
                  {(slice.valueCents / 100).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
