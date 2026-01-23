/**
 * PPP Poker WebSocket Server
 * 
 * Gerencia múltiplas salas de poker com múltiplos usuários em tempo real
 * Comunicação via WebSocket para sincronização instantânea
 */

import express from 'express'
import http from 'http'
import { WebSocketServer } from 'ws'
import RoomService from './services/roomService.js'
import MessageHandler from './handlers/messageHandler.js'

const OPEN = 1  // WebSocket.OPEN constant

try {
  console.log('server/index.js: launching')

  // ============================================
  // Configuração
  // ============================================
  const PORT = process.env.PORT || 4000
  const app = express()
  const server = http.createServer(app)
  const wss = new WebSocketServer({ server })

  const roomService = new RoomService()
  
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
    ws.room = extractRoomFromUrl(req.url)

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
} catch (err) {
  console.error('Server startup error:', err)
  if (err && err.stack) console.error(err.stack)
  process.exit(1)
}
