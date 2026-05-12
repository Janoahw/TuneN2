interface StatusBadgeProps {
  status: string;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'default';
}

const variantStyles = {
  success: 'bg-[#30D158]/15 text-[#30D158]',
  warning: 'bg-[#FFD60A]/15 text-[#FFD60A]',
  error: 'bg-[#FF453A]/15 text-[#FF453A]',
  info: 'bg-[#00CCCC]/15 text-[#00CCCC]',
  default: 'bg-[#1A1A1E] text-[#8E8E93]',
};

export function StatusBadge({ status, variant = 'default' }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variantStyles[variant]}`}
    >
      {status}
    </span>
  );
}
