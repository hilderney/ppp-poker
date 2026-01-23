# Quick Start Guide - Server

## Primeiro Uso

### 1. Instalar Dependências
```bash
npm install
```

### 2. Configurar Ambiente
```bash
# Copiar template
cp .env.example .env

# Para desenvolvimento com testes rápidos (recomendado inicialmente):
# DATABASE_ADAPTER=mock (já é o padrão)

# Para usar PostgreSQL:
# DATABASE_ADAPTER=postgres
# Certifique-se de ter PostgreSQL rodando e DATABASE_URL correto
```

### 3. Rodar Testes
```bash
# Testes unitários (usam MockAdapter - RÁPIDOS)
npm test

# Testes em watch mode
npm run test:watch

# Teste específico
npm test -- roomService.test.js
```

### 4. Iniciar Servidor
```bash
# Com MockAdapter (desenvolvimento rápido)
npm start

# Com PostgresAdapter (produção)
DATABASE_ADAPTER=postgres npm start
```

### 5. Acessar Servidor
- HTTP: http://localhost:4000
- WebSocket: ws://localhost:4000/?room=default

## Dados de Teste

Quando usar `DATABASE_ADAPTER=mock`:
- Os dados são armazenados em memória
- Não persistem entre reinicializações
- Ideal para desenvolvimento e testes

Quando usar `DATABASE_ADAPTER=postgres`:
- Os dados persistem em PostgreSQL
- Precisa de PostgreSQL rodando
- Configure DATABASE_URL em .env

## Problemas Comuns

**Erro: "PostgreSQL connection failed"**
```bash
# Verificar DATABASE_URL em .env
# Certifique-se de que PostgreSQL está rodando
docker run --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres:15
```

**Erro: "Module not found"**
```bash
# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install
```

**Porta 4000 já em uso**
```bash
# Trocar porta
PORT=5000 npm start

# Ou matar processo
npx kill-port 4000  # macOS/Linux
netstat -ano | findstr :4000  # Windows (verificar PID, depois taskkill /PID <id>)
```

## Checklist de Primeiro Uso

- [ ] `npm install`
- [ ] Verificar `.env`
- [ ] `npm test` - Todos os 35 testes passam?
- [ ] `npm start` - Servidor inicia sem erros?
- [ ] Testar WebSocket: `npm run test:ws` (se tiver script)

## Estrutura de Diretórios

```
server/
├── index.js                              # Arquivo principal do servidor
├── handlers/
│   └── messageHandler.js                 # Processa mensagens WebSocket
├── services/
│   ├── roomService.js                    # Lógica de jogo
│   └── roomServiceFactory.js             # Factory para injeção
└── infrastructure/
    ├── adapters/
    │   └── database/
    │       ├── IDatabaseAdapter.ts       # Interface
    │       ├── PostgresAdapter.ts        # Implementação Postgres
    │       ├── MockAdapter.ts            # Implementação Mock
    │       └── index.ts                  # Exports
    └── repositories/
        ├── RoomRepository.ts             # Repository para Rooms
        └── index.ts                      # Exports
```

## Variáveis de Ambiente

```bash
# Porta do servidor (padrão: 4000)
PORT=4000

# Adaptador de banco: 'mock' ou 'postgres'
DATABASE_ADAPTER=mock

# URL do PostgreSQL (para DATABASE_ADAPTER=postgres)
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"

# Ambiente: development ou production
NODE_ENV=development
```

## Dicas

1. **Para desenvolvimento rápido**: Use `DATABASE_ADAPTER=mock` - não precisa de PostgreSQL!
2. **Para testar com dados persistidos**: Configure PostgreSQL e use `DATABASE_ADAPTER=postgres`
3. **Testes sempre usam MockAdapter**: Rápidos e não dependem do banco
4. **Servidor escolhe adapter automaticamente**: Via variável `DATABASE_ADAPTER`

---

**Pronto?** Execute `npm start` e você está rodando! 🚀
