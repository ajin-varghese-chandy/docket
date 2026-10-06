import api from './api.js'

let savedConfig = null

export async function getRazorpayConfig() {
  if (savedConfig !== null) {
    return savedConfig
  }

  try {
    const response = await api.get('/razorpay-config')
    savedConfig = response.data
  } catch (error) {
    savedConfig = { enabled: false, keyId: null }
  }

  return savedConfig
}

export async function payInvoice(invoice, user) {
  const config = await getRazorpayConfig()

  if (!config.enabled) {
    throw new Error(
      'Razorpay is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env and restart the API.',
    )
  }

  const order = await createOrder(invoice)

  await loadCheckoutScript()

  const checkoutResult = await openCheckout(order, invoice, user)

  const payment = await verifyPayment(checkoutResult)
  return payment
}

async function createOrder(invoice) {
  try {
    const response = await api.post('/orders', { invoiceId: invoice.id })
    return response.data
  } catch (error) {
    throw new Error(serverErrorMessage(error))
  }
}

async function verifyPayment(checkoutResult) {
  try {
    const response = await api.post('/payments/verify', checkoutResult)
    return response.data
  } catch (error) {
    throw new Error(serverErrorMessage(error))
  }
}

function serverErrorMessage(error) {
  if (error.response && error.response.data && error.response.data.error) {
    return error.response.data.error
  }
  return error.message
}

function openCheckout(order, invoice, user) {
  return new Promise(function (resolve, reject) {
    const options = {
      key: order.keyId,
      order_id: order.orderId,
      amount: order.amount,
      currency: order.currency,
      name: 'DOCKET',
      description: 'Invoice ' + invoice.number,
      theme: { color: '#4f46e5' },
      prefill: {},
      handler: function (response) {
        resolve({
          orderId: response.razorpay_order_id,
          paymentId: response.razorpay_payment_id,
          signature: response.razorpay_signature,
        })
      },
      modal: {
        ondismiss: function () {
          reject(new Error('Payment cancelled.'))
        },
      },
    }

    if (user) {
      options.prefill.name = user.name || ''
      options.prefill.email = user.email || ''
    }

    try {
      const checkout = new window.Razorpay(options)

      checkout.on('payment.failed', function (response) {
        let message = 'Payment failed.'
        if (response.error && response.error.description) {
          message = response.error.description
        }
        reject(new Error(message))
      })

      checkout.open()
    } catch (error) {
      reject(error)
    }
  })
}

function loadCheckoutScript() {
  if (window.Razorpay) {
    return Promise.resolve()
  }

  return new Promise(function (resolve, reject) {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'

    script.onload = function () {
      resolve()
    }

    script.onerror = function () {
      reject(new Error('Could not load the Razorpay checkout script.'))
    }

    document.body.appendChild(script)
  })
}
