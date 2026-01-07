const WebSocket = require('ws');
const url = 'ws://localhost:4000/';
const ws = new WebSocket(url);

ws.on('open', () => {
  console.log('client: connected');
  const join = { type: 'join', clientId: 'test-client', name: 'TestClient' };
  ws.send(JSON.stringify(join));
});

ws.on('message', (msg) => {
  try {
    const data = JSON.parse(msg.toString());
    console.log('client: received:', JSON.stringify(data, null, 2));
  } catch (e) {
    console.log('client: raw message:', msg.toString());
  }
});

ws.on('close', (code, reason) => {
  console.log('client: closed', code, reason && reason.toString());
});

ws.on('error', (err) => {
  console.error('client: error', err && err.message);
});

// auto-close after 5s
setTimeout(() => {
  if (ws && ws.readyState === WebSocket.OPEN) ws.close();
  setTimeout(() => process.exit(0), 200);
}, 5000);
