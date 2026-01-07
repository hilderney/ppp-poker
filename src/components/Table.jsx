import React from 'react'
import UserCard from './UserCard'

export default function Table({ users = [], currentUserId = null, revealed = false }) {
  return (
    <section className="table">
      {users.length === 0 && <div className="slot-empty">Nenhum usuário na mesa</div>}
      {users.map((u) => (
        <div className="slot" key={u.id}>
          <div className="slot-label">{u.name}</div>
          <UserCard
            value={u.card}
            active={u.id === currentUserId}
            showValue={revealed || u.id === currentUserId}
            hasVoted={u.card != null}
          />
        </div>
      ))}
    </section>
  )
}
