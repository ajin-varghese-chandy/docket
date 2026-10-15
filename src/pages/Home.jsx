import { useRef } from 'react'
import Logo from '../components/Logo.jsx'
import AudienceTag from '../components/home/AudienceTag.jsx'
import CardList from '../components/home/CardList.jsx'
import HeroWires from '../components/home/HeroWires.jsx'
import SiteFooter from '../components/home/SiteFooter.jsx'
import { BENEFITS, FEATURES } from '../components/home/homeContent.jsx'
import Login from './Login.jsx'

/*
 * Home = two panels split down the middle:
 *
 *   left  (dark)  — the freelancer pitch: brand bar, headline, feature cards
 *   right (light) — the client pitch: sign-in card, benefit cards
 *
 * Both panels are subgrids of the same rows — [intro, cards, filler] — so the
 * two card stacks land on one horizontal line across the seam. A single footer
 * spans both columns below them, and curved wires tie every card to the hero
 * image floating at the centre.
 */

/* Horizontal page padding for the dark panel and its footer half. */
const PAD = 'px-7 lg:px-10 xl:px-[52px]'

/* Dark panel background: blueprint grid + a soft glow in the bottom corner. */
const PANEL_BG = {
  backgroundImage: [
    'radial-gradient(640px 420px at 96% 104%, rgba(56, 189, 248, 0.14), transparent 62%)',
    'linear-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px)',
    'linear-gradient(90deg, rgba(255, 255, 255, 0.035) 1px, transparent 1px)',
  ].join(', '),
  backgroundSize: 'auto, 64px 64px, 64px 64px',
}

/* Light page background — same grid with dark lines, glow under the right half. */
const RIGHT_BG = {
  backgroundImage: [
    'radial-gradient(560px 420px at 88% 108%, rgba(56, 189, 248, 0.12), transparent 62%)',
    'linear-gradient(rgba(15, 23, 42, 0.05) 1px, transparent 1px)',
    'linear-gradient(90deg, rgba(15, 23, 42, 0.05) 1px, transparent 1px)',
  ].join(', '),
  backgroundSize: 'auto, 64px 64px, 64px 64px',
}

export default function Home() {
  const rootRef = useRef(null)
  const heroRef = useRef(null)

  return (
    <div
      ref={rootRef}
      style={RIGHT_BG}
      className="relative grid min-h-screen grid-cols-2 bg-indigo-50 max-lg:grid-cols-1 lg:grid-rows-[auto_auto_1fr_auto]"
    >
      {/* ── Left panel: the freelancer side ─────────────────────────────── */}
      <section
        style={PANEL_BG}
        className="relative flex min-h-screen flex-col bg-slate-950 text-slate-200 max-lg:order-1 lg:col-start-1 lg:grid lg:grid-rows-subgrid lg:min-h-0 lg:row-span-3"
      >
        {/* Row 1 — sticky brand bar + headline */}
        <div className="max-lg:contents">
          <div
            className={`sticky top-0 z-10 flex items-center gap-3 border-b border-white/[0.07] bg-slate-950/75 py-4 backdrop-blur-md ${PAD} max-lg:py-3.5`}
          >
            <Logo size={44} />
            <span className="text-[21px] font-extrabold leading-none tracking-[0.16em] text-white">
              DOCKET
            </span>
          </div>

          <div className={`pt-10 ${PAD} max-lg:pt-8`}>
            <div className="w-full max-w-[560px] lg:max-w-[80%]">
              <h1 className="mt-4 text-[34px] font-bold leading-[1.08] tracking-[-0.035em] text-white lg:text-[38px] xl:text-[44px] 2xl:text-[47px]">
                Run your business.
                <br />
                <span className="bg-gradient-to-r from-indigo-300 via-indigo-400 to-sky-400 bg-clip-text text-transparent">
                  Keep clients in the loop.
                </span>
              </h1>

              <p className="mt-6 max-w-[46ch] text-[15.5px] leading-[1.7] text-slate-400">
                Built for <span className="font-semibold text-slate-200">freelancers</span>: one
                workspace for your clients, projects, files and invoices.
              </p>

              <AudienceTag tone="dark" className="mt-3">
                For freelancers
              </AudienceTag>
            </div>
          </div>
        </div>

        {/* Row 2 — feature cards */}
        <div className={`mt-5 pb-8 ${PAD} max-lg:pb-8`}>
          <div className="w-full max-w-[560px] lg:max-w-[80%]">
            <CardList items={FEATURES} tone="dark" />
          </div>
        </div>

        {/* Row 3 — stretches the panel down to the footer */}
        <div aria-hidden="true" />
      </section>

      {/* ── Right panel: the client side ────────────────────────────────── */}
      <section className="z-20 flex min-h-screen max-w-[640px] flex-col justify-self-end border-l border-indigo-100 px-8 max-lg:order-3 max-lg:max-w-none max-lg:justify-self-stretch max-lg:border-l-0 max-lg:border-t max-lg:px-7 max-lg:py-10 lg:col-start-2 lg:grid lg:grid-rows-subgrid lg:min-h-0 lg:row-span-3">
        {/* Row 1 — sign-in card + audience tag */}
        <div className="mx-auto w-full max-w-[470px] pt-8 max-lg:pt-0">
          <Login />

          <div className="my-4 h-px w-full bg-indigo-200/80" />

          <AudienceTag tone="light">For clients</AudienceTag>
        </div>

        {/* Row 2 — benefit cards */}
        <div className="mx-auto mt-5 w-full max-w-[470px] pb-8 max-lg:pb-0">
          <CardList items={BENEFITS} tone="light" />
        </div>

        {/* Row 3 — stretches the panel down to the footer */}
        <div aria-hidden="true" />
      </section>

      {/* Curved wires tying every card to the centre image */}
      <HeroWires rootRef={rootRef} heroRef={heroRef} />

      {/* Hero image, shared by both sides (static on desktop, inline on mobile) */}
      <div
        ref={heroRef}
        className="pointer-events-none fixed left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 max-lg:static max-lg:order-2 max-lg:my-7 max-lg:translate-x-0 max-lg:translate-y-0 max-lg:justify-self-center"
      >
        <img
          src="/hero.png"
          alt=""
          aria-hidden="true"
          className="block w-[clamp(230px,22vw,320px)] animate-[docket-float_7s_ease-in-out_infinite] max-lg:w-[min(62vw,280px)] motion-reduce:animate-none"
        />
      </div>

      <SiteFooter />
    </div>
  )
}
