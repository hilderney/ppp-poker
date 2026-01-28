/**
 * PPP Poker WebSocket Server
 * 
 * Gerencia múltiplas salas de poker com múltiplos usuários em tempo real
 * Comunicação via WebSocket para sincronização instantânea
 */

import express from 'express'
import http from 'http'
import { WebSocketServer } from 'ws'
import swaggerUi from 'swagger-ui-express'
import { swaggerSpec } from './swagger.js'
import { createRoomService } from './services/roomServiceFactory.js'
import { UserService } from './services/userService.js'
import { createAuthRoutes } from './routes/authRoutes.js'
import { verifyAccessToken, extractToken } from './services/authService.js'
import MessageHandler from './handlers/messageHandler.js'

const OPEN = 1  // WebSocket.OPEN constant

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
    const wss = new WebSocketServer({ server })

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
      const msg = JSON.stringify({ type: 'state', state })
      
      const clients = Array.from(wss.clients || []).filter(
        (c) => c && c.readyState === OPEN && c.room === roomId
      )
      
      console.log(
        `[${new Date().toISOString()}] Broadcasting state to ${clients.length} clients in room=${roomId}`
      )
      
      clients.forEach((c) => {
        try {
          c.send(msg)
        } catch (err) {
          console.error('Error sending to client:', err)
        }
      })
    }

    /**
     * Extrai o ID da sala do request URL
     */
    function extractRoomFromUrl(reqUrl) {
      try {
        const url = new URL(reqUrl, `http://localhost`)
        return url.searchParams.get('room') || 'default'
      } catch (err) {
        return 'default'
      }
    }

    // ============================================
    // WebSocket Connection Handler
    // ============================================
    wss.on('connection', (ws, req) => {
      // Extrai token do header
      const token = extractToken(req.headers.authorization)
      
      // Valida token (opcional para compatibilidade com clientes antigos)
      let user = null
      if (token) {
        user = verifyAccessToken(token)
        if (!user) {
          console.warn('Invalid token provided, closing connection')
          ws.close(4001, 'Invalid token')
          return
        }
      } else {
        console.warn('No token provided, allowing anonymous connection (deprecated)')
      }

      ws.room = extractRoomFromUrl(req.url)
      ws.user = user // Armazena dados do usuário autenticado

      const messageHandler = new MessageHandler(roomService, broadcastRoomState)

      ws.on('message', async (msg) => {
        console.log(`[${new Date().toISOString()}] Received raw WS message:`, msg.toString())

        let data
        try {
          data = JSON.parse(msg)
        } catch (err) {
          console.warn('Malformed WS message, ignoring')
          return
        }

        console.log(`[${new Date().toISOString()}] Parsed WS message:`, data)

        const roomId = data.room || ws.room || 'default'

        try {
          await messageHandler.handle(data, roomId)
        } catch (err) {
          console.error(`Error handling message:`, err)
        }
      })

      ws.on('close', (code, reason) => {
        console.log(
          `[${new Date().toISOString()}] WS connection closed. code=${code} reason=${reason} room=${ws.room}`
        )
      })

      ws.on('error', (err) => {
        console.error(`[${new Date().toISOString()}] WS connection error:`, err)
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
      wss.close(() => {
        console.log('WebSocket server closed')
      })
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
