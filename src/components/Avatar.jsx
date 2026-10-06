import { initials } from '../format.js'

export default function Avatar({ name, color = '#4f46e5', photoURL, size = 40 }) {
  if (photoURL) {
    return (
      <img
        className="shrink-0 rounded-full object-cover"
        src={photoURL}
        alt={name}
        style={{ width: size, height: size }}
      />
    )
  }

  return (
    <div
      className="grid shrink-0 place-items-center rounded-full font-bold tracking-wide text-white"
      style={{ width: size, height: size, background: color, fontSize: size * 0.38 }}
    >
      {initials(name)}
    </div>
  )
}
