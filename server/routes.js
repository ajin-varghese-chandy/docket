import { razorpayErrorMessage, validateSignature } from './razorpay.js'

export function registerRoutes(server, router, razorpay) {
  const { client, keyId, keySecret, isOn } = razorpay

  server.get('/razorpay-config', function (req, res) {
    if (!isOn) {
      res.json({ enabled: false, keyId: null })
      return
    }

    res.json({ enabled: true, keyId: keyId })
  })

  server.post('/orders', async function (req, res) {
    if (!isOn) {
      res.status(400).json({
        error: 'Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env.',
      })
      return
    }

    const invoiceId = req.body ? req.body.invoiceId : null
    const invoice = router.db.get('invoices').find({ id: invoiceId }).value()

    if (!invoice) {
      res.status(404).json({ error: 'Invoice not found.' })
      return
    }

    if (invoice.status !== 'sent') {
      res.status(400).json({ error: 'This invoice is not awaiting payment.' })
      return
    }

    const amountInPaise = Math.round(Number(invoice.amount) * 100)

    if (!Number.isFinite(amountInPaise) || amountInPaise < 100) {
      res.status(400).json({ error: 'Invoice amount is too small to charge.' })
      return
    }

    try {
      const order = await client.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        receipt: invoice.number || invoice.id,
        notes: {
          invoiceId: invoice.id,
          projectId: invoice.projectId || '',
          freelancerId: invoice.freelancerId || '',
          clientId: invoice.clientId || '',
        },
      })

      res.json({
        keyId: keyId,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        invoice: { id: invoice.id, number: invoice.number },
      })
    } catch (error) {
      res
        .status(502)
        .json({ error: razorpayErrorMessage(error, 'Could not create a Razorpay order.') })
    }
  })

  server.post('/payments/verify', async function (req, res) {
    if (!isOn) {
      res.status(400).json({ error: 'Razorpay is not configured.' })
      return
    }

    const body = req.body || {}
    const orderId = body.orderId
    const paymentId = body.paymentId
    const signature = body.signature

    if (!orderId || !paymentId || !signature) {
      res.status(400).json({ error: 'Missing payment verification fields.' })
      return
    }

    const signedText = orderId + '|' + paymentId
    const signatureIsGood = validateSignature(signedText, signature, keySecret)

    if (!signatureIsGood) {
      res.status(400).json({ error: 'Payment signature verification failed.' })
      return
    }

    try {
      const order = await client.orders.fetch(orderId)
      const invoiceId = order.notes ? order.notes.invoiceId : null
      const invoice = router.db.get('invoices').find({ id: invoiceId }).value()

      if (!invoice) {
        res.status(404).json({ error: 'Invoice not found.' })
        return
      }

      const savedPayment = router.db
        .get('payments')
        .find({ razorpayOrderId: orderId, status: 'succeeded' })
        .value()

      if (savedPayment) {
        res.json(savedPayment)
        return
      }

      const charge = await client.payments.fetch(paymentId)

      if (charge.order_id !== orderId) {
        res.status(400).json({ error: 'Payment does not belong to this order.' })
        return
      }

      if (charge.status !== 'captured' && charge.status !== 'authorized') {
        res.status(400).json({ error: 'Payment is not complete (status: ' + charge.status + ').' })
        return
      }

      const amountInPaise = Math.round(Number(invoice.amount) * 100)
      if (Number(charge.amount) !== amountInPaise) {
        res.status(400).json({ error: 'Paid amount does not match the invoice.' })
        return
      }

      let cardLast4 = null
      if (charge.card && charge.card.last4) {
        cardLast4 = charge.card.last4
      }

      const today = new Date().toISOString().slice(0, 10)

      const payment = {
        id: newId('pay'),
        invoiceId: invoice.id,
        projectId: invoice.projectId,
        freelancerId: invoice.freelancerId,
        clientId: invoice.clientId,
        amount: invoice.amount,
        method: 'razorpay',
        via: charge.method || '',
        cardLast4: cardLast4,
        status: 'succeeded',
        reference: paymentId,
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
        paidAt: today,
      }

      router.db.get('payments').push(payment).write()
      router.db
        .get('invoices')
        .find({ id: invoice.id })
        .assign({ status: 'paid', paidAt: today })
        .write()

      res.json(payment)
    } catch (error) {
      res.status(502).json({ error: razorpayErrorMessage(error, 'Could not verify the payment.') })
    }
  })
}

function newId(prefix) {
  const time = Date.now().toString(36)
  const random = Math.random().toString(36).slice(2, 6)
  return prefix + '_' + time + random
}
