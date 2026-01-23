/**
 * RoomRepository - Padrão Repository para Rooms
 * Abstrai o acesso aos dados usando o DatabaseAdapter
 */

import type { IDatabaseAdapter } from '../adapters/database/IDatabaseAdapter.js'

export interface Room {
  id?: string
  name: string
  status: 'waiting' | 'voting' | 'revealed' | 'finished'
  revealed: boolean
  createdAt?: Date
  updatedAt?: Date
}

export class RoomRepository {
  constructor(private adapter: IDatabaseAdapter) {}

  /**
   * Cria uma nova sala
   */
  async create(room: Omit<Room, 'id' | 'createdAt' | 'updatedAt'>): Promise<Room> {
    const newRoom: Room = {
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
  async findById(id: string): Promise<Room | null> {
    return await this.adapter.findById(id, 'room')
  }

  /**
   * Busca todas as salas
   */
  async findAll(): Promise<Room[]> {
    return await this.adapter.findMany('room')
  }

  /**
   * Atualiza uma sala
   */
  async update(id: string, data: Partial<Room>): Promise<Room> {
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
  async delete(id: string): Promise<boolean> {
    return await this.adapter.delete(id, 'room')
  }

  /**
   * Marca sala como revelada
   */
  async reveal(id: string): Promise<Room> {
    return await this.update(id, {
      revealed: true,
      status: 'revealed',
    })
  }

  /**
   * Reseta sala para votação
   */
  async reset(id: string): Promise<Room> {
    return await this.update(id, {
      revealed: false,
      status: 'voting',
    })
  }
}
