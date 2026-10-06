import { useEffect, useState } from 'react'
import { useAuth } from '../AuthContext.jsx'
import api, { newId } from '../api.js'
import { money, date, daysUntil } from '../format.js'
import Modal from '../components/Modal.jsx'
import StatusBadge from '../components/StatusBadge.jsx'

const FILTERS = ['all', 'draft', 'sent', 'paid']
const EMPTY_FORM = { projectId: '', amount: '', dueDate: '', note: '' }

const FIELD = 'mb-3.5 flex flex-col gap-1.5 text-[13.5px] font-semibold'
const INPUT =
  'rounded-lg border border-slate-200 bg-white px-3 py-2.5 font-normal outline-none transition focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20'

function nextNumber(invoices) {
  const numbers = invoices
    .map((invoice) => Number(String(invoice.number).replace(/\D/g, '')))
    .filter((value) => !Number.isNaN(value))

  const highest = numbers.length > 0 ? Math.max(...numbers) : 1000
  return 'INV-' + (highest + 1)
}

export default function Invoices() {
  const { user } = useAuth()

  const [invoices, setInvoices] = useState(null)
  const [projects, setProjects] = useState([])
  const [users, setUsers] = useState([])
  const [filter, setFilter] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState('')

  async function load() {
    const rows = (await api.get('/invoices', { params: { freelancerId: user.id } })).data
    const allProjects = (await api.get('/projects')).data
    const everyone = (await api.get('/users')).data

    setInvoices([...rows].sort((a, b) => (a.issuedAt < b.issuedAt ? 1 : -1)))
    setProjects(allProjects)
    setUsers(everyone)
  }

  useEffect(() => {
    load().catch((err) => setError(err.message))
  }, [user])

  function projectTitle(id) {
    const project = projects.find((row) => row.id === id)
    return project ? project.title : 'Project'
  }

  function personName(id) {
    const person = users.find((row) => row.id === id)
    return person ? person.name : 'Unknown'
  }

  function updateForm(field, value) {
    setForm({ ...form, [field]: value })
  }

  async function addInvoice(event) {
    event.preventDefault()

    const project = projects.find((row) => row.id === form.projectId)
    if (!project) {
      setError('Choose which project this invoice is for.')
      return
    }
    if (!Number(form.amount)) {
      setError('Enter an amount.')
      return
    }

    const invoice = {
      id: newId('i'),
      number: nextNumber(invoices),
      projectId: project.id,
      freelancerId: project.freelancerId,
      clientId: project.clientId,
      amount: Number(form.amount),
      status: 'draft',
      issuedAt: new Date().toISOString().slice(0, 10),
      dueDate: form.dueDate || '',
      paidAt: null,
      note: form.note.trim(),
    }

    await api.post('/invoices', invoice)
    setInvoices([invoice, ...invoices])
    setForm(EMPTY_FORM)
    setShowForm(false)
    setError('')
  }

  async function sendInvoice(invoice) {
    const issuedAt = new Date().toISOString().slice(0, 10)
    setInvoices(
      invoices.map((row) => (row.id === invoice.id ? { ...row, status: 'sent', issuedAt } : row)),
    )
    await api.patch('/invoices/' + invoice.id, { status: 'sent', issuedAt })
  }

  async function removeInvoice(invoice) {
    if (!confirm('Delete ' + invoice.number + '?')) return
    await api.delete('/invoices/' + invoice.id)
    setInvoices(invoices.filter((row) => row.id !== invoice.id))
  }

  if (!invoices) return <p className="text-slate-500">Loading…</p>

  const myProjects = projects.filter((project) => project.freelancerId === user.id)

  const outstanding = invoices.filter((invoice) => invoice.status === 'sent')
  const drafts = invoices.filter((invoice) => invoice.status === 'draft')
  const paid = invoices.filter((invoice) => invoice.status === 'paid')

  const visible = filter === 'all' ? invoices : invoices.filter((row) => row.status === filter)

  return (
    <div>
      <header className="mb-[22px] flex items-start justify-between gap-5">
        <div>
          <h1 className="text-3xl font-bold tracking-[-0.02em]">Invoices</h1>
          <p className="mt-1.5 text-sm text-slate-500">
            {money(outstanding.reduce((sum, row) => sum + row.amount, 0))} outstanding ·{' '}
            {money(paid.reduce((sum, row) => sum + row.amount, 0))} paid
          </p>
        </div>
        <button
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-[10px] border border-indigo-600 bg-indigo-600 px-4 py-[9px] text-sm font-semibold text-white transition hover:bg-indigo-700"
          onClick={() => setShowForm(true)}
        >
          New invoice
        </button>
      </header>

      {drafts.length > 0 ? (
        <p className="mb-4 rounded-[10px] border border-indigo-200 bg-indigo-50 px-3.5 py-3 text-sm text-indigo-800">
          You have {drafts.length} draft invoice{drafts.length === 1 ? '' : 's'} not sent yet.
        </p>
      ) : null}

      <div className="mb-[18px] flex flex-wrap gap-1 border-b border-slate-200">
        {FILTERS.map((name) => (
          <button
            key={name}
            className={
              '-mb-px inline-flex cursor-pointer items-center gap-[7px] border-b-2 bg-transparent px-3.5 py-2.5 text-sm font-semibold transition ' +
              (filter === name
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-900')
            }
            onClick={() => setFilter(name)}
          >
            {name === 'all' ? 'All' : name.charAt(0).toUpperCase() + name.slice(1)}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="text-slate-500">Nothing here yet.</p>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="border-b border-slate-200 px-2.5 py-2 text-left text-[11.5px] font-bold uppercase tracking-wider text-slate-500">
                  Invoice
                </th>
                <th className="border-b border-slate-200 px-2.5 py-2 text-left text-[11.5px] font-bold uppercase tracking-wider text-slate-500">
                  Client
                </th>
                <th className="border-b border-slate-200 px-2.5 py-2 text-left text-[11.5px] font-bold uppercase tracking-wider text-slate-500">
                  Amount
                </th>
                <th className="border-b border-slate-200 px-2.5 py-2 text-left text-[11.5px] font-bold uppercase tracking-wider text-slate-500">
                  Due
                </th>
                <th className="border-b border-slate-200 px-2.5 py-2 text-left text-[11.5px] font-bold uppercase tracking-wider text-slate-500">
                  Status
                </th>
                <th className="border-b border-slate-200 px-2.5 py-2" />
              </tr>
            </thead>
            <tbody>
              {visible.map((invoice) => {
                const days = daysUntil(invoice.dueDate)
                const overdue = invoice.status === 'sent' && days !== null && days < 0

                return (
                  <tr key={invoice.id} className="hover:bg-slate-50">
                    <td className="border-b border-slate-200 px-2.5 py-[13px] align-middle">
                      <strong>{invoice.number}</strong>
                      <span className="block text-slate-500">{projectTitle(invoice.projectId)}</span>
                    </td>
                    <td className="border-b border-slate-200 px-2.5 py-[13px] align-middle">
                      {personName(invoice.clientId)}
                    </td>
                    <td className="border-b border-slate-200 px-2.5 py-[13px] align-middle font-semibold tabular-nums">
                      {money(invoice.amount)}
                    </td>
                    <td
                      className={
                        'border-b border-slate-200 px-2.5 py-[13px] align-middle ' +
                        (overdue ? 'font-semibold text-red-600' : 'text-slate-500')
                      }
                    >
                      {date(invoice.dueDate)}
                      {overdue ? ' · overdue' : ''}
                    </td>
                    <td className="border-b border-slate-200 px-2.5 py-[13px] align-middle">
                      <StatusBadge status={invoice.status} />
                    </td>
                    <td className="whitespace-nowrap border-b border-slate-200 px-2.5 py-[13px] text-right align-middle">
                      {invoice.status === 'draft' ? (
                        <>
                          <button
                            className="mr-2 inline-flex cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[13px] font-semibold text-slate-900 transition hover:bg-slate-100"
                            onClick={() => sendInvoice(invoice)}
                          >
                            Send
                          </button>
                          <button
                            className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-[13px] font-semibold text-red-600 transition hover:bg-red-100"
                            onClick={() => removeInvoice(invoice)}
                          >
                            Delete
                          </button>
                        </>
                      ) : null}

                      {invoice.status === 'paid' ? (
                        <span className="text-slate-500">Paid {date(invoice.paidAt)}</span>
                      ) : null}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {showForm ? (
        <Modal
          title="New invoice"
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
                onClick={addInvoice}
              >
                Save draft
              </button>
            </>
          }
        >
          <form onSubmit={addInvoice}>
            <label className={FIELD}>
              <span className="text-slate-700">Project</span>
              <select
                className={INPUT}
                value={form.projectId}
                onChange={(event) => updateForm('projectId', event.target.value)}
              >
                <option value="">Choose a project…</option>
                {myProjects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.title}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className={FIELD}>
                <span className="text-slate-700">Amount</span>
                <input
                  className={INPUT}
                  value={form.amount}
                  onChange={(event) => updateForm('amount', event.target.value)}
                  placeholder="3000"
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
              <span className="text-slate-700">Note</span>
              <textarea
                className={INPUT}
                rows="3"
                value={form.note}
                onChange={(event) => updateForm('note', event.target.value)}
                placeholder="Milestone 2 — homepage delivered."
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
