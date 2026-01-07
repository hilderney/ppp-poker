import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import Table from './components/Table'
import Hand from './components/Hand'
import Results from './components/Results'
import { setCurrentUser, selectCardForCurrentUser, revealAll, resetTable, updateUserName, setState } from './store/roomSlice'
import { connectWS } from './wsClient'
import './index.css'

export default function App() {
  const dispatch = useDispatch()
  const EMPTY_ARRAY = React.useMemo(() => [], [])
  const hand = useSelector((s) => (s.room && s.room.hand) ? s.room.hand : EMPTY_ARRAY)
  const users = useSelector((s) => (s.room && s.room.users) ? s.room.users : EMPTY_ARRAY)
  const currentUserId = useSelector((s) => (s.room && s.room.currentUserId) ? s.room.currentUserId : null)
  const revealed = useSelector((s) => (s.room && typeof s.room.revealed !== 'undefined') ? s.room.revealed : false)

  React.useEffect(() => {
    // ensure currentUserId matches client id from localStorage if present
    try {
      const clientId = localStorage.getItem('ppp_client_id')
      if (clientId) dispatch(setCurrentUser(clientId))
    } catch (e) {
      // ignore
    }
  }, [dispatch])

  // connect to WebSocket server and sync state
  React.useEffect(() => {
    const clientId = localStorage.getItem('ppp_client_id')
    const name = users.find((u) => u.id === clientId)?.name || 'Você'
    const wsClient = connectWS({ clientId, name, onState: (s) => dispatch(setState(s)) })
    // expose for debugging and action sends
    try { window.wsClient = wsClient } catch (e) {}
    return () => { try { wsClient.close(); delete window.wsClient } catch (e) {} }
  }, [dispatch, users])

  function onSelect(card) {
    if (!currentUserId) return
    dispatch(selectCardForCurrentUser(card))
    try { window.wsClient && window.wsClient.sendAction({ action: 'select', clientId: currentUserId, card }) } catch (e) {}
  }

  function onReveal() {
    dispatch(revealAll())
    try { window.wsClient && window.wsClient.sendAction({ action: 'reveal' }) } catch (e) {}
  }

  function onReset() {
    dispatch(resetTable())
    try { window.wsClient && window.wsClient.sendAction({ action: 'reset' }) } catch (e) {}
  }

  // compute results across users when revealed
  let results = null
  const anyVoted = users.some((u) => u.card != null)
  if (revealed && anyVoted) {
    const votes = users.map((u) => u.card).filter((v) => v != null)
    const counts = {}
    const numeric = []
    votes.forEach((v) => {
      const key = String(v)
      counts[key] = (counts[key] || 0) + 1
      if (typeof v === 'number') numeric.push(v)
    })
    const avg = numeric.length ? numeric.reduce((a, b) => a + b, 0) / numeric.length : null
    let closest = null
    if (avg !== null) {
      let best = Infinity
      votes.forEach((v) => {
        const val = typeof v === 'number' ? v : null
        const diff = val !== null ? Math.abs(val - avg) : Infinity
        if (diff < best) {
          best = diff
          closest = v
        }
      })
    }
    results = { counts, avg, closest }
  }

  return (
    <div className="app">
      <header>
        <h1>PPP Poker — Alpha (multi-user local)</h1>
      </header>

      <main>

        <Table users={users} currentUserId={currentUserId} revealed={revealed} />

        <section className="controls">
          <div style={{ marginBottom: 8 }}>
            <label style={{ marginRight: 8 }}>Seu nome:</label>
            <input
              value={users.find((u) => u.id === currentUserId)?.name ?? ''}
              onChange={(e) => {
                const name = e.target.value
                dispatch(updateUserName({ id: currentUserId, name }))
                try { window.wsClient && window.wsClient.sendAction({ action: 'rename', clientId: currentUserId, name }) } catch (e) {}
              }}
              style={{ marginRight: 8 }}
            />
          </div>

          <Hand
            hand={hand}
            selected={users.find((u) => u.id === currentUserId)?.card}
            onSelect={onSelect}
            disabled={revealed || (users.find((u) => u.id === currentUserId)?.card != null)}
          />

          <div className="actions">
            <button onClick={onReveal} disabled={!anyVoted}>
              Revelar cartas
            </button>
            {revealed && (
              <button onClick={onReset} className="reset">
                Reiniciar mesa
              </button>
            )}
          </div>

          <Results results={revealed ? results : null} />
        </section>
      </main>

      <footer>
        <small>Fase Alfa: local multi-user simulation</small>
      </footer>
    </div>
  )
}
