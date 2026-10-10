import Logo from '../components/Logo.jsx'
import Login from './Login.jsx'

const STEPS = [
  {
    title: 'Single flow',
    lead: 'Add the client once.',
    text: ' Projects, files and invoices hang off that one record.',
  },
  {
    title: 'Shared project',
    lead: 'One link, both sides.',
    text: 'Clients see your progress, files, and invoices in one shared view.',
  },
  {
    title: 'Razorpay payments',
    lead: 'Pay button, then checkout.',
    text: 'Clients pay by UPI or card, with Razorpay handling checkout.',
  },
]

const PAD = 'px-7 lg:px-10 xl:px-[52px]'

function Footer({ className }) {
  return (
    <footer className={className}>
      <span>© {new Date().getFullYear()} DOCKET</span>
      <span className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <span>Payments secured by Razorpay</span>
        <span className="max-sm:hidden">Built for freelancers &amp; clients</span>
      </span>
    </footer>
  )
}

export default function Home() {
  return (
    <div className="relative grid min-h-screen grid-cols-2 bg-indigo-50 max-lg:grid-cols-1">
      <section className="no-scrollbar flex h-screen flex-col overflow-y-auto bg-slate-900 text-slate-200 max-lg:order-1 max-lg:h-auto max-lg:overflow-visible">
        <div className={`sticky top-0 z-10 flex items-center gap-3 bg-slate-900 py-4 ${PAD} max-lg:py-3.5`}>
          <Logo size={46} />
          <span className="text-[22px] font-extrabold tracking-[0.14em] text-white ">DOCKET</span>
        </div>

        <div
          className={`flex flex-1 flex-col justify-center py-2 ${PAD} max-lg:py-8`}
        >
          <div className="w-full max-w-[560px] lg:max-w-[80%]">


            <h1 className="text-[34px] p-2 w-fit bg-indigo-50 leading-[1.12] tracking-[-0.03em] text-slate-900 lg:text-[30px] xl:text-[36px] 2xl:text-[38px]">
              Run your business.
              <br />
              Keep clients in the loop.
            </h1>

            <p className="mt-4 text-[15.5px] leading-[1.7] text-slate-400">
              Freelancers manage clients, projects and invoices. <br /> Clients track shared work, files
              and payments.{' '} <br />

            </p>

            <div className="mt-6">
              <h2 className="inline-block border-b-2 font-extrabold text-slate-900 border-indigo-400 pb-1.5 text-[16px] underline uppercase tracking-[0.16em] bg-indigo-50 p-1">
                How it works
              </h2>

              <ol className="mt-6 flex flex-col gap-5 ">
                {STEPS.map((step) => (
                  <li key={step.title}>
                    <h3 className=" bg-indigo-50 p-1 w-fit text-[15.5px] font-semibold uppercase text-slate-900 underline decoration-indigo-400 decoration-2 underline-offset-4">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-[15.5px] leading-[1.72] text-slate-400">
                      <span className="text-slate-200">{step.lead}</span> <br />
                      {step.text}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>

        <Footer
          className={`hidden border-t border-white/10 bg-slate-900 py-4 text-[11.5px] text-slate-400 max-lg:hidden lg:flex lg:flex-wrap lg:items-center lg:justify-between lg:gap-x-6 lg:gap-y-1.5 ${PAD}`}
        />
      </section>

      <Login />

      <div className="pointer-events-none fixed left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 max-lg:static max-lg:order-2 max-lg:my-7 max-lg:translate-x-0 max-lg:translate-y-0 max-lg:justify-self-center">
        <img
          src="/hero.png"
          alt=""
          aria-hidden="true"
          className="block w-[clamp(230px,22vw,320px)] animate-[docket-float_7s_ease-in-out_infinite] max-lg:w-[min(62vw,280px)] motion-reduce:animate-none"
        />
      </div>

      <Footer
        className="hidden border-t border-white/10 bg-slate-900 px-7 py-4 text-[11.5px] text-slate-400 max-lg:order-4 max-lg:flex max-lg:flex-wrap max-lg:items-center max-lg:justify-between max-lg:gap-x-5 max-lg:gap-y-1.5"
      />
    </div>
  )
}
