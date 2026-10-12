import { initializeApp } from 'firebase/app'
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { getDatabase } from 'firebase/database'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
}

export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId)

let auth = null
let database = null

if (isFirebaseConfigured) {
  const app = initializeApp(firebaseConfig)
  auth = getAuth(app)
  if (firebaseConfig.databaseURL) {
    database = getDatabase(app)
  }
}

export { auth, database }

function toProfile(user) {
  const profile = {
    uid: user.uid,
    name: user.displayName,
    email: user.email,
    photoURL: user.photoURL,
  }
  return profile
}

function friendlyAuthMessage(error) {
  let code = ''
  if (error && error.code) {
    code = error.code
  }

  if (
    code === 'auth/invalid-credential' ||
    code === 'auth/wrong-password' ||
    code === 'auth/user-not-found'
  ) {
    return 'Wrong email or password.'
  }

  if (code === 'auth/email-already-in-use') {
    return 'That email already has an account.'
  }

  if (code === 'auth/weak-password') {
    return 'Use at least 6 characters for your password.'
  }

  if (code === 'auth/invalid-email') {
    return 'That email does not look right.'
  }

  if (code === 'auth/too-many-requests') {
    return 'Too many attempts. Try again in a moment.'
  }

  if (code === 'auth/unauthorized-domain') {
    const host = typeof window !== 'undefined' ? window.location.hostname : 'this site'
    return (
      'Sign-in is blocked: ' +
      host +
      ' is not an authorized domain in Firebase. Add it under Authentication → Settings → Authorized domains.'
    )
  }

  if (code === 'auth/popup-closed-by-user') {
    return 'The sign-in window was closed before it finished.'
  }

  if (code === 'auth/popup-blocked') {
    return 'The sign-in popup was blocked by the browser. Allow popups for this site and try again.'
  }

  if (error && error.message) {
    return error.message
  }

  return 'Could not sign you in.'
}

export async function googleSignIn() {
  const provider = new GoogleAuthProvider()
  try {
    const result = await signInWithPopup(auth, provider)
    const profile = toProfile(result.user)
    return profile
  } catch (error) {
    throw new Error(friendlyAuthMessage(error))
  }
}

export async function emailSignIn(email, password) {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password)
    const profile = toProfile(result.user)
    return profile
  } catch (error) {
    throw new Error(friendlyAuthMessage(error))
  }
}

export async function emailSignUp(email, password) {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password)
    const profile = toProfile(result.user)
    return profile
  } catch (error) {
    throw new Error(friendlyAuthMessage(error))
  }
}

export async function googleSignOut() {
  if (auth) {
    await signOut(auth)
  }
}
