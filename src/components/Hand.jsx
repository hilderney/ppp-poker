import React from 'react'

export default function Hand({ hand, selected, onSelect, disabled }) {
  return (
    <div className="hand">
      <div className="hand-label">Sua mão</div>
      <div className="cards">
        {hand.map((c) => (
          <button
            key={String(c)}
            className={`hand-card ${selected === c ? 'selected' : ''}`}
            onClick={() => onSelect(c)}
            disabled={disabled}
          >
            {String(c)}
          </button>
        ))}
      </div>
    </div>
  )
}
