

const CARD_STYLE = {
  dark: {
    side: 'left',
    card:
      'group flex gap-4 border border-white/[0.07] bg-white/[0.035] p-4 transition duration-200 hover:-translate-y-px hover:border-indigo-400/30 hover:bg-white/[0.06]',
    tile:
      'grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-indigo-400/25 bg-indigo-500/15 text-indigo-200 transition duration-200 group-hover:bg-indigo-500/25',
    title: 'text-[13px] font-bold uppercase tracking-[0.14em] text-white',
    text: 'mt-1.5 text-[14.5px] leading-[1.68] text-slate-400',
    lead: 'font-semibold text-slate-200',
  },
  light: {
    side: 'right',
    card:
      'group flex gap-4 border border-slate-200 bg-white p-4 transition duration-200 hover:-translate-y-px hover:border-indigo-300 hover:shadow-[0_16px_36px_-26px_rgba(15,23,42,0.4)]',
    tile:
      'grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-indigo-100 bg-indigo-50 text-indigo-600 transition duration-200 group-hover:bg-indigo-100',
    title: 'text-[13px] font-bold uppercase tracking-[0.14em] text-slate-900',
    text: 'mt-1.5 text-[14.5px] leading-[1.68] text-slate-600',
    lead: 'font-semibold text-slate-900',
  },
}

export default function CardList({ items, tone }) {
  const style = CARD_STYLE[tone]

  return (
    <ul className="flex flex-col gap-3">
      {items.map((item) => (
        <li key={item.title} data-wire-card={style.side} className={style.card}>
          <span className={style.tile}>
            <svg
              className="h-[18px] w-[18px]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              focusable="false"
            >
              {item.icon}
            </svg>
          </span>
          <div className="min-w-0">
            <h3 className={style.title}>{item.title}</h3>
            <p className={style.text}>
              <span className={style.lead}>{item.lead}</span> {item.text}
            </p>
          </div>
        </li>
      ))}
    </ul>
  )
}
