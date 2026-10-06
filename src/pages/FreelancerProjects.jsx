import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../AuthContext.jsx'
import api, { newId } from '../api.js'
import { money, date } from '../format.js'
import Modal from '../components/Modal.jsx'
import StatusBadge from '../components/StatusBadge.jsx'

const EMPTY_FORM = { title: '', clientId: '', budget: '', description: '', dueDate: '' }

const FIELD = 'mb-3.5 flex flex-col gap-1.5 text-[13.5px] font-semibold'
const INPUT =
  'rounded-lg border border-slate-200 bg-white px-3 py-2.5 font-normal outline-none transition focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20'

export default function Projects() {
  const { user } = useAuth()
  const [projects, setProjects] = useState(null)
  const [users, setUsers] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState('')

  async function load() {
    const rows = (await api.get('/projects', { params: { freelancerId: user.id } })).data
    const everyone = (await api.get('/users')).data
    setProjects(rows)
    setUsers(everyone)
  }

  useEffect(() => {
    load().catch((err) => setError(err.message))
  }, [user])

  function nameOf(id) {
    const person = users.find((row) => row.id === id)
    return person ? person.name : 'Unknown'
  }

  function updateForm(field, value) {
    setForm({ ...form, [field]: value })
  }

  async function addProject(event) {
    event.preventDefault()

    if (!form.title.trim()) {
      setError('Give the project a title.')
      return
    }
    if (!form.clientId) {
      setError('Pick the client this project is for.')
      return
    }

    const project = {
      id: newId('p'),
      freelancerId: user.id,
      clientId: form.clientId,
      title: form.title.trim(),
      description: form.description.trim(),
      budget: Number(form.budget) || 0,
      status: 'active',
      progress: 0,
      startDate: new Date().toISOString().slice(0, 10),
      dueDate: form.dueDate || '',
    }

    await api.post('/projects', project)
    setProjects([...projects, project])
    setForm(EMPTY_FORM)
    setShowForm(false)
    setError('')
  }

  if (!projects) return <p className="text-slate-500">Loading…</p>

  const clientOptions = users.filter(
    (row) => row.role === 'client' && (row.freelancerId === user.id || !row.freelancerId),
  )
  const activeCount = projects.filter((project) => project.status === 'active').length

  return (
    <div>
      <header className="mb-[22px] flex items-start justify-between gap-5">
        <div>
          <h1 className="text-3xl font-bold tracking-[-0.02em]">Projects</h1>
          <p className="mt-1.5 text-sm text-slate-500">
            {projects.length} total · {activeCount} active · shared with your clients
          </p>
        </div>
        <button
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-[10px] border border-indigo-600 bg-indigo-600 px-4 py-[9px] text-sm font-semibold text-white transition hover:bg-indigo-700"
          onClick={() => setShowForm(true)}
        >
          New project
        </button>
      </header>

      {projects.length === 0 ? (
        <p className="text-slate-500">No projects yet.</p>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
          {projects.map((project) => (
            <Link
              className="flex flex-col gap-2.5 rounded-xl border border-slate-200 bg-white p-[18px] shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-600"
              key={project.id}
              to={'/projects/' + project.id}
            >
              <div className="flex items-center justify-between">
                <StatusBadge status={project.status} />
                <span className="font-semibold tabular-nums">{money(project.budget)}</span>
              </div>

              <h3 className="text-[17px] font-bold">{project.title}</h3>
              <p className="m-0 line-clamp-2 text-sm text-slate-500">{project.description}</p>

              <div className="h-[7px] overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-[width] duration-300"
                  style={{ width: project.progress + '%' }}
                />
              </div>

              <div className="mt-auto flex items-center justify-between gap-2.5 text-xs text-slate-500">
                <span>Client: {nameOf(project.clientId)}</span>
                <span>Due {date(project.dueDate)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

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
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-[10px] border border-indigo-600 bg-indigo-600 px-4 py-[9px] text-sm font-semibold text-white transition hover:bg-indigo-700"
                onClick={addProject}
              >
                Create project
              </button>
            </>
          }
        >
          <form onSubmit={addProject}>
            <label className={FIELD}>
              <span className="text-slate-700">Title</span>
              <input
                className={INPUT}
                value={form.title}
                onChange={(event) => updateForm('title', event.target.value)}
                placeholder="Acme Marketing Site"
              />
            </label>

            <label className={FIELD}>
              <span className="text-slate-700">Client</span>
              <select
                className={INPUT}
                value={form.clientId}
                onChange={(event) => updateForm('clientId', event.target.value)}
              >
                <option value="">Choose a client…</option>
                {clientOptions.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name} {client.company ? '· ' + client.company : ''}
                  </option>
                ))}
              </select>
              {clientOptions.length === 0 ? (
                <span className="font-normal text-slate-500">
                  No clients yet.{' '}
                  <Link className="font-semibold text-indigo-600 hover:underline" to="/clients">
                    Add a client first
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
                  placeholder="8500"
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
                placeholder="What are you delivering?"
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
