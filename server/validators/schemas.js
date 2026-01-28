/**
 * Validation Schemas usando Zod
 * Centraliza todas as validações da aplicação
 */

import { z } from 'zod'

// ============================================
// Auth Schemas
// ============================================

export const RegisterSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be at most 50 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens'),
  
  email: z.string()
    .email('Invalid email address'),
  
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must be at most 100 characters')
})

export const LoginSchema = z.object({
  email: z.string()
    .email('Invalid email address'),
  
  password: z.string()
    .min(1, 'Password is required')
})

export const RefreshTokenSchema = z.object({
  refreshToken: z.string()
    .min(1, 'Refresh token is required')
})

// ============================================
// Room Schemas
// ============================================

export const CreateRoomSchema = z.object({
  name: z.string()
    .min(3, 'Room name must be at least 3 characters')
    .max(100, 'Room name must be at most 100 characters'),
  
  description: z.string()
    .max(500, 'Description must be at most 500 characters')
    .optional()
})

export const UpdateRoomSchema = z.object({
  name: z.string()
    .min(3, 'Room name must be at least 3 characters')
    .max(100, 'Room name must be at most 100 characters')
    .optional(),
  
  description: z.string()
    .max(500, 'Description must be at most 500 characters')
    .optional(),
  
  status: z.enum(['open', 'voting', 'closed'])
    .optional()
})

// ============================================
// Vote Schemas
// ============================================

export const VoteSchema = z.object({
  roomId: z.string()
    .uuid('Invalid room ID'),
  
  value: z.number()
    .int('Vote value must be an integer')
    .min(0, 'Vote value must be non-negative')
    .max(999, 'Vote value must be at most 999'),
  
  comment: z.string()
    .max(500, 'Comment must be at most 500 characters')
    .optional()
})

// ============================================
// WebSocket Message Schemas
// ============================================

export const WSJoinSchema = z.object({
  type: z.literal('join'),
  clientId: z.string()
    .min(1, 'Client ID is required'),
  
  name: z.string()
    .min(1, 'User name is required')
    .max(100, 'User name must be at most 100 characters'),
  
  room: z.string()
    .min(1, 'Room ID is required')
})

export const WSActionSchema = z.object({
  type: z.enum(['vote', 'reset', 'reveal', 'close', 'action']),
  
  data: z.record(z.any()).optional()
})

export const WSMessageSchema = z.object({
  type: z.string(),
  
  room: z.string().optional(),
  
  data: z.record(z.any()).optional()
})

// ============================================
// User Schemas
// ============================================

export const UserSchema = z.object({
  id: z.string().uuid(),
  username: z.string(),
  email: z.string().email(),
  createdAt: z.date(),
  updatedAt: z.date()
})

// ============================================
// Error Response Schema
// ============================================

export const ErrorResponseSchema = z.object({
  error: z.string(),
  message: z.string(),
  code: z.string().optional(),
  timestamp: z.date(),
  path: z.string().optional()
})

// ============================================
// Success Response Schema
// ============================================

export const SuccessResponseSchema = z.object({
  success: z.boolean().default(true),
  data: z.any(),
  message: z.string().optional()
})

// ============================================
// Tipo definitions usando Zod
// ============================================

export type RegisterInput = z.infer<typeof RegisterSchema>
export type LoginInput = z.infer<typeof LoginSchema>
export type RefreshTokenInput = z.infer<typeof RefreshTokenSchema>
export type CreateRoomInput = z.infer<typeof CreateRoomSchema>
export type UpdateRoomInput = z.infer<typeof UpdateRoomSchema>
export type VoteInput = z.infer<typeof VoteSchema>
export type WSJoinInput = z.infer<typeof WSJoinSchema>
export type WSActionInput = z.infer<typeof WSActionSchema>
export type User = z.infer<typeof UserSchema>
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>
export type SuccessResponse = z.infer<typeof SuccessResponseSchema>

// ============================================
// Validation Utility Functions
// ============================================

/**
 * Valida dados contra um schema Zod
 * Retorna { valid: true, data } ou { valid: false, errors }
 */
export function validateData(schema, data) {
  try {
    const validated = schema.parse(data)
    return { valid: true, data: validated }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        valid: false,
        errors: error.errors.map(e => ({
          path: e.path.join('.'),
          message: e.message,
          code: e.code
        }))
      }
    }
    return { valid: false, errors: [{ message: error.message }] }
  }
}

/**
 * Parse seguro de JSON com validação
 */
export function parseJSON(text, schema) {
  try {
    const data = JSON.parse(text)
    return validateData(schema, data)
  } catch (error) {
    return { valid: false, errors: [{ message: 'Invalid JSON' }] }
  }
}
