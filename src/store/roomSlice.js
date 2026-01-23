import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  hand: [1, 2, 3, 5, 8, 13, 21, 34, 55, 'Coringa', 'Duvida'],
  // default two users for local testing: you + simulated
  users: [ { id: 'sim', name: 'Simulado', card: null } ],
  currentUserId: null,
  revealed: false,
  history: []
}

const roomSlice = createSlice({
  name: 'room',
  initialState,
  reducers: {
    addUser(state, action) {
      const name = action.payload
      const id = `${Date.now()}_${Math.floor(Math.random() * 1000)}`
      state.users.push({ id, name, card: null })
      state.currentUserId = id
    },
    setCurrentUser(state, action) {
      state.currentUserId = action.payload
    },
    selectCardForCurrentUser(state, action) {
      const card = action.payload
      const user = state.users.find((u) => u.id === state.currentUserId)
      if (user) {
        user.card = card
        state.revealed = false
        // If there is a simulated user, give them a random selection (exclude the chosen card)
        const sim = state.users.find((u) => u.id === 'sim')
        if (sim && (sim.card == null || sim.card === undefined)) {
          const choices = state.hand.filter((c) => c !== card)
          sim.card = choices[Math.floor(Math.random() * choices.length)]
        }
      }
    },
    revealAll(state) {
      state.revealed = true
      state.history.push({ users: state.users.map((u) => ({ name: u.name, card: u.card })), ts: Date.now() })
    },
    resetTable(state) {
      state.users = state.users.map((u) => ({ ...u, card: null }))
      state.revealed = false
    },
    updateUserName(state, action) {
      const { id, name } = action.payload
      const user = state.users.find((u) => u.id === id)
      if (user) user.name = name
    },
    setState(state, action) {
      return { ...state, ...action.payload }
    }
  }
})

export const { addUser, setCurrentUser, selectCardForCurrentUser, revealAll, resetTable, updateUserName, setState } = roomSlice.actions
export default roomSlice.reducer
