import { useEffect, useState } from 'react'
import { useAuth } from '../AuthContext.jsx'
import api, { newId } from '../api.js'
import { date } from '../format.js'
import { filterRows } from '../search.js'
import Avatar from '../components/Avatar.jsx'
import Modal from '../components/Modal.jsx'
import SearchBox from '../components/SearchBox.jsx'

const EMPTY_FORM = { name: '', company: '', email: '', notes: '' }
const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#0ea5e9', '#8b5cf6']

const FIELD = 'mb-3.5 flex flex-col gap-1.5 text-[13.5px] font-semibold'
const INPUT =
  'rounded-lg border border-slate-200 bg-white px-3 py-2.5 font-normal outline-none transition focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20'

export default function Clients() {
  const { user } = useAuth()
  const [clients, setClients] = useState(null)
  const [projects, setProjects] = useState([])
  const [query, setQuery] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [loadError, setLoadError] = useState('')
  const [error, setError] = useState('')

  async function load() {
    const everyone = (await api.get('/users')).data
    const allProjects = (await api.get('/projects')).data

    const mine = everyone.filter(
      (row) => row.role === 'client' && (row.freelancerId === user.id || !row.freelancerId),
    )

    setClients(mine)
    setProjects(allProjects)
  }

  useEffect(() => {
    load().catch((err) => setLoadError(err.message))
  }, [user])

  function updateForm(field, value) {
    setForm({ ...form, [field]: value })
  }

  function projectCount(id) {
    return projects.filter((row) => row.clientId === id).length
  }

  async function addClient(event) {
    event.preventDefault()

    if (!form.name.trim()) {
      setError('Give the client a name.')
      return
    }

    const client = {
      id: newId('c'),
      uid: '',
      name: form.name.trim(),
      email: form.email.trim(),
      role: 'client',
      title: 'Client',
      company: form.company.trim(),
      photoURL: '',
      color: COLORS[clients.length % COLORS.length],
      freelancerId: user.id,
      notes: form.notes.trim(),
      createdAt: new Date().toISOString().slice(0, 10),
    }

    await api.post('/users', client)
    setClients([...clients, client])
    setForm(EMPTY_FORM)
    setShowForm(false)
    setError('')
  }

  async function removeClient(client) {
    const count = projectCount(client.id)
    const warning =
      count > 0 ? ' They have ' + count + ' project' + (count === 1 ? '' : 's') + '.' : ''
    if (!confirm('Delete "' + client.name + '"?' + warning)) return

    await api.delete('/users/' + client.id)
    setClients(clients.filter((row) => row.id !== client.id))
  }

  if (loadError) {
    return (
      <p className="my-2.5 rounded-[10px] border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-600">
        {loadError}
      </p>
    )
  }
  if (!clients) return <p className="text-slate-500">Loading…</p>

  const visible = filterRows(clients, query, function (client) {
    return [client.name, client.company, client.email, client.notes]
  })

  return (
    <div>
      <header className="mb-[22px] flex items-start justify-between gap-5">
        <div>
          <h1 className="text-3xl font-bold tracking-[-0.02em]">Clients</h1>
          <p className="mt-1.5 text-sm text-slate-500">
            {clients.length} total · shown on every new project
          </p>
        </div>
        <div className="flex items-center gap-2.5 max-md:w-full max-md:flex-col max-md:items-stretch">
          <SearchBox
            className="w-[230px] max-md:w-full"
            value={query}
            onChange={setQuery}
            placeholder="Search clients…"
          />
          <button
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-[10px] border border-indigo-600 bg-indigo-600 px-4 py-[9px] text-sm font-semibold text-white transition hover:bg-indigo-700"
            onClick={() => setShowForm(true)}
          >
            New client
          </button>
        </div>
      </header>

      {clients.length === 0 ? (
        <p className="text-slate-500">No clients yet. Add your first one.</p>
      ) : visible.length === 0 ? (
        <p className="text-slate-500">No clients match “{query}”.</p>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="border-b border-slate-200 px-2.5 py-2 text-left text-[11.5px] font-bold uppercase tracking-wider text-slate-500">
                  Client
                </th>
                <th className="border-b border-slate-200 px-2.5 py-2 text-left text-[11.5px] font-bold uppercase tracking-wider text-slate-500">
                  Email
                </th>
                <th className="border-b border-slate-200 px-2.5 py-2 text-left text-[11.5px] font-bold uppercase tracking-wider text-slate-500">
                  Projects
                </th>
                <th className="border-b border-slate-200 px-2.5 py-2 text-left text-[11.5px] font-bold uppercase tracking-wider text-slate-500">
                  Added
                </th>
                <th className="border-b border-slate-200 px-2.5 py-2" />
              </tr>
            </thead>
            <tbody>
              {visible.map((client) => (
                <tr key={client.id} className="hover:bg-slate-50">
                  <td className="border-b border-slate-200 px-2.5 py-[13px] align-middle">
                    <div className="flex items-center gap-[11px]">
                      <Avatar
                        name={client.name}
                        color={client.color}
                        photoURL={client.photoURL}
                        size={36}
                      />
                      <div className="flex min-w-0 flex-col">
                        <strong>{client.name}</strong>
                        <span className="block text-slate-500">{client.company || 'Client'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="border-b border-slate-200 px-2.5 py-[13px] align-middle text-slate-500">
                    {client.email || '—'}
                  </td>
                  <td className="border-b border-slate-200 px-2.5 py-[13px] align-middle text-slate-500">
                    {projectCount(client.id)}
                  </td>
                  <td className="border-b border-slate-200 px-2.5 py-[13px] align-middle text-slate-500">
                    {date(client.createdAt)}
                  </td>
                  <td className="border-b border-slate-200 px-2.5 py-[13px] text-right align-middle">
                    <button
                      className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-[13px] font-semibold text-red-600 transition hover:bg-red-100"
                      onClick={() => removeClient(client)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm ? (
        <Modal
          title="New client"
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
                onClick={addClient}
              >
                Add client
              </button>
            </>
          }
        >
          <form onSubmit={addClient}>
            <label className={FIELD}>
              <span className="text-slate-700">Contact name</span>
              <input
                className={INPUT}
                value={form.name}
                onChange={(event) => updateForm('name', event.target.value)}
                placeholder="Dana Whitfield"
              />
            </label>

            <label className={FIELD}>
              <span className="text-slate-700">Company</span>
              <input
                className={INPUT}
                value={form.company}
                onChange={(event) => updateForm('company', event.target.value)}
                placeholder="Brightline Cafe"
              />
            </label>

            <label className={FIELD}>
              <span className="text-slate-700">Email</span>
              <input
                className={INPUT}
                value={form.email}
                onChange={(event) => updateForm('email', event.target.value)}
                placeholder="dana@brightline.cafe"
              />
            </label>

            <label className={FIELD}>
              <span className="text-slate-700">Notes</span>
              <textarea
                className={INPUT}
                rows="3"
                value={form.notes}
                onChange={(event) => updateForm('notes', event.target.value)}
                placeholder="What do they need?"
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
