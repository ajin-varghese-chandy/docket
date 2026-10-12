import { useEffect, useState } from 'react'
import Modal from './Modal.jsx'
import { money } from '../format.js'
import { getRazorpayConfig } from '../payments.js'

export default function PaymentModal({ invoice, onClose, onPaid }) {
  const [config, setConfig] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    getRazorpayConfig().then((value) => {
      if (alive) setConfig(value)
    })
    return () => {
      alive = false
    }
  }, [])

  const notConfigured = Boolean(config) && !config.enabled

  async function handlePay() {

    
    setBusy(true)
    setError('')

    try {
      await onPaid()
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <Modal
      title={'Pay ' + invoice.number}
      onClose={onClose}
      footer={
        <>
          <button
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-[10px] border border-slate-200 bg-white px-4 py-[9px] text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={onClose}
            disabled={busy}
          >
            {notConfigured ? 'Close' : 'Cancel'}
          </button>
          <button
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-[10px] border border-indigo-600 bg-indigo-600 px-4 py-[9px] text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={handlePay}
            disabled={busy || notConfigured || config === null}
          >
            {busy ? 'Processing…' : 'Pay ' + money(invoice.amount)}
          </button>
        </>
      }
    >
      <div className="mb-4 flex justify-between gap-4 rounded-[10px] border border-slate-200 bg-slate-50 px-4 py-3.5">
        <div className="flex flex-col gap-0.5 text-[13px]">
          <span className="text-slate-500">Amount due</span>
          <strong className="text-lg">{money(invoice.amount)}</strong>
        </div>
        <div className="flex flex-col gap-0.5 text-[13px]">
          <span className="text-slate-500">Invoice</span>
          <strong className="text-lg">{invoice.number}</strong>
        </div>
      </div>

      {config === null ? (
        <p className="rounded-[10px] border border-slate-200 bg-slate-50 px-3 py-2.5 text-[13px] text-slate-500">
          Checking payment options…
        </p>
      ) : notConfigured ? (
        <p className="rounded-[10px] border border-amber-200 bg-amber-50 px-3 py-2.5 text-[13px] text-amber-800">
          Razorpay is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env and
          restart the API to accept payments.
        </p>
      ) : null}

      {error ? (
        <p className="my-2.5 rounded-[10px] border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-600">
          {error}
        </p>
      ) : null}
    </Modal>
  )
}
