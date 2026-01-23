/**
 * Factory para RoomService
 * Facilita injeção de dependência e testes
 */

import RoomService from './roomService.js'
import { RoomRepository } from '../infrastructure/repositories/RoomRepository.js'
import { createDatabaseAdapter } from '../infrastructure/adapters/database/index.js'

/**
 * Cria RoomService com injeção de repositório
 * @param {string} adapterType - 'mock' para testes, 'postgres' para produção
 * @returns {RoomService}
 */
export async function createRoomService(adapterType = 'postgres') {
  const adapter = createDatabaseAdapter(adapterType)

  if (adapterType === 'postgres') {
    await adapter.connect()
  }

  const repository = new RoomRepository(adapter)
  return new RoomService(repository)
}

/**
 * Cria RoomService com MockAdapter para testes
 * @returns {RoomService}
 */
export function createRoomServiceForTests() {
  return createRoomService('mock')
}

export default {
  createRoomService,
  createRoomServiceForTests,
}
