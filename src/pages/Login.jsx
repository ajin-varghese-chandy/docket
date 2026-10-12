import { useState } from 'react'
import { useAuth } from '../AuthContext.jsx'

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

function GoogleIcon() {
  return (
    <svg
      className="h-[17px] w-[17px] shrink-0"
      viewBox="0 0 48 48"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="#4285F4"
        d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"
      />
      <path
        fill="#34A853"
        d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"
      />
      <path
        fill="#FBBC05"
        d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24s.85 6.91 2.34 9.88l7.35-5.7z"
      />
      <path
        fill="#EA4335"
        d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"
      />
    </svg>
  )
}

export default function Login() {
  const { signIn, signInWithEmail, signUpWithEmail } = useAuth()
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
                      {busy === role.id ? (
                        'Signing in…'
                      ) : (
                        <>
                          <GoogleIcon />
                          Continue with Google
                        </>
                      )}
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
      </div>
    </section>
  )
}
