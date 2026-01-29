## 1. Visão Geral da Fase 1 – Autenticação & Sessão

A **Phase 1 – Autenticação & Sessão** tem como objetivo garantir que apenas usuários autenticados acessem o Planning Poker, com gerenciamento de sessão seguro e pronto para suportar as próximas fases (WebSocket confiável, escalabilidade horizontal e produção).

- **Estado alvo**: produto com fluxo de login e sessão estável, integrado ao banco, com tokens JWT e middleware de proteção de rotas.
- **Versão alvo**: `0.1.x` (base estável com autenticação + sessão).

O resultado desta fase é a fundação de identidade e segurança sobre a qual todas as demais fases (WebSocket, escalabilidade e produção) serão construídas.

---

## 2. Objetivos de Negócio e de Produto

- **Garantir acesso seguro**: impedir acesso não autenticado às salas e recursos principais do Planning Poker.
- **Criar base de identidade do usuário**: modelagem de `User` e vinculação futura com salas, votos e histórico.
- **Preparar a base para escalabilidade**: JWT e sessão pensados para múltiplas instâncias (arquitetura stateless).

---

## 3. Escopo da Fase 1

### 3.1 Incluído no Escopo

- Fluxo de autenticação baseado em **JWT**.
- Endpoints de autenticação (ex.: registro, login, refresh, logout “lógico”).
- Middleware de autenticação e validação de tokens.
- Integração com banco de dados para persistência de usuários e sessões lógicas.
- Testes unitários e de integração cobrindo os fluxos de autenticação e sessão.
- Documentação técnica da solução de autenticação (`AUTHENTICATION-IMPLEMENTATION.md`) e resumo da fase (`PHASE1-SUMMARY.md`).

### 3.2 Fora de Escopo (Postergado para Fases Seguintes)

- WebSocket confiável (reconexão, heartbeat) – tratado na Phase 2.
- Escalabilidade horizontal com Redis e Nginx – tratada na Phase 2 Beta.
- PWA, design system completo e CI/CD – tratados em fases posteriores.
- Regras avançadas de segurança (CSP, rate limiting, WAF, etc.) – reforçadas na Phase 3 (Production).

---

## 4. Usuários e Casos de Uso

### 4.1 Usuários-Alvo

- Product Owners e Scrum Masters que organizam sessões de planning poker.
- Desenvolvedores de times ágeis que participam das estimativas.
- Líderes técnicos e outros stakeholders internos que precisam acessar salas autenticadas.

### 4.2 Principais Casos de Uso (Phase 1)

1. **Cadastro de usuário**
   - Usuário informa e-mail, nome e senha.
   - Sistema valida dados e cria registro no banco.
2. **Login**
   - Usuário informa credenciais válidas.
   - Sistema autentica e gera token JWT com claims essenciais (ex.: `userId`, `email`, `role`, `exp`).
3. **Acesso a rotas autenticadas**
   - Usuário faz chamadas autenticadas com JWT (ex.: header `Authorization: Bearer <token>`).
   - Middleware valida token, resolve o usuário no banco e injeta o contexto autenticado na requisição.
4. **Logout / Revogação lógica**
   - Usuário realiza logout no frontend; token é descartado no cliente.
   - Opcionalmente, o backend mantém estratégia de revogação/rotação (ex.: blacklist ou rotação de chave).
5. **Erro de autenticação**
   - Tokens inválidos, expirados ou ausentes retornam erros padronizados (ex.: 401/403).
   - Mensagens de erro são claras para o usuário, sem vazar informação sensível (por exemplo, não indicar se o e-mail existe ou não).

---

## 5. Requisitos Funcionais (RF)

### 5.1 Cadastro de Usuário

- **RF01**: O sistema deve permitir criação de conta com, no mínimo, e-mail e senha (e opcionalmente nome de exibição).
- **RF02**: O sistema deve impedir cadastro de e-mail duplicado, retornando mensagem de erro adequada.

### 5.2 Login

- **RF03**: O sistema deve autenticar o usuário a partir de e-mail e senha.
- **RF04**: Em caso de sucesso, o sistema deve retornar um JWT com tempo de expiração configurável.

### 5.3 Validação de Autenticação

- **RF05**: O sistema deve possuir middleware de autenticação que valide o token JWT em rotas protegidas.
- **RF06**: Em caso de token inválido/ausente/expirado, o sistema deve retornar **401 Unauthorized** com mensagem padronizada.

### 5.4 Gestão de Sessão

- **RF07**: O sistema deve suportar renovação de token (via endpoint de refresh ou fluxo de re-login simples) sem quebrar a experiência do usuário.
- **RF08**: O sistema deve permitir invalidar sessões em caso de suspeita de comprometimento (estratégia técnica a definir: blacklist de tokens, rotação de chaves, etc.).

