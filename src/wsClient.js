import { io } from 'socket.io-client'

let socket
let reconnectAttempts = 0
const MAX_RECONNECT_ATTEMPTS = 5

/**
 * Conecta ao servidor WebSocket usando Socket.io
 * Com suporte a auto-reconnection, heartbeat e fallback polling
 */
export function connectWS({ onState, url = 'http://localhost:4000', clientId, name, token }) {
  console.log(`[wsClient] connecting to ${url} as ${clientId}`)
  
  const socketOptions = {
    // Transport methods com fallback
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
    // Heartbeat
    pingInterval: 30000,
    pingTimeout: 60000,
    // Auth
    auth: {
      token: token || null
    },
    query: {
      room: 'default',
      clientId,
      name
    }
  }

  // Se token for enviado via header
  if (token) {
    socketOptions.extraHeaders = {
      'Authorization': `Bearer ${token}`
    }
  }

  socket = io(url, socketOptions)

  // ============================================
  // Connection Events
  // ============================================
  socket.on('connect', () => {
    console.log(`[wsClient] connected with id: ${socket.id}`)
    reconnectAttempts = 0
  })

  socket.on('connect_error', (error) => {
    console.error('[wsClient] connection error:', error)
  })

  socket.on('disconnect', (reason) => {
    console.log(`[wsClient] disconnected, reason: ${reason}`)
  })

  socket.on('reconnect_attempt', () => {
    reconnectAttempts++
    console.log(`[wsClient] reconnect attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS}`)
  })

  socket.on('reconnect_failed', () => {
    console.error(`[wsClient] failed to reconnect after ${MAX_RECONNECT_ATTEMPTS} attempts`)
  })

  // ============================================
  // State & Data Events
  // ============================================
  socket.on('room:state', (msg) => {
    console.log('[wsClient] room state received:', msg)
    if (msg.state && typeof onState === 'function') {
      onState(msg.state)
    }
  })

  socket.on('state', (msg) => {
    console.log('[wsClient] state received:', msg)
    if (msg.state && typeof onState === 'function') {
      onState(msg.state)
    }
  })

  // ============================================
  // User Events
  // ============================================
  socket.on('user:connected', (data) => {
    console.log('[wsClient] user connected:', data)
  })

  socket.on('user:disconnected', (data) => {
    console.log('[wsClient] user disconnected:', data)
  })

  // ============================================
  // Error Events
  // ============================================
  socket.on('error', (error) => {
    console.error('[wsClient] server error:', error)
  })

  // ============================================
  // Heartbeat
  // ============================================
  const pingInterval = setInterval(() => {
    if (socket.connected) {
      socket.emit('ping', (response) => {
        console.log('[wsClient] pong received:', response)
      })
    }
  }, 30000)

  // Cleanup on disconnect
  socket.on('disconnect', () => {
    clearInterval(pingInterval)
  })

  return {
    // Send generic message
    send: (type, data) => {
      if (socket && socket.connected) {
        console.log(`[wsClient] sending ${type}:`, data)
        socket.emit(type, data)
      } else {
        console.warn(`[wsClient] socket not connected, cannot send ${type}`)
      }
    },

    // Send action
    sendAction: (action) => {
      if (socket && socket.connected) {
        console.log('[wsClient] sending action:', action)
        socket.emit('action', action)
      } else {
        console.warn('[wsClient] socket not connected, cannot send action')
      }
    },

    // Send join
    sendJoin: ({ clientId: cId, name: n, room }) => {
      if (socket && socket.connected) {
        console.log('[wsClient] sending join:', { clientId: cId, name: n, room })
        socket.emit('join', { clientId: cId, name: n, room })
      } else {
        console.warn('[wsClient] socket not connected, cannot send join')
      }
    },

    // Manual disconnect
    close: () => {
      console.log('[wsClient] closing socket')
      if (socket) {
        clearInterval(pingInterval)
        socket.disconnect()
      }
    },

    // Get connection status
    isConnected: () => socket && socket.connected,

    // Get socket ID
    getId: () => socket?.id,

    // Listen to events
    on: (event, handler) => {
      if (socket) {
        socket.on(event, handler)
      }
    },

    // Stop listening to events
    off: (event, handler) => {
      if (socket) {
        socket.off(event, handler)
      }
    }
  }
}

export function closeWS() {
  if (socket) {
    socket.disconnect()
  }
}
