interface StatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
}

export function StatsCard({ title, value, change, icon }: StatsCardProps) {
  return (
    <div className="bg-[#111114] rounded-lg shadow p-6 border border-[#1A1A1E]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-[#8E8E93] font-medium">{title}</p>
          <p className="text-3xl font-bold text-white mt-2">{value}</p>
          {change && (
            <p className={`text-sm mt-2 ${change.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {change.isPositive ? '↑' : '↓'} {Math.abs(change.value)}%
            </p>
          )}
        </div>
        {icon && <div className="p-3 bg-[#00CCCC]/10 rounded-full text-[#00CCCC]">{icon}</div>}
      </div>
    </div>
  );
}
