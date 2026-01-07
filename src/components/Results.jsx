import React from 'react'

export default function Results({ results }) {
  if (!results) return null
  return (
    <div className="results">
      <h3>Resultados</h3>
      <div>Contagens por valor:</div>
      <ul>
        {Object.entries(results.counts).map(([k, v]) => (
          <li key={k}>{k}: {v} voto(s)</li>
        ))}
      </ul>
      <div>Média (valores numéricos): {results.avg !== null ? results.avg.toFixed(2) : '—'}</div>
      <div>Mais próximo da média: {results.closest ?? '—'}</div>
    </div>
  )
}
