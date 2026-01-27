# 🎯 PRÓXIMAS ETAPAS - Planning Poker MVP

## 📊 Status Atual

### ✅ Completado (Phase 1)
- **Autenticação JWT** - 14 testes passando
- **Adapter Pattern + SQLite** - Desenvolvimento pronto
- **Documentação** - Consolidada em `docs-ongoing/`
- **Tests** - 35 testes passando (28 unitários + 7 React)

**Próxima ação:** Executar Phase 2 (WebSocket Confiável)

---

## 🚀 Phase 2 - WebSocket Confiável (PRÓXIMO)

### 🔴 Prioridade Alta (Semana 1)

#### 1. Migrar `ws` → `socket.io`
**Por quê:** Melhor reconexão automática, suporte a fallback, mais confiável
**Tarefas:**
- [ ] Instalar: `npm install socket.io socket.io-client`
- [ ] Atualizar `server/index.js` para usar Socket.io
- [ ] Atualizar `src/wsClient.js` para usar Socket.io client
- [ ] Refatorar messageHandler para emits/on de Socket.io
- [ ] Testar broadcast de mensagens

**Tempo estimado:** 2-3 horas

#### 2. Implement Auto-Reconnection
**Tarefas:**
- [ ] Configurar `reconnection: true` no cliente
- [ ] Adicionar `reconnection: { delay: 100, maxDelay: 5000 }`
- [ ] Implementar retry logic com exponential backoff
- [ ] Adicionar eventos: `connect`, `disconnect`, `reconnect_attempt`
- [ ] Testes: desconectar/reconectar socket

**Tempo estimado:** 1-2 horas

#### 3. Adicionar Heartbeat/Ping-Pong
**Tarefas:**
- [ ] Configurar `pingInterval: 25000` em Socket.io
- [ ] Implementar servidor-side heartbeat check
- [ ] Logging de desconexões por timeout
- [ ] Alert no UI se conexão estiver instável

**Tempo estimado:** 1 hora

---

### 🟡 Prioridade Média (Semana 1-2)

#### 4. Testes de WebSocket
**Tarefas:**
- [ ] Remover testes antigos (5 testes ignorados em `test/room.test.js`)
- [ ] Criar novos testes com Socket.io
- [ ] Testar reconexão
- [ ] Testar broadcast entre múltiplos clientes
- [ ] Testar timeout e desconexão

**Tempo estimado:** 3-4 horas

#### 5. Validações (Zod/Joi)
**Tarefas:**
- [ ] Instalar `npm install zod`
- [ ] Validar entrada em `/api/auth/*`
- [ ] Validar mensagens WebSocket
- [ ] Criar schemas de validação reutilizáveis
- [ ] Implementar erro handling consistente

**Tempo estimado:** 3-4 horas

#### 6. Deploy Básico (Docker)
**Tarefas:**
- [ ] Criar `Dockerfile` (Node + npm)
- [ ] Criar `docker-compose.yml` (app + SQLite)
- [ ] Build e testar localmente
- [ ] Documentar setup

**Tempo estimado:** 2-3 horas

---

## 📋 Checklist Rápido

```bash
# Phase 2 - WebSocket
[ ] npm install socket.io socket.io-client
[ ] Migrar server/index.js para Socket.io
[ ] Migrar src/wsClient.js para Socket.io client
[ ] Implementar auto-reconnection
[ ] Adicionar heartbeat
[ ] Criar Dockerfile + docker-compose.yml
[ ] npm test (deve passar)
[ ] Testar manualmente: conectar → desconectar → reconectar
```

---

## 🗂️ Estrutura de Arquivos (Atual)

```
ppp-poker/
├── README.md                    (Principal - NÃO MOVER)
├── TODO.md                      (Roadmap completo)
├── NEXT-STEPS.md               (Este arquivo - ações imediatas)
├── docs-ongoing/               (Documentação consolidada)
│   ├── QUICK-START.md
│   ├── QUICKSTART-AUTH.md
│   ├── START-HERE.md
│   ├── TEST-GUIDE.md
│   ├── IMPLEMENTATION-GUIDE.md
│   ├── COMPLETION-SUMMARY.md
│   ├── ADAPTER-PATTERN-COMPLETE.md
│   ├── ARCHITECTURE-EVOLUTION.md
│   ├── PROJECT-FILES.md
│   ├── REFACTORING-PROGRESS.md
│   ├── SQLITE-SETUP.md
│   ├── README.DEV.md
│   ├── FINAL-SUMMARY.js
│   └── PHASE1.md
├── server/
│   ├── index.js                (Socket.io migration aqui)
│   ├── middleware/
│   │   └── authMiddleware.js   ✅ Pronto
│   ├── routes/
│   │   └── authRoutes.js       ✅ Pronto
│   ├── services/
│   │   ├── roomService.js      (Pronto para Phase 2)
│   │   ├── userService.js      ✅ Pronto
│   │   └── roomServiceFactory.js
│   ├── handlers/
│   │   └── messageHandler.js   (Refatorar para Socket.io)
│   └── infrastructure/
│       ├── adapters/database/  ✅ Completo
│       └── repositories/       ✅ Completo
├── src/
│   ├── wsClient.js             (Migrar para Socket.io)
│   ├── App.jsx
│   ├── components/
│   └── store/
├── prisma/
│   ├── schema.prisma           ✅ SQLite pronto
│   ├── dev.db                  (Auto-criado)
│   └── migrations/             ✅ Aplicadas
├── test/                        (35 testes passando)
├── package.json                (Adicionar socket.io)
├── .env                        (Atualizado)
└── Dockerfile                  (NEW - Phase 2)
```

---

## 💡 Dicas Importantes

### Desenvolvimento Local
```bash
# Phase 1 funcionando
npm test        # ✅ 35 testes
npm start       # ✅ Server rodando

# Phase 2 próximo
# Após migração Socket.io:
npm start       # Socket.io em ws://localhost:4000
npm test        # Testes atualizados
```

### Antes de começar Phase 2
1. ✅ Verificar que Phase 1 está 100% funcional
2. ✅ Revisar `docs-ongoing/` (especialmente TEST-GUIDE.md)
3. ✅ Ler `socket.io` docs: https://socket.io/docs/
4. ✅ Testar Socket.io localmente com exemplo básico

---

## 📚 Documentação Importante

Para entender arquitetura:
1. **docs-ongoing/START-HERE.md** - Overview rápido
2. **docs-ongoing/IMPLEMENTATION-GUIDE.md** - Detalhes técnicos
3. **docs-ongoing/TEST-GUIDE.md** - Como rodar testes
4. **docs-ongoing/COMPLETION-SUMMARY.md** - O que foi feito

---

## ⏱️ Timeline Estimado

| Tarefa | Tempo | Prioridade |
|--------|-------|-----------|
| Migrar Socket.io | 2-3h | 🔴 Alta |
| Auto-reconnection | 1-2h | 🔴 Alta |
| Heartbeat | 1h | 🔴 Alta |
| Validações (Zod) | 3-4h | 🟡 Média |
| Docker setup | 2-3h | 🟡 Média |
| Testes novos | 3-4h | 🟡 Média |
| **Total Phase 2** | **12-17h** | - |

---

## 🎯 Sucesso é quando...

✅ Socket.io está rodando sem erros  
✅ Auto-reconnection funciona (desconecta e reconecta)  
✅ Heartbeat ativo no console  
✅ Testes rodam com Socket.io  
✅ Docker build completo  
✅ README.md atualizado com instruções Socket.io  

---

**Próximo Passo:** Abrir `server/index.js` e começar migração Socket.io! 🚀
