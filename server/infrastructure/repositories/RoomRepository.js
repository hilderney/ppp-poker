/**
 * RoomRepository - Padrão Repository para Rooms
 * Abstrai o acesso aos dados usando o DatabaseAdapter
 */

export class RoomRepository {
  constructor(adapter) {
    this.adapter = adapter
  }

  /**
   * Cria uma nova sala
   */
  async create(room) {
    const newRoom = {
      ...room,
      id: `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    return await this.adapter.save(newRoom, 'room')
  }

  /**
   * Busca sala por ID
   */
  async findById(id) {
    return await this.adapter.findById(id, 'room')
  }

  /**
   * Busca todas as salas
   */
  async findAll() {
    return await this.adapter.findMany('room')
  }

  /**
   * Atualiza uma sala
   */
  async update(id, data) {
    const room = await this.findById(id)
    if (!room) {
      throw new Error(`Room ${id} not found`)
    }

    const updated = {
      ...room,
      ...data,
      updatedAt: new Date(),
    }

    return await this.adapter.save(updated, 'room')
  }

  /**
   * Deleta uma sala
   */
  async delete(id) {
    return await this.adapter.delete(id, 'room')
  }

  /**
   * Marca sala como revelada
   */
  async reveal(id) {
    return await this.update(id, {
      revealed: true,
      status: 'revealed',
    })
  }

  /**
   * Reseta sala para votação
   */
  async reset(id) {
    return await this.update(id, {
      revealed: false,
      status: 'voting',
    })
  }
}
