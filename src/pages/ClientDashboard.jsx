import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../AuthContext.jsx'
import api, { newId } from '../api.js'
import { money, date, daysUntil } from '../format.js'
import Modal from '../components/Modal.jsx'
import StatCard from '../components/StatCard.jsx'
import StatusBadge from '../components/StatusBadge.jsx'

const EMPTY_FORM = { title: '', freelancerId: '', budget: '', dueDate: '', description: '' }

const FIELD = 'mb-3.5 flex flex-col gap-1.5 text-[13.5px] font-semibold'
const INPUT =
  'rounded-lg border border-slate-200 bg-white px-3 py-2.5 font-normal outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20'

export default function Dashboard() {
  const { user, updateProfile } = useAuth()
  const [state, setState] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState('')
  const [sentTo, setSentTo] = useState('')

  useEffect(() => {
    let alive = true

    async function load() {
      const projects = (await api.get('/projects', { params: { clientId: user.id } })).data
      const invoices = (await api.get('/invoices', { params: { clientId: user.id } })).data
      const payments = (await api.get('/payments', { params: { clientId: user.id } })).data
      const files = (await api.get('/files')).data
      const everyone = (await api.get('/users')).data
      const freelancers = everyone.filter((row) => row.role === 'freelancer')

      if (alive) setState({ projects, invoices, payments, files, freelancers })
    }

    load().catch((err) => {
      if (alive) setState({ error: err.message })
    })

    return () => {
      alive = false
    }
  }, [user])

  if (!state) return <p className="text-slate-500">Loading…</p>
  if (state.error) {
    return (
      <p className="my-2.5 rounded-[10px] border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-600">
        {state.error}
      </p>
    )
  }

  const { projects, invoices, payments, files, freelancers } = state

  function updateForm(field, value) {
    setForm({ ...form, [field]: value })
  }

  function openForm() {
    setForm(EMPTY_FORM)
    setError('')
    setSentTo('')
    setShowForm(true)
  }

  async function sendProject(event) {
    event.preventDefault()

    if (!form.title.trim()) {
      setError('Give the project a title.')
      return
    }
    if (!form.freelancerId) {
      setError('Pick the freelancer to send it to.')
      return
    }

    const freelancer = freelancers.find((row) => row.id === form.freelancerId)
    const project = {
      id: newId('p'),
      freelancerId: form.freelancerId,
      clientId: user.id,
      title: form.title.trim(),
      description: form.description.trim(),
      budget: Number(form.budget) || 0,
      status: 'requested',
      progress: 0,
      startDate: new Date().toISOString().slice(0, 10),
      dueDate: form.dueDate || '',
    }

    try {
      await api.post('/projects', project)

      if (!user.freelancerId) {
        await updateProfile({ freelancerId: form.freelancerId })
      }
    } catch (err) {
      setError(err.message)
      return
    }

    setState((prev) => ({ ...prev, projects: [...prev.projects, project] }))
    setSentTo(freelancer ? freelancer.name : '')
    setShowForm(false)
    setForm(EMPTY_FORM)
    setError('')
  }

  const activeProjects = projects.filter((p) => p.status === 'active')
  const unpaid = invoices.filter((i) => i.status === 'sent')
  const unpaidTotal = unpaid.reduce((sum, i) => sum + i.amount, 0)
  const paidTotal = payments
    .filter((p) => p.status === 'succeeded')
    .reduce((sum, p) => sum + p.amount, 0)

  const projectIds = projects.map((p) => p.id)
  const myFiles = files.filter((f) => projectIds.includes(f.projectId))

  const recentInvoices = [...invoices]
    .filter((invoice) => invoice.status !== 'draft')
    .sort((a, b) => (a.issuedAt < b.issuedAt ? 1 : -1))
    .slice(0, 4)

  return (
    <div>
      <header className="mb-[22px] flex items-start justify-between gap-5">
        <div>
          <h1 className="text-3xl font-bold tracking-[-0.02em]">
            Welcome back, {user.name.split(' ')[0]}
          </h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Here is the work you share with your freelancer.
          </p>
        </div>
        <button
          className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-[10px] border border-emerald-600 bg-emerald-600 px-4 py-[9px] text-sm font-semibold text-white transition hover:bg-emerald-700"
          onClick={openForm}
        >
          New project
        </button>
      </header>

      {sentTo ? (
        <p className="mb-4 rounded-[10px] border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-sm text-emerald-700">
          Project sent to {sentTo} for approval. It starts once they accept it.
        </p>
      ) : null}

      <section className="mb-[22px] grid grid-cols-4 gap-3.5 max-lg:grid-cols-2 max-sm:grid-cols-1">
        <StatCard label="Active projects" value={activeProjects.length} />
        <StatCard label="Files shared" value={myFiles.length} />
        <StatCard
          label="Outstanding balance"
          value={money(unpaidTotal)}
          tone="warn"
          hint={unpaid.length + ' invoice' + (unpaid.length === 1 ? '' : 's')}
        />
        <StatCard label="Paid to date" value={money(paidTotal)} tone="good" />
      </section>

      <div className="grid grid-cols-2 items-start gap-4 max-lg:grid-cols-1">
        <section className="mb-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3.5 flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold">Shared projects</h2>
            <Link className="text-sm font-semibold text-indigo-600 hover:underline" to="/projects">
              View all
            </Link>
          </div>

          {projects.length === 0 ? (
            <p className="text-slate-500">No projects yet.</p>
          ) : (
            <ul className="m-0 flex list-none flex-col p-0">
              {projects.slice(0, 4).map((project) => (
                <li key={project.id} className="border-b border-slate-200 last:border-b-0">
                  <Link
                    className="flex items-center justify-between gap-3 rounded-lg px-2 py-3 transition hover:bg-slate-50"
                    to={'/projects/' + project.id}
                  >
                    <div className="flex min-w-0 flex-col gap-[3px]">
                      <strong className="text-[14.5px]">{project.title}</strong>
                      <span className="text-xs text-slate-500">
                        {money(project.budget)} · due {date(project.dueDate)}
                      </span>
                    </div>
                    <StatusBadge status={project.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="mb-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3.5 flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold">Recent invoices</h2>
            <Link className="text-sm font-semibold text-indigo-600 hover:underline" to="/invoices">
              View all
            </Link>
          </div>

          {recentInvoices.length === 0 ? (
            <p className="text-slate-500">No invoices yet.</p>
          ) : (
            <ul className="m-0 flex list-none flex-col p-0">
              {recentInvoices.map((invoice) => {
                const days = daysUntil(invoice.dueDate)
                return (
                  <li
                    key={invoice.id}
                    className="flex items-center justify-between gap-3 border-b border-slate-200 px-2 py-3 last:border-b-0"
                  >
                    <div className="flex min-w-0 flex-col gap-[3px]">
                      <strong className="text-[14.5px]">{invoice.number}</strong>
                      <span className="text-xs text-slate-500">
                        {invoice.status === 'paid'
                          ? 'Paid ' + date(invoice.paidAt)
                          : 'Due ' +
                            date(invoice.dueDate) +
                            (days !== null && days < 0 ? ' · overdue' : '')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="font-semibold tabular-nums">{money(invoice.amount)}</span>
                      <StatusBadge status={invoice.status} />
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </div>

      {showForm ? (
        <Modal
          title="New project"
          onClose={() => setShowForm(false)}
          footer={
            <>
              <button
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-[10px] border border-slate-200 bg-white px-4 py-[9px] text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
              <button
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-[10px] border border-emerald-600 bg-emerald-600 px-4 py-[9px] text-sm font-semibold text-white transition hover:bg-emerald-700"
                onClick={sendProject}
              >
                Send for approval
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

            <label className={FIELD}>
              <span className="text-slate-700">Freelancer</span>
              <select
                className={INPUT}
                value={form.freelancerId}
                onChange={(event) => updateForm('freelancerId', event.target.value)}
              >
                <option value="">Choose a freelancer…</option>
                {freelancers.map((freelancer) => (
                  <option key={freelancer.id} value={freelancer.id}>
                    {freelancer.name} {freelancer.company ? '· ' + freelancer.company : ''}
                  </option>
                ))}
              </select>
              {freelancers.length === 0 ? (
                <span className="font-normal text-slate-500">
                  No freelancers yet.{' '}
                  <Link className="font-semibold text-emerald-600 hover:underline" to="/freelancers">
                    Browse freelancers
                  </Link>
                  .
                </span>
              ) : null}
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
