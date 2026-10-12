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
    if (!isFirebaseConfigured || !auth) {
      setLoading(false)
      return undefined
    }

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

  function requireFirebase() {
    if (!isFirebaseConfigured || !auth) {
      throw new Error(
        'Firebase is not configured. Add the VITE_FIREBASE_* keys to .env and restart the dev server.',
      )
    }
  }

  async function signIn(role) {
    requireFirebase()
    chosenRole = role
    await googleSignIn()
  }

  async function signInWithEmail(email, password, role) {
    requireFirebase()
    chosenRole = role
    await emailSignIn(email, password)
  }

  async function signUpWithEmail(email, password, role) {
    requireFirebase()
    chosenRole = role
    await emailSignUp(email, password)
  }

  async function signOut() {
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
