/**
 * PPP Poker WebSocket Server
 * 
 * Gerencia múltiplas salas de poker com múltiplos usuários em tempo real
 * Comunicação via WebSocket para sincronização instantânea
 */

import express from 'express'
import http from 'http'
import { Server as SocketIOServer } from 'socket.io'
import swaggerUi from 'swagger-ui-express'
import { swaggerSpec } from './swagger.js'
import { createRoomService } from './services/roomServiceFactory.js'
import { UserService } from './services/userService.js'
import { createAuthRoutes } from './routes/authRoutes.js'
import { verifyAccessToken, extractToken } from './services/authService.js'
import MessageHandler from './handlers/messageHandler.js'

/**
 * Inicializa o servidor com as dependências apropriadas
 */
async function initializeServer() {
  try {
    console.log('server/index.js: launching')

    // ============================================
    // Configuração
    // ============================================
    const PORT = process.env.PORT || 4000
    const adapterType = process.env.DATABASE_ADAPTER || 'mock'
    
    console.log(`Initializing RoomService with adapter: ${adapterType}`)
    const roomService = await createRoomService(adapterType)
    
    // Inicializa User Service
    const userService = new UserService(roomService.roomRepository.adapter)
    
    const app = express()
    const server = http.createServer(app)
    const io = new SocketIOServer(server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      pingInterval: 30000,
      pingTimeout: 60000
    })

    // ============================================
    // Middleware Express
    // ============================================
    app.use(express.json())
    app.use(express.urlencoded({ extended: true }))

    // CORS headers
    app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*')
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      if (req.method === 'OPTIONS') {
        return res.sendStatus(200)
      }
      next()
    })

    // ============================================
    // Swagger Documentation
    // ============================================
    app.use('/api-docs', swaggerUi.serve)
    app.get('/api-docs', swaggerUi.setup(swaggerSpec))

    // ============================================
    // Routes
    // ============================================
    app.use('/api/auth', createAuthRoutes(userService))

    // Health check
    app.get('/health', (req, res) => {
      res.status(200).json({ status: 'ok' })
    })

    // ============================================
    // Handlers de Erro
    // ============================================
    server.on('error', (err) => {
      console.error('HTTP server error:', err)
    })

    process.on('uncaughtException', (err) => {
      console.error('Uncaught exception in server:', err)
    })

    process.on('unhandledRejection', (reason) => {
      console.error('Unhandled rejection in server:', reason)
    })

    // ============================================
    // Utilitários
    // ============================================

    /**
     * Envia o estado atual da sala para todos os clientes conectados
     */
    function broadcastRoomState(roomId) {
      const state = roomService.getRoom(roomId)
      const msg = { type: 'state', state }
      
      // Socket.io emit para todos os clientes em um namespace/room específico
      io.to(`room:${roomId}`).emit('room:state', msg)
      
      const connectedClients = io.sockets.adapter.rooms.get(`room:${roomId}`)?.size || 0
      console.log(
        `[${new Date().toISOString()}] Broadcasting state to ${connectedClients} clients in room=${roomId}`
      )
    }

    /**
     * Extrai token da query params do socket
     */
    function extractTokenFromSocket(socket) {
      const token = socket.handshake.headers.authorization || 
                   socket.handshake.auth?.token ||
                   socket.handshake.query?.token
      return extractToken(token)
    }

    // ============================================
    // Socket.io Connection Handler
    // ============================================
    io.on('connection', (socket) => {
      // Extrai token do handshake
      const token = extractTokenFromSocket(socket)
      
      // Valida token
      let user = null
      if (token) {
        user = verifyAccessToken(token)
        if (!user) {
          console.warn('Invalid token provided, disconnecting socket:', socket.id)
          socket.disconnect(true)
          return
        }
      } else {
        console.warn('No token provided, allowing anonymous connection (deprecated)')
      }

      // Obtém room da query ou usa 'default'
      const roomId = socket.handshake.query.room || 'default'
      
      socket.join(`room:${roomId}`)
      socket.data.room = roomId
      socket.data.user = user

      const messageHandler = new MessageHandler(roomService, broadcastRoomState)

      console.log(
        `[${new Date().toISOString()}] Client connected. id=${socket.id} room=${roomId} user=${user?.email || 'anonymous'}`
      )

      // Emite evento de usuário conectado
      io.to(`room:${roomId}`).emit('user:connected', {
        userId: user?.id,
        email: user?.email,
        socketId: socket.id
      })

      socket.on('message', async (data) => {
        console.log(`[${new Date().toISOString()}] Received message:`, data)

        if (!data || typeof data !== 'object') {
          console.warn('Invalid message format, ignoring')
          return
        }

        const room = data.room || roomId

        try {
          await messageHandler.handle(data, room)
        } catch (err) {
          console.error(`Error handling message:`, err)
          socket.emit('error', { message: 'Error processing message', error: err.message })
        }
      })

      socket.on('action', async (data) => {
        console.log(`[${new Date().toISOString()}] Received action:`, data)
        try {
          await messageHandler.handle({ type: 'action', ...data }, roomId)
        } catch (err) {
          console.error(`Error handling action:`, err)
          socket.emit('error', { message: 'Error processing action', error: err.message })
        }
      })

      socket.on('join', async (data) => {
        console.log(`[${new Date().toISOString()}] Received join:`, data)
        try {
          await messageHandler.handle({ type: 'join', ...data }, roomId)
        } catch (err) {
          console.error(`Error handling join:`, err)
          socket.emit('error', { message: 'Error joining room', error: err.message })
        }
      })

      socket.on('disconnect', (reason) => {
        console.log(
          `[${new Date().toISOString()}] Client disconnected. id=${socket.id} room=${roomId} reason=${reason}`
        )
        
        // Emite evento de usuário desconectado
        io.to(`room:${roomId}`).emit('user:disconnected', {
          socketId: socket.id,
          userId: user?.id
        })
      })

      socket.on('error', (err) => {
        console.error(`[${new Date().toISOString()}] Socket error:`, err)
      })

      // Health check ping
      socket.on('ping', (callback) => {
        console.log(`[${new Date().toISOString()}] Received ping from ${socket.id}`)
        if (typeof callback === 'function') {
          callback({ timestamp: Date.now() })
        }
      })
    })

    // ============================================
    // HTTP Routes
    // ============================================
    app.get('/', (req, res) => {
      res.send('PPP Poker WebSocket server')
    })

    // ============================================
    // Server Startup
    // ============================================
    console.log('about to listen on port', PORT)
    
    server.on('listening', () => {
      console.log(`Server listening on http://localhost:${PORT}`)
    })

    server.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`)
    })

    // Cleanup on shutdown
    process.on('SIGINT', async () => {
      console.log('\nShutting down server gracefully...')
      io.close()
      console.log('Socket.io server closed')
      server.close(async () => {
        console.log('HTTP server closed')
        if (roomService?.roomRepository?.adapter) {
          await roomService.roomRepository.adapter.disconnect()
        }
        process.exit(0)
      })
    })
  } catch (err) {
    console.error('Server initialization error:', err)
    if (err && err.stack) console.error(err.stack)
    process.exit(1)
  }
}

/**
 * Inicia o servidor
 */
try {
  initializeServer()
} catch (err) {
  console.error('Server startup error:', err)
  if (err && err.stack) console.error(err.stack)
  process.exit(1)
}
