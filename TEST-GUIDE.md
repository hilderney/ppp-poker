## 📋 Testes - Estrutura Atualizada (v2.0)

### Status Geral ✅
- **Total de Testes:** 35 passando
- **Testes Unitários:** 28 ✓
- **Testes de Componentes:** 7 ✓
- **Taxa de Sucesso:** 100%

### Arquivos de Teste

#### 1. **test/roomService.test.js** - Testes Unitários (18 testes)
- ✅ Gerenciamento de salas (`getRoom`, `createInitialState`)
- ✅ Gerenciamento de usuários (`ensureUserExists`, `renameUser`)
- ✅ Lógica de jogo (`selectCard`, `reveal`, `reset`)
- ✅ Validações de estado e histórico

**Exemplo de execução:**
```bash
npm test roomService.test.js
```

#### 2. **test/messageHandler.test.js** - Testes Unitários (10 testes)
- ✅ Roteamento de mensagens (`join`, `action`)
- ✅ Processamento de ações (`select`, `rename`, `reveal`, `reset`)
- ✅ Tratamento de mensagens desconhecidas
- ✅ Mock de broadcast com Jest

**Exemplo de execução:**
```bash
npm test messageHandler.test.js
```

#### 3. **test/room.test.js** - Testes de Integração (5 testes)
- ⚠️ Fluxo completo: join → select → reveal → reset
- ⚠️ Múltiplos clientes sincronizados
- ⚠️ Histórico de rounds
- ⚠️ Renomeação de usuários
- ⚠️ Comunicação WebSocket end-to-end

> **Nota:** Estes testes requerem o servidor WebSocket em execução na porta 4000.

**Exemplo de execução:**
```bash
# Terminal 1: Inicie o servidor
npm run start:server

# Terminal 2: Execute os testes de integração
npm test -- test/room.test.js --run
```

#### 4. **src/components/__tests__/UserCard.test.jsx** - Testes de Componentes (3 testes)
- ✅ Renderização do componente
- ✅ Validação de props
- ✅ Interações do usuário

#### 5. **src/store/__tests__/roomSlice.test.js** - Testes Redux (4 testes)
- ✅ Actions do Redux
- ✅ Reducers
- ✅ Seletores
- ✅ Gerenciamento de estado

#### 6. **server/test-ws-client.js** - Cliente de Teste Manual
Cliente WebSocket para testar manualmente o servidor com fluxo completo:
1. Join na sala
2. Select carta
3. Reveal
4. Reset
5. Rename

**Exemplo de execução:**
```bash
# Terminal 1: Inicie o servidor
npm run start:server

# Terminal 2: Inicie o cliente de teste
node server/test-ws-client.js
```

**Saída esperada:**
```
✓ Connected to server
  Client ID: test-client-...
  Room ID: test-room

→ Sending JOIN message...

[Message #1] type: state
  Users in room: 2
    - Test Client (test-client-...): no card
    - Simulado (sim): no card
  Revealed: false
  History entries: 0

→ Sending SELECT action...
...
```

### 🚀 Como Executar Todos os Testes

```bash
# Instalar dependências (se não instaladas)
npm install

# Executar todos os testes
npm test

# Executar testes unitários e de componentes (excluindo integração)
npm test -- --testPathIgnorePatterns="room.test.js"

# Executar apenas testes de integração (requer servidor rodando)
npm run start:server  # Terminal 1
npm test room.test.js  # Terminal 2

# Executar em modo watch (desenvolvimento)
npm test -- --watch

# Executar com coverage
npm test -- --coverage
```

### 📊 Cobertura de Testes

| Módulo | Testes | Status |
|--------|--------|--------|
| RoomService | 18 testes | ✅ Passando |
| MessageHandler | 10 testes | ✅ Passando |
| UserCard | 3 testes | ✅ Passando |
| roomSlice (Redux) | 4 testes | ✅ Passando |
| WebSocket Integration | 5 cenários | ⚠️ Requer servidor |

### 🔄 Mudanças Recentes (v3.0 - Jest)

1. **Migração de Vitest para Jest** ✅
   - Framework de testes trocado de Vitest para Jest
   - Todos os testes funcionando com Jest
   - Compatibilidade com ES modules via Babel

2. **Configurações Adicionadas**
   - `jest.config.js` - Configuração do Jest com jsdom, Babel transform
   - `jest.setup.js` - Setup com `@testing-library/jest-dom`
   - `.babelrc` - Babel presets para React e Node.js

3. **Conversão para ES Modules**
   - Todos os arquivos de teste usam import/export
   - package.json com `"type": "module"`
   - Servidor WebSocket convertido para ES modules

4. **Servidor WebSocket Atualizado**
   - Server/index.js convertido para ES modules
   - Importação corrigida de `WebSocketServer` do pacote `ws`
   - Melhor gerenciamento de porta e listeners

5. **Testes Melhorados**
   - History agora inclui `id` do usuário (snapshot melhorado)
   - MessageHandler retorna `null` para tipos desconhecidos
   - Melhor isolamento de testes com fresh RoomService instances
   - Mocks usando `jest.fn()` em vez de `vi.fn()`

### ✨ Melhorias Implementadas

1. **Testes Unitários Isolados** - RoomService e MessageHandler testados independentemente com dados frescos em cada teste
2. **Testes de Componentes React** - Validação de renderização e comportamento com Jest + Testing Library
3. **Testes Redux** - Verificação de actions, reducers e seletores
4. **Testes de Integração** - Validação do fluxo WebSocket end-to-end com múltiplos clientes
5. **Mocks Automáticos** - Uso de `jest.fn()` para testar callbacks e broadcasts
6. **Cenários Realistas** - Múltiplos clientes, ações sequenciais, edge cases, histórico
7. **Cliente de Teste Manual** - Ferramenta interativa para testar servidor localmente
8. **CI-Ready** - Testes podem rodar em pipelines de CI/CD com Jest
9. **Framework Maduro** - Jest é mais estável e amplamente adotado que Vitest para produção

