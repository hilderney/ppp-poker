/**
 * Testes para RoomService
 * Valida: gerenciamento de salas, usuários, seleções, reveals e resets
 */

import RoomService from '../server/services/roomService.js'

describe('RoomService', () => {
  let roomService

  beforeEach(() => {
    roomService = new RoomService()
  })

  describe('createInitialState', () => {
    test('deve criar um estado inicial válido', () => {
      const state = RoomService.createInitialState()

      expect(state).toHaveProperty('hand')
      expect(state).toHaveProperty('users')
      expect(state).toHaveProperty('revealed')
      expect(state).toHaveProperty('history')

      expect(Array.isArray(state.hand)).toBe(true)
      expect(Array.isArray(state.users)).toBe(true)
      expect(Array.isArray(state.history)).toBe(true)
      expect(state.revealed).toBe(false)
    })

    test('deve incluir usuário simulado no estado inicial', () => {
      const state = RoomService.createInitialState()
      const simUser = state.users.find((u) => u.id === 'sim')

      expect(simUser).toBeDefined()
      expect(simUser.name).toBe('Simulado')
      expect(simUser.card).toBeNull()
    })
  })

  describe('getRoom', () => {
    test('deve criar uma nova sala se não existir', () => {
      const state = roomService.getRoom('room1')

      expect(state).toBeDefined()
      expect(Array.isArray(state.users)).toBe(true)
      expect(state.users.length).toBeGreaterThan(0)
    })

    test('deve retornar a mesma sala se já existir', () => {
      const state1 = roomService.getRoom('room1')
      state1.customProp = 'test'

      const state2 = roomService.getRoom('room1')

      expect(state2.customProp).toBe('test')
    })
  })

  describe('ensureUserExists', () => {
    test('deve adicionar novo usuário se não existir', () => {
      roomService.ensureUserExists('room1', 'user1', 'User One')

      const state = roomService.getRoom('room1')
      const user = state.users.find((u) => u.id === 'user1')

      expect(user).toBeDefined()
      expect(user.name).toBe('User One')
      expect(user.card).toBeNull()
    })

    test('não deve duplicar usuário existente', () => {
      roomService.ensureUserExists('room1', 'user1', 'User One')
      roomService.ensureUserExists('room1', 'user1', 'User One Changed')

      const state = roomService.getRoom('room1')
      const users = state.users.filter((u) => u.id === 'user1')

      expect(users.length).toBe(1)
    })

    test('deve usar nome padrão se não informado', () => {
      roomService.ensureUserExists('room1', 'user1')

      const state = roomService.getRoom('room1')
      const user = state.users.find((u) => u.id === 'user1')

      expect(user.name).toBe('Anonymous')
    })
  })

  describe('selectCard', () => {
    test('deve atribuir carta ao usuário', () => {
      roomService.ensureUserExists('room1', 'user1', 'User One')

      const state = roomService.selectCard('room1', 'user1', 5)

      const user = state.users.find((u) => u.id === 'user1')
      expect(user.card).toBe(5)
    })

    test('deve resetar revealed ao selecionar carta', () => {
      const state = roomService.getRoom('room1')
      state.revealed = true

      roomService.selectCard('room1', 'user1', 5)

      expect(state.revealed).toBe(false)
    })

    test('deve fazer usuário simulado selecionar automaticamente', () => {
      roomService.selectCard('room1', 'user1', 5)

      const state = roomService.getRoom('room1')
      const simUser = state.users.find((u) => u.id === 'sim')

      expect(simUser.card).not.toBeNull()
      expect(simUser.card).not.toBe(5)
    })
  })

  describe('renameUser', () => {
    test('deve renomear usuário existente', () => {
      roomService.ensureUserExists('room1', 'user1', 'Old Name')

      roomService.renameUser('room1', 'user1', 'New Name')

      const state = roomService.getRoom('room1')
      const user = state.users.find((u) => u.id === 'user1')

      expect(user.name).toBe('New Name')
    })

    test('deve criar usuário se não existir', () => {
      roomService.renameUser('room1', 'user1', 'User One')

      const state = roomService.getRoom('room1')
      const user = state.users.find((u) => u.id === 'user1')

      expect(user).toBeDefined()
      expect(user.name).toBe('User One')
    })
  })

  describe('reveal', () => {
    test('deve marcar revealed como true', () => {
      roomService.reveal('room1')

      const state = roomService.getRoom('room1')
      expect(state.revealed).toBe(true)
    })

    test('deve registrar no histórico', () => {
      roomService.ensureUserExists('room1', 'user1', 'User One')
      roomService.selectCard('room1', 'user1', 5)

      roomService.reveal('room1')

      const state = roomService.getRoom('room1')
      expect(state.history.length).toBe(1)
      expect(state.history[0]).toHaveProperty('users')
      expect(state.history[0]).toHaveProperty('ts')
    })

    test('histórico deve conter snapshot do estado', () => {
      roomService.ensureUserExists('room1', 'user1', 'User One')
      roomService.selectCard('room1', 'user1', 5)

      roomService.reveal('room1')

      const state = roomService.getRoom('room1')
      const historyEntry = state.history[0]
      const userInHistory = historyEntry.users.find((u) => u.id === 'user1')

      expect(userInHistory).toBeDefined()
      expect(userInHistory.card).toBe(5)
    })
  })

  describe('reset', () => {
    test('deve limpar cartas de todos os usuários', () => {
      roomService.ensureUserExists('room1', 'user1', 'User One')
      roomService.selectCard('room1', 'user1', 5)

      const state = roomService.reset('room1')

      state.users.forEach((u) => {
        expect(u.card).toBeNull()
      })
    })

    test('deve marcar revealed como false', () => {
      const state = roomService.getRoom('room1')
      state.revealed = true

      roomService.reset('room1')

      expect(state.revealed).toBe(false)
    })

    test('deve manter usuários após reset', () => {
      roomService.ensureUserExists('room1', 'user1', 'User One')
      roomService.ensureUserExists('room1', 'user2', 'User Two')

      roomService.reset('room1')

      const state = roomService.getRoom('room1')
      expect(state.users.length).toBeGreaterThanOrEqual(2)
      expect(state.users.some((u) => u.id === 'user1')).toBe(true)
      expect(state.users.some((u) => u.id === 'user2')).toBe(true)
    })
  })
})
