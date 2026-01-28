import swaggerJsdoc from 'swagger-jsdoc'

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
  apis: ['./server/routes/*.js']
}

export const swaggerSpec = swaggerJsdoc(options)
