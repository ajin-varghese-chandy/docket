import { useState } from 'react'
import { useAuth } from '../AuthContext.jsx'
import Avatar from '../components/Avatar.jsx'

const FIELD = 'mb-3.5 flex flex-col gap-1.5 text-[13.5px] font-semibold'

export default function Profile() {
  const { user, updateProfile } = useAuth()
  const [form, setForm] = useState({
    name: user.name || '',
    title: user.title || '',
    company: user.company || '',
  })
  const [busy, setBusy] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const isFreelancer = user.role === 'freelancer'
  const INPUT =
    'rounded-lg border border-slate-200 bg-white px-3 py-2.5 font-normal outline-none transition focus:ring-2 ' +
    (isFreelancer
      ? 'focus:border-indigo-600 focus:ring-indigo-600/20'
      : 'focus:border-emerald-600 focus:ring-emerald-600/20')
  const SAVE =
    'inline-flex cursor-pointer items-center justify-center gap-2 rounded-[10px] border px-4 py-[9px] text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ' +
    (isFreelancer
      ? 'border-indigo-600 bg-indigo-600 hover:bg-indigo-700'
      : 'border-emerald-600 bg-emerald-600 hover:bg-emerald-700')
  const PILL =
    'mt-3 inline-block rounded-full border px-3 py-[7px] text-xs font-semibold ' +
    (isFreelancer
      ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
      : 'border-emerald-200 bg-emerald-50 text-emerald-700')

  function updateForm(field, value) {
    setForm({ ...form, [field]: value })
    setSaved(false)
  }

  async function save(event) {
    event.preventDefault()

    if (!form.name.trim()) {
      setError('Your name cannot be empty.')
      return
    }

    setBusy(true)
    setError('')
    setSaved(false)

    try {
      await updateProfile({
        name: form.name.trim(),
        title: form.title.trim(),
        company: form.company.trim(),
      })
      setSaved(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <header className="mb-[22px]">
        <h1 className="text-3xl font-bold tracking-[-0.02em]">Profile</h1>
        <p className="mt-1.5 text-sm text-slate-500">Your account details on DOCKET.</p>
      </header>

      <div className="grid grid-cols-[300px_1fr] items-start gap-4 max-lg:grid-cols-1">
        <section className="rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <div className="mb-3 flex justify-center">
            <Avatar name={user.name} color={user.color} photoURL={user.photoURL} size={84} />
          </div>
          <h2 className="text-xl font-bold">{user.name}</h2>
          <p className="mt-1 text-sm text-slate-500">{user.email}</p>
          <p className="mt-2 text-sm text-slate-500">
            {user.title || (isFreelancer ? 'Freelancer' : 'Client')}
          </p>
          {user.company ? <p className="text-sm text-slate-500">{user.company}</p> : null}
          <span className={PILL}>{isFreelancer ? 'Freelancer account' : 'Client account'}</span>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3.5 text-base font-semibold">Edit details</h2>

          <form onSubmit={save}>
            <label className={FIELD}>
              <span className="text-slate-700">Full name</span>
              <input
                className={INPUT}
                value={form.name}
                onChange={(event) => updateForm('name', event.target.value)}
                placeholder="Your name"
              />
            </label>

            <label className={FIELD}>
              <span className="text-slate-700">Title</span>
              <input
                className={INPUT}
                value={form.title}
                onChange={(event) => updateForm('title', event.target.value)}
                placeholder={isFreelancer ? 'Product Designer' : 'Head of Marketing'}
              />
            </label>

            <label className={FIELD}>
              <span className="text-slate-700">Company</span>
              <input
                className={INPUT}
                value={form.company}
                onChange={(event) => updateForm('company', event.target.value)}
                placeholder={isFreelancer ? 'Your studio' : 'Your company'}
              />
            </label>

            <label className={FIELD}>
              <span className="text-slate-700">Email</span>
              <input
                className="rounded-lg border border-slate-200 bg-slate-100 px-3 py-2.5 font-normal text-slate-500 outline-none"
                value={user.email}
                disabled
              />
            </label>

            {error ? (
              <p className="my-2.5 rounded-[10px] border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-600">
                {error}
              </p>
            ) : null}

            {saved ? (
              <p className="my-2.5 rounded-[10px] border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700">
                Profile saved.
              </p>
            ) : null}

            <button className={SAVE} type="submit" disabled={busy}>
              {busy ? 'Saving…' : 'Save changes'}
            </button>
          </form>
        </section>
      </div>
    </div>
  )
}
