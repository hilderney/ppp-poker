/**
 * IDatabaseAdapter - Interface para abstração de banco de dados
 * Permite trocar implementações sem afetar o código de negócio
 * 
 * Nota: Usando comentários JSDoc para documentar a interface
 * já que JavaScript não tem tipos nativos.
 */

/**
 * @typedef {Object} IQueryResult
 * @property {any} data
 * @property {Error} [error]
 */

/**
 * @interface IDatabaseAdapter
 * Interface para abstrair operações de banco de dados
 */
export class IDatabaseAdapter {
  /**
   * Conecta ao banco de dados
   * @returns {Promise<void>}
   */
  async connect() {
    throw new Error('Not implemented')
  }

  /**
   * Desconecta do banco de dados
   * @returns {Promise<void>}
   */
  async disconnect() {
    throw new Error('Not implemented')
  }

  /**
   * Salva uma entidade (create ou update)
   * @template T
   * @param {T} entity
   * @param {string} entityType
   * @returns {Promise<T>}
   */
  async save(entity, entityType) {
    throw new Error('Not implemented')
  }

  /**
   * Busca uma entidade por ID
   * @template T
   * @param {string} id
   * @param {string} entityType
   * @returns {Promise<T|null>}
   */
  async findById(id, entityType) {
    throw new Error('Not implemented')
  }

  /**
   * Busca múltiplas entidades
   * @template T
   * @param {string} entityType
   * @param {any} [where]
   * @returns {Promise<T[]>}
   */
  async findMany(entityType, where) {
    throw new Error('Not implemented')
  }

  /**
   * Deleta uma entidade
   * @param {string} id
   * @param {string} entityType
   * @returns {Promise<boolean>}
   */
  async delete(id, entityType) {
    throw new Error('Not implemented')
  }

  /**
   * Executa uma query customizada
   * @template T
   * @param {string} sql
   * @param {any[]} [params]
   * @returns {Promise<T[]>}
   */
  async query(sql, params) {
    throw new Error('Not implemented')
  }

  /**
   * Inicia uma transação
   * @returns {Promise<void>}
   */
  async beginTransaction() {
    throw new Error('Not implemented')
  }

  /**
   * Commit da transação
   * @returns {Promise<void>}
   */
  async commit() {
    throw new Error('Not implemented')
  }

  /**
   * Rollback da transação
   * @returns {Promise<void>}
   */
  async rollback() {
    throw new Error('Not implemented')
  }

  /**
   * Cria um novo usuário
   * @param {any} userData
   * @returns {Promise<any>}
   */
  async createUser(userData) {
    throw new Error('Not implemented')
  }

  /**
   * Obtém usuário por email
   * @param {string} email
   * @returns {Promise<any|null>}
   */
  async getUserByEmail(email) {
    throw new Error('Not implemented')
  }

  /**
   * Obtém usuário por ID
   * @param {string} id
   * @returns {Promise<any|null>}
   */
  async getUserById(id) {
    throw new Error('Not implemented')
  }

  /**
   * Atualiza usuário
   * @param {string} id
   * @param {any} userData
   * @returns {Promise<any>}
   */
  async updateUser(id, userData) {
    throw new Error('Not implemented')
  }
}
