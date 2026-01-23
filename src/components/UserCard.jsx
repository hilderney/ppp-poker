import React from 'react'

export default function UserCard({ value, active, showValue = false, hasVoted = false }) {
  return (
    <div className={`card ${active ? 'active' : ''} ${hasVoted && !showValue ? 'voted' : ''}`}>
      <div className="card-value">{showValue ? String(value ?? '—') : hasVoted ? 'Votou' : '(vazio)'}</div>
    </div>
  )
}
