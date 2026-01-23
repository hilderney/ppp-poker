/**
 * Testes para MessageHandler
 * Valida: processamento de mensagens, roteamento de ações, lógica de eventos
 */

import MessageHandler from '../server/handlers/messageHandler.js'
import RoomService from '../server/services/roomService.js'

describe('MessageHandler', () => {
  let messageHandler, roomService, broadcastMock

  beforeEach(() => {
    roomService = new RoomService()
    broadcastMock = jest.fn()
    messageHandler = new MessageHandler(roomService, broadcastMock)
  })

  describe('handle', () => {
    test('deve rotear mensagem de tipo join', async () => {
      const data = {
        type: 'join',
        clientId: 'user1',
        name: 'User One'
      }

      const result = await messageHandler.handle(data, 'room1')

      expect(result.type).toBe('join-success')
      expect(result.state).toBeDefined()
      expect(broadcastMock).toHaveBeenCalledWith('room1')
    })

    test('deve rotear mensagem de tipo action', async () => {
      const data = {
        type: 'action',
        action: 'select',
        clientId: 'user1',
        card: 5
      }

      const result = await messageHandler.handle(data, 'room1')

      expect(result.type).toBe('action-success')
      expect(result.action).toBe('select')
      expect(result.state).toBeDefined()
      expect(broadcastMock).toHaveBeenCalledWith('room1')
    })

    test('deve ignorar tipos de mensagem desconhecidos', async () => {
      const data = {
        type: 'unknown',
        clientId: 'user1'
      }

      const result = await messageHandler.handle(data, 'room1')

      expect(result).toBeNull()
    })
  })

  describe('handleJoin', () => {
    test('deve adicionar usuário e retornar estado', () => {
      const data = {
        clientId: 'user1',
        name: 'User One'
      }

      const result = messageHandler.handleJoin(data, 'room1')

      expect(result.type).toBe('join-success')
      expect(result.state.users.some((u) => u.id === 'user1')).toBe(true)
      expect(broadcastMock).toHaveBeenCalledWith('room1')
    })

    test('deve usar nome padrão se não informado', () => {
      const data = {
        clientId: 'user1',
        name: undefined
      }

      const result = messageHandler.handleJoin(data, 'room1')

      expect(result.state.users.some((u) => u.id === 'user1' && u.name === 'Anonymous')).toBe(true)
    })
  })

  describe('handleAction - select', () => {
    test('deve processar ação select e atualizar estado', () => {
      const data = {
        action: 'select',
        clientId: 'user1',
        card: 5
      }

      const result = messageHandler.handleAction(data, 'room1')

      expect(result.type).toBe('action-success')
      expect(result.action).toBe('select')
      expect(result.state.users.find((u) => u.id === 'user1').card).toBe(5)
      expect(broadcastMock).toHaveBeenCalledWith('room1')
    })
  })

  describe('handleAction - rename', () => {
    test('deve processar ação rename', () => {
      roomService.ensureUserExists('room1', 'user1', 'Old Name')

      const data = {
        action: 'rename',
        clientId: 'user1',
        name: 'New Name'
      }

      const result = messageHandler.handleAction(data, 'room1')

      expect(result.type).toBe('action-success')
      expect(result.state.users.find((u) => u.id === 'user1').name).toBe('New Name')
    })
  })

  describe('handleAction - reveal', () => {
    test('deve processar ação reveal', () => {
      const data = { action: 'reveal' }

      const result = messageHandler.handleAction(data, 'room1')

      expect(result.type).toBe('action-success')
      expect(result.state.revealed).toBe(true)
      expect(result.state.history.length).toBe(1)
    })
  })

  describe('handleAction - reset', () => {
    test('deve processar ação reset', () => {
      roomService.ensureUserExists('room1', 'user1', 'User One')
      roomService.selectCard('room1', 'user1', 5)

      const data = { action: 'reset' }

      const result = messageHandler.handleAction(data, 'room1')

      expect(result.type).toBe('action-success')
      expect(result.state.users.find((u) => u.id === 'user1').card).toBeNull()
    })
  })

  describe('handleAction - ação desconhecida', () => {
    test('deve ignorar ações desconhecidas', () => {
      const data = {
        action: 'unknown',
        clientId: 'user1'
      }

      const result = messageHandler.handleAction(data, 'room1')

      expect(result).toBeNull()
      expect(broadcastMock).not.toHaveBeenCalled()
    })
  })
})
