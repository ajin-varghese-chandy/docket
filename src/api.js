import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || '/api',
})

export default api

export function newId(prefix) {
  const time = Date.now().toString(36)
  const random = Math.random().toString(36).slice(2, 6)
  return prefix + '_' + time + random
}
