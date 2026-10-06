import { useEffect, useState } from 'react'
import { useAuth } from '../AuthContext.jsx'
import api, { newId } from '../api.js'
import Avatar from '../components/Avatar.jsx'
import Modal from '../components/Modal.jsx'

const EMPTY_FORM = { title: '', description: '', budget: '', dueDate: '' }

const FIELD = 'mb-3.5 flex flex-col gap-1.5 text-[13.5px] font-semibold'
const INPUT =
  'rounded-lg border border-slate-200 bg-white px-3 py-2.5 font-normal outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20'

export default function Freelancers() {
  const { user, updateProfile } = useAuth()
  const [freelancers, setFreelancers] = useState(null)
  const [chosen, setChosen] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [loadError, setLoadError] = useState('')
  const [error, setError] = useState('')
  const [sentTo, setSentTo] = useState('')

  async function load() {
    const everyone = (await api.get('/users')).data
    setFreelancers(everyone.filter((row) => row.role === 'freelancer'))
  }

  useEffect(() => {
    load().catch((err) => setLoadError(err.message))
  }, [user])

  function updateForm(field, value) {
    setForm({ ...form, [field]: value })
  }

  function openForm(freelancer) {
    setChosen(freelancer)
    setForm(EMPTY_FORM)
    setError('')
    setSentTo('')
  }

  async function sendProject(event) {
    event.preventDefault()

    if (!form.title.trim()) {
      setError('Give the project a title.')
      return
    }

    const project = {
      id: newId('p'),
      freelancerId: chosen.id,
      clientId: user.id,
      title: form.title.trim(),
      description: form.description.trim(),
      budget: Number(form.budget) || 0,
      status: 'requested',
      progress: 0,
      startDate: new Date().toISOString().slice(0, 10),
      dueDate: form.dueDate || '',
    }

    await api.post('/projects', project)

    if (!user.freelancerId) {
      await updateProfile({ freelancerId: chosen.id })
    }

    setSentTo(chosen.name)
    setChosen(null)
    setForm(EMPTY_FORM)
  }

  if (loadError) {
    return (
      <p className="my-2.5 rounded-[10px] border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-600">
        {loadError}
      </p>
    )
  }
  if (!freelancers) return <p className="text-slate-500">Loading…</p>

  return (
    <div>
      <header className="mb-[22px] flex items-start justify-between gap-5">
        <div>
          <h1 className="text-3xl font-bold tracking-[-0.02em]">Freelancers</h1>
          <p className="mt-1.5 text-sm text-slate-500">
            {freelancers.length} available · send a project to anyone
          </p>
        </div>
      </header>

      {sentTo ? (
        <p className="mb-4 rounded-[10px] border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-sm text-emerald-700">
          Project sent to {sentTo}. They will pick it up from their dashboard.
        </p>
      ) : null}

      {freelancers.length === 0 ? (
        <p className="text-slate-500">No freelancers yet.</p>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
          {freelancers.map((freelancer) => (
            <div
              className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-[18px] shadow-sm"
              key={freelancer.id}
            >
              <div className="flex items-center gap-[11px]">
                <Avatar
                  name={freelancer.name}
                  color={freelancer.color}
                  photoURL={freelancer.photoURL}
                  size={44}
                />
                <div className="flex min-w-0 flex-col">
                  <strong className="truncate text-[15px]">{freelancer.name}</strong>
                  <span className="truncate text-xs text-slate-500">
                    {freelancer.title || 'Freelancer'}
                  </span>
                </div>
              </div>

              {freelancer.company ? (
                <p className="m-0 text-sm text-slate-500">{freelancer.company}</p>
              ) : null}

              <button
                className="mt-auto inline-flex cursor-pointer items-center justify-center gap-2 rounded-[10px] border border-emerald-600 bg-emerald-600 px-4 py-[9px] text-sm font-semibold text-white transition hover:bg-emerald-700"
                onClick={() => openForm(freelancer)}
              >
                Send project
              </button>
            </div>
          ))}
        </div>
      )}

      {chosen ? (
        <Modal
          title={'Send a project to ' + chosen.name}
          onClose={() => setChosen(null)}
          footer={
            <>
              <button
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-[10px] border border-slate-200 bg-white px-4 py-[9px] text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                onClick={() => setChosen(null)}
              >
                Cancel
              </button>
              <button
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-[10px] border border-emerald-600 bg-emerald-600 px-4 py-[9px] text-sm font-semibold text-white transition hover:bg-emerald-700"
                onClick={sendProject}
              >
                Send project
              </button>
            </>
          }
        >
          <form onSubmit={sendProject}>
            <label className={FIELD}>
              <span className="text-slate-700">Title</span>
              <input
                className={INPUT}
                value={form.title}
                onChange={(event) => updateForm('title', event.target.value)}
                placeholder="New marketing site"
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className={FIELD}>
                <span className="text-slate-700">Budget</span>
                <input
                  className={INPUT}
                  value={form.budget}
                  onChange={(event) => updateForm('budget', event.target.value)}
                  placeholder="8000"
                  inputMode="numeric"
                />
              </label>
              <label className={FIELD}>
                <span className="text-slate-700">Due date</span>
                <input
                  className={INPUT}
                  type="date"
                  value={form.dueDate}
                  onChange={(event) => updateForm('dueDate', event.target.value)}
                />
              </label>
            </div>

            <label className={FIELD}>
              <span className="text-slate-700">Description</span>
              <textarea
                className={INPUT}
                rows="3"
                value={form.description}
                onChange={(event) => updateForm('description', event.target.value)}
                placeholder="What do you need done?"
              />
            </label>

            {error ? (
              <p className="my-2.5 rounded-[10px] border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-600">
                {error}
              </p>
            ) : null}
          </form>
        </Modal>
      ) : null}
    </div>
  )
}
