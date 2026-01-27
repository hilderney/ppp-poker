# 🚀 Quick Start - Testando Autenticação

## 1️⃣ Iniciar o Servidor

```bash
npm run start:server
```

Você verá:
```
server/index.js: launching
Initializing RoomService with adapter: postgres
✅ Connected to SQLite via Prisma
Server running on http://localhost:4000
```

---

## 2️⃣ Registrar Novo Usuário

**Com curl:**
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Com PowerShell:**
```powershell
$body = @{
    username = "testuser"
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:4000/api/auth/register `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body
```

**Resposta esperada:**
```json
{
  "user": {
    "id": "abc123def456",
    "username": "testuser",
    "email": "test@example.com"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": "15m"
}
```

---

## 3️⃣ Fazer Login

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

---

## 4️⃣ Obter Dados do Usuário (com token)

Copie o `accessToken` da resposta anterior e use:

```bash
curl http://localhost:4000/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Resposta esperada:**
```json
{
  "id": "abc123def456",
  "username": "testuser",
  "email": "test@example.com",
  "iat": 1704907200,
  "exp": 1704908100
}
```

---

## 5️⃣ Renovar Token

Usando o `refreshToken` recebido:

```bash
curl -X POST http://localhost:4000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

**Resposta esperada:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": "15m"
}
```

---

## 6️⃣ Testar WebSocket com Token

Crie um arquivo `test-ws-auth.js`:

```javascript
import { WebSocket } from 'ws'

const token = 'seu-access-token-aqui'

const ws = new WebSocket('ws://localhost:4000?room=test-room', {
  headers: {
    Authorization: `Bearer ${token}`
  }
})

ws.on('open', () => {
  console.log('✅ WebSocket conectado com autenticação!')
  console.log('Usuário autenticado no servidor')
  
  // Enviar mensagem de teste
  ws.send(JSON.stringify({
    type: 'join',
    room: 'test-room',
    user: 'testuser'
  }))
})

ws.on('message', (data) => {
  console.log('📨 Mensagem recebida:', data.toString())
})

ws.on('close', (code, reason) => {
  console.log(`Conexão fechada: ${code} - ${reason}`)
})

ws.on('error', (err) => {
  console.error('❌ Erro:', err.message)
})
```

Execute:
```bash
node test-ws-auth.js
```

---

## 7️⃣ Executar Testes

```bash
# Testes de autenticação
npm test -- test/authService.test.js

# Testes de rotas
npm test -- test/authRoutes.test.js

# Todos os testes
npm test
```

---

## 🐛 Troubleshooting

### Erro: "Cannot find module 'authRoutes'"
**Solução:** O arquivo `server/routes/authRoutes.js` precisa ser criado. Use o comando abaixo para criar um básico:

```bash
# O arquivo deve estar em server/routes/authRoutes.js
# Verifique se o diretório existe
ls -la server/routes/
```

### Erro: "Invalid token"
**Solução:** 
- Verifique se o token está sendo enviado no header `Authorization`
- O formato deve ser: `Authorization: Bearer <token>`
- O token pode ter expirado (válido por 15 minutos)

### Erro: "Email já está registrado"
**Solução:** Use um email diferente ou delete o banco de dados:
```bash
rm prisma/dev.db
npm run start:server
```

### WebSocket não conecta
**Solução:**
1. Verifique se o servidor está rodando
2. Verifique o URL: `ws://localhost:4000` (não `http://`)
3. Se usar token, envie no header `Authorization`

---

## 📊 Fluxo de Teste Completo

```
1. npm run start:server
   └─> Servidor inicia em :4000

2. curl POST /api/auth/register
   └─> Usuário criado, tokens retornados

3. curl POST /api/auth/login
   └─> Faz login novamente

4. curl GET /api/auth/me -H "Authorization: Bearer ..."
   └─> Retorna dados do usuário

5. curl POST /api/auth/refresh
   └─> Token renovado

6. WebSocket com token
   └─> Conectado como ws.user
```

---

## ✅ Checklist de Sucesso

- [ ] Servidor iniciou sem erros
- [ ] Usuário registrado com sucesso
- [ ] Login retornou tokens
- [ ] GET /auth/me funcionou
- [ ] Refresh token funcionou
- [ ] WebSocket conectou com token
- [ ] Testes passaram

Se todas essas caixas estão marcadas, a **Phase 1 funciona corretamente!** ✨

---

## 📚 Próximos Passos

1. Integrar com frontend React
2. Armazenar tokens no localStorage
3. Enviar token em requisições HTTP
4. Renovar token automaticamente
5. Logout e limpeza de tokens

Ver [PHASE1-COMPLETE.md](./PHASE1-COMPLETE.md) para mais detalhes.
