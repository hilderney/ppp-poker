let ws
let send

export function connectWS({ onState, url = 'ws://localhost:4000' , clientId, name }) {
  console.log(`[wsClient] connecting to ${url} as ${clientId}`)
  ws = new WebSocket(url)

  ws.addEventListener('open', () => {
    console.log('[wsClient] open')
  })

  ws.addEventListener('message', (ev) => {
    console.log('[wsClient] message received:', ev.data)
    try {
      const msg = JSON.parse(ev.data)
      if (msg.type === 'state' && typeof onState === 'function') onState(msg.state)
    } catch (e) {
      console.warn('[wsClient] failed to parse message', e)
    }
  })

  ws.addEventListener('close', (ev) => {
    console.log('[wsClient] connection closed', ev)
  })
  ws.addEventListener('error', (err) => {
    console.error('[wsClient] connection error', err)
  })

  send = (obj) => {
    const payload = JSON.stringify(obj)
    console.log('[wsClient] sending:', payload)
    if (ws && ws.readyState === WebSocket.OPEN) ws.send(payload)
    else console.warn('[wsClient] send attempted while socket not open')
  }

  return {
    sendAction: (action) => send({ type: 'action', ...action }),
    sendJoin: ({ clientId, name, room }) => send({ type: 'join', clientId, name, room }),
    close: () => {
      console.log('[wsClient] closing socket')
      ws && ws.close()
    }
  }
}

export function closeWS() { if (ws) ws.close() }
