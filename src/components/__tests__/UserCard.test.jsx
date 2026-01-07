import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import UserCard from '../UserCard'

test('shows placeholder when no vote', () => {
  render(<UserCard value={null} showValue={false} hasVoted={false} />)
  expect(screen.getByText('(vazio)')).toBeInTheDocument()
})

test('shows Votou when voted but not revealed', () => {
  render(<UserCard value={5} showValue={false} hasVoted={true} />)
  expect(screen.getByText('Votou')).toBeInTheDocument()
})

test('shows value when revealed', () => {
  render(<UserCard value={8} showValue={true} hasVoted={true} />)
  expect(screen.getByText('8')).toBeInTheDocument()
})
