/*
 * "For freelancers" / "For clients" marker.
 *
 * Flat and squared off — no border, no radius, asymmetric padding so the block
 * hugs its text like a stamped index label. `tone` picks the panel palette;
 * extra spacing (e.g. mt-3) can be passed via className.
 */

const TAG_STYLE = {
  dark: 'bg-indigo-500/20 text-indigo-200',
  light: 'bg-indigo-100 text-indigo-700',
}

export default function AudienceTag({ tone, className = '', children }) {
  return (
    <p
      className={`inline-block px-2.5 py-1 pr-3 text-[11px] font-bold uppercase tracking-[0.24em] ${TAG_STYLE[tone]} ${className}`}
    >
      {children}
    </p>
  )
}
