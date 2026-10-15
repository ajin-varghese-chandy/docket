import { useEffect, useState } from 'react'

/*
 * Hairline wires connecting every home card to the centred hero image.
 *
 * Positions are measured from the live DOM (cards are found via their
 * data-wire-card attribute) and re-measured on resize, scroll and font load,
 * so the wires hold their shape at any viewport. Each wire is a cubic Bézier
 * with horizontal control points: it leaves the card flat, sweeps through the
 * gap and meets the image flat.
 */
export default function HeroWires({ rootRef, heroRef }) {
  const [wires, setWires] = useState([])

  useEffect(() => {
    const root = rootRef.current
    const hero = heroRef.current
    if (!root || !hero) return

    function measure() {
      const rootRect = root.getBoundingClientRect()
      const heroRect = hero.getBoundingClientRect()
      const centreX = heroRect.left + heroRect.width / 2 - rootRect.left
      const centreY = heroRect.top + heroRect.height / 2 - rootRect.top

      const next = []
      root.querySelectorAll('[data-wire-card]').forEach((el, i) => {
        const rect = el.getBoundingClientRect()
        const onLeft = el.dataset.wireCard === 'left'
        next.push({
          key: `${onLeft ? 'left' : 'right'}-${i}`,
          x1: (onLeft ? rect.right : rect.left) - rootRect.left + (onLeft ? 10 : -10),
          y1: rect.top + rect.height / 2 - rootRect.top,
          x2: centreX,
          y2: centreY,
          stroke: onLeft ? 'rgba(255, 255, 255, 0.16)' : 'rgba(99, 102, 241, 0.4)',
          dot: onLeft ? 'rgba(255, 255, 255, 0.32)' : 'rgba(99, 102, 241, 0.75)',
        })
      })
      setWires(next)
    }

    let frame = 0
    const schedule = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(measure)
    }

    measure()
    const observer = new ResizeObserver(schedule)
    observer.observe(root)
    window.addEventListener('resize', schedule, { passive: true })
    window.addEventListener('scroll', schedule, { passive: true })
    if (document.fonts?.ready) document.fonts.ready.then(schedule)

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      window.removeEventListener('resize', schedule)
      window.removeEventListener('scroll', schedule)
    }
  }, [rootRef, heroRef])

  return (
    <svg
      className="pointer-events-none absolute inset-0 z-[5] h-full w-full max-lg:hidden"
      aria-hidden="true"
    >
      {wires.map((wire) => {
        const dx = (wire.x2 - wire.x1) / 2
        const d = `M ${wire.x1} ${wire.y1} C ${wire.x1 + dx} ${wire.y1}, ${wire.x2 - dx} ${wire.y2}, ${wire.x2} ${wire.y2}`
        return (
          <g key={wire.key}>
            <path d={d} fill="none" stroke={wire.stroke} strokeWidth="1.5" />
            <circle cx={wire.x1} cy={wire.y1} r="3" fill={wire.dot} />
          </g>
        )
      })}
    </svg>
  )
}
