/**
 * Middleware de Validação para Express
 * Valida request body, params e query
 */

import { validateData } from '../validators/schemas.js'

/**
 * Middleware para validar request body
 * Uso: app.post('/endpoint', validateBody(schema), handler)
 */
export function validateBody(schema) {
  return (req, res, next) => {
    const validation = validateData(schema, req.body)
    
    if (!validation.valid) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Request body validation failed',
        details: validation.errors,
        timestamp: new Date(),
        path: req.path
      })
    }
    
    // Substituir req.body pelos dados validados
    req.body = validation.data
    next()
  }
}

/**
 * Middleware para validar request params
 * Uso: app.get('/endpoint/:id', validateParams(schema), handler)
 */
export function validateParams(schema) {
  return (req, res, next) => {
    const validation = validateData(schema, req.params)
    
    if (!validation.valid) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Request params validation failed',
        details: validation.errors,
        timestamp: new Date(),
        path: req.path
      })
    }
    
    req.params = validation.data
    next()
  }
}

/**
 * Middleware para validar request query
 * Uso: app.get('/endpoint', validateQuery(schema), handler)
 */
export function validateQuery(schema) {
  return (req, res, next) => {
    const validation = validateData(schema, req.query)
    
    if (!validation.valid) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Request query validation failed',
        details: validation.errors,
        timestamp: new Date(),
        path: req.path
      })
    }
    
    req.query = validation.data
    next()
  }
}

/**
 * Middleware de erro global
 * Captura erros e formata resposta
 */
export function errorHandler() {
  return (err, req, res, next) => {
    console.error('Error:', err)

    // Erro de validação
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation Error',
        message: err.message,
        details: err.details || [],
        timestamp: new Date(),
        path: req.path
      })
    }

    // Erro de autenticação
    if (err.status === 401) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: err.message || 'Authentication failed',
        timestamp: new Date(),
        path: req.path
      })
    }

    // Erro de autorização
    if (err.status === 403) {
      return res.status(403).json({
        error: 'Forbidden',
        message: err.message || 'Access denied',
        timestamp: new Date(),
        path: req.path
      })
    }

    // Erro não encontrado
    if (err.status === 404) {
      return res.status(404).json({
        error: 'Not Found',
        message: err.message || 'Resource not found',
        timestamp: new Date(),
        path: req.path
      })
    }

    // Erro genérico do servidor
    res.status(err.status || 500).json({
      error: err.error || 'Internal Server Error',
      message: err.message || 'An unexpected error occurred',
      code: err.code,
      timestamp: new Date(),
      path: req.path
    })
  }
}

/**
 * Classe para erros customizados
 */
export class ValidationError extends Error {
  constructor(message, details = []) {
    super(message)
    this.name = 'ValidationError'
    this.details = details
  }
}

export class AuthenticationError extends Error {
  constructor(message = 'Authentication failed') {
    super(message)
    this.name = 'AuthenticationError'
    this.status = 401
  }
}

export class AuthorizationError extends Error {
  constructor(message = 'Access denied') {
    super(message)
    this.name = 'AuthorizationError'
    this.status = 403
  }
}

export class NotFoundError extends Error {
  constructor(resource = 'Resource') {
    super(`${resource} not found`)
    this.name = 'NotFoundError'
    this.status = 404
  }
}
