const WebSocket = require('ws')

function waitForState(ws, predicate, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => {
      ws.removeAllListeners('message')
      reject(new Error('timeout waiting for state'))
    }, timeout)
    ws.on('message', (m) => {
      try {
        const msg = JSON.parse(m.toString())
        if (msg.type === 'state') {
          if (predicate(msg.state)) {
            clearTimeout(t)
            ws.removeAllListeners('message')
            resolve(msg.state)
          }
        }
      } catch (e) {
        // ignore
      }
    })
  })
}

async function run() {
  const room = process.argv[2] || 'testroom'
  const clientId = `node-test-${Date.now()}`
  const ws = new WebSocket(`ws://localhost:4000/?room=${room}`)

  await new Promise((res, rej) => {
    ws.on('open', res)
    ws.on('error', rej)
  })

  console.log('connected, sending join')
  ws.send(JSON.stringify({ type: 'join', clientId, name: 'NodeTester', room }))

  try {
    const stateAfterJoin = await waitForState(ws, (s) => Array.isArray(s.users) && s.users.some((u) => u.id === clientId), 4000)
    console.log('join observed, users:', stateAfterJoin.users.map((u) => u.id))

    console.log('sending select action')
    ws.send(JSON.stringify({ type: 'action', action: 'select', clientId, card: 5, room }))

    const stateAfterSelect = await waitForState(ws, (s) => {
      const u = (s.users || []).find((x) => x.id === clientId)
      return u && u.card === 5
    }, 4000)

    console.log('select observed, card:', stateAfterSelect.users.find((u) => u.id === clientId).card)
    console.log('TEST PASSED')
  } catch (e) {
    console.error('TEST FAILED', e)
    process.exitCode = 2
  } finally {
    ws.close()
  }
}

run()
