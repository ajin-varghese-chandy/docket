import { useState } from 'react'
import { useAuth } from '../AuthContext.jsx'
import { isFirebaseConfigured } from '../firebase.js'

const ROLES = [
  {
    id: 'freelancer',
    title: 'I am a Freelancer',
    lead: 'Manage',
    blurb: ' clients, projects and invoices',
    button: 'bg-indigo-600 hover:bg-indigo-700 focus-visible:ring-indigo-600',
    accent:
      'group-hover:border-indigo-300 group-hover:bg-indigo-50 group-hover:text-indigo-600',
    icon: (
      <>
        <path d="M11 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5" />
        <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z" />
      </>
    ),
  },
  {
    id: 'client',
    title: 'I am a Client',
    lead: 'Track',
    blurb: ' work, files and invoices',
    button: 'bg-emerald-600 hover:bg-emerald-700 focus-visible:ring-emerald-600',
    accent:
      'group-hover:border-emerald-300 group-hover:bg-emerald-50 group-hover:text-emerald-600',
    icon: (
      <>
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
  },
]

const INPUT =
  'rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20'

const FOCUS =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-600/50'

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
    <section className="sticky top-0 z-20 flex h-screen max-w-[640px] flex-col justify-center justify-self-end border-l border-indigo-100 bg-indigo-50 px-8 py-10 max-lg:static max-lg:order-3 max-lg:h-auto max-lg:max-w-none max-lg:justify-self-stretch max-lg:border-l-0 max-lg:border-t max-lg:px-7 max-lg:py-10">
      <div className="mx-auto flex w-full max-w-[470px] flex-col">
        <header className="mb-7">
          <h2 className="text-[27px] font-bold leading-[1.15] tracking-[-0.025em] text-slate-900">
            Welcome to Docket
          </h2>
          <p className="mt-2 text-[14.5px] leading-relaxed text-slate-600">
            Choose your workspace to continue.
          </p>
        </header>

        {!isFirebaseConfigured ? (
          <p className="mb-4 rounded-[10px] border border-indigo-200 bg-indigo-100/60 px-3.5 py-3 text-[13.5px] leading-relaxed text-indigo-900">
            Demo mode. Firebase keys are not configured, so sign-in is simulated with the sample
            accounts from <code>db.json</code>. Any password of 6 or more characters works.
          </p>
        ) : null}

        <div className="flex flex-col gap-3">
          {ROLES.map((role) => {
            const isOpen = openRole === role.id
            return (
              <div
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition duration-200 hover:-translate-y-px hover:border-indigo-300 hover:shadow-[0_16px_36px_-26px_rgba(15,23,42,0.55)] has-[:focus-visible]:border-indigo-300"
                key={role.id}
              >
                <button
                  type="button"
                  className={
                    'group flex w-full cursor-pointer items-center gap-4 px-5 py-[17px] text-left ' +
                    FOCUS
                  }
                  onClick={() => setOpenRole(isOpen ? '' : role.id)}
                  aria-expanded={isOpen}
                  aria-controls={'signin-' + role.id}
                >
                  <span
                    className={
                      'grid h-10 w-10 shrink-0 place-items-center rounded-[11px] border border-slate-200 bg-slate-50 text-slate-500 transition duration-200 ' +
                      role.accent
                    }
                  >
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
                      {role.icon}
                    </svg>
                  </span>

                  <span className="flex min-w-0 flex-1 flex-col gap-1">
                    <strong className="text-[15.5px] font-semibold text-slate-900">
                      {role.title}
                    </strong>
                    <span className="text-[13.5px] leading-snug text-slate-600">
                      <span className="font-semibold text-slate-900">{role.lead}</span>
                      {role.blurb}
                    </span>
                  </span>

                  <svg
                    className={
                      'h-5 w-5 shrink-0 text-slate-400 transition duration-200 group-hover:text-slate-700 ' +
                      (isOpen ? 'rotate-90' : 'group-hover:translate-x-0.5')
                    }
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    focusable="false"
                  >
                    <path d="M9 6l6 6-6 6" />
                  </svg>
                </button>

                {isOpen ? (
                  <div
                    id={'signin-' + role.id}
                    className="flex flex-col gap-3 border-t border-slate-200 bg-indigo-50/70 p-4"
                  >
                    <button
                      type="button"
                      className={
                        'flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-[10px] px-4 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ' +
                        role.button
                      }
                      onClick={() => handleSignIn(role.id)}
                      disabled={busy !== ''}
                    >
                      {busy === role.id ? 'Signing in…' : 'Continue with Google'}
                    </button>

                    <div className="flex items-center gap-2.5 text-[12px] uppercase tracking-wider text-slate-500">
                      <span className="h-px flex-1 bg-slate-300/70" />
                      or
                      <span className="h-px flex-1 bg-slate-300/70" />
                    </div>

                    <input
                      className={INPUT}
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="you@example.com"
                      autoComplete="email"
                      aria-label="Email"
                    />
                    <input
                      className={INPUT}
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Password"
                      autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                      aria-label="Password"
                    />

                    <button
                      type="button"
                      className={
                        'flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-[10px] px-4 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ' +
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
                      type="button"
                      className="cursor-pointer self-center border-none bg-transparent p-0 text-[13px] font-semibold text-slate-600 transition hover:text-slate-900 focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600/50"
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
            )
          })}
        </div>

        {error ? (
          <p
            role="alert"
            className="my-3 rounded-[10px] border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-600"
          >
            {error}
          </p>
        ) : null}

        {!isFirebaseConfigured ? (
          <div className="mt-6 flex flex-col gap-2.5 text-[13.5px]">
            <span className="text-slate-600">Or open a specific sample account</span>
            <div className="flex flex-wrap gap-2">
              {[
                { email: 'alex@docket.dev', label: 'Alex · Freelancer' },
                { email: 'sam@acme.com', label: 'Sam · Client (Acme)' },
                { email: 'priya@northwind.io', label: 'Priya · Client (Northwind)' },
              ].map((demo) => (
                <button
                  type="button"
                  key={demo.email}
                  className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-[10px] border border-slate-200 bg-white px-4 py-[9px] text-sm font-semibold text-slate-900 transition hover:border-indigo-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-600/50"
                  onClick={() => handleDemo(demo.email)}
                >
                  {demo.label}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}
