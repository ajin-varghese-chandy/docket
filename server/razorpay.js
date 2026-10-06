import Razorpay from 'razorpay'

export function setupRazorpay() {
  const keyId = process.env.RAZORPAY_KEY_ID || ''
  const keySecret = process.env.RAZORPAY_KEY_SECRET || ''
  const isOn = Boolean(keyId && keySecret)

  let client = null

  if (isOn) {
    client = new Razorpay({ key_id: keyId, key_secret: keySecret })
  }

  return { client, keyId, keySecret, isOn }
}

export function validateSignature(signedText, signature, keySecret) {
  return Razorpay.validateWebhookSignature(signedText, signature, keySecret)
}

export function razorpayErrorMessage(error, fallback) {
  if (error && error.error && error.error.description) {
    return error.error.description
  }

  if (error && error.message) {
    return error.message
  }

  return fallback
}
