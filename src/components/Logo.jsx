export default function Logo({ size = 32 }) {
  return (
    <img
      src="/logo.png"
      alt="DOCKET"
      width={size}
      height={size}
      className="block shrink-0 object-contain"
    />
  )
}
