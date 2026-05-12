interface StatusBadgeProps {
  status: string;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'default';
}

const variantStyles = {
  success: 'bg-green-500/20 text-green-300',
  warning: 'bg-yellow-500/20 text-yellow-300',
  error: 'bg-red-500/20 text-red-300',
  info: 'bg-blue-500/20 text-blue-300',
  default: 'bg-[#1A1A1E] text-[#8E8E93]',
};

export function StatusBadge({ status, variant = 'default' }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantStyles[variant]}`}
    >
      {status}
    </span>
  );
}
