const STATUS_LABELS = { pending: 'قيد الانتظار', approved: 'مقبول', rejected: 'مرفوض' };

export default function StatusBadge({ status }) {
  return <span className={`admin-badge admin-badge-${status}`}>{STATUS_LABELS[status] || status}</span>;
}
