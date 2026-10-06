const LABELS = {
  active: 'Active',
  completed: 'Completed',
  on_hold: 'On hold',
  draft: 'Draft',
  sent: 'Sent',
  paid: 'Paid',
  overdue: 'Overdue',
  succeeded: 'Succeeded',
  pending: 'Pending',
  requested: 'Requested',
  failed: 'Failed',
}

const TONES = {
  active: 'bg-indigo-50 text-indigo-700',
  sent: 'bg-indigo-50 text-indigo-700',
  draft: 'bg-slate-100 text-slate-600',
  on_hold: 'bg-slate-100 text-slate-600',
  paid: 'bg-emerald-50 text-emerald-600',
  completed: 'bg-emerald-50 text-emerald-600',
  succeeded: 'bg-emerald-50 text-emerald-600',
  failed: 'bg-red-50 text-red-600',
  overdue: 'bg-red-50 text-red-600',
  pending: 'bg-amber-50 text-amber-600',
  requested: 'bg-amber-50 text-amber-600',
}

export default function StatusBadge({ status }) {
  if (!status) return null

  return (
    <span
      className={
        'inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ' +
        (TONES[status] || 'bg-slate-100 text-slate-600')
      }
    >
      {LABELS[status] || status}
    </span>
  )
}
