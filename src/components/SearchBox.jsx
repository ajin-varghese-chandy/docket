const TONES = {
  indigo: 'focus:border-indigo-600 focus:ring-indigo-600/20',
  emerald: 'focus:border-emerald-600 focus:ring-emerald-600/20',
}

export default function SearchBox({
  value,
  onChange,
  placeholder = 'Search…',
  tone = 'indigo',
  className = '',
}) {
  return (
    <div className={'relative flex items-center ' + className}>
      <svg
        className="pointer-events-none absolute left-3 h-[17px] w-[17px] text-slate-400"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M21 21l-4.3-4.3M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
      </svg>

      <input
        className={
          'w-full rounded-[10px] border border-slate-200 bg-white py-2.5 pl-9 pr-9 text-sm outline-none transition placeholder:text-slate-400 ' +
          TONES[tone]
        }
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
      />

      {value ? (
        <button
          className="absolute right-2.5 cursor-pointer text-slate-400 transition hover:text-slate-700"
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      ) : null}
    </div>
  )
}
