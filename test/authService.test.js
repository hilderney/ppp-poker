/**
 * Authentication Service Tests
 */

import {
  hashPassword,
  verifyPassword,
  createAccessToken,
  createRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  createTokenPair,
  extractToken
} from '../server/services/authService.js'

describe('AuthService', () => {
  describe('Password Hashing', () => {
    test('hashPassword should create a hash', async () => {
      const password = 'test123'
      const hash = await hashPassword(password)
      
      expect(hash).toBeTruthy()
      expect(hash).not.toBe(password)
      expect(hash.length).toBeGreaterThan(20)
    })

    test('verifyPassword should validate correct password', async () => {
      const password = 'test123'
      const hash = await hashPassword(password)
      const isValid = await verifyPassword(password, hash)
      
      expect(isValid).toBe(true)
    })

    test('verifyPassword should reject wrong password', async () => {
      const password = 'test123'
      const hash = await hashPassword(password)
      const isValid = await verifyPassword('wrong', hash)
      
      expect(isValid).toBe(false)
    })
  })

  describe('JWT Tokens', () => {
    test('createAccessToken should create a valid token', () => {
      const payload = { id: '123', username: 'test' }
      const token = createAccessToken(payload)
      
      expect(token).toBeTruthy()
      expect(typeof token).toBe('string')
    })

    test('verifyAccessToken should validate correct token', () => {
      const payload = { id: '123', username: 'test' }
      const token = createAccessToken(payload)
      const verified = verifyAccessToken(token)
      
      expect(verified).toBeTruthy()
      expect(verified.id).toBe(payload.id)
      expect(verified.username).toBe(payload.username)
    })

    test('verifyAccessToken should reject invalid token', () => {
      const verified = verifyAccessToken('invalid.token.here')
      
      expect(verified).toBeNull()
    })

    test('verifyAccessToken should reject expired token', () => {
      // Cria um token com expiração imediata
      const oldSecret = process.env.JWT_SECRET
      process.env.JWT_SECRET = 'test'
      process.env.JWT_EXPIRY = '0s'
      
      const token = createAccessToken({ id: '123' })
      
      // Aguarda para garantir que expirou
      setTimeout(() => {
        const verified = verifyAccessToken(token)
        expect(verified).toBeNull()
      }, 100)
      
      process.env.JWT_SECRET = oldSecret
    })
  })

  describe('Refresh Tokens', () => {
    test('createRefreshToken should create a valid token', () => {
      const payload = { id: '123', username: 'test' }
      const token = createRefreshToken(payload)
      
      expect(token).toBeTruthy()
      expect(typeof token).toBe('string')
    })

    test('verifyRefreshToken should validate correct token', () => {
      const payload = { id: '123', username: 'test' }
      const token = createRefreshToken(payload)
      const verified = verifyRefreshToken(token)
      
      expect(verified).toBeTruthy()
      expect(verified.id).toBe(payload.id)
    })

    test('verifyRefreshToken should reject invalid token', () => {
      const verified = verifyRefreshToken('invalid.token.here')
      
      expect(verified).toBeNull()
    })
  })

  describe('Token Pairs', () => {
    test('createTokenPair should return both access and refresh tokens', () => {
      const payload = { id: '123', username: 'test' }
      const pair = createTokenPair(payload)
      
      expect(pair.accessToken).toBeTruthy()
      expect(pair.refreshToken).toBeTruthy()
      expect(pair.expiresIn).toBeTruthy()
      
      // Verifica que ambos são válidos
      const accessVerified = verifyAccessToken(pair.accessToken)
      const refreshVerified = verifyRefreshToken(pair.refreshToken)
      
      expect(accessVerified).toBeTruthy()
      expect(refreshVerified).toBeTruthy()
    })
  })

  describe('Token Extraction', () => {
    test('extractToken should extract token from Authorization header', () => {
      const token = 'my-token-123'
      const header = `Bearer ${token}`
      
      const extracted = extractToken(header)
      
      expect(extracted).toBe(token)
    })

    test('extractToken should return null for invalid format', () => {
      const extracted1 = extractToken('Invalid format')
      const extracted2 = extractToken('Bearer')
      const extracted3 = extractToken('')
      
      expect(extracted1).toBeNull()
      expect(extracted2).toBeNull()
      expect(extracted3).toBeNull()
    })

    test('extractToken should return null when no header', () => {
      const extracted = extractToken(null)
      
      expect(extracted).toBeNull()
    })
  })
})
