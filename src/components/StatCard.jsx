const TONES = {
  warn: 'border-amber-200 bg-amber-50',
  good: 'border-emerald-200 bg-emerald-50',
}

export default function StatCard({ label, value, hint, tone }) {
  return (
    <div
      className={
        'flex flex-col gap-1 rounded-xl border border-slate-200 bg-white px-[18px] py-4 ' +
        (tone ? TONES[tone] : '')
      }
    >
      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </span>
      <strong className="text-[26px] tracking-[-0.02em]">{value}</strong>
      {hint ? <span className="text-xs text-slate-500">{hint}</span> : null}
    </div>
  )
}
