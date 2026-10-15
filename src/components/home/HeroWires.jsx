import { useEffect, useState } from 'react'

const EDGE_NUDGE = 10

const SIDES = {
  left: { stroke: 'rgba(255, 255, 255, 0.16)', dot: 'rgba(255, 255, 255, 0.32)' },
  right: { stroke: 'rgba(99, 102, 241, 0.4)', dot: 'rgba(99, 102, 241, 0.75)' },
}

const STROKE_WIDTH = 1.5
const DOT_RADIUS = 3


function toContainerCoords(x, y, containerRect) {
  return { x: x - containerRect.left, y: y - containerRect.top }
}


function startAtCard(cardRect, isLeftPanel, containerRect) {
  const x = isLeftPanel ? cardRect.right + EDGE_NUDGE : cardRect.left - EDGE_NUDGE
  const y = cardRect.top + cardRect.height / 2
  return toContainerCoords(x, y, containerRect)
}


function endAtHero(heroRect, containerRect) {
  const x = heroRect.left + heroRect.width / 2
  const y = heroRect.top + heroRect.height / 2
  return toContainerCoords(x, y, containerRect)
}


function curvePath(from, to) {
  const halfway = (to.x - from.x) / 2
  return [
    `M ${from.x} ${from.y}`,
    `C ${from.x + halfway} ${from.y}`,
    `${to.x - halfway} ${to.y}`,
    `${to.x} ${to.y}`,
  ].join(' ')
}


function measureWires(container, hero) {
  const containerRect = container.getBoundingClientRect()
  const end = endAtHero(hero.getBoundingClientRect(), containerRect)

  return Array.from(container.querySelectorAll('[data-wire-card]'), (card, index) => {
    const isLeftPanel = card.dataset.wireCard === 'left'
    const side = isLeftPanel ? 'left' : 'right'

    return {
      key: side + '-' + index,
      start: startAtCard(card.getBoundingClientRect(), isLeftPanel, containerRect),
      end: end,
      ...SIDES[side],
    }
  })
}



export default function HeroWires({ rootRef, heroRef }) {
  const [wires, setWires] = useState([])

  useEffect(() => {
    const container = rootRef.current
    const hero = heroRef.current
    if (!container || !hero) return

    let frame = 0
    function remeasure() {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => setWires(measureWires(container, hero)))
    }

    remeasure()

    const observer = new ResizeObserver(remeasure)
    observer.observe(container)
    window.addEventListener('resize', remeasure, { passive: true })
    window.addEventListener('scroll', remeasure, { passive: true })
    if (document.fonts?.ready) document.fonts.ready.then(remeasure)

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      window.removeEventListener('resize', remeasure)
      window.removeEventListener('scroll', remeasure)
    }
  }, [rootRef, heroRef])

  return (
    <svg
      className="pointer-events-none absolute inset-0 z-[5] h-full w-full max-lg:hidden"
      aria-hidden="true"
    >
      {wires.map((wire) => (
        <g key={wire.key}>
          <path
            d={curvePath(wire.start, wire.end)}
            fill="none"
            stroke={wire.stroke}
            strokeWidth={STROKE_WIDTH}
          />
          <circle cx={wire.start.x} cy={wire.start.y} r={DOT_RADIUS} fill={wire.dot} />
        </g>
      ))}
    </svg>
  )
}
