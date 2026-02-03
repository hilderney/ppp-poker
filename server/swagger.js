import swaggerJsdoc from 'swagger-jsdoc'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'PPP Poker API',
      version: '1.0.0',
      description: 'API para Planning Poker em Tempo Real com WebSocket',
      contact: {
        name: 'PPP Poker Team'
      }
    },
    servers: [
      {
        url: 'http://localhost:4000',
        description: 'Development server'
      }
    ],
    paths: {
      '/': {
        get: {
          summary: 'Mensagem de boas-vindas do servidor',
          tags: ['Health'],
          responses: {
            200: {
              description: 'Servidor respondendo',
              content: {
                'text/plain': {
                  schema: { type: 'string', example: 'PPP Poker WebSocket server' }
                }
              }
            }
          }
        }
      },
      '/health': {
        get: {
          summary: 'Verifica a saúde do servidor',
          tags: ['Health'],
          responses: {
            200: {
              description: 'Servidor está rodando',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string', example: 'ok' }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            username: { type: 'string' },
            email: { type: 'string' },
            name: { type: 'string' }
          }
        },
        Room: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            status: { type: 'string', enum: ['waiting', 'voting', 'revealed', 'finished'] },
            revealed: { type: 'boolean' },
            users: { type: 'array', items: { $ref: '#/components/schemas/User' } }
          }
        },
        AuthResponse: {
          type: 'object',
          properties: {
            user: { $ref: '#/components/schemas/User' },
            accessToken: { type: 'string' },
            refreshToken: { type: 'string' },
            expiresIn: { type: 'string' }
          }
        }
      }
    }
  },
  apis: [path.join(__dirname, 'routes', '*.js')]
}

export const swaggerSpec = swaggerJsdoc(options)
