/**
 * Testes de Integração para WebSocket
 * Valida: comunicação end-to-end entre cliente e servidor
 */

import WebSocket from 'ws'

function waitForState(ws, predicate, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => {
      ws.removeAllListeners('message')
      reject(new Error('timeout waiting for state'))
    }, timeout)
    ws.on('message', (m) => {
      try {
        const msg = JSON.parse(m.toString())
        if (msg.type === 'state') {
          if (predicate(msg.state)) {
            clearTimeout(t)
            ws.removeAllListeners('message')
            resolve(msg.state)
          }
        }
      } catch (e) {
        // ignore
      }
    })
  })
}

describe('WebSocket Integration Tests', () => {
  test('join e select atualizam o estado', async () => {
    const room = 'testroom'
    const clientId = `test-${Date.now()}`
    const ws = new WebSocket(`ws://localhost:4000/?room=${room}`)

    await new Promise((res, rej) => {
      ws.on('open', res)
      ws.on('error', rej)
    })

    // enviar join
    ws.send(JSON.stringify({ type: 'join', clientId, name: 'Vitest', room }))

    // aguardar servidor incluir usuário no estado
    const stateAfterJoin = await waitForState(
      ws,
      (s) => Array.isArray(s.users) && s.users.some((u) => u.id === clientId),
      3000
    )
    expect(stateAfterJoin.users.some((u) => u.id === clientId)).toBe(true)

    // enviar ação select
    ws.send(JSON.stringify({ type: 'action', action: 'select', clientId, card: 5, room }))

    const stateAfterSelect = await waitForState(
      ws,
      (s) => {
        const u = (s.users || []).find((x) => x.id === clientId)
        return u && u.card === 5
      },
      3000
    )

    const me = stateAfterSelect.users.find((u) => u.id === clientId)
    expect(me).toBeDefined()
    expect(me.card).toBe(5)

    ws.close()
  })

  test('múltiplos clientes recebem atualizações de estado', async () => {
    const room = `testroom-multi-${Date.now()}`
    const client1Id = `client1-${Date.now()}`
    const client2Id = `client2-${Date.now()}`

    const ws1 = new WebSocket(`ws://localhost:4000/?room=${room}`)
    const ws2 = new WebSocket(`ws://localhost:4000/?room=${room}`)

    // aguardar ambos os clientes conectarem
    await Promise.all([
      new Promise((res) => ws1.on('open', res)),
      new Promise((res) => ws2.on('open', res))
    ])

    // client1 entra na sala
    ws1.send(JSON.stringify({ type: 'join', clientId: client1Id, name: 'Client1', room }))
    await waitForState(ws1, (s) => s.users.some((u) => u.id === client1Id), 3000)

    // client2 entra na sala
    ws2.send(JSON.stringify({ type: 'join', clientId: client2Id, name: 'Client2', room }))
    await waitForState(ws2, (s) => s.users.some((u) => u.id === client2Id), 3000)

    // client1 seleciona carta
    ws1.send(JSON.stringify({ type: 'action', action: 'select', clientId: client1Id, card: 3, room }))

    // ambos devem receber o estado atualizado
    const state1 = await waitForState(
      ws1,
      (s) => s.users.find((u) => u.id === client1Id)?.card === 3,
      3000
    )
    const state2 = await waitForState(
      ws2,
      (s) => s.users.find((u) => u.id === client1Id)?.card === 3,
      3000
    )

    expect(state1.users.find((u) => u.id === client1Id).card).toBe(3)
    expect(state2.users.find((u) => u.id === client1Id).card).toBe(3)

    ws1.close()
    ws2.close()
  })

  test('reveal salva histórico e marca como revelado', async () => {
    const room = `testroom-reveal-${Date.now()}`
    const clientId = `test-${Date.now()}`
    const ws = new WebSocket(`ws://localhost:4000/?room=${room}`)

    await new Promise((res) => ws.on('open', res))

    // join
    ws.send(JSON.stringify({ type: 'join', clientId, name: 'TestUser', room }))
    await waitForState(ws, (s) => s.users.some((u) => u.id === clientId), 3000)

    // select
    ws.send(JSON.stringify({ type: 'action', action: 'select', clientId, card: 8, room }))
    await waitForState(ws, (s) => s.users.find((u) => u.id === clientId)?.card === 8, 3000)

    // reveal
    ws.send(JSON.stringify({ type: 'action', action: 'reveal', room }))

    const stateAfterReveal = await waitForState(ws, (s) => s.revealed === true, 3000)

    expect(stateAfterReveal.revealed).toBe(true)
    expect(stateAfterReveal.history.length).toBeGreaterThan(0)

    ws.close()
  })

  test('reset limpa cartas mas mantém usuários', async () => {
    const room = `testroom-reset-${Date.now()}`
    const clientId = `test-${Date.now()}`
    const ws = new WebSocket(`ws://localhost:4000/?room=${room}`)

    await new Promise((res) => ws.on('open', res))

    // join
    ws.send(JSON.stringify({ type: 'join', clientId, name: 'TestUser', room }))
    await waitForState(ws, (s) => s.users.some((u) => u.id === clientId), 3000)

    // select
    ws.send(JSON.stringify({ type: 'action', action: 'select', clientId, card: 2, room }))
    await waitForState(ws, (s) => s.users.find((u) => u.id === clientId)?.card === 2, 3000)

    // reset
    ws.send(JSON.stringify({ type: 'action', action: 'reset', room }))

    const stateAfterReset = await waitForState(ws, (s) => s.users.find((u) => u.id === clientId)?.card === null, 3000)

    expect(stateAfterReset.users.find((u) => u.id === clientId)).toBeDefined()
    expect(stateAfterReset.users.find((u) => u.id === clientId).card).toBeNull()

    ws.close()
  })

  test('rename atualiza nome do usuário', async () => {
    const room = `testroom-rename-${Date.now()}`
    const clientId = `test-${Date.now()}`
    const ws = new WebSocket(`ws://localhost:4000/?room=${room}`)

    await new Promise((res) => ws.on('open', res))

    // join
    ws.send(JSON.stringify({ type: 'join', clientId, name: 'OldName', room }))
    await waitForState(ws, (s) => s.users.some((u) => u.id === clientId && u.name === 'OldName'), 3000)

    // rename
    ws.send(JSON.stringify({ type: 'action', action: 'rename', clientId, name: 'NewName', room }))

    const stateAfterRename = await waitForState(
      ws,
      (s) => s.users.find((u) => u.id === clientId)?.name === 'NewName',
      3000
    )

    expect(stateAfterRename.users.find((u) => u.id === clientId).name).toBe('NewName')

    ws.close()
  })
})
