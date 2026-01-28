/**
 * Authentication Routes
 * 
 * POST /auth/register - Registra novo usuário
 * POST /auth/login - Faz login
 * POST /auth/refresh - Renova access token
 */

import express from 'express'
import { createTokenPair, createAccessToken } from '../services/authService.js'
import { verifyRefreshToken } from '../services/authService.js'
import { authMiddleware } from '../middleware/authMiddleware.js'

export function createAuthRoutes(userService) {
  const router = express.Router()

  /**
   * @swagger
   * /api/auth/register:
   *   post:
   *     summary: Registra um novo usuário
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               username:
   *                 type: string
   *                 example: "john_doe"
   *               email:
   *                 type: string
   *                 example: "john@example.com"
   *               password:
   *                 type: string
   *                 example: "SecurePass123!"
   *               name:
   *                 type: string
   *                 example: "John Doe"
   *             required: [username, email, password]
   *     responses:
   *       201:
   *         description: Usuário registrado com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/AuthResponse'
   *       400:
   *         description: Erro na validação ou registro
   */
  router.post('/register', async (req, res) => {
    try {
      const { username, email, password, name } = req.body

      // Validação básica
      if (!username || !email || !password) {
        return res.status(400).json({
          error: 'Username, email e password são obrigatórios'
        })
      }

      // Registra usuário
      const user = await userService.register(username, email, password)

      // Cria tokens
      const tokens = createTokenPair({
        id: user.id,
        username: user.username,
        email: user.email
      })

      res.status(201).json({
        user,
        ...tokens
      })
    } catch (error) {
      console.error('Register error:', error.message)
      res.status(400).json({ error: error.message })
    }
  })

  /**
   * @swagger
   * /api/auth/login:
   *   post:
   *     summary: Faz login de um usuário
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               email:
   *                 type: string
   *                 example: "john@example.com"
   *               password:
   *                 type: string
   *                 example: "SecurePass123!"
   *             required: [email, password]
   *     responses:
   *       200:
   *         description: Login realizado com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/AuthResponse'
   *       400:
   *         description: Credenciais inválidas
   */
  router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body

      // Validação
      if (!email || !password) {
        return res.status(400).json({
          error: 'Email e password são obrigatórios'
        })
      }

      // Faz login
      const user = await userService.login(email, password)

      // Cria tokens
      const tokens = createTokenPair({
        id: user.id,
        username: user.username,
        email: user.email
      })

      res.status(200).json({
        user,
        ...tokens
      })
    } catch (error) {
      console.error('Login error:', error.message)
      res.status(401).json({ error: error.message })
    }
  })

  /**
   * POST /auth/refresh
   * Renova o access token usando refresh token
   */
  router.post('/refresh', async (req, res) => {
    try {
      const { refreshToken } = req.body

      if (!refreshToken) {
        return res.status(400).json({ error: 'Refresh token obrigatório' })
      }

      // Verifica refresh token
      const payload = verifyRefreshToken(refreshToken)
      if (!payload) {
        return res.status(401).json({ error: 'Refresh token inválido ou expirado' })
      }

      // Cria novo access token
      const accessToken = createAccessToken({
        id: payload.id,
        username: payload.username,
        email: payload.email
      })

      res.status(200).json({
        accessToken,
        expiresIn: '15m'
      })
    } catch (error) {
      console.error('Refresh error:', error.message)
      res.status(401).json({ error: error.message })
    }
  })

  /**
   * GET /auth/me
   * Obtém dados do usuário autenticado
   */
  router.get('/me', authMiddleware, async (req, res) => {
    try {
      const user = await userService.getUserById(req.user.id)

      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' })
      }

      res.status(200).json({ user })
    } catch (error) {
      console.error('Get user error:', error.message)
      res.status(500).json({ error: error.message })
    }
  })

  /**
   * @swagger
   * /api/auth/users:
   *   get:
   *     summary: Lista todos os usuários
   *     tags: [Users]
   *     responses:
   *       200:
   *         description: Lista de usuários obtida com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 users:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/User'
   *       500:
   *         description: Erro ao listar usuários
   */
  router.get('/users', async (req, res) => {
    try {
      const users = await userService.getAllUsers()
      res.status(200).json({ users })
    } catch (error) {
      console.error('Get all users error:', error.message)
      res.status(500).json({ error: error.message })
    }
  })

  return router
}
