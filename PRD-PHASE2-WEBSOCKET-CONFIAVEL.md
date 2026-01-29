## 1. Visão Geral da Fase 2 – WebSocket Confiável

A **Phase 2 – WebSocket Confiável** tem como objetivo garantir comunicação em tempo real estável, validada e observável entre clientes e servidor do Planning Poker, preparando a aplicação para uso intenso em times distribuídos.

- **Estado alvo**: sessões de planning poker em tempo real, com conexão estável (reconexão e heartbeat), validação de mensagens e cobertura E2E.
- **Versão alvo**: `0.2.x` (versão atual descrita no roadmap, com WebSocket confiável, validações e Docker pronto).

O resultado desta fase é um backend e frontend capazes de suportar sessões colaborativas em tempo real com qualidade e previsibilidade, formando a base para a futura escalabilidade horizontal (Phase 2 Beta) e operação em produção (Phase 3).

---

## 2. Objetivos de Negócio e de Produto

- **Garantir experiência em tempo real**: permitir que times façam planning poker com feedback instantâneo (entradas, saídas, votos, revelação de resultados).
- **Aumentar confiabilidade da conexão**: reduzir quedas e inconsistências por problemas de rede ou reconexão.
- **Assegurar integridade das mensagens**: validar o formato e o conteúdo de cada mensagem usando contratos explícitos.
- **Facilitar evolução e testes**: disponibilizar uma base de testes E2E para fluxos críticos em tempo real.

---

## 3. Escopo da Fase 2

### 3.1 Incluído no Escopo

- Migração e/ou consolidação da comunicação em tempo real para **Socket.io**.
- Suporte a reconexão automática, heartbeat e detecção de desconexão.
- Validações com **Zod** para mensagens e eventos WebSocket/HTTP relacionados.
- Testes E2E com **Playwright** cobrindo fluxos principais em tempo real.
- Configuração de **Dockerfile** e **docker-compose** para suportar a aplicação com WebSocket em ambiente de desenvolvimento/teste e preparação para produção.
- Documentação detalhada da arquitetura de WebSockets e contratos de mensagens (`PHASE2-WEBSOCKET.md`, `TEST-GUIDE.md`).

### 3.2 Fora de Escopo (Postergado para Fases Seguintes)

- Escalabilidade horizontal com Redis (adapter Socket.io) e Nginx como load balancer – Phase 2 Beta.
- Segurança avançada (HTTPS, CSP, rate limiting, WAF) – Phase 3.
- Otimizações de performance (caching distribuído, CDN) – Phase 3.
- Integrações externas e features opcionais – Fase 4.

---

## 4. Usuários e Casos de Uso (Tempo Real)

### 4.1 Usuários-Alvo

- Mesmos usuários da Phase 1 (POs, SMs, devs, líderes técnicos), agora utilizando a aplicação em sessões colaborativas em tempo real.

### 4.2 Principais Casos de Uso em Tempo Real

1. **Entrada de usuário em uma sala**
   - Usuário autenticado entra em uma sala de planning poker.
   - Todos na sala visualizam em tempo quase real a entrada do novo participante.
2. **Saída / desconexão de usuário**
   - Usuário fecha o navegador, perde conexão ou sai da sala.
   - O sistema detecta desconexão (heartbeat/timeouts) e atualiza a lista de participantes.
3. **Rodada de votação**
   - Facilitador inicia uma rodada.
   - Cada participante envia seu voto via WebSocket.
   - O sistema armazena votos e sinaliza quando todos votaram (ou quando o tempo expira, se houver).
4. **Revelação de votos**
   - Facilitador (ou regra automática) revela os votos.
   - Todos na sala recebem os resultados simultaneamente, incluindo estatísticas básicas (ex.: média, mediana, dispersão).
5. **Atualização de estado de sala**
   - Mudanças de estado de sala (início de nova rodada, reinicialização, mudança de facilitador) são propagadas em tempo real para todos os clientes conectados.

---

## 5. Requisitos Funcionais (RF)

