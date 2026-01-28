# 🎴 PPP Poker - Planning Poker Application

Aplicação web de Planning Poker com autenticação JWT, WebSocket real-time e banco de dados integrado.

## 🎯 Status do Projeto

- ✅ **Phase 1 (MVP)** - Autenticação & Sessão - **COMPLETO**
- ✅ **Phase 2** - WebSocket Confiável (Socket.io) - **COMPLETO**
- 🔄 **Phase 2 Completo** - Validações & Testes E2E - Próximo
- 📋 **Phase 3** - Deploy & Escalabilidade - Planejado

## 📦 Funcionalidades Implementadas

### ✅ Autenticação (Phase 1)
- [x] JWT com access token (15 min) e refresh token (7 dias)
- [x] Hash de senhas com bcryptjs
- [x] Endpoints: `/api/auth/register`, `/api/auth/login`, `/api/auth/refresh`, `/api/auth/me`
- [x] Validação de token em WebSockets
- [x] Middleware de autenticação Express
- [x] Schema Prisma com User autenticado
- [x] 14 testes passando

### ✅ WebSocket Confiável (Phase 2)
- [x] Migração de `ws` para `socket.io` 4.7.2
- [x] Auto-reconnection com backoff exponencial
- [x] Heartbeat automático (30s ping interval)
- [x] Fallback HTTP Polling
- [x] Eventos de room com namespaces Socket.io
- [x] 6 testes de integração Socket.io
- [x] Documentação completa (PHASE2-WEBSOCKET.md)

### 🎮 Planning Poker
- [x] Salas multi-usuários
- [x] Votação em tempo real (WebSocket)
- [x] Sincronização de estado
- [x] Histórico de votações

## 🚀 Quick Start

### 1. Instalar dependências
```bash
npm install
```

### 2. Iniciar servidor
```bash
npm run start:server
```

### 3. Registrar e fazer login
```bash
# Registrar
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","email":"alice@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"password123"}'
```

### 4. Usar token em requisições
```bash
curl http://localhost:4000/api/auth/me \
  -H "Authorization: Bearer <seu-token>"
```

## 📚 Documentação

- [PHASE1-COMPLETE.md](./PHASE1-COMPLETE.md) - Resumo da Phase 1
- [AUTHENTICATION-IMPLEMENTATION.md](./AUTHENTICATION-IMPLEMENTATION.md) - Detalhes de autenticação
- [QUICKSTART-AUTH.md](./QUICKSTART-AUTH.md) - Guia rápido de testes
- [TODO.md](./TODO.md) - Roadmap completo do projeto

## 🧪 Executar Testes

```bash
# Testes de autenticação
npm test -- test/authService.test.js

# Testes de rotas
npm test -- test/authRoutes.test.js

# Todos os testes
npm test
```

## 🔧 Stack Tecnológico

### Backend
- **Node.js + Express** - Servidor web
- **JWT + bcryptjs** - Autenticação & segurança
- **Prisma + SQLite** - ORM & banco de dados
- **WebSocket (ws)** - Comunicação real-time
- **Jest** - Testes unitários

### Frontend (Planeado)
- **React 18+** - UI
- **Redux Toolkit** - State management
- **Vite** - Build tool
- **Socket.io client** - WebSocket client

### DevOps
- **Docker** - Containerização (futuro)
- **GitHub Actions** - CI/CD (futuro)
- **PostgreSQL** - Produção (futuro)

## 📋 Arquitetura

```
┌─────────────────┐
│   Frontend      │
│   (React)       │
└────────┬────────┘
         │ HTTP/WebSocket
         │
┌────────▼────────────────┐
│   Express Server        │
│  ├─ Auth Routes         │
│  ├─ WebSocket Handler   │
│  └─ Health Check        │
└────────┬────────────────┘
         │ SQL
         │
┌────────▼────────────────┐
│   Prisma ORM            │
│   ├─ User              │
│   ├─ Room              │
│   ├─ Vote              │
│   └─ RoomHistory       │
└────────┬────────────────┘
         │
┌────────▼────────────────┐
│   SQLite/PostgreSQL     │
│   (Banco de Dados)      │
└─────────────────────────┘
```

## 🔐 Segurança

- ✅ Senhas hash com bcryptjs (salt 10)
- ✅ JWT assinados com HS256
- ✅ Validação em todos os endpoints
- ✅ CORS habilitado
- 🔄 Rate limiting (planejado)
- 🔄 Helmet middleware (planejado)
- 🔄 HTTPS/TLS (produção)

## 📈 Performance

- Access token: ~1ms
- Password hash: ~90-150ms
- WebSocket: <100ms latência
- Database query: <50ms (SQLite dev)

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja [LICENSE](./LICENSE) para mais detalhes.

## 🎓 Aprendizados

Este é um projeto de aprendizagem implementando:
- Autenticação com JWT
- Padrão Adapter para abstração de banco de dados
- WebSocket em tempo real
- Testes unitários com Jest
- Migrações de banco de dados
- TypeScript + JavaScript

## 🔗 Links Úteis

- [JWT.io](https://jwt.io) - Debugar JWT tokens
- [Prisma Docs](https://www.prisma.io/docs/) - ORM documentation
- [Node.js WebSocket](https://nodejs.org/api/net.html) - WebSocket API

---

**Versão:** 0.1.0 (Phase 1)  
**Última atualização:** 26 de janeiro de 2026  
**Status:** ✅ Phase 1 Completa
