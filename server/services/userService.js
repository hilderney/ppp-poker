/**
 * User Service
 * 
 * Gerencia lógica de negócio de usuários
 */

import { hashPassword, verifyPassword } from './authService.js'

export class UserService {
  constructor(database) {
    this.db = database
  }

  /**
   * Registra um novo usuário
   */
  async register(username, email, password) {
    if (!username || !email || !password) {
      throw new Error('Username, email e password são obrigatórios')
    }

    // Verifica se usuário já existe
    const existingUser = await this.db.getUserByEmail(email)
    if (existingUser) {
      throw new Error('Email já está registrado')
    }

    // Hash da senha
    const hashedPassword = await hashPassword(password)

    // Cria usuário
    const user = await this.db.createUser({
      username,
      email,
      passwordHash: hashedPassword
    })

    return {
      id: user.id,
      username: user.username,
      email: user.email
    }
  }

  /**
   * Faz login de um usuário
   */
  async login(email, password) {
    if (!email || !password) {
      throw new Error('Email e password são obrigatórios')
    }

    const user = await this.db.getUserByEmail(email)
    if (!user) {
      throw new Error('Email ou senha inválidos')
    }

    const isPasswordValid = await verifyPassword(password, user.passwordHash)
    if (!isPasswordValid) {
      throw new Error('Email ou senha inválidos')
    }

    return {
      id: user.id,
      username: user.username,
      email: user.email
    }
  }

  /**
   * Obtém usuário por ID
   */
  async getUserById(userId) {
    const user = await this.db.getUserById(userId)
    if (!user) {
      return null
    }

    return {
      id: user.id,
      username: user.username,
      email: user.email
    }
  }

  /**
   * Obtém usuário por email
   */
  async getUserByEmail(email) {
    const user = await this.db.getUserByEmail(email)
    if (!user) {
      return null
    }

    return {
      id: user.id,
      username: user.username,
      email: user.email
    }
  }

  /**
   * Lista todos os usuários
   */
  async getAllUsers() {
    const users = await this.db.getAllUsers()
    if (!users) {
      return []
    }

    return users.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email
    }))
  }
}
