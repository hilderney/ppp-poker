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
import { validateBody } from '../middleware/validationMiddleware.js'
import { RegisterSchema, LoginSchema, RefreshTokenSchema } from '../validators/schemas.js'

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
  router.post('/register', validateBody(RegisterSchema), async (req, res) => {
    try {
      const { username, email, password } = req.body

      // Registra usuário
      const user = await userService.register(username, email, password)

      // Cria tokens
      const tokens = createTokenPair({
        id: user.id,
        username: user.username,
        email: user.email
      })

      res.status(201).json({
        success: true,
        user,
        ...tokens
      })
    } catch (error) {
      console.error('Register error:', error.message)
      res.status(400).json({ 
        error: 'Registration failed',
        message: error.message,
        timestamp: new Date()
      })
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
  router.post('/login', validateBody(LoginSchema), async (req, res) => {
    try {
      const { email, password } = req.body

      // Faz login
      const user = await userService.login(email, password)

      // Cria tokens
      const tokens = createTokenPair({
        id: user.id,
        username: user.username,
        email: user.email
      })

      res.status(200).json({
        success: true,
        user,
        ...tokens
      })
    } catch (error) {
      console.error('Login error:', error.message)
      res.status(401).json({ 
        error: 'Login failed',
        message: error.message,
        timestamp: new Date()
      })
    }
  })

  /**
   * @swagger
   * /api/auth/refresh:
   *   post:
   *     summary: Renova o access token usando refresh token
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               refreshToken:
   *                 type: string
   *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   *             required: [refreshToken]
   *     responses:
   *       200:
   *         description: Token renovado com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 accessToken:
   *                   type: string
   *                 expiresIn:
   *                   type: string
   *                   example: "15m"
   *       401:
   *         description: Refresh token inválido ou expirado
   */
  router.post('/refresh', validateBody(RefreshTokenSchema), async (req, res) => {
    try {
      const { refreshToken } = req.body

      // Verifica refresh token
      const payload = verifyRefreshToken(refreshToken)
      if (!payload) {
        return res.status(401).json({ 
          error: 'Refresh failed',
          message: 'Refresh token inválido ou expirado',
          timestamp: new Date()
        })
      }

      // Cria novo access token
      const accessToken = createAccessToken({
        id: payload.id,
        username: payload.username,
        email: payload.email
      })

      res.status(200).json({
        success: true,
        accessToken,
        expiresIn: '15m'
      })
    } catch (error) {
      console.error('Refresh error:', error.message)
      res.status(401).json({ 
        error: 'Refresh failed',
        message: error.message,
        timestamp: new Date()
      })
    }
  })

  /**
    * @swagger
   * /api/auth/me:
   *   get:
   *     summary: Obtém dados do usuário autenticado
   *     tags: [Authentication]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Dados do usuário obtidos com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 user:
   *                   $ref: '#/components/schemas/User'
   *       401:
   *         description: Token ausente ou inválido
   *       404:
   *         description: Usuário não encontrado
   *       500:
   *         description: Erro interno do servidor
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
