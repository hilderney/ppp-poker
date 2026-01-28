/**
 * MessageHandler - Processa mensagens WebSocket
 * Responsável por: validação e roteamento de mensagens para a lógica apropriada
 */

import { validateData, WSJoinSchema, WSActionSchema, WSMessageSchema } from '../validators/schemas.js'

class MessageHandler {
  constructor(roomService, broadcastFn) {
    this.roomService = roomService
    this.broadcast = broadcastFn
  }

  /**
   * Processa uma mensagem recebida com validação
   */
  async handle(data, roomId) {
    const { type } = data

    try {
      // Validação básica
      const validation = validateData(WSMessageSchema, data)
      if (!validation.valid) {
        console.warn('Invalid message format:', validation.errors)
        throw new Error('Invalid message format')
      }

      if (type === 'join') {
        return this.handleJoin(data, roomId)
      }

      if (type === 'action') {
        return this.handleAction(data, roomId)
      }

      console.warn(`Unknown message type: ${type}`)
      return null
    } catch (err) {
      console.error(`Error handling message (type=${type}):`, err)
      throw err
    }
  }

  /**
   * Trata solicitação de entrada em uma sala com validação
   */
  handleJoin(data, roomId) {
    // Validar contra schema de join
    const validation = validateData(WSJoinSchema, data)
    if (!validation.valid) {
      throw new Error(`Invalid join message: ${validation.errors.map(e => e.message).join(', ')}`)
    }

    const { clientId, name } = validation.data

    this.roomService.ensureUserExists(roomId, clientId, name)
    const state = this.roomService.getRoom(roomId)

    console.log(
      `[${new Date().toISOString()}] join from ${clientId} (${name}) in room=${roomId}`
    )

    // Retorna o estado inicial para este cliente
    this.broadcast(roomId)
    
    return {
      type: 'join-success',
      state
    }
  }

  /**
   * Trata ações de jogo (select, rename, reveal, reset)
   */
  handleAction(data, roomId) {
    const { action, clientId } = data

    console.log(
      `[${new Date().toISOString()}] action=${action} from ${clientId || 'unknown'} in room=${roomId}`
    )

    let state

    switch (action) {
      case 'select':
        state = this.handleSelect(data, roomId)
        break
      case 'rename':
        state = this.handleRename(data, roomId)
        break
      case 'reveal':
        state = this.handleReveal(roomId)
        break
      case 'reset':
        state = this.handleReset(roomId)
        break
      default:
        console.warn(`Unknown action: ${action}`)
        return null
    }

    this.broadcast(roomId)
    
    return {
      type: 'action-success',
      action,
      state
    }
  }

  /**
   * Trata seleção de carta
   */
  handleSelect(data, roomId) {
    const { clientId, card } = data
    return this.roomService.selectCard(roomId, clientId, card)
  }

  /**
   * Trata renomeação de usuário
   */
  handleRename(data, roomId) {
    const { clientId, name } = data
    return this.roomService.renameUser(roomId, clientId, name)
  }

  /**
   * Trata revelação de cartas
   */
  handleReveal(roomId) {
    console.log(`[${new Date().toISOString()}] Reveal triggered in room=${roomId}`)
    return this.roomService.reveal(roomId)
  }

  /**
   * Trata reset de cartas
   */
  handleReset(roomId) {
    console.log(`[${new Date().toISOString()}] Reset triggered in room=${roomId}`)
    return this.roomService.reset(roomId)
  }
}

export default MessageHandler
