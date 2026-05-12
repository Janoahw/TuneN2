interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: {
    value: number;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
}

export function StatsCard({ title, value, subtitle, change, icon }: StatsCardProps) {
  return (
    <div className="rounded-lg border border-[#1A1A1E] bg-[#111114] p-4 shadow">
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <p className="text-xs font-medium text-[#8E8E93]">{title}</p>
          <p className="mt-2 break-words font-['Space_Grotesk'] text-2xl font-bold text-white">
            {value}
          </p>
          {subtitle && <p className="mt-1 text-xs text-[#30D158]">{subtitle}</p>}
          {change && (
            <p className={`mt-2 text-xs ${change.isPositive ? 'text-[#30D158]' : 'text-[#FF453A]'}`}>
              {change.isPositive ? '↑' : '↓'} {Math.abs(change.value)}%
            </p>
          )}
        </div>
        {icon && (
          <div className="ml-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#00CCCC]/10 text-sm text-[#00CCCC]">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
