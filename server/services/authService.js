/**
 * Authentication Service
 * 
 * Gerencia JWT tokens, refresh tokens e validação de usuários
 */

import jwt from 'jsonwebtoken'
import bcryptjs from 'bcryptjs'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-change-in-production'
const JWT_EXPIRY = process.env.JWT_EXPIRY || '15m'
const JWT_REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '7d'

/**
 * Hash uma senha
 */
export async function hashPassword(password) {
  const salt = await bcryptjs.genSalt(10)
  return bcryptjs.hash(password, salt)
}

/**
 * Valida uma senha contra um hash
 */
export async function verifyPassword(password, hash) {
  return bcryptjs.compare(password, hash)
}

/**
 * Cria um JWT token
 */
export function createAccessToken(payload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRY,
    issuer: 'ppp-poker',
    algorithm: 'HS256'
  })
}

/**
 * Cria um refresh token
 */
export function createRefreshToken(payload) {
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRY,
    issuer: 'ppp-poker',
    algorithm: 'HS256'
  })
}

/**
 * Verifica um JWT token
 */
export function verifyAccessToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET, {
      issuer: 'ppp-poker',
      algorithms: ['HS256']
    })
  } catch (error) {
    console.error('Token verification failed:', error.message)
    return null
  }
}

/**
 * Verifica um refresh token
 */
export function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET, {
      issuer: 'ppp-poker',
      algorithms: ['HS256']
    })
  } catch (error) {
    console.error('Refresh token verification failed:', error.message)
    return null
  }
}

/**
 * Cria par de tokens (access + refresh)
 */
export function createTokenPair(payload) {
  const accessToken = createAccessToken(payload)
  const refreshToken = createRefreshToken(payload)
  
  return {
    accessToken,
    refreshToken,
    expiresIn: JWT_EXPIRY
  }
}

/**
 * Decodifica um token sem validar (útil para logs)
 */
export function decodeToken(token) {
  try {
    return jwt.decode(token)
  } catch (error) {
    return null
  }
}

/**
 * Extrai o token do header Authorization
 */
export function extractTokenFromHeader(authHeader) {
  if (!authHeader) return null
  
  const parts = authHeader.split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null
  }
  
  return parts[1]
}

/**
 * Extrai o token de um header genérico
 */
export function extractToken(authHeader) {
  return extractTokenFromHeader(authHeader)
}
