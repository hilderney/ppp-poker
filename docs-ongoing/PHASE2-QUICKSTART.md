# 🚀 Quick Start - Phase 2 (Socket.io)

## ✅ O que mudou?

Phase 2 migrou de `ws` para `socket.io`, adicionando:
- ✅ Auto-reconnection automática
- ✅ HTTP polling como fallback
- ✅ Heartbeat automático
- ✅ Melhor tratamento de erros

---

## 🏃 Quick Start (5 minutos)

### 1. Instalar Dependências
```bash
npm install
```

### 2. Iniciar Servidor
```bash
npm run start:server
```

Você deve ver:
```
Server listening on http://localhost:4000
```

### 3. Testar Conexão (Node REPL ou Script)
```javascript
import { connectWS } from './src/wsClient.js'

const client = connectWS({
  url: 'http://localhost:4000',
  clientId: 'test-client',
  name: 'Test User'
})

// Enviar mensagem
client.sendAction({ type: 'vote', value: 5 })

// Desconectar
client.close()
```

### 4. Executar Testes
```bash
npm test socketio.test.js
```

---

## 🔌 API do Cliente

### Conectar
```javascript
import { connectWS } from './src/wsClient.js'

const ws = connectWS({
  onState: (state) => console.log('Nova state:', state),
  url: 'http://localhost:4000',
  token: 'jwt-token-aqui', // Opcional
  clientId: 'user123',
  name: 'John Doe'
})
```

### Enviar Mensagens
```javascript
// Generic emit
ws.send('event-name', { data: 'value' })

// Enviar ação
ws.sendAction({ type: 'vote', value: 8 })

// Entrar na sala
ws.sendJoin({ clientId: 'user123', name: 'John', room: 'room-123' })
```

### Verificar Status
```javascript
if (ws.isConnected()) {
  console.log('Conectado:', ws.getId())
}
```

### Escutar Eventos
```javascript
ws.on('room:state', (msg) => {
  console.log('Estado da sala:', msg)
})

ws.on('user:connected', (data) => {
  console.log('Usuário conectado:', data)
})
```

### Desconectar
```javascript
ws.close()
```

---

## 📡 Eventos do Servidor

### Emitidos para Cliente
| Evento | Descrição | Dados |
|--------|-----------|-------|
| `connect` | Conectado ao servidor | - |
| `disconnect` | Desconectado | `reason` |
| `room:state` | Estado da sala | `{ type, state }` |
| `user:connected` | Usuário entrou | `{ userId, email, socketId }` |
| `user:disconnected` | Usuário saiu | `{ userId, socketId }` |
| `error` | Erro no servidor | `{ message, error }` |

### Enviados para Servidor
| Evento | Descrição | Dados |
|--------|-----------|-------|
| `message` | Mensagem genérica | Qualquer objeto |
| `action` | Ação (vote, etc) | `{ type, ...data }` |
| `join` | Entrar na sala | `{ clientId, name, room }` |
| `ping` | Heartbeat manual | Callback |

---

## 🔄 Auto-Reconnection

Configuração automática:
```javascript
reconnection: true,
reconnectionDelay: 1000,        // 1s na primeira tentativa
reconnectionDelayMax: 5000,     // Máximo 5s
reconnectionAttempts: 5         // 5 tentativas
```

Eventos de reconexão:
```javascript
socket.on('connect', () => console.log('Conectado'))
socket.on('disconnect', () => console.log('Desconectado'))
socket.on('reconnect_attempt', () => console.log('Tentando reconectar...'))
socket.on('reconnect_failed', () => console.log('Falha ao reconectar'))
```

---

## 🫀 Heartbeat

Automático a cada 30s:
```javascript
pingInterval: 30000,    // Ping a cada 30s
pingTimeout: 60000      // Timeout de 60s
```

Responder ao ping manualmente:
```javascript
socket.on('ping', (callback) => {
  if (callback) callback({ timestamp: Date.now() })
})
```

---

## 📲 Transports (Fallback)

O cliente tenta automaticamente:
1. **WebSocket** (ideal, melhor performance)
2. **HTTP Polling** (fallback, para firewalls/proxies)

Você não precisa fazer nada, alternância é automática!

---

## 🧪 Testes

### Executar todos os testes
```bash
npm test
```

### Executar apenas testes Socket.io
```bash
npm test socketio.test.js
```

### Ver cobertura
```bash
npm test -- --coverage
```

---

## 🐛 Debugging

### Ativar logs detalhados (Browser DevTools)
```javascript
localStorage.debug = 'socket.io-client:*'
```

### Checar conexão no servidor
```bash
# No terminal do servidor, você verá:
# [ISO] Client connected. id=abc123 room=default user=...
# [ISO] Received message: { ... }
```

---

## ⚡ Diferenças do ws antigo

| Aspecto | ws | socket.io |
|---------|-----|-----------|
| Conectar | `new WebSocket(url)` | `io(url, { ... })` |
| Enviar | `ws.send(JSON.stringify(...))` | `socket.emit('event', data)` |
| Receber | `ws.addEventListener('message', ...)` | `socket.on('event', (data) => ...)` |
| Reconectar | Manual | Automático |
| Fallback | Não | Polling HTTP |
| Heartbeat | Manual | Automático |

---

## 🚀 Próximas Etapas

Phase 2 está completo! Próximas:

1. **Validações** - Adicionar Zod/Joi para validar mensagens
2. **Testes E2E** - Playwright/Cypress para testes end-to-end
3. **Deploy** - Docker/Docker Compose
4. **Testes de Carga** - k6/Artillery

---

## 📞 Troubleshooting

### Conexão recusada
```
Error: connect ECONNREFUSED 127.0.0.1:4000
```
✅ Solução: Iniciar servidor com `npm run start:server`

### Token inválido
```
Invalid token provided, disconnecting
```
✅ Solução: Verificar JWT_SECRET no `.env`

### Polling não funciona
```
GET /socket.io/?transport=polling failed
```
✅ Solução: CORS está configurado, deve funcionar automaticamente

### Muitos logs de reconnect
```
reconnect attempt 1/5
reconnect attempt 2/5
```
✅ Solução: Servidor não está respondendo, verificar `npm run start:server`

---

**Última atualização:** 27 de janeiro de 2026  
**Versão:** Phase 2 v1.0  
**Status:** ✅ Completo e Pronto para Uso