### 5.5 Integração com Banco de Dados

- **RF09**: O usuário autenticado deve ser carregado a partir do banco (modelo `User` no schema Prisma).
- **RF10**: Todas as ações em rotas protegidas devem ter acesso ao identificador do usuário autenticado (`userId`) no contexto da requisição.

---

## 6. Requisitos Não Funcionais (RNF)

### 6.1 Segurança

- **RNF01**: Senhas devem ser armazenadas usando hashing seguro (por exemplo, `bcrypt` ou `argon2`).
- **RNF02**: Tokens JWT devem ser assinados com chave segura, mantida fora do código fonte (ex.: variáveis de ambiente).
- **RNF03**: As mensagens de erro de autenticação não devem indicar se o e-mail existe ou não no sistema, evitando leak de informação.

### 6.2 Performance

- **RNF04**: Login e validação de token devem responder com latência aceitável, alinhada com a meta de Phase 1: **latência P99 < 500ms** para os endpoints principais de autenticação.

### 6.3 Confiabilidade e Qualidade

- **RNF05**: Fluxos de autenticação (cadastro, login, acesso a rota protegida) devem ter testes unitários e de integração cobrindo cenários de sucesso e falha.
- **RNF06**: O código de autenticação deve seguir boas práticas de clean code e ser revisado via code review antes de merge.

### 6.4 Observabilidade Inicial

- **RNF07**: Devem existir logs básicos (via Winston) para eventos relevantes de autenticação (falhas de login, uso de token inválido, etc.).

---

## 7. Métricas de Sucesso da Fase 1

Baseado nas métricas globais do projeto:

- **Cobertura de testes**: 
  - Meta: **>60%** nas áreas de autenticação e sessão (conforme tabela de métricas de Phase 1).
- **Latência P99**:
  - Meta: **<500ms** para endpoints de login/registro em ambiente de teste/controlado.
- **Security Score**:
  - Meta: alcançar pelo menos nível **C** ao final da Phase 1, preparando o caminho para **B** (Phase 2) e **A+** (Phase 3).
- **Taxa de falha inesperada em login**:
  - Meta: próxima de 0% em ambiente estável, considerando que falhas esperadas (credenciais inválidas) não contam como erro de sistema.

---

## 8. Dependências, Restrição e Alinhamento com o Roadmap

- **Stack Backend**:
  - Node.js + Express.
  - PostgreSQL como banco de dados.
  - Prisma ORM para acesso ao banco.
  - JWT para autenticação stateless.
- **Integração com fases futuras**:
  - Usuários autenticados serão a base para identificar donos de sala, participantes e votos (Phase 2 em diante).
  - Arquitetura de autenticação deve ser compatível com múltiplas instâncias no futuro (Phase 2 Beta – escalabilidade horizontal).
- **Documentação e processo**:
  - `AUTHENTICATION-IMPLEMENTATION.md` e `PHASE1-SUMMARY.md` devem ser produzidos/concluídos ao final da fase.
  - Respeitar as notas gerais do projeto: não pular fases, escrever testes junto ao desenvolvimento, revisar código antes de merge, documentar continuamente e considerar segurança desde o início.

---

## 9. Riscos e Considerações

- **Risco 1 – Implementação insegura de tokens**
  - Ex.: tempos de expiração muito longos, armazenamento inseguro no frontend, falta de rotação de chaves.
  - **Mitigação**: definir tempos de expiração razoáveis, boas práticas de armazenamento no front, e estratégia mínima de rotação/revogação.

- **Risco 2 – UX ruim no fluxo de autenticação**
  - Ex.: mensagens de erro confusas, campo de senha não mostrando critérios mínimos, ausência de feedback de carregamento.
  - **Mitigação**: desenhar UX simples e clara, revisar textos de erro, adicionar feedback visual e testes E2E básicos focados em login/logout.

- **Risco 3 – Atraso na entrega impactando fases seguintes**
  - A Phase 2 (WebSocket confiável) depende de uma base de autenticação sólida.
  - **Mitigação**: priorizar requisitos essenciais de autenticação, manter escopo bem controlado e alinhado com este PRD.

---

## 10. Critérios de Conclusão da Phase 1

A Phase 1 – Autenticação & Sessão será considerada concluída quando:

1. Todos os requisitos funcionais RF01–RF10 estiverem implementados e testados (unitário + integração).
2. Os requisitos não funcionais críticos (RNF01–RNF04) estiverem atendidos.
3. Cobertura de testes de autenticação for ≥ 60%.
4. A documentação `AUTHENTICATION-IMPLEMENTATION.md` e `PHASE1-SUMMARY.md` estiver concluída e revisada.
5. O fluxo de autenticação (cadastro, login, acesso autenticado) estiver estável em ambiente de teste, sem falhas inesperadas.

