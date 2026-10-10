import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../AuthContext.jsx'
import api, { newId } from '../api.js'
import { money, date, fileSize } from '../format.js'
import Avatar from '../components/Avatar.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import PaymentModal from '../components/PaymentModal.jsx'
import { payInvoice } from '../payments.js'

const TABS = ['Overview', 'Invoices', 'Files', 'Payments']

export default function ProjectDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const isFreelancer = user.role === 'freelancer'

  const [project, setProject] = useState(null)
  const [people, setPeople] = useState([])
  const [invoices, setInvoices] = useState([])
  const [files, setFiles] = useState([])
  const [payments, setPayments] = useState([])
  const [tab, setTab] = useState('Overview')
  const [payingInvoice, setPayingInvoice] = useState(null)
  const [error, setError] = useState('')

  async function load() {
    const found = (await api.get('/projects/' + id)).data
    const everyone = (await api.get('/users')).data
    const projectInvoices = (await api.get('/invoices', { params: { projectId: id } })).data
    const projectFiles = isFreelancer
      ? []
      : (await api.get('/files', { params: { projectId: id } })).data
    const projectPayments = (await api.get('/payments', { params: { projectId: id } })).data

    setProject(found)
    setPeople(everyone)
    setInvoices(projectInvoices)
    setFiles(projectFiles)
    setPayments(projectPayments)
  }

  useEffect(() => {
    load().catch((err) => setError(err.message))
  }, [id])

  function person(id2) {
    return people.find((row) => row.id === id2)
  }

  async function updateProgress(value) {
    const progress = Number(value)
    setProject({ ...project, progress })
    await api.patch('/projects/' + project.id, { progress })
  }

  async function acceptProject() {
    setProject({ ...project, status: 'active' })
    await api.patch('/projects/' + project.id, { status: 'active' })
  }

  async function sendInvoice(invoice) {
    const issuedAt = new Date().toISOString().slice(0, 10)
    setInvoices(
      invoices.map((row) => (row.id === invoice.id ? { ...row, status: 'sent', issuedAt } : row)),
    )
    await api.patch('/invoices/' + invoice.id, { status: 'sent', issuedAt })
  }

  async function handlePaid() {
    const payment = await payInvoice(payingInvoice, user)
    setInvoices(
      invoices.map((row) =>
        row.id === payingInvoice.id ? { ...row, status: 'paid', paidAt: payment.paidAt } : row,
      ),
    )
    setPayments([...payments, payment])
    setPayingInvoice(null)
    setTab('Invoices')
  }

  async function addFile(event) {
    const file = event.target.files[0]
    if (!file) return

    const saved = {
      id: newId('fl'),
      projectId: project.id,
      name: file.name,
      size: file.size,
      uploadedBy: user.id,
      createdAt: new Date().toISOString().slice(0, 10),
      url: '#',
    }

    await api.post('/files', saved)
    setFiles([...files, saved])
    event.target.value = ''
  }

  if (error) {
    return (
      <p className="my-2.5 rounded-[10px] border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-600">
        {error}
      </p>
    )
  }
  if (!project) return <p className="text-slate-500">Loading…</p>

  const freelancer = person(project.freelancerId)
  const client = person(project.clientId)
  const mine = user.id === project.freelancerId || user.id === project.clientId

  if (!mine) {
    return (
      <div>
        <p className="my-2.5 rounded-[10px] border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-600">
          This project belongs to someone else.
        </p>
        <Link className="text-sm font-semibold text-indigo-600 hover:underline" to="/projects">
          Back to projects
        </Link>
      </div>
    )
  }

  const outstanding = invoices
    .filter((invoice) => invoice.status === 'sent')
    .reduce((sum, invoice) => sum + invoice.amount, 0)
  const received = payments
    .filter((payment) => payment.status === 'succeeded')
    .reduce((sum, payment) => sum + payment.amount, 0)
  const accent = isFreelancer ? 'text-indigo-600 border-indigo-600' : 'text-emerald-700 border-emerald-600'
  const tabs = isFreelancer ? TABS.filter((name) => name !== 'Files') : TABS

  return (
    <div>
      <Link
        className="mb-3.5 inline-block text-sm font-semibold text-indigo-600 hover:underline"
        to="/projects"
      >
        ← All projects
      </Link>

      <header className="mb-[22px] flex items-start justify-between gap-5">
        <div>
          <h1 className="text-3xl font-bold tracking-[-0.02em]">{project.title}</h1>
          <p className="mt-1.5 text-sm text-slate-500">
            {money(project.budget)} budget · started {date(project.startDate)} · due{' '}
            {date(project.dueDate)}
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <StatusBadge status={project.status} />
          {isFreelancer && project.status === 'requested' ? (
            <button
              className="inline-flex cursor-pointer items-center justify-center rounded-[10px] border border-indigo-600 bg-indigo-600 px-4 py-[9px] text-sm font-semibold text-white transition hover:bg-indigo-700"
              onClick={acceptProject}
            >
              Accept project
            </button>
          ) : null}
        </div>
      </header>

      <div className="mb-[18px] flex flex-wrap items-center gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3.5 shadow-sm">
        {freelancer ? (
          <div className="flex items-center gap-[11px]">
            <Avatar
              name={freelancer.name}
              color={freelancer.color}
              photoURL={freelancer.photoURL}
              size={42}
            />
            <div>
              <strong className="text-[14.5px]">{freelancer.name}</strong>
              <span className="block text-xs text-slate-500">Freelancer</span>
            </div>
          </div>
        ) : null}
        <span className="text-lg text-slate-500">⇄</span>
        {client ? (
          <div className="flex items-center gap-[11px]">
            <Avatar name={client.name} color={client.color} photoURL={client.photoURL} size={42} />
            <div>
              <strong className="text-[14.5px]">{client.name}</strong>
              <span className="block text-xs text-slate-500">{client.company || 'Client'}</span>
            </div>
          </div>
        ) : null}
      </div>

      <div className="mb-[18px] flex flex-wrap gap-1 border-b border-slate-200">
        {tabs.map((name) => (
          <button
            key={name}
            className={
              '-mb-px inline-flex cursor-pointer items-center gap-[7px] border-b-2 bg-transparent px-3.5 py-2.5 text-sm font-semibold transition ' +
              (tab === name
                ? accent
                : 'border-transparent text-slate-500 hover:text-slate-900')
            }
            onClick={() => setTab(name)}
          >
            {name}
            {name === 'Invoices' && outstanding > 0 ? (
              <span className="rounded-full bg-indigo-50 px-[7px] py-0.5 text-[11px] font-bold text-indigo-700">
                {money(outstanding)}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {tab === 'Overview' ? (
        <div className="grid grid-cols-2 items-start gap-4 max-lg:grid-cols-1">
          <section className="mb-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold">About this project</h2>
            <p className="mb-3 text-sm leading-relaxed text-slate-600">{project.description}</p>

            <div className="mt-[18px] grid grid-cols-2 gap-3.5">
              <div className="flex flex-col gap-[3px] text-[13px]">
                <span className="text-slate-500">Budget</span>
                <strong className="text-base">{money(project.budget)}</strong>
              </div>
              <div className="flex flex-col gap-[3px] text-[13px]">
                <span className="text-slate-500">Outstanding</span>
                <strong className="text-base">{money(outstanding)}</strong>
              </div>
              <div className="flex flex-col gap-[3px] text-[13px]">
                <span className="text-slate-500">Paid so far</span>
                <strong className="text-base">{money(received)}</strong>
              </div>
              <div className="flex flex-col gap-[3px] text-[13px]">
                <span className="text-slate-500">Progress</span>
                <strong className="text-base">{project.progress}%</strong>
              </div>
            </div>

            <div className="mt-3.5 h-2.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-[width] duration-300"
                style={{ width: project.progress + '%' }}
              />
            </div>
          </section>

          <section className="mb-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold">Progress</h2>
            {isFreelancer ? (
              <>
                <p className="mb-3 text-sm text-slate-500">Drag to update what the client sees.</p>
                <input
                  className="my-3.5 w-full accent-indigo-600"
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={project.progress}
                  onChange={(event) => updateProgress(event.target.value)}
                />
                <p className="mt-2 text-[34px] font-bold tracking-[-0.03em]">{project.progress}%</p>
              </>
            ) : (
              <>
                <p className="mb-3 text-sm text-slate-500">Your freelancer keeps this up to date.</p>
                <p className="mt-2 text-[34px] font-bold tracking-[-0.03em]">{project.progress}%</p>
              </>
            )}
          </section>
        </div>
      ) : null}

      {tab === 'Invoices' ? (
        <section className="mb-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3.5 flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold">Invoices</h2>
            <Link className="text-sm font-semibold text-indigo-600 hover:underline" to="/invoices">
              Open invoices page
            </Link>
          </div>

          {invoices.length === 0 ? (
            <p className="text-slate-500">No invoices for this project yet.</p>
          ) : (
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="border-b border-slate-200 px-2.5 py-2 text-left text-[11.5px] font-bold uppercase tracking-wider text-slate-500">
                    Invoice
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
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-slate-50">
                    <td className="border-b border-slate-200 px-2.5 py-[13px] align-middle">
                      <strong>{invoice.number}</strong>
                      <span className="block text-slate-500">{invoice.note}</span>
                    </td>
                    <td className="border-b border-slate-200 px-2.5 py-[13px] align-middle font-semibold tabular-nums">
                      {money(invoice.amount)}
                    </td>
                    <td className="border-b border-slate-200 px-2.5 py-[13px] align-middle text-slate-500">
                      {date(invoice.dueDate)}
                    </td>
                    <td className="border-b border-slate-200 px-2.5 py-[13px] align-middle">
                      <StatusBadge status={invoice.status} />
                    </td>
                    <td className="border-b border-slate-200 px-2.5 py-[13px] text-right align-middle">
                      {isFreelancer && invoice.status === 'draft' ? (
                        <button
                          className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[13px] font-semibold text-slate-900 transition hover:bg-slate-100"
                          onClick={() => sendInvoice(invoice)}
                        >
                          Send
                        </button>
                      ) : null}
                      {!isFreelancer && invoice.status === 'sent' ? (
                        <button
                          className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-emerald-600 bg-emerald-600 px-3 py-1.5 text-[13px] font-semibold text-white transition hover:bg-emerald-700"
                          onClick={() => setPayingInvoice(invoice)}
                        >
                          Pay {money(invoice.amount)}
                        </button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      ) : null}

      {tab === 'Files' && !isFreelancer ? (
        <section className="mb-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3.5 flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold">Shared files</h2>
            {!isFreelancer ? (
              <label className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[13px] font-semibold text-slate-900 transition hover:bg-slate-100">
                Upload
                <input type="file" hidden onChange={addFile} />
              </label>
            ) : null}
          </div>

          <p className="mb-4 rounded-[10px] border border-indigo-200 bg-indigo-50 px-3 py-2.5 text-[13px] text-indigo-800">
            Demo only. We save the file name and size, not the file itself.
          </p>

          {files.length === 0 ? (
            <p className="text-slate-500">Nothing shared yet.</p>
          ) : (
            <ul className="m-0 flex list-none flex-col p-0">
              {files.map((file) => {
                const owner = person(file.uploadedBy)
                return (
                  <li
                    className="flex items-center gap-3 border-b border-slate-200 px-2 py-[11px] last:border-b-0"
                    key={file.id}
                  >
                    <span className="grid h-[42px] w-[42px] shrink-0 place-items-center rounded-[9px] bg-indigo-50 text-[10px] font-extrabold tracking-wider text-indigo-600">
                      FILE
                    </span>
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <strong className="text-sm">{file.name}</strong>
                      <span className="text-xs text-slate-500">
                        {fileSize(file.size)} · {owner ? owner.name : 'Unknown'} ·{' '}
                        {date(file.createdAt)}
                      </span>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      ) : null}

      {tab === 'Payments' ? (
        <section className="mb-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3.5 text-base font-semibold">Payments</h2>

          {payments.length === 0 ? (
            <p className="text-slate-500">No payments recorded yet.</p>
          ) : (
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="border-b border-slate-200 px-2.5 py-2 text-left text-[11.5px] font-bold uppercase tracking-wider text-slate-500">
                    Reference
                  </th>
                  <th className="border-b border-slate-200 px-2.5 py-2 text-left text-[11.5px] font-bold uppercase tracking-wider text-slate-500">
                    Amount
                  </th>
                  <th className="border-b border-slate-200 px-2.5 py-2 text-left text-[11.5px] font-bold uppercase tracking-wider text-slate-500">
                    Method
                  </th>
                  <th className="border-b border-slate-200 px-2.5 py-2 text-left text-[11.5px] font-bold uppercase tracking-wider text-slate-500">
                    Date
                  </th>
                  <th className="border-b border-slate-200 px-2.5 py-2 text-left text-[11.5px] font-bold uppercase tracking-wider text-slate-500">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-slate-50">
                    <td className="border-b border-slate-200 px-2.5 py-[13px] align-middle">
                      <strong>{payment.reference}</strong>
                    </td>
                    <td className="border-b border-slate-200 px-2.5 py-[13px] align-middle font-semibold tabular-nums">
                      {money(payment.amount)}
                    </td>
                    <td className="border-b border-slate-200 px-2.5 py-[13px] align-middle text-slate-500">
                      {payment.method === 'razorpay'
                        ? 'Razorpay' + (payment.via ? ' · ' + payment.via : '')
                        : 'Card •••• ' + payment.cardLast4}
                    </td>
                    <td className="border-b border-slate-200 px-2.5 py-[13px] align-middle text-slate-500">
                      {date(payment.paidAt)}
                    </td>
                    <td className="border-b border-slate-200 px-2.5 py-[13px] align-middle">
                      <StatusBadge status={payment.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      ) : null}

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
