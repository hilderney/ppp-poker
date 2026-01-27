/**
 * IDatabaseAdapter - Interface para abstração de banco de dados
 * Permite trocar implementações sem afetar o código de negócio
 */

export interface IQueryResult<T> {
  data: T
  error?: Error
}

export interface IDatabaseAdapter {
  /**
   * Conecta ao banco de dados
   */
  connect(): Promise<void>

  /**
   * Desconecta do banco de dados
   */
  disconnect(): Promise<void>

  /**
   * Salva uma entidade (create ou update)
   */
  save<T>(entity: T, entityType: string): Promise<T>

  /**
   * Busca uma entidade por ID
   */
  findById<T>(id: string, entityType: string): Promise<T | null>

  /**
   * Busca múltiplas entidades
   */
  findMany<T>(entityType: string, where?: any): Promise<T[]>

  /**
   * Deleta uma entidade
   */
  delete(id: string, entityType: string): Promise<boolean>

  /**
   * Executa uma query customizada
   */
  query<T>(sql: string, params?: any[]): Promise<T[]>

  /**
   * Inicia uma transação
   */
  beginTransaction(): Promise<void>

  /**
   * Confirma uma transação
   */
  commit(): Promise<void>

  /**
   * Desfaz uma transação
   */
  rollback(): Promise<void>

  /**
   * Cria um novo usuário
   */
  createUser(userData: any): Promise<any>

  /**
   * Obtém usuário por email
   */
  getUserByEmail(email: string): Promise<any | null>

  /**
   * Obtém usuário por ID
   */
  getUserById(id: string): Promise<any | null>

  /**
   * Atualiza usuário
   */
  updateUser(id: string, userData: any): Promise<any>
}
