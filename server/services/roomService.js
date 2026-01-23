/**
 * RoomService - Gerencia o estado das salas de poker
 * Responsável por: criação de salas, gerenciamento de usuários, operações de jogo
 * 
 * Usa o padrão Repository + Adapter para persistência
 */

class RoomService {
  constructor(roomRepository = null) {
    // Compatibilidade com testes legados que não usam repository
    this.rooms = new Map()
    this.roomRepository = roomRepository
  }

  /**
   * Cria o estado inicial de uma sala
   */
  static createInitialState() {
    return {
      hand: [1, 2, 3, 5, 8, 'Coringa', 'Duvida'],
      users: [{ id: 'sim', name: 'Simulado', card: null }],
      revealed: false,
      history: []
    }
  }

  /**
   * Obtém ou cria uma sala pelo ID
   */
  getRoom(roomId) {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, RoomService.createInitialState())
    }
    return this.rooms.get(roomId)
  }

  /**
   * Garante que um usuário existe na sala
   */
  ensureUserExists(roomId, userId, userName) {
    const state = this.getRoom(roomId)
    if (!state.users.find((u) => u.id === userId)) {
      state.users.push({
        id: userId,
        name: userName || 'Anonymous',
        card: null
      })
    }
  }

  /**
   * Usuário seleciona uma carta
   */
  selectCard(roomId, userId, card) {
    const state = this.getRoom(roomId)
    this.ensureUserExists(roomId, userId)
    
    const user = state.users.find((u) => u.id === userId)
    if (user) user.card = card

    // Simula seleção automática do usuário simulado
    this.simulatedUserAutoSelect(state, card)
    
    state.revealed = false
    return state
  }

  /**
   * Simula a seleção automática do usuário bot
   */
  simulatedUserAutoSelect(state, lastSelectedCard) {
    const sim = state.users.find((u) => u.id === 'sim')
    if (sim && sim.card == null) {
      const choices = state.hand.filter((c) => c !== lastSelectedCard)
      sim.card = choices[Math.floor(Math.random() * choices.length)]
    }
  }

  /**
   * Renomeia um usuário na sala
   */
  renameUser(roomId, userId, newName) {
    const state = this.getRoom(roomId)
    this.ensureUserExists(roomId, userId)
    
    const user = state.users.find((u) => u.id === userId)
    if (user) {
      user.name = newName
    }
    return state
  }

  /**
   * Revela as cartas selecionadas e registra no histórico
   */
  reveal(roomId) {
    const state = this.getRoom(roomId)
    state.revealed = true
    state.history.push({
      users: state.users.map((u) => ({
        id: u.id,
        name: u.name,
        card: u.card
      })),
      ts: Date.now()
    })
    return state
  }

  /**
   * Reseta as cartas selecionadas
   */
  reset(roomId) {
    const state = this.getRoom(roomId)
    state.users = state.users.map((u) => ({
      ...u,
      card: null
    }))
    state.revealed = false
    return state
  }
}

export default RoomService