### 5.1 Comunicação em Tempo Real (Socket.io)

- **RF01**: O sistema deve utilizar **Socket.io** para gerenciar conexões em tempo real entre clientes e servidor.
- **RF02**: Cada sala de planning poker deve ter um canal lógico (room/channel) associado no Socket.io para broadcast de eventos.
- **RF03**: O servidor deve identificar usuários autenticados ao estabelecer a conexão WebSocket (por exemplo, via token JWT enviado na handshake).

### 5.2 Confiabilidade da Conexão

- **RF04**: O sistema deve suportar **reconexão automática** do cliente em caso de perda temporária de conexão.
- **RF05**: O servidor deve implementar **heartbeat / ping-pong** para detecção de clientes desconectados.
- **RF06**: O sistema deve atualizar o estado da sala (lista de participantes conectados) quando clientes entram, saem ou são considerados desconectados.

### 5.3 Fluxos de Sala e Votação

- **RF07**: Usuários autenticados devem poder **entrar** em uma sala existente via evento Socket.io apropriado (ex.: `join_room`).
- **RF08**: Usuários devem poder **enviar votos** para uma rodada ativa via evento dedicado (ex.: `submit_vote`).
- **RF09**: O servidor deve controlar as transições de estado da sala (ex.: aguardando votos → votação concluída → resultados revelados).
- **RF10**: O evento de **revelação de votos** deve ser enviado para todos os participantes da sala simultaneamente.

### 5.4 Validações de Mensagens (Zod)

- **RF11**: Todas as mensagens recebidas via WebSocket (eventos) devem ser validadas usando **Zod**, garantindo:
  - Tipagem correta de payload.
  - Campos obrigatórios presentes.
  - Valores dentro de faixas esperadas (por exemplo, valores de carta).
- **RF12**: Em caso de payload inválido, o servidor deve:
  - Rejeitar a mensagem.
  - Opcionalmente enviar um erro padronizado ao cliente.
  - Registrar o evento para análise (logging).

### 5.5 Testes End-to-End (Playwright)

- **RF13**: Devem existir testes E2E com **Playwright** cobrindo, no mínimo:
  - Criação/acesso a uma sala por dois ou mais usuários.
  - Envio de votos por múltiplos participantes.
  - Revelação de votos e atualização de UI em todos os clientes.
  - Comportamento em caso de desconexão e reconexão de um participante.
- **RF14**: Os testes E2E devem ser executáveis via comando único (ex.: `npm test:e2e` ou similar) e integráveis ao pipeline de CI no futuro.

### 5.6 Docker e Ambiente

- **RF15**: A aplicação deve possuir **Dockerfile** e **docker-compose** capazes de subir:
  - Backend com suporte a WebSocket (Socket.io).
  - Banco de dados PostgreSQL.
  - Dependências necessárias para rodar testes E2E (conforme definido no projeto).
- **RF16**: A configuração de Docker deve ser adequada tanto para desenvolvimento local quanto para ambiente de teste/QA que simula produção.

---

## 6. Requisitos Não Funcionais (RNF)

### 6.1 Performance

- **RNF01**: A comunicação em tempo real deve contribuir para atingir as metas globais de latência:
  - **Phase 2**: **latência P99 < 200ms** para eventos principais de sala e votação, em cenário de carga moderada (até ~500 usuários simultâneos).

### 6.2 Confiabilidade e Robustez

- **RNF02**: O sistema deve ser resiliente a desconexões temporárias de rede, permitindo reconexão sem perda indevida de estado.
- **RNF03**: Erros inesperados em handlers de eventos WebSocket devem ser tratados e logados, evitando derrubar o servidor.

### 6.3 Segurança

- **RNF04**: O estabelecimento da conexão WebSocket deve respeitar as regras de autenticação definidas na Phase 1, usando tokens válidos e vigentes.
- **RNF05**: Eventos e payloads não devem aceitar campos que permitam escalada de privilégios ou acesso a salas indevidas.

### 6.4 Testabilidade e Qualidade

