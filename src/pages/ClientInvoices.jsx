import { useEffect, useState } from 'react'
import { useAuth } from '../AuthContext.jsx'
import api from '../api.js'
import { money, date, daysUntil } from '../format.js'
import { filterRows } from '../search.js'
import SearchBox from '../components/SearchBox.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import PaymentModal from '../components/PaymentModal.jsx'
import { payInvoice } from '../payments.js'

const FILTERS = ['all', 'sent', 'paid']

export default function Invoices() {
  const { user } = useAuth()

  const [invoices, setInvoices] = useState(null)
  const [projects, setProjects] = useState([])
  const [users, setUsers] = useState([])
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [payingInvoice, setPayingInvoice] = useState(null)
  const [error, setError] = useState('')

  async function load() {
    const rows = (await api.get('/invoices', { params: { clientId: user.id } })).data
    const allProjects = (await api.get('/projects')).data
    const everyone = (await api.get('/users')).data

    const shown = rows.filter((row) => row.status !== 'draft')
    setInvoices([...shown].sort((a, b) => (a.issuedAt < b.issuedAt ? 1 : -1)))
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

  async function handlePaid() {
    const payment = await payInvoice(payingInvoice, user)
    setInvoices(
      invoices.map((row) =>
        row.id === payingInvoice.id ? { ...row, status: 'paid', paidAt: payment.paidAt } : row,
      ),
    )
    setPayingInvoice(null)
  }

  if (error) {
    return (
      <p className="my-2.5 rounded-[10px] border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-600">
        {error}
      </p>
    )
  }
  if (!invoices) return <p className="text-slate-500">Loading…</p>

  const outstanding = invoices.filter((invoice) => invoice.status === 'sent')
  const paid = invoices.filter((invoice) => invoice.status === 'paid')

  const searched = filterRows(invoices, query, function (invoice) {
    return [
      invoice.number,
      invoice.note,
      invoice.status,
      invoice.amount,
      projectTitle(invoice.projectId),
      personName(invoice.freelancerId),
    ]
  })
  const visible = filter === 'all' ? searched : searched.filter((row) => row.status === filter)

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
      </header>

      {outstanding.length > 0 ? (
        <p className="mb-4 rounded-[10px] border border-indigo-200 bg-indigo-50 px-3.5 py-3 text-sm text-indigo-800">
          You have {outstanding.length} invoice{outstanding.length === 1 ? '' : 's'} waiting to be
          paid.
        </p>
      ) : null}

      <div className="mb-[18px] flex flex-wrap items-center justify-between gap-3 border-b border-slate-200">
        <div className="flex flex-wrap gap-1">
          {FILTERS.map((name) => (
            <button
              key={name}
              className={
                '-mb-px inline-flex cursor-pointer items-center gap-[7px] border-b-2 bg-transparent px-3.5 py-2.5 text-sm font-semibold transition ' +
                (filter === name
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-900')
              }
              onClick={() => setFilter(name)}
            >
              {name === 'all' ? 'All' : name.charAt(0).toUpperCase() + name.slice(1)}
            </button>
          ))}
        </div>
        <SearchBox
          className="w-[230px] max-md:w-full"
          value={query}
          onChange={setQuery}
          placeholder="Search invoices…"
          tone="emerald"
        />
      </div>

      {visible.length === 0 ? (
        <p className="text-slate-500">
          {query ? 'No invoices match “' + query + '”.' : 'Nothing here yet.'}
        </p>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="border-b border-slate-200 px-2.5 py-2 text-left text-[11.5px] font-bold uppercase tracking-wider text-slate-500">
                  Invoice
                </th>
                <th className="border-b border-slate-200 px-2.5 py-2 text-left text-[11.5px] font-bold uppercase tracking-wider text-slate-500">
                  From
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
                      {personName(invoice.freelancerId)}
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
                      {invoice.status === 'sent' ? (
                        <button
                          className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-emerald-600 bg-emerald-600 px-3 py-1.5 text-[13px] font-semibold text-white transition hover:bg-emerald-700"
                          onClick={() => setPayingInvoice(invoice)}
                        >
                          Pay {money(invoice.amount)}
                        </button>
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

      {payingInvoice ? (
        <PaymentModal
          invoice={payingInvoice}
          onClose={() => setPayingInvoice(null)}
          onPaid={handlePaid}
        />
      ) : null}
    </div>
  )
}
