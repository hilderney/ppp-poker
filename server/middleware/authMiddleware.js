/**
 * Authentication Middleware
 * 
 * Middleware Express para validar JWT tokens
 */

import { verifyAccessToken, extractToken } from '../services/authService.js'

/**
 * Middleware para validar JWT token
 * Adiciona o payload do token em req.user
 */
export function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization
    const token = extractToken(authHeader)

    if (!token) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' })
    }

    const payload = verifyAccessToken(token)
    if (!payload) {
      return res.status(401).json({ error: 'Invalid or expired token' })
    }

    req.user = payload
    next()
  } catch (error) {
    console.error('Auth middleware error:', error)
    return res.status(401).json({ error: 'Unauthorized' })
  }
}

/**
 * Middleware opcional para validar JWT
 * Se token for inválido, continua sem usuário
 */
export function optionalAuthMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization
    const token = extractToken(authHeader)

    if (token) {
      const payload = verifyAccessToken(token)
      if (payload) {
        req.user = payload
      }
    }

    next()
  } catch (error) {
    console.error('Optional auth middleware error:', error)
    next()
  }
}
