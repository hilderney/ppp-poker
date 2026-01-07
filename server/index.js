try {
  console.log('server/index.js: launching')
  const express = require('express')
const http = require('http')
const WebSocket = require('ws')

const app = express()
const server = http.createServer(app)
// attach error handler to server
server.on('error', (err) => {
  console.error('HTTP server error:', err)
})
const wss = new WebSocket.Server({ server })

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception in server:', err)
})
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection in server:', reason)
})

const PORT = process.env.PORT || 4000

// server-side authoritative room state
const state = {
  hand: [1, 2, 3, 5, 8, 'Coringa', 'Duvida'],
  users: [
    { id: 'sim', name: 'Simulado', card: null }
  ],
  revealed: false,
  history: []
}

function broadcastState() {
  const msg = JSON.stringify({ type: 'state', state })
  wss.clients.forEach((c) => {
    if (c.readyState === WebSocket.OPEN) c.send(msg)
  })
}

function ensureUserExists(id, name) {
  if (!state.users.find((u) => u.id === id)) {
    state.users.push({ id, name: name || 'Anonymous', card: null })
  }
}

wss.on('connection', (ws) => {
  ws.on('message', (msg) => {
    let data
    try { data = JSON.parse(msg) } catch (e) { return }
    if (data.type === 'join') {
      ensureUserExists(data.clientId, data.name)
      // send current state to this client
      ws.send(JSON.stringify({ type: 'state', state }))
    }

    if (data.type === 'action') {
      const a = data.action
      if (a === 'select') {
        const { clientId, card } = data
        ensureUserExists(clientId)
        const user = state.users.find((u) => u.id === clientId)
        if (user) user.card = card
        // if sim exists and hasn't voted, choose random
        const sim = state.users.find((u) => u.id === 'sim')
        if (sim && (sim.card == null)) {
          const choices = state.hand.filter((c) => c !== card)
          sim.card = choices[Math.floor(Math.random() * choices.length)]
        }
        state.revealed = false
        broadcastState()
      }

      if (a === 'rename') {
        const { clientId, name } = data
        ensureUserExists(clientId)
        const user = state.users.find((u) => u.id === clientId)
        if (user) user.name = name
        broadcastState()
      }

      if (a === 'reveal') {
        state.revealed = true
        state.history.push({ users: state.users.map((u) => ({ name: u.name, card: u.card })), ts: Date.now() })
        broadcastState()
      }

      if (a === 'reset') {
        state.users = state.users.map((u) => ({ ...u, card: null }))
        state.revealed = false
        broadcastState()
      }
    }
  })

  // initial sync
  ws.send(JSON.stringify({ type: 'state', state }))
})

app.get('/', (req, res) => res.send('PPP Poker WebSocket server'))

console.log('about to listen on port', PORT)
server.on('listening', () => console.log(`Server listening on http://localhost:${PORT}`))
  server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
  })
} catch (err) {
  console.error('Server startup error:', err)
  if (err && err.stack) console.error(err.stack)
  process.exit(1)
}
