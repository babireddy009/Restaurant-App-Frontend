const STATUS_CONFIG = {
  pending:           { label: 'Pending',           cls: 'status-pending',           icon: '⏳' },
  confirmed:         { label: 'Confirmed',         cls: 'status-confirmed',         icon: '✅' },
  preparing:         { label: 'Preparing',         cls: 'status-preparing',         icon: '👨‍🍳' },
  ready:             { label: 'Ready',             cls: 'status-ready',             icon: '📦' },
  out_for_delivery:  { label: 'Out for Delivery',  cls: 'status-out_for_delivery',  icon: '🛵' },
  delivered:         { label: 'Delivered',         cls: 'status-delivered',         icon: '🎉' },
  cancelled:         { label: 'Cancelled',         cls: 'status-cancelled',         icon: '❌' },
};

export default function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || { label: status, cls: '', icon: '•' };
  return (
    <span className={`status-badge ${config.cls}`}>
      {config.icon} {config.label}
    </span>
  );
}
