let ws
let send

export function connectWS({ onState, url = 'ws://localhost:4000' , clientId, name }) {
  ws = new WebSocket(url)
  ws.addEventListener('open', () => {
    ws.send(JSON.stringify({ type: 'join', clientId, name }))
  })
  ws.addEventListener('message', (ev) => {
    try {
      const msg = JSON.parse(ev.data)
      if (msg.type === 'state' && typeof onState === 'function') onState(msg.state)
    } catch (e) {
      // ignore
    }
  })

  send = (obj) => {
    if (ws && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(obj))
  }

  return {
    sendAction: (action) => send({ type: 'action', ...action }),
    close: () => ws && ws.close()
  }
}

export function closeWS() { if (ws) ws.close() }
