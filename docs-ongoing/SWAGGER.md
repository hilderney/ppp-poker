# 📊 Swagger Documentation Setup

## ✅ Instalado com Sucesso!

Swagger foi configurado para documentar e testar a API do PPP Poker.

## 🚀 Acessar a Documentação

**URL**: `http://localhost:4000/api-docs`

## 📋 Endpoints Documentados

### Autenticação
- `POST /api/auth/register` - Registrar novo usuário
- `POST /api/auth/login` - Fazer login
- `POST /api/auth/refresh` - Renovar access token

### Health Check
- `GET /health` - Verificar saúde do servidor

## 🧪 Como Testar no Swagger UI

1. Abra `http://localhost:4000/api-docs` no navegador
2. Clique em um endpoint (ex: `POST /api/auth/register`)
3. Clique em "Try it out"
4. Preencha os campos solicitados
5. Clique em "Execute"
6. Veja a resposta da API

## ⚠️ IMPORTANTE - URLs Corretas

Os endpoints estão mapeados com o prefixo `/api`:
- ✓ Correto: `http://localhost:4000/api/auth/register`
- ✗ Errado: `http://localhost:4000/auth/register`

## 🔧 Configuração

### Arquivos Adicionados
- `server/swagger.js` - Configuração do Swagger/OpenAPI

### Arquivos Modificados
- `server/index.js` - Integração do Swagger UI
- `server/routes/authRoutes.js` - Documentação dos endpoints

### Dependências Instaladas
```bash
npm install swagger-ui-express swagger-jsdoc
```

## 📝 Exemplo de Request

```bash
curl -X POST "http://localhost:4000/api/auth/register" \
  -H "accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "SecurePass123!",
    "name": "John Doe"
  }'
```

## 📊 Exemplo de Resposta

```json
{
  "user": {
    "id": "cmkx85mr00000ni2gsxxwerce",
    "username": "johndoe",
    "email": "john@example.com"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNta3g4NW1yMDAwMDBuaTJnc3h4d2VyY2UiLCJ1c2VybmFtZSI6ImpvaG5kb2UiLCJlbWFpbCI6ImpvaG5AZXhhbXBsZS5jb20iLCJpYXQiOjE3Njk1NTYzNDAsImV4cCI6MTc2OTU1NzI0MCwiaXNzIjoicHBwLXBva2VyIn0.pQy6wLzjvvAEu31iBSAaNRxqLSp0bQLBps7Osfw49nc",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNta3g4NW1yMDAwMDBuaTJnc3h4d2VyY2UiLCJ1c2VybmFtZSI6ImpvaG5kb2UiLCJlbWFpbCI6ImpvaG5AZXhhbXBsZS5jb20iLCJpYXQiOjE3Njk1NTYzNDAsImV4cCI6MTc3MDE2MTE0MCwiaXNzIjoicHBwLXBva2VyIn0.90zOB_MPED6qV8LGnL7dKBkxBuAz66b0UB_wE8MukvM",
  "expiresIn": "15m"
}
```

## ✨ Recursos

- ✅ Documentação interativa com OpenAPI 3.0
- ✅ Interface Swagger UI para testar endpoints
- ✅ Schemas definidos para request/response
- ✅ Descrições de endpoints em português

## 🔗 Links Úteis

- Swagger UI: http://localhost:4000/api-docs
- Health Check: http://localhost:4000/health
- API Base: http://localhost:4000
