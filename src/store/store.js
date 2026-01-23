import { configureStore } from '@reduxjs/toolkit'
import roomReducer, { setState } from './roomSlice'

const STORAGE_KEY = 'ppp_state_v1'

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return undefined
    return JSON.parse(raw)
  } catch (e) {
    return undefined
  }
}

function saveState(state) {
  try {
    const toSave = JSON.stringify(state)
    localStorage.setItem(STORAGE_KEY, toSave)
  } catch (e) {
    // ignore
  }
}

const preloaded = loadState()

const store = configureStore({
  reducer: { room: roomReducer },
  preloadedState: preloaded
})

// Ensure a persistent client id exists and that the current client has a user record.
const CLIENT_KEY = 'ppp_client_id'
function ensureClientUser() {
  try {
    let clientId = localStorage.getItem(CLIENT_KEY)
    if (!clientId) {
      clientId = `c_${Date.now()}_${Math.floor(Math.random() * 10000)}`
      localStorage.setItem(CLIENT_KEY, clientId)
    }

    const s = store.getState()
    const users = (s && s.room && Array.isArray(s.room.users)) ? s.room.users : []

    // Ensure simulated user exists
      const hasSim = users.some((u) => u.id === 'sim')
      if (!hasSim) {
        const newUsers = [...users, { id: 'sim', name: 'Simulado', card: null }]
        store.dispatch(setState({ users: newUsers }))
      }
    return clientId
  } catch (e) {
    return null
  }
}

const CLIENT_ID = ensureClientUser()

store.subscribe(() => {
  const s = store.getState()
  saveState(s)
})

export default store
