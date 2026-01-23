/**
 * MessageHandler - Processa mensagens WebSocket
 * Responsável por: validação e roteamento de mensagens para a lógica apropriada
 */

class MessageHandler {
  constructor(roomService, broadcastFn) {
    this.roomService = roomService
    this.broadcast = broadcastFn
  }

  /**
   * Processa uma mensagem recebida
   */
  async handle(data, roomId) {
    const { type, action, clientId } = data

    try {
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
   * Trata solicitação de entrada em uma sala
   */
  handleJoin(data, roomId) {
    const { clientId, name } = data

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
