import React from 'react';
import type { CardValue } from '../types';
import './PokerCard.css';

interface PokerCardProps {
  value: CardValue;
  selected: boolean;
  revealed?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

const PokerCard: React.FC<PokerCardProps> = ({
  value,
  selected,
  revealed = false,
  onClick,
  disabled = false,
}) => {
  return (
    <button
      className={`poker-card ${selected ? 'selected' : ''} ${
        revealed ? 'revealed' : ''
      } ${disabled ? 'disabled' : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      <span className="card-value">{value}</span>
    </button>
  );
};

export default PokerCard;
