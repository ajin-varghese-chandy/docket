import { onValue, push, ref } from 'firebase/database'
import { database } from './firebase'

function requireDatabase() {
  if (!database) {
    throw new Error(
      'Chat requires Firebase Realtime Database. Enable it in the Firebase console and set VITE_FIREBASE_DATABASE_URL in .env.',
    )
  }
}

function chatRef(projectId) {
  return ref(database, 'chats/' + projectId + '/messages')
}

function snapshotToArray(snapshot) {
  const rows = []
  snapshot.forEach((child) => {
    rows.push({ id: child.key, ...child.val() })
  })
  return rows.sort((a, b) => a.createdAt - b.createdAt)
}

export function subscribeToChat(projectId, onMessages, onError) {
  requireDatabase()
  return onValue(
    chatRef(projectId),
    (snapshot) => onMessages(snapshotToArray(snapshot)),
    (error) => {
      if (onError) onError(error)
    },
  )
}

export async function sendChatMessage(projectId, user, text) {
  requireDatabase()
  const message = {
    text: String(text).trim(),
    senderId: user.id,
    senderName: user.name,
    senderRole: user.role,
    createdAt: Date.now(),
  }
  if (!message.text) return null
  await push(chatRef(projectId), message)
  return message
}
