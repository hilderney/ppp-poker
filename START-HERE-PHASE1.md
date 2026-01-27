# 🎬 COMECE AQUI - Phase 1 Autenticação

## 👋 Bem-vindo!

A **Phase 1 - Autenticação & Sessão** foi completamente implementada.  
Este arquivo guia você através do projeto.

---

## 📚 Documentação Recomendada

Leia nesta ordem:

1. **Este arquivo** (você está aqui) - Visão geral
2. [PHASE1-SUMMARY.md](./PHASE1-SUMMARY.md) - Resumo executivo (5 min)
3. [QUICKSTART-AUTH.md](./QUICKSTART-AUTH.md) - Teste rápido (10 min)
4. [PHASE1-CHECKLIST.md](./PHASE1-CHECKLIST.md) - Checklist completo (referência)
5. [AUTHENTICATION-IMPLEMENTATION.md](./AUTHENTICATION-IMPLEMENTATION.md) - Detalhes técnicos
6. [README.md](./README.md) - Overview do projeto

---

## ⚡ Comece em 5 Minutos

### 1. Instale as dependências
```bash
npm install
```

### 2. Inicie o servidor
```bash
npm run start:server
```

Você verá:
```
✅ Connected to SQLite via Prisma
Server running on http://localhost:4000
```

### 3. Registre um usuário (copie e cole)
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"password123"}'
```

### 4. Copie o `accessToken` da resposta e use

```bash
curl http://localhost:4000/api/auth/me \
  -H "Authorization: Bearer seu-token-aqui"
```

✅ Pronto! Autenticação funcionando!

---

## 🎯 O Que Foi Implementado?

### ✅ Autenticação JWT
- Tokens de curta vida (15 minutos)
- Refresh tokens (7 dias)
- Hash de senhas com bcryptjs
- Validação em WebSockets

### ✅ 4 Endpoints REST
- `POST /api/auth/register` - Registrar
- `POST /api/auth/login` - Fazer login
- `POST /api/auth/refresh` - Renovar token
- `GET /api/auth/me` - Meu perfil

### ✅ Segurança
- Senhas criptografadas
- JWT assinados
- Validação de tokens
- CORS habilitado

### ✅ Banco de Dados
- Schema Prisma com User
- Migração aplicada
- SQLite para desenvolvimento
- PostgreSQL pronto para produção

### ✅ Testes
- 14 testes passando
- Cobertura de autenticação
- Validações testadas

---

## 🗂️ Estrutura do Projeto

```
ppp-poker/
├── server/
│   ├── services/
│   │   ├── authService.js ✨ (JWT + bcryptjs)
│   │   └── userService.js ✨ (Usuários)
│   ├── routes/
│   │   └── authRoutes.js ✨ (Endpoints)
│   ├── middleware/
│   │   └── authMiddleware.js ✨ (Autenticação)
│   └── index.js (Servidor principal)
├── test/
│   ├── authService.test.js ✨ (14 testes)
│   └── authRoutes.test.js ✨ (Testes de rotas)
├── prisma/
│   ├── schema.prisma (Schema com User)
│   └── dev.db (Banco SQLite)
└── docs/ (Documentação)
```

---

## 🔐 Como Funciona a Autenticação?

### Fluxo de Registro
```
1. POST /api/auth/register
   ↓
2. Validar username, email, password
   ↓
3. Hash da senha com bcryptjs
   ↓
4. Salvar usuário no banco
   ↓
5. Gerar JWT (accessToken)
   ↓
6. Gerar Refresh Token
   ↓
7. Retornar tokens ao cliente
```

### Fluxo de Login
```
1. POST /api/auth/login
   ↓
2. Buscar usuário por email
   ↓
3. Verificar senha com bcryptjs
   ↓
4. Se válido, gerar tokens
   ↓
5. Retornar user + tokens
```

### Fluxo de Request Autenticado
```
1. Cliente envia: Authorization: Bearer <token>
   ↓
2. Middleware extrai token
   ↓
3. Verifica assinatura JWT
   ↓
4. Se válido, passa req.user para handler
   ↓
5. Handler acessa dados do usuário
```

---

## 🧪 Executar Testes

### Testes de Autenticação (14 testes)
```bash
npm test -- test/authService.test.js
```

### Todos os testes
```bash
npm test
```

---

## 📝 Exemplos de Uso

### Registrar um usuário
```javascript
const res = await fetch('http://localhost:4000/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'alice',
    email: 'alice@example.com',
    password: 'password123'
  })
})

