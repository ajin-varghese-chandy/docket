import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import {
  auth,
  isFirebaseConfigured,
  googleSignIn,
  googleSignOut,
  emailSignIn,
  emailSignUp,
} from './firebase'
import api, { newId } from './api'

const AuthContext = createContext(null)

const DEMO_STORAGE_KEY = 'docket_demo_user_id'

const AVATAR_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#0ea5e9', '#8b5cf6']

let chosenRole = 'freelancer'

async function findOrCreateUser(profile, role) {
  const everyone = (await api.get('/users')).data
  const existing =
    everyone.find((row) => row.uid === profile.uid) ||
    everyone.find((row) => row.email === profile.email)

  if (existing) {
    if (!existing.uid && profile.uid) {
      const updated = await api.patch('/users/' + existing.id, { uid: profile.uid })
      return updated.data
    }
    return existing
  }

  const newUser = {
    id: newId('u'),
    uid: profile.uid || '',
    name: profile.name || profile.email.split('@')[0],
    email: profile.email,
    role: role,
    title: role === 'freelancer' ? 'Freelancer' : 'Client',
    company: '',
    photoURL: profile.photoURL || '',
    color: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
  }

  const created = await api.post('/users', newUser)
  return created.data
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isFirebaseConfigured) return

    const savedId = localStorage.getItem(DEMO_STORAGE_KEY)
    if (!savedId) {
      setLoading(false)
      return
    }

    api
      .get('/users/' + savedId)
      .then((res) => setUser(res.data))
      .catch(() => localStorage.removeItem(DEMO_STORAGE_KEY))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) return undefined

    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null)
        setLoading(false)
        return
      }

      try {
        const record = await findOrCreateUser(
          {
            uid: firebaseUser.uid,
            name: firebaseUser.displayName,
            email: firebaseUser.email,
            photoURL: firebaseUser.photoURL,
          },
          chosenRole,
        )
        setUser(record)
      } catch (error) {
        console.error('Could not load your DOCKET profile:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    })
  }, [])

  async function signIn(role) {
    chosenRole = role

    if (isFirebaseConfigured) {
      await googleSignIn()
      return
    }

    const demoEmail = role === 'freelancer' ? 'alex@docket.dev' : 'sam@acme.com'
    await signInAsDemoAccount(demoEmail)
  }

  async function signInAsDemoAccount(email) {
    const matches = (await api.get('/users', { params: { email: email } })).data
    if (matches.length === 0) throw new Error('No demo account with that email')

    const record = matches[0]
    localStorage.setItem(DEMO_STORAGE_KEY, record.id)
    setUser(record)
  }

  async function signInWithEmail(email, password, role) {
    if (isFirebaseConfigured) {
      chosenRole = role
      await emailSignIn(email, password)
      return
    }

    const matches = (await api.get('/users', { params: { email: email } })).data
    if (matches.length === 0) {
      throw new Error('No account with that email. Create one instead.')
    }
    await signInAsDemoAccount(email)
  }

  async function signUpWithEmail(email, password, role) {
    if (isFirebaseConfigured) {
      chosenRole = role
      await emailSignUp(email, password)
      return
    }

    const matches = (await api.get('/users', { params: { email: email } })).data
    if (matches.length > 0) throw new Error('An account with that email already exists.')

    const record = await findOrCreateUser(
      { uid: 'demo-' + Date.now(), name: '', email: email, photoURL: '' },
      role,
    )
    localStorage.setItem(DEMO_STORAGE_KEY, record.id)
    setUser(record)
  }

  async function signOut() {
    localStorage.removeItem(DEMO_STORAGE_KEY)
    await googleSignOut()
    setUser(null)
  }

  async function updateProfile(changes) {
    const updated = (await api.patch('/users/' + user.id, changes)).data
    setUser(updated)
    return updated
  }

  const value = {
    user,
    loading,
    signIn,
    signInAsDemoAccount,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>')
  return context
}
