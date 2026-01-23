/**
 * Cliente WebSocket de Teste
 * Conecta ao servidor e simula fluxo de um usuário em uma sala
 * 
 * Uso: node server/test-ws-client.js
 */

import WebSocket from 'ws'

const url = 'ws://localhost:4000/'
const clientId = `test-client-${Date.now()}`
const roomId = 'test-room'

const ws = new WebSocket(url + `?room=${roomId}`)

let messageCount = 0

ws.on('open', () => {
  console.log('✓ Connected to server')
  console.log(`  Client ID: ${clientId}`)
  console.log(`  Room ID: ${roomId}`)
  console.log('')

  // Step 1: Join room
  console.log('→ Sending JOIN message...')
  const joinMsg = {
    type: 'join',
    clientId,
    name: 'Test Client',
    room: roomId
  }
  ws.send(JSON.stringify(joinMsg))
})

ws.on('message', (msg) => {
  messageCount++
  try {
    const data = JSON.parse(msg.toString())
    console.log(`\n[Message #${messageCount}] type: ${data.type}`)
    
    if (data.type === 'state') {
      console.log(`  Users in room: ${data.state.users.length}`)
      data.state.users.forEach((u) => {
        console.log(`    - ${u.name} (${u.id}): ${u.card !== null ? `card=${u.card}` : 'no card'}`)
      })
      console.log(`  Revealed: ${data.state.revealed}`)
      console.log(`  History entries: ${data.state.history.length}`)

      // Auto-perform actions on certain events
      if (messageCount === 1) {
        // After initial join, select a card
        setTimeout(() => {
          console.log('\n→ Sending SELECT action...')
          const selectMsg = {
            type: 'action',
            action: 'select',
            clientId,
            card: 5,
            room: roomId
          }
          ws.send(JSON.stringify(selectMsg))
        }, 500)
      } else if (messageCount === 2) {
        // After select, reveal
        setTimeout(() => {
          console.log('\n→ Sending REVEAL action...')
          const revealMsg = {
            type: 'action',
            action: 'reveal',
            room: roomId
          }
          ws.send(JSON.stringify(revealMsg))
        }, 500)
      } else if (messageCount === 3) {
        // After reveal, reset
        setTimeout(() => {
          console.log('\n→ Sending RESET action...')
          const resetMsg = {
            type: 'action',
            action: 'reset',
            room: roomId
          }
          ws.send(JSON.stringify(resetMsg))
        }, 500)
      } else if (messageCount === 4) {
        // After reset, rename
        setTimeout(() => {
          console.log('\n→ Sending RENAME action...')
          const renameMsg = {
            type: 'action',
            action: 'rename',
            clientId,
            name: 'Renamed Client',
            room: roomId
          }
          ws.send(JSON.stringify(renameMsg))
        }, 500)
      }
    }
  } catch (e) {
    console.log(`[Message #${messageCount}] raw:`, msg.toString())
  }
})

ws.on('close', (code, reason) => {
  console.log(`\n✗ Connection closed`)
  console.log(`  Code: ${code}`)
  console.log(`  Reason: ${reason && reason.toString()}`)
})

ws.on('error', (err) => {
  console.error('✗ Connection error:', err && err.message)
})

// Close after 10 seconds
setTimeout(() => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    console.log('\n→ Closing connection...')
    ws.close()
  }
  setTimeout(() => process.exit(0), 200)
}, 10000)