const { user, accessToken, refreshToken } = await res.json()
```

### Fazer login
```javascript
const res = await fetch('http://localhost:4000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'alice@example.com',
    password: 'password123'
  })
})

const { accessToken, refreshToken } = await res.json()
```

### Usar token em requisição
```javascript
const res = await fetch('http://localhost:4000/api/auth/me', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
})

const user = await res.json() // { id, username, email, iat, exp }
```

### WebSocket com token
```javascript
const token = accessToken
const ws = new WebSocket('ws://localhost:4000?room=test', {
  headers: { Authorization: `Bearer ${token}` }
})

ws.onopen = () => {
  console.log('Conectado como:', ws.user)
  // ws.user = { id, username, email, iat, exp }
}
```

---

## 🔑 Variáveis de Ambiente

Verificar `.env`:

```env
# JWT
JWT_SECRET=your-super-secret-key-change-in-production-12345
JWT_REFRESH_SECRET=your-refresh-secret-key-change-in-production-67890
JWT_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Database
DATABASE_URL="file:./prisma/dev.db"

# Server
PORT=4000
```

**⚠️ Em produção, alterar JWT_SECRET e JWT_REFRESH_SECRET!**

---

## 🐛 Troubleshooting

### Erro: "Cannot find module"
```bash
# Reinstale dependências
rm -r node_modules package-lock.json
npm install
```

### Erro: "Database locked"
```bash
# Delete e recrie o banco
rm prisma/dev.db
npm run start:server
```

### Token expirou
```bash
# Use refresh token para obter novo access token
curl -X POST http://localhost:4000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"seu-refresh-token"}'
```

---

## 📊 Estatísticas da Phase 1

| Métrica | Valor |
|---------|-------|
| **Testes** | 14/14 ✅ |
| **Endpoints** | 4/4 ✅ |
| **Services** | 2 ✅ |
| **Middleware** | 2 ✅ |
| **Docs** | 6 ✅ |
| **Segurança** | JWT + bcrypt ✅ |
| **DB Schema** | User + Auth ✅ |

---

## 🎓 Próximos Passos

### Para Aprender
1. Ler [AUTHENTICATION-IMPLEMENTATION.md](./AUTHENTICATION-IMPLEMENTATION.md) para entender a arquitetura
2. Explorar código em `server/services/authService.js`
3. Executar testes e ver o que faz
4. Integrar com seu frontend

### Para Próxima Phase (Phase 2)
1. Migrar WebSocket para Socket.io
2. Implementar reconexão automática
3. Adicionar heartbeat/ping-pong
4. Validações com Zod

---

## 📞 Suporte

Se encontrar problemas:

1. Verificar [QUICKSTART-AUTH.md](./QUICKSTART-AUTH.md#-troubleshooting)
2. Executar testes: `npm test`
3. Ver logs do servidor
4. Verificar sintaxe: `node -c server/index.js`

---

## ✨ Destaques da Implementação

### 🔐 Segurança Profissional
- Senhas hash com salt 10
- JWT com expiração
- Validação em todos os pontos
- Error messages genéricas

### 🏗️ Arquitetura Escalável
- Service layer separada
- Adapter pattern para database
- Middleware reutilizável
- Testes unitários

### 📚 Documentação Completa
- Código comentado
- 6 documentos
- Exemplos curl
- Guias passo-a-passo

### ✅ Qualidade
- TypeScript + JavaScript
- 14 testes passando
- Zero erros de sintaxe
- Padrões profissionais

---

## 🎉 Conclusão

**Phase 1 - Autenticação & Sessão está 100% pronta!**

```
┌─────────────────────────────────────┐
│                                     │
│   ✅ JWT Funcionando               │
│   ✅ Endpoints Prontos             │
│   ✅ WebSocket Seguro              │
│   ✅ Testes Passando               │
│   ✅ Documentação Completa         │
│                                     │
│   Próximo: Phase 2 - Socket.io     │
│                                     │
└─────────────────────────────────────┘
```

---

**Desenvolvido:** 26 de janeiro de 2026  
**Versão:** 0.1.0-auth  
**Status:** ✅ PRONTO PARA USAR

Vamos começar? Execute `npm run start:server` agora! 🚀
