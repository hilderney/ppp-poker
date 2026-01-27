/**
 * Authentication Routes Tests
 */

import express from 'express'
import { createAuthRoutes } from '../server/routes/authRoutes.js'
import { MockAdapter } from '../server/infrastructure/adapters/database/MockAdapter.js'
import { UserService } from '../server/services/userService.js'

describe('Auth Routes', () => {
  let app
  let userService

  beforeEach(() => {
    // Cria aplicação Express de teste
    app = express()
    app.use(express.json())

    // Cria adapter e user service mock
    const adapter = new MockAdapter()
    userService = new UserService(adapter)

    // Monta rotas de autenticação
    app.use('/auth', createAuthRoutes(userService))
  })

  describe('POST /auth/register', () => {
    test('should register a new user', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123'
        })

      expect(res.status).toBe(201)
      expect(res.body).toHaveProperty('user')
      expect(res.body).toHaveProperty('accessToken')
      expect(res.body).toHaveProperty('refreshToken')
      expect(res.body.user.email).toBe('test@example.com')
    })

    test('should reject missing fields', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({
          username: 'testuser'
        })

      expect(res.status).toBe(400)
      expect(res.body).toHaveProperty('error')
    })

    test('should reject duplicate email', async () => {
      // Primeiro registro
      await request(app)
        .post('/auth/register')
        .send({
          username: 'user1',
          email: 'test@example.com',
          password: 'password123'
        })

      // Tentativa de registrar com mesmo email
      const res = await request(app)
        .post('/auth/register')
        .send({
          username: 'user2',
          email: 'test@example.com',
          password: 'password456'
        })

      expect(res.status).toBe(400)
      expect(res.body.error).toContain('já está registrado')
    })
  })

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      // Registra um usuário antes dos testes de login
      await request(app)
        .post('/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123'
        })
    })

    test('should login with correct credentials', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        })

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('user')
      expect(res.body).toHaveProperty('accessToken')
      expect(res.body).toHaveProperty('refreshToken')
      expect(res.body.user.email).toBe('test@example.com')
    })

    test('should reject wrong password', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        })

      expect(res.status).toBe(401)
      expect(res.body).toHaveProperty('error')
    })

    test('should reject non-existent email', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        })

      expect(res.status).toBe(401)
      expect(res.body).toHaveProperty('error')
    })

    test('should reject missing credentials', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com'
        })

      expect(res.status).toBe(400)
      expect(res.body).toHaveProperty('error')
    })
  })

  describe('POST /auth/refresh', () => {
    let refreshToken

    beforeEach(async () => {
      // Registra e faz login para obter refresh token
      const registerRes = await request(app)
        .post('/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123'
        })

      refreshToken = registerRes.body.refreshToken
    })

    test('should refresh access token', async () => {
      const res = await request(app)
        .post('/auth/refresh')
        .send({ refreshToken })

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('accessToken')
      expect(res.body).toHaveProperty('expiresIn')
    })

    test('should reject invalid refresh token', async () => {
      const res = await request(app)
        .post('/auth/refresh')
        .send({ refreshToken: 'invalid.token' })

      expect(res.status).toBe(401)
      expect(res.body).toHaveProperty('error')
    })

    test('should reject missing refresh token', async () => {
      const res = await request(app)
        .post('/auth/refresh')
        .send({})

      expect(res.status).toBe(400)
      expect(res.body).toHaveProperty('error')
    })
  })
})
