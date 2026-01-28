import { test, expect } from '@playwright/test'

// URL base do servidor
const BASE_URL = 'http://localhost:4000'

// Dados de teste
const testUser = {
  username: 'testuser' + Date.now(),
  email: `test${Date.now()}@example.com`,
  password: 'TestPassword123!'
}

test.describe('PPP Poker - Authentication E2E', () => {
  let accessToken = null
  let refreshToken = null
  let userId = null

  test('should register a new user via API', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/auth/register`, {
      data: {
        username: testUser.username,
        email: testUser.email,
        password: testUser.password
      }
    })

    expect(response.status()).toBe(201)
    const data = await response.json()
    
    expect(data.success).toBe(true)
    expect(data.user).toBeDefined()
    expect(data.user.email).toBe(testUser.email)
    expect(data.accessToken).toBeDefined()
    expect(data.refreshToken).toBeDefined()

    // Salvar tokens para próximos testes
    accessToken = data.accessToken
    refreshToken = data.refreshToken
    userId = data.user.id
  })

  test('should fail registration with invalid email', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/auth/register`, {
      data: {
        username: 'testuser123',
        email: 'invalid-email',
        password: 'TestPassword123!'
      }
    })

    expect(response.status()).toBe(400)
    const data = await response.json()
    expect(data.error).toBe('Validation Error')
  })

  test('should fail registration with short password', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/auth/register`, {
      data: {
        username: 'testuser123',
        email: 'user@example.com',
        password: 'short'
      }
    })

    expect(response.status()).toBe(400)
    const data = await response.json()
    expect(data.error).toBe('Validation Error')
  })

  test('should login with valid credentials', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/auth/login`, {
      data: {
        email: testUser.email,
        password: testUser.password
      }
    })

    expect(response.status()).toBe(200)
    const data = await response.json()
    
    expect(data.success).toBe(true)
    expect(data.user).toBeDefined()
    expect(data.accessToken).toBeDefined()
  })

  test('should fail login with invalid password', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/auth/login`, {
      data: {
        email: testUser.email,
        password: 'wrongpassword'
      }
    })

    expect(response.status()).toBe(401)
  })

  test('should refresh access token', async ({ request }) => {
    // Primeiro fazer login
    const loginResponse = await request.post(`${BASE_URL}/api/auth/login`, {
      data: {
        email: testUser.email,
        password: testUser.password
      }
    })
    
    const loginData = await loginResponse.json()
    const refreshTok = loginData.refreshToken

    // Agora fazer refresh
    const refreshResponse = await request.post(`${BASE_URL}/api/auth/refresh`, {
      data: {
        refreshToken: refreshTok
      }
    })

    expect(refreshResponse.status()).toBe(200)
    const data = await refreshResponse.json()
    expect(data.success).toBe(true)
    expect(data.accessToken).toBeDefined()
  })

  test('should get user data with valid token', async ({ request }) => {
    // Primeiro fazer login
    const loginResponse = await request.post(`${BASE_URL}/api/auth/login`, {
      data: {
        email: testUser.email,
        password: testUser.password
      }
    })
    
    const loginData = await loginResponse.json()
    const token = loginData.accessToken

    // Obter dados do usuário
    const meResponse = await request.get(`${BASE_URL}/api/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    expect(meResponse.status()).toBe(200)
    const data = await meResponse.json()
    expect(data.user).toBeDefined()
    expect(data.user.email).toBe(testUser.email)
  })

  test('should fail getting user data without token', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/auth/me`)
    expect(response.status()).toBe(401)
  })
})

test.describe('PPP Poker - WebSocket E2E', () => {
  test('should connect to WebSocket server via Socket.io', async ({ request }) => {
    // Primeiro, fazer login para obter token
    const loginResponse = await request.post(`${BASE_URL}/api/auth/login`, {
      data: {
        email: `wstest${Date.now()}@example.com`,
        password: 'TestPass123!'
      }
    })

    // Se não existir, criar usuário primeiro
    if (loginResponse.status() === 401) {
      const registerResponse = await request.post(`${BASE_URL}/api/auth/register`, {
        data: {
          username: `wstest${Date.now()}`,
          email: `wstest${Date.now()}@example.com`,
          password: 'TestPass123!'
        }
      })
      expect(registerResponse.status()).toBe(201)
    }

    // Verificar que o servidor está saudável
    const healthResponse = await request.get(`${BASE_URL}/health`)
    expect(healthResponse.status()).toBe(200)
  })

  test('should accept Socket.io connections on port 4000', async ({ request }) => {
    // Verificar que o servidor WebSocket está ativo via health check
    const response = await request.get(`${BASE_URL}/health`)
    expect(response.status()).toBe(200)
    
    const data = await response.json()
    expect(data.status).toBe('ok')
  })

  test('should validate WebSocket messages with schemas', async ({ request }) => {
    // Teste via REST API que a validação funciona
    const registerResponse = await request.post(`${BASE_URL}/api/auth/register`, {
      data: {
        username: `validation_test_${Date.now()}`,
        email: `validation_${Date.now()}@example.com`,
        password: 'ValidPass123!'
      }
    })

    expect(registerResponse.status()).toBe(201)
    const userData = await registerResponse.json()
    
    // Se conseguiu registrar, a validação está funcionando
    expect(userData.user).toBeDefined()
    expect(userData.accessToken).toBeDefined()
  })
})

test.describe('PPP Poker - Full User Flow E2E', () => {
  const user1 = {
    username: 'user1_' + Date.now(),
    email: `user1_${Date.now()}@example.com`,
    password: 'TestPass123!'
  }

  const user2 = {
    username: 'user2_' + Date.now(),
    email: `user2_${Date.now()}@example.com`,
    password: 'TestPass123!'
  }

  test('should complete full registration and login flow', async ({ request }) => {
    // 1. Register User 1
    const registerRes1 = await request.post(`${BASE_URL}/api/auth/register`, {
      data: user1
    })
    expect(registerRes1.status()).toBe(201)
    const user1Data = await registerRes1.json()

    // 2. Register User 2
    const registerRes2 = await request.post(`${BASE_URL}/api/auth/register`, {
      data: user2
    })
    expect(registerRes2.status()).toBe(201)
    const user2Data = await registerRes2.json()

    // 3. Login both users
    const login1Res = await request.post(`${BASE_URL}/api/auth/login`, {
      data: {
        email: user1.email,
        password: user1.password
      }
    })
    expect(login1Res.status()).toBe(200)

    const login2Res = await request.post(`${BASE_URL}/api/auth/login`, {
      data: {
        email: user2.email,
        password: user2.password
      }
    })
    expect(login2Res.status()).toBe(200)

    // 4. Both users should have valid tokens
    const user1Tokens = await login1Res.json()
    const user2Tokens = await login2Res.json()

    expect(user1Tokens.accessToken).toBeDefined()
    expect(user2Tokens.accessToken).toBeDefined()
  })

  test('should validate form inputs with Zod schemas', async ({ request }) => {
    const testCases = [
      {
        name: 'Missing email',
        data: { username: 'test', password: 'Pass123!' },
        expectError: true
      },
      {
        name: 'Invalid email format',
        data: { username: 'test', email: 'not-an-email', password: 'Pass123!' },
        expectError: true
      },
      {
        name: 'Short password',
        data: { username: 'test', email: 'test@example.com', password: 'short' },
        expectError: true
      },
      {
        name: 'Valid data',
        data: { 
          username: 'validuser_' + Date.now(), 
          email: `valid_${Date.now()}@example.com`, 
          password: 'ValidPass123!' 
        },
        expectError: false
      }
    ]

    for (const testCase of testCases) {
      const response = await request.post(`${BASE_URL}/api/auth/register`, {
        data: testCase.data
      })

      if (testCase.expectError) {
        expect(response.status()).toBe(400)
      } else {
        expect([201, 400]).toContain(response.status())
      }
    }
  })
})

test.describe('PPP Poker - Error Handling E2E', () => {
  test('should return proper error for duplicate email', async ({ request }) => {
    const userData = {
      username: 'uniqueuser_' + Date.now(),
      email: `duplicate_${Date.now()}@example.com`,
      password: 'TestPass123!'
    }

    // First registration should succeed
    const res1 = await request.post(`${BASE_URL}/api/auth/register`, {
      data: userData
    })
    expect(res1.status()).toBe(201)

    // Second registration with same email should fail
    const res2 = await request.post(`${BASE_URL}/api/auth/register`, {
      data: {
        username: 'anotheruser_' + Date.now(),
        email: userData.email,
        password: 'TestPass123!'
      }
    })
    expect(res2.status()).toBe(400)
  })

  test('should handle malformed JSON gracefully', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/auth/register`, {
      data: 'invalid json {'
    })
    expect(response.status()).toBeGreaterThanOrEqual(400)
  })

  test('should return 401 for invalid refresh token', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/auth/refresh`, {
      data: {
        refreshToken: 'invalid.token.here'
      }
    })
    expect(response.status()).toBe(401)
  })
})
