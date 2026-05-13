interface FinancialTrendPoint {
  label: string;
  grossRevenueCents: number;
}

interface FinancialLineChartProps {
  data: FinancialTrendPoint[];
}

export function FinancialLineChart({ data }: FinancialLineChartProps) {
  const width = 520;
  const height = 180;
  const paddingX = 18;
  const chartTop = 18;
  const chartBottom = 130;
  const chartHeight = chartBottom - chartTop;
  const maxValue = Math.max(...data.map((point) => point.grossRevenueCents), 1);
  const stepX = data.length > 1 ? (width - paddingX * 2) / (data.length - 1) : 0;

  const points = data.map((point, index) => {
    const x = paddingX + stepX * index;
    const y = chartBottom - (point.grossRevenueCents / maxValue) * chartHeight;
    return { ...point, x, y };
  });

  const linePath = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1]?.x ?? paddingX} ${chartBottom} L ${points[0]?.x ?? paddingX} ${chartBottom} Z`;
  const gridLines = [0.25, 0.5, 0.75].map((ratio) => chartBottom - chartHeight * ratio);

  return (
    <div className="rounded-lg border border-[#1A1A1E] bg-surface-alt p-4">
      <div className="mb-3 text-[11px] text-white">Revenue Over Time</div>
      <div className="rounded-lg bg-surface px-3 py-4">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-45 w-full">
          <defs>
            <linearGradient id="financial-trend-line" x1="0%" x2="100%" y1="0%" y2="0%">
              <stop offset="0%" stopColor="#7CF7FF" />
              <stop offset="55%" stopColor="#00CCCC" />
              <stop offset="100%" stopColor="#006F73" />
            </linearGradient>
            <linearGradient id="financial-trend-area" x1="0%" x2="0%" y1="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(124,247,255,0.35)" />
              <stop offset="100%" stopColor="rgba(0,204,204,0.03)" />
            </linearGradient>
          </defs>

          {gridLines.map((y) => (
            <line
              key={y}
              x1={paddingX}
              x2={width - paddingX}
              y1={y}
              y2={y}
              stroke="rgba(255,255,255,0.08)"
              strokeDasharray="4 6"
            />
          ))}

          <path d={areaPath} fill="url(#financial-trend-area)" />
          <path
            d={linePath}
            fill="none"
            stroke="url(#financial-trend-line)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {points.map((point) => (
            <g key={point.label}>
              <circle
                cx={point.x}
                cy={point.y}
                r="4.5"
                fill="#0D0D0F"
                stroke="#7CF7FF"
                strokeWidth="2"
              />
              <circle cx={point.x} cy={point.y} r="2" fill="#FFFFFF" opacity="0.85" />
              <text x={point.x} y={height - 14} textAnchor="middle" fontSize="10" fill="#8E8E93">
                {point.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
