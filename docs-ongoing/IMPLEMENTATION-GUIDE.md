# Guia de Conclusão: Refatoração RoomService → Adapter Pattern

## Visão Geral
Você iniciou a migração de RoomService de um modelo em-memory (Map) para usar o padrão Repository + Adapter com Prisma + PostgreSQL. Aqui está um guia completo para conclusão.

## Arquitetura Final

```
┌─────────────────────────────────────────┐
│         messageHandler.js               │
│  (Processa mensagens WebSocket)         │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│    RoomService (server/services/)       │
│  (Lógica de negócio de jogo)            │
│  - selectCard()                         │
│  - reveal()                             │
│  - reset()                              │
│  - renameUser()                         │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│  RoomRepository                         │
│  (Acesso a dados)                       │
│  - create()                             │
│  - findById()                           │
│  - findAll()                            │
│  - update()                             │
│  - delete()                             │
│  - reveal()                             │
│  - reset()                              │
└────────────────┬────────────────────────┘
                 │
                 ▼
        IDatabaseAdapter (Interface)
         /                          \
        /                            \
   MockAdapter                  PostgresAdapter
   (testes em-memory)      (Prisma + PostgreSQL)
```

## Arquivos Já Criados ✅

### 1. Database Layer
- ✅ `server/infrastructure/adapters/database/IDatabaseAdapter.ts` - Interface
- ✅ `server/infrastructure/adapters/database/PostgresAdapter.ts` - Implementação Postgres
- ✅ `server/infrastructure/adapters/database/MockAdapter.ts` - Mock para testes
- ✅ `server/infrastructure/adapters/database/index.ts` - Factory

### 2. Repository Layer
- ✅ `server/infrastructure/repositories/RoomRepository.ts` - Repository
- ✅ `server/infrastructure/repositories/index.ts` - Exports

### 3. Service Updates
- ✅ `server/services/roomService.js` - Atualizado para aceitar roomRepository
- ✅ `server/services/roomServiceFactory.js` - Factory com injeção de dependência

### 4. Documentação
- ✅ `REFACTORING-PROGRESS.md` - Progress tracker
- ✅ `prisma/schema.prisma` - Schema do banco
- ✅ `.env` - Configuração do banco

## Tarefas Pendentes 🔄

### Tarefa 1: Atualizar messageHandler.js para usar factory
**Objetivo:** Instanciar RoomService usando a factory com injeção de dependência

**Arquivo:** `server/index.js`
**Localização:** Provavelmente onde RoomService é instanciado

**Mudanças:**
```javascript
// Antes:
import RoomService from './services/roomService.js'
const roomService = new RoomService()

// Depois:
import { createRoomService } from './services/roomServiceFactory.js'
const roomService = await createRoomService('postgres') // ou 'mock' para testes
```

### Tarefa 2: Gerar migrações Prisma
**Objetivo:** Criar scripts de migração do banco de dados

**Comandos:**
```bash
# Gerar migração inicial
npx prisma migrate dev --name initial

# Verificar schema
npx prisma db push

# Abrir Prisma Studio (visual)
npx prisma studio
```

### Tarefa 3: Atualizar testes
**Objetivo:** Fazer testes usarem MockAdapter em vez de em-memory

**Arquivos a atualizar:**
- `server/test/roomService.test.js`
- `test/room.test.js`
- `test/messageHandler.test.js`

**Mudança padrão:**
```javascript
// Antes:
import RoomService from '../server/services/roomService.js'
describe('RoomService', () => {
  let roomService
  beforeEach(() => {
    roomService = new RoomService()
  })

// Depois:
import { createRoomServiceForTests } from '../server/services/roomServiceFactory.js'
describe('RoomService', () => {
  let roomService
  beforeEach(async () => {
    roomService = await createRoomServiceForTests()
  })
```

### Tarefa 4: Adicionar variável de ambiente
**Objetivo:** Determinar qual adapter usar (mock vs postgres)

**Arquivo:** `.env`
**Adicionar:**
```
DATABASE_ADAPTER=mock        # Em testes
DATABASE_ADAPTER=postgres    # Em produção
```

**Uso em messageHandler:**
```javascript
const adapterType = process.env.DATABASE_ADAPTER || 'postgres'
const roomService = await createRoomService(adapterType)
```

### Tarefa 5: Integração completa (Opcional por agora)
**Objetivo:** Usar dados do PostgreSQL de verdade

**Passos:**
1. Configurar PostgreSQL local ou em Docker
2. Executar migrações: `npx prisma migrate dev`
3. Testar end-to-end com dados persistidos

## Checklist de Implementação

- [ ] Verificar `server/index.js` ou arquivo de inicialização
- [ ] Atualizar import e instanciação de RoomService com factory
- [ ] Rodar testes (devem ainda passar com MockAdapter)
- [ ] Gerar migrações Prisma
- [ ] Adicionar NODE_ENV para distinguir ambientes
- [ ] Testar com mock adapter em desenvolvimento
- [ ] Configurar PostgreSQL quando pronto

## Executar Testes Após Mudanças

```bash
# Rodar todos os testes (com MockAdapter)
npm test

# Rodar em modo watch
npm run test:watch

# Rodar teste específico
npm test -- roomService.test.js
```

## Próximas Fases (Após Conclusão)

### Fase 2: Adicionar autenticação
- Criar UserRepository
- Implementar JWT/sessions
- Adicionar middleware de autenticação

### Fase 3: Escala horizontal
- Adicionar Redis para pub/sub
- Implementar room broadcasting com Redis
- Suporte para múltiplos servidores

### Fase 4: Monitoramento
- Adicionar logging estruturado
- Metrics com Prometheus
- Tracing distribuído

## Dúvidas Frequentes

**P: Posso misturar MockAdapter e PostgresAdapter?**
R: Sim! Configure via variável de ambiente. Útil para testes em CI/CD rodar rápido com mock.

**P: O que fazer se a migração Prisma quebrar?**
R: Use `npx prisma migrate reset` para limpar e começar do zero (apenas dev).

**P: Como os dados persistem no banco?**
R: Quando DatabaseAdapter.save() é chamado, o PostgresAdapter usa Prisma para inserir/atualizar no PostgreSQL.

**P: Preciso configurar Docker agora?**
R: Não! Deixei para depois como você pediu. Use um PostgreSQL local ou em container quando pronto.

---

**Status:** A arquitetura está em place. Próximo passo: conectar tudo no `server/index.js` e rodar os testes! 🚀