- **RNF06**: Cobertura de testes globais deve subir para **>80%** ao final da Phase 2 (conforme tabela de métricas).
- **RNF07**: Devem existir testes unitários para funções críticas (ex.: validação de payloads com Zod, gerenciamento de estado de sala) além dos testes E2E.
- **RNF08**: O código de eventos WebSocket deve ser organizado de forma modular, facilitando mock em testes.

### 6.5 Observabilidade

- **RNF09**: Devem existir logs estruturados (via Winston) para:
  - Conexão/desconexão de clientes.
  - Erros de validação de mensagens (Zod).
  - Erros internos em handlers de eventos.
- **RNF10**: A arquitetura deve estar preparada para, no futuro, integrar rastreamento de erros (ex.: Sentry) como previsto no roadmap.

---

## 7. Métricas de Sucesso da Fase 2

Conectadas às métricas globais do projeto:

- **Latência P99**:
  - Meta: **<200ms** para eventos principais de sala (entrada/saída, envio de votos, revelação).
- **Usuários simultâneos (alvo inicial)**:
  - Meta: suportar **~500 usuários simultâneos** em cenário de teste (pré-escalabilidade horizontal da Phase 2 Beta).
- **Cobertura de testes**:
  - Meta: cobertura global de código **>80%**, com foco em lógica de tempo real e E2E.
- **Estabilidade da conexão**:
  - Meta: baixa taxa de desconexões inesperadas em redes estáveis e reconexão bem-sucedida em casos de oscilação.

---

## 8. Dependências, Restrições e Alinhamento com o Roadmap

- **Dependências técnicas**:
  - Backend em Node.js + Express, já com autenticação (Phase 1).
  - Socket.io (server e client).
  - Zod para validação de payloads.
  - Playwright para testes E2E.
  - Docker + Docker Compose para empacotamento.
- **Restrições**:
  - Deve reutilizar o modelo de usuários e autenticação da Phase 1.
  - Não assumir ainda a presença de Redis ou load balancer; a arquitetura deve, contudo, estar preparada para introduzi-los na Phase 2 Beta (ex.: não acoplar estado de sala de forma que impeça o uso de adaptadores do Socket.io).
- **Alinhamento com fases seguintes**:
  - A forma de gerenciar salas e eventos deve ser compatível com replicação em múltiplas instâncias via Redis (Phase 2 Beta).
  - Logs e estrutura de erros devem ser pensados de forma a facilitar futura integração com Sentry/New Relic (Phase 3).

---

## 9. Riscos e Considerações

- **Risco 1 – Complexidade de estados em tempo real**
  - Gerenciamento de estados de sala e usuários conectados pode se tornar complexo e gerar bugs sutis.
  - **Mitigação**: manter modelo de estado simples, com funções puras bem testadas e documentação de fluxos de estado.

- **Risco 2 – Problemas de reconexão**
  - Reconexões mal tratadas podem levar a participantes “fantasmas” (ex.: usuários duplicados ou nunca desconectados).
  - **Mitigação**: testes E2E específicos para cenários de reconexão e timeouts, além de heartbeat bem configurado.

- **Risco 3 – Falta de observabilidade**
  - Sem logs adequados, bugs em tempo real são difíceis de reproduzir.
  - **Mitigação**: definir desde já evento mínimos de logging, com correlação via IDs de sala/usuário.

---

## 10. Critérios de Conclusão da Phase 2

A Phase 2 – WebSocket Confiável será considerada concluída quando:

1. Todos os requisitos funcionais RF01–RF16 estiverem implementados e testados.
2. Os requisitos não funcionais críticos (RNF01–RNF05) estiverem atendidos.
3. Cobertura de testes global do projeto for ≥ 80%, incluindo testes E2E focados em tempo real.
4. A documentação `PHASE2-WEBSOCKET.md` e `TEST-GUIDE.md` estiver concluída e revisada.
5. Os fluxos principais de planning poker em tempo real (entrar em sala, votar, revelar votos) estiverem estáveis em ambiente de teste, com boa experiência para múltiplos usuários simultâneos.

