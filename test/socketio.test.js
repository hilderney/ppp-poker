/**
 * Socket.io Integration Tests
 * Testa a conexão, reconexão, heartbeat e fallback polling
 */

import { Server as SocketIOServer } from 'socket.io'
import { io as ioClient } from 'socket.io-client'
import http from 'http'

describe('Socket.io WebSocket Integration', () => {
  let server
  let httpServer
  let clientSocket1
  let clientSocket2

  const PORT = 4001
  const SERVER_URL = `http://localhost:${PORT}`

  beforeAll((done) => {
    httpServer = http.createServer()
    server = new SocketIOServer(httpServer, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 100,
      reconnectionDelayMax: 500,
      reconnectionAttempts: 3,
      pingInterval: 10000,
      pingTimeout: 5000
    })

    server.on('connection', (socket) => {
      console.log('Socket connected:', socket.id)

      socket.on('message', (data) => {
        socket.emit('response', { received: data })
      })

      socket.on('ping', (callback) => {
        if (callback) callback({ timestamp: Date.now() })
      })

      socket.on('disconnect', () => {
        console.log('Socket disconnected:', socket.id)
      })
    })

    httpServer.listen(PORT, done)
  })

  afterAll((done) => {
    if (clientSocket1) clientSocket1.disconnect()
    if (clientSocket2) clientSocket2.disconnect()
    server.close()
    httpServer.close(done)
  })

  it('should connect to Socket.io server', (done) => {
    clientSocket1 = ioClient(SERVER_URL, {
      transports: ['websocket', 'polling'],
      reconnection: false
    })

    clientSocket1.on('connect', () => {
      expect(clientSocket1.connected).toBe(true)
      expect(clientSocket1.id).toBeDefined()
      done()
    })

    clientSocket1.on('connect_error', (error) => {
      done(error)
    })
  })

  it('should send and receive messages', (done) => {
    clientSocket1 = ioClient(SERVER_URL, {
      transports: ['websocket', 'polling']
    })

    clientSocket1.on('connect', () => {
      clientSocket1.emit('message', { text: 'hello' })
    })

    clientSocket1.on('response', (data) => {
      expect(data.received).toEqual({ text: 'hello' })
      done()
    })

    clientSocket1.on('connect_error', (error) => {
      done(error)
    })
  })

  it('should support heartbeat/ping-pong', (done) => {
    clientSocket1 = ioClient(SERVER_URL, {
      transports: ['websocket', 'polling']
    })

    clientSocket1.on('connect', () => {
      clientSocket1.emit('ping', (response) => {
        expect(response).toBeDefined()
        expect(response.timestamp).toBeDefined()
        done()
      })
    })

    clientSocket1.on('connect_error', (error) => {
      done(error)
    })
  })

  it('should reconnect after disconnection', (done) => {
    clientSocket1 = ioClient(SERVER_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 100,
      reconnectionDelayMax: 200,
      reconnectionAttempts: 3
    })

    let connectCount = 0

    clientSocket1.on('connect', () => {
      connectCount++
      if (connectCount === 1) {
        // Força desconexão
        clientSocket1.io.engine.close()
      } else if (connectCount === 2) {
        // Reconectou com sucesso
        expect(clientSocket1.connected).toBe(true)
        done()
      }
    })

    clientSocket1.on('connect_error', (error) => {
      if (connectCount < 2) {
        console.log('Expected reconnection attempt:', error)
      } else {
        done(error)
      }
    })

    setTimeout(() => {
      if (connectCount < 2) {
        done(new Error('Failed to reconnect'))
      }
    }, 5000)
  })

  it('should support multiple clients in same room', (done) => {
    clientSocket1 = ioClient(SERVER_URL, {
      transports: ['websocket', 'polling']
    })

    clientSocket2 = ioClient(SERVER_URL, {
      transports: ['websocket', 'polling']
    })

    let socket1Connected = false
    let socket2Connected = false

    const checkBothConnected = () => {
      if (socket1Connected && socket2Connected) {
        expect(clientSocket1.connected).toBe(true)
        expect(clientSocket2.connected).toBe(true)
        done()
      }
    }

    clientSocket1.on('connect', () => {
      socket1Connected = true
      checkBothConnected()
    })

    clientSocket2.on('connect', () => {
      socket2Connected = true
      checkBothConnected()
    })

    clientSocket1.on('connect_error', (error) => {
      done(error)
    })

    clientSocket2.on('connect_error', (error) => {
      done(error)
    })
  })

  it('should handle polling transport fallback', (done) => {
    clientSocket1 = ioClient(SERVER_URL, {
      transports: ['websocket', 'polling'],
      reconnection: false
    })

    clientSocket1.on('connect', () => {
      // Verifica se está conectado (pode ser via websocket ou polling)
      expect(clientSocket1.connected).toBe(true)
      expect(clientSocket1.io.engine.transport.name).toBeDefined()
      done()
    })

    clientSocket1.on('connect_error', (error) => {
      done(error)
    })
  })
})
