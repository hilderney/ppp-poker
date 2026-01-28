# API Endpoints Registry - PPP Poker

Registro completo de todos os endpoints da aplicação PPP Poker com documentação, exemplos de uso e status de implementação.

**Base URL**: `http://localhost:4000`
**API Prefix**: `/api`
**Swagger UI**: http://localhost:4000/api-docs

---

## 📋 Índice de Endpoints

- [Health Check](#health-check)
- [Autenticação](#autenticação)
  - [POST /api/auth/register](#post-apiauthregister)
  - [POST /api/auth/login](#post-apiauthlogin)
  - [POST /api/auth/refresh](#post-apiauthrefresh)
  - [GET /api/auth/me](#get-apiauthme)
- [Usuários](#usuários)
  - [GET /api/auth/users](#get-apiautheusers)

---

## Health Check

### GET /health

**Status**: ✅ Implementado

Verifica se o servidor está online e funcionando corretamente.

**Método**: GET
**Path**: `/health`
**Autenticação**: Não requerida

**Response** (200 OK):
```json
{
  "status": "ok"
}
```

**Exemplo com curl**:
```bash
curl -X GET http://localhost:4000/health
```

---

## Autenticação

### POST /api/auth/register

**Status**: ✅ Implementado

Registra um novo usuário na aplicação.

**Método**: POST
**Path**: `/api/auth/register`
**Autenticação**: Não requerida
**Content-Type**: application/json

**Request Body**:
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "name": "John Doe"
}
```

**Campos Obrigatórios**: `username`, `email`, `password`
**Campo Opcional**: `name`

**Response** (201 Created):
```json
{
  "user": {
    "id": "uuid-string",
    "username": "john_doe",
    "email": "john@example.com",
    "name": "John Doe"
  },
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "expiresIn": "15m"
}
```

**Erros**:
- 400: Email já registrado / Campos obrigatórios faltando
- 500: Erro ao registrar usuário

**Exemplo com curl**:
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

---

### POST /api/auth/login

**Status**: ✅ Implementado

Realiza login de um usuário existente.

**Método**: POST
**Path**: `/api/auth/login`
**Autenticação**: Não requerida
**Content-Type**: application/json

**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Campos Obrigatórios**: `email`, `password`

**Response** (200 OK):
```json
{
  "user": {
    "id": "uuid-string",
    "username": "john_doe",
    "email": "john@example.com",
    "name": "John Doe"
  },
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "expiresIn": "15m"
}
```

**Erros**:
- 400: Campos obrigatórios faltando
- 401: Email ou senha inválidos
- 500: Erro ao fazer login

**Exemplo com curl**:
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

---

### POST /api/auth/refresh

**Status**: ✅ Implementado

Renova o access token usando um refresh token válido.

**Método**: POST
**Path**: `/api/auth/refresh`
**Autenticação**: Não requerida
**Content-Type**: application/json

**Request Body**:
```json
{
  "refreshToken": "eyJhbGc..."
}
```

**Campos Obrigatórios**: `refreshToken`

**Response** (200 OK):
```json
{
  "accessToken": "eyJhbGc...",
  "expiresIn": "15m"
}
```

**Erros**:
- 400: Refresh token faltando
- 401: Refresh token inválido ou expirado
- 500: Erro ao renovar token

**Exemplo com curl**:
```bash
curl -X POST http://localhost:4000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGc..."
  }'
```

---

### GET /api/auth/me

**Status**: ✅ Implementado

Obtém os dados do usuário autenticado.

**Método**: GET
**Path**: `/api/auth/me`
**Autenticação**: Requerida (Bearer Token)
**Header**: `Authorization: Bearer <accessToken>`

**Response** (200 OK):
```json
{
  "user": {
    "id": "uuid-string",
    "username": "john_doe",
    "email": "john@example.com",
    "name": "John Doe"
  }
}
```

**Erros**:
- 401: Token faltando ou inválido
- 404: Usuário não encontrado
- 500: Erro ao obter dados do usuário

**Exemplo com curl**:
```bash
curl -X GET http://localhost:4000/api/auth/me \
  -H "Authorization: Bearer eyJhbGc..."
```

---

## Usuários

### GET /api/auth/users

**Status**: ✅ Implementado

Lista todos os usuários registrados na aplicação.

**Método**: GET
**Path**: `/api/auth/users`
**Autenticação**: Não requerida
**Query Parameters**: Nenhum

**Response** (200 OK):
```json
{
  "users": [
    {
      "id": "uuid-1",
      "username": "john_doe",
      "email": "john@example.com"
    },
    {
      "id": "uuid-2",
      "username": "jane_smith",
      "email": "jane@example.com"
    }
  ]
}
```

**Notas**:
- Retorna apenas campos públicos (id, username, email)
- Sensíveis campos como password não são inclusos
- Retorna array vazio [] se nenhum usuário existir

**Erros**:
- 500: Erro ao listar usuários

**Exemplo com curl**:
```bash
curl -X GET http://localhost:4000/api/auth/users
```

---

## 📊 Resumo de Implementação

| Endpoint | Método | Status | Autenticação |
|----------|--------|--------|--------------|
| /health | GET | ✅ | Não |
| /api/auth/register | POST | ✅ | Não |
| /api/auth/login | POST | ✅ | Não |
| /api/auth/refresh | POST | ✅ | Não |
| /api/auth/me | GET | ✅ | Sim |
| /api/auth/users | GET | ✅ | Não |

---

## 🔐 Autenticação

### Tokens JWT

**Access Token**:
- **TTL**: 15 minutos
- **Uso**: Autenticar requests em endpoints protegidos
- **Header**: `Authorization: Bearer <token>`

**Refresh Token**:
- **TTL**: 7 dias
- **Uso**: Obter novo access token quando expirar
- **Método**: POST /api/auth/refresh

### Segurança

- Senhas são criptografadas com bcryptjs
- Tokens são assinados com JWT_SECRET
- Sensitive fields (passwords) nunca são retornados na API
- CORS habilitado para requisições cross-origin

---

## 🧪 Testes

**Status**: ✅ 61 testes passando

- 6 test suites
- 61 testes passando
- 5 testes skipped (WebSocket integration tests)

Execute os testes com:
```bash
npm test
```

---

## 📚 Documentação Interativa

Acesse a documentação interativa do Swagger em:
```
http://localhost:4000/api-docs
```

Nesta interface você pode:
- Visualizar todos os endpoints
- Ver schemas de request/response
- Testar endpoints com "Try it out"
- Copiar exemplos de curl

---

## 🔄 Fluxo de Autenticação

```
1. User registra com POST /api/auth/register
   ↓
2. Recebe accessToken (15m) e refreshToken (7d)
   ↓
3. Usa accessToken para acessar endpoints protegidos
   ↓
4. Quando accessToken expira, usa refreshToken
   ↓
5. POST /api/auth/refresh retorna novo accessToken
```

---

## 📝 Notas de Desenvolvimento

- **Base URL**: Mude para ambiente de produção em production
- **JWT_SECRET**: Configure via variável de ambiente
- **Database**: SQLite para desenvolvimento, Prisma ORM
- **Adapter Pattern**: Suporta PostgreSQL e mock adapter para testes

---

## Atualizado em

27 de Janeiro de 2026
