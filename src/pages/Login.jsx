import { useState } from 'react'
import { useAuth } from '../AuthContext.jsx'
import { isFirebaseConfigured } from '../firebase.js'
import Logo from '../components/Logo.jsx'

const ROLES = [
  {
    id: 'freelancer',
    title: 'I am a Freelancer',
    blurb: 'Manage clients, projects and invoices',
    button: 'bg-indigo-600 hover:bg-indigo-700',
  },
  {
    id: 'client',
    title: 'I am a Client',
    blurb: 'Track work, files and invoices',
    button: 'bg-emerald-600 hover:bg-emerald-700',
  },
]

const INPUT =
  'rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20'

export default function Login() {
  const { signIn, signInWithEmail, signUpWithEmail, signInAsDemoAccount } = useAuth()
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
  const [openRole, setOpenRole] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState('signin')

  async function handleSignIn(role) {
    setError('')
    setBusy(role)
    try {
      await signIn(role)
    } catch (err) {
      setError('Sign in failed: ' + err.message)
    } finally {
      setBusy('')
    }
  }

  async function handleEmail(role) {
    setError('')
    if (!email.trim()) {
      setError('Enter your email.')
      return
    }
    if (password.length < 6) {
      setError('Use at least 6 characters for your password.')
      return
    }

    setBusy('email-' + role)
    try {
      if (mode === 'signup') {
        await signUpWithEmail(email.trim(), password, role)
      } else {
        await signInWithEmail(email.trim(), password, role)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy('')
    }
  }

  async function handleDemo(email) {
    setError('')
    try {
      await signInAsDemoAccount(email)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="relative grid min-h-screen grid-cols-2 max-lg:grid-cols-1">
      <section className="no-scrollbar flex h-screen flex-col overflow-y-auto bg-slate-900 px-[52px] text-slate-200 max-lg:h-auto max-lg:overflow-visible max-lg:px-7">
        <div className="sticky top-0 z-10 -mx-[52px] flex items-center gap-3 bg-slate-900 px-[52px] py-4 max-lg:-mx-7 max-lg:px-7">
          <Logo size={52} />
          <span className="text-2xl font-extrabold tracking-[0.14em] text-white">DOCKET</span>
        </div>

        <div className="pb-16">
          <div className="flex min-h-[calc(100vh-84px)] flex-col justify-center gap-[18px]">
            <h1 className="text-[38px] leading-[1.15] tracking-[-0.03em] text-white">
              Run your business.
              <br />
              Keep clients in the loop.
            </h1>
            <p className="max-w-[460px] text-base text-slate-400">
              Freelancers manage clients, projects and invoices. Clients track the shared work, share
              files and pay invoices — one shared project, two sides.
            </p>

            <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
              {[
                'Clients, projects and invoices in a single flow',
                'One shared project both sides can open',
                'Razorpay payments between freelancer and client',
              ].map((point) => (
                <li
                  key={point}
                  className="relative pl-[26px] text-[14.5px] text-slate-300 before:absolute before:left-1 before:top-[7px] before:h-2 before:w-2 before:rounded-full before:bg-indigo-400"
                >
                  {point}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-3 pt-3">
            <div className="rounded-xl border border-white/10 bg-slate-800 p-4">
              <h2 className="mb-1.5 text-base font-bold text-white">What is DOCKET?</h2>
              <p className="text-sm leading-relaxed text-slate-400">
                DOCKET is a small workspace where a freelancer runs their business and their client
                follows the same work. One project, two sides, everything in one place — no
                spreadsheets, no lost email threads.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 max-lg:grid-cols-1">
              <div className="rounded-xl border border-white/10 bg-slate-800 p-4">
                <h2 className="mb-1.5 text-base font-bold text-white">For the freelancer</h2>
                <p className="text-sm leading-relaxed text-slate-400">
                  Keep your clients, projects and invoices in one place. Update project progress,
                  share files and send an invoice straight from the project page. The dashboard
                  shows what is active, what you are owed and what you have been paid.
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-slate-800 p-4">
                <h2 className="mb-1.5 text-base font-bold text-white">For the client</h2>
                <p className="text-sm leading-relaxed text-slate-400">
                  Open the same project your freelancer sees, with live progress, shared files and
                  every invoice in a list. Pay an invoice online and the freelancer watches it land
                  on their side instantly.
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-slate-800 p-4">
                <h2 className="mb-1.5 text-base font-bold text-white">How a project works</h2>
                <p className="text-sm leading-relaxed text-slate-400">
                  A project starts in the freelancer's list and is shared with the client. The
                  freelancer moves it along, uploads files and raises invoices; the client reviews
                  the same tabs — Overview, Invoices, Files and Payments — and pays when an invoice
                  arrives.
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-slate-800 p-4">
                <h2 className="mb-1.5 text-base font-bold text-white">Files and sharing</h2>
                <p className="text-sm leading-relaxed text-slate-400">
                  Deliverables live on the project. The freelancer uploads from the project page,
                  the client opens the same Files tab and picks them up — no attachment hunting
                  through email.
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-slate-800 p-4">
                <h2 className="mb-1.5 text-base font-bold text-white">Invoices</h2>
                <p className="text-sm leading-relaxed text-slate-400">
                  Draft an invoice from the project, send it when the work is done, and follow draft
                  → sent → paid in one list. Overdue dates are highlighted automatically so nothing
                  lingers.
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-slate-800 p-4">
                <h2 className="mb-1.5 text-base font-bold text-white">Payments with Razorpay</h2>
                <p className="text-sm leading-relaxed text-slate-400">
                  Invoices are paid through Razorpay — UPI, cards, netbanking and wallets. Every
                  payment is verified on the server before the invoice is marked paid, so a paid
                  invoice really means the money was taken.
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-slate-800 p-4">
                <h2 className="mb-1.5 text-base font-bold text-white">Dashboards</h2>
                <p className="text-sm leading-relaxed text-slate-400">
                  Both sides get a dashboard: active projects, clients, money outstanding and money
                  received — plus the latest projects and invoices, so the important numbers are
                  always the first thing you see.
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-slate-800 p-4">
                <h2 className="mb-1.5 text-base font-bold text-white">Sign in your way</h2>
                <p className="text-sm leading-relaxed text-slate-400">
                  Google or email and password through Firebase Auth. Without Firebase keys the app
                  drops into demo mode with sample accounts, so you can explore everything before
                  wiring up your own project.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="sticky top-0 z-20 flex h-screen max-w-[640px] flex-col justify-center justify-self-end border-l border-indigo-100 bg-indigo-50 px-9 max-lg:static max-lg:h-auto max-lg:max-w-none max-lg:justify-self-stretch max-lg:border-l-0 max-lg:border-t max-lg:px-7 max-lg:py-10">
        <h2 className="mb-[18px] text-xl font-bold">Choose how you are signing in</h2>

        {!isFirebaseConfigured ? (
          <p className="mb-4 rounded-[10px] border border-indigo-200 bg-indigo-50 px-3.5 py-3 text-sm text-indigo-800">
            Demo mode. Firebase keys are not configured, so sign-in is simulated with the sample
            accounts from <code>db.json</code>. Any password of 6 or more characters works.
          </p>
        ) : null}

        <div className="flex flex-col gap-3">
          {ROLES.map((role) => (
            <div
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
              key={role.id}
            >
              <button
                className="flex w-full cursor-pointer items-center gap-3.5 px-5 py-[18px] text-left transition hover:bg-slate-50"
                onClick={() => setOpenRole(openRole === role.id ? '' : role.id)}
              >
                <span className="flex min-w-0 flex-1 flex-col gap-1">
                  <strong className="text-base">{role.title}</strong>
                  <span className="text-[13.5px] text-slate-500">{role.blurb}</span>
                </span>
                <svg
                  className={
                    'h-5 w-5 shrink-0 text-slate-400 transition-transform ' +
                    (openRole === role.id ? 'rotate-90' : '')
                  }
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </button>

              {openRole === role.id ? (
                <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 p-4">
                  <button
                    className={
                      'flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-[10px] px-4 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ' +
                      role.button
                    }
                    onClick={() => handleSignIn(role.id)}
                    disabled={busy !== ''}
                  >
                    {busy === role.id ? 'Signing in…' : 'Continue with Google'}
                  </button>

                  <div className="flex items-center gap-2.5 text-[12px] uppercase tracking-wider text-slate-400">
                    <span className="h-px flex-1 bg-slate-200" />
                    or
                    <span className="h-px flex-1 bg-slate-200" />
                  </div>

                  <input
                    className={INPUT}
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                  <input
                    className={INPUT}
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Password"
                    autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  />

                  <button
                    className={
                      'flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-[10px] px-4 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ' +
                      role.button
                    }
                    onClick={() => handleEmail(role.id)}
                    disabled={busy !== ''}
                  >
                    {busy === 'email-' + role.id
                      ? 'Please wait…'
                      : mode === 'signup'
                        ? 'Create account'
                        : 'Sign in with email'}
                  </button>

                  <button
                    className="cursor-pointer self-center border-none bg-transparent p-0 text-[13px] font-semibold text-slate-500 transition hover:text-slate-900"
                    onClick={() => {
                      setMode(mode === 'signup' ? 'signin' : 'signup')
                      setError('')
                    }}
                  >
                    {mode === 'signup'
                      ? 'Already have an account? Sign in'
                      : 'New here? Create an account'}
                  </button>
                </div>
              ) : null}
            </div>
          ))}
        </div>

        {error ? (
          <p className="my-2.5 rounded-[10px] border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-600">
            {error}
          </p>
        ) : null}

        {!isFirebaseConfigured ? (
          <div className="mt-[22px] flex flex-col gap-2.5 text-[13.5px]">
            <span className="text-slate-500">Or open a specific sample account</span>
            <div className="flex flex-wrap gap-2">
              <button
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-[10px] border border-slate-200 bg-white px-4 py-[9px] text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                onClick={() => handleDemo('alex@docket.dev')}
              >
                Alex · Freelancer
              </button>
              <button
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-[10px] border border-slate-200 bg-white px-4 py-[9px] text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                onClick={() => handleDemo('sam@acme.com')}
              >
                Sam · Client (Acme)
              </button>
              <button
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-[10px] border border-slate-200 bg-white px-4 py-[9px] text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                onClick={() => handleDemo('priya@northwind.io')}
              >
                Priya · Client (Northwind)
              </button>
            </div>
          </div>
        ) : null}
      </section>

      <img
        src="/hero.png"
        alt=""
        aria-hidden="true"
        className="pointer-events-none fixed left-1/2 top-1/2 z-10 w-[min(42vw,380px)] -translate-x-1/2 -translate-y-1/2"
      />
    </div>
  )
}
