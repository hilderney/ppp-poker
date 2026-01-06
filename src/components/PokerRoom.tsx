import React, { useState } from 'react';
import { usePoker } from '../contexts/PokerContext';
import type { CardValue } from '../types';
import PokerCard from './PokerCard';
import Results from './Results';
import './PokerRoom.css';

const CARD_VALUES: CardValue[] = ['0', '1', '2', '3', '5', '8', '13', '21', '34', '55', '89', '?', '☕'];

const PokerRoom: React.FC = () => {
  const {
    currentUser,
    currentRoom,
    leaveRoom,
    submitVote,
    revealVotes,
    resetVotes,
    updateStory,
  } = usePoker();

  const [storyInput, setStoryInput] = useState('');

  if (!currentUser || !currentRoom) return null;

  const currentVote = currentRoom.votes.find(
    (vote) => vote.userId === currentUser.id
  );

  const votingUsers = currentRoom.users.filter((user) => !user.isObserver);
  const votedCount = currentRoom.votes.filter((vote) => {
    const user = currentRoom.users.find((u) => u.id === vote.userId);
    return !user?.isObserver && vote.value !== null;
  }).length;

  const allVoted = votingUsers.length > 0 && votedCount === votingUsers.length;

  const handleCardClick = (value: CardValue) => {
    if (!currentUser.isObserver && !currentRoom.revealed) {
      submitVote(value);
    }
  };

  const handleReveal = () => {
    revealVotes();
  };

  const handleReset = () => {
    resetVotes();
    setStoryInput('');
    updateStory('');
  };

  const handleStoryUpdate = () => {
    if (storyInput.trim()) {
      updateStory(storyInput);
    }
  };

  return (
    <div className="poker-room">
      <div className="room-header">
        <div className="room-info">
          <h1>{currentRoom.name}</h1>
          <p className="room-id">Room ID: {currentRoom.id}</p>
        </div>
        <button className="leave-button" onClick={leaveRoom}>
          Leave Room
        </button>
      </div>

      <div className="story-section">
        <div className="story-input-group">
          <input
            type="text"
            placeholder="Enter story or task to estimate..."
            value={storyInput}
            onChange={(e) => setStoryInput(e.target.value)}
            className="story-input"
            disabled={currentRoom.revealed}
          />
          <button
            className="story-button"
            onClick={handleStoryUpdate}
            disabled={currentRoom.revealed || !storyInput.trim()}
          >
            Update
          </button>
        </div>
        {currentRoom.currentStory && (
          <div className="current-story">
            <strong>Current Story:</strong> {currentRoom.currentStory}
          </div>
        )}
      </div>

      <div className="participants-section">
        <h2>Participants ({currentRoom.users.length})</h2>
        <div className="participants-list">
          {currentRoom.users.map((user) => {
            const userVote = currentRoom.votes.find((v) => v.userId === user.id);
            const hasVoted = userVote?.value !== null;
            return (
              <div key={user.id} className="participant">
                <span className="participant-name">
                  {user.name}
                  {user.isObserver && ' (Observer)'}
                  {user.id === currentUser.id && ' (You)'}
                </span>
                {!user.isObserver && (
                  <span className={`vote-status ${hasVoted ? 'voted' : ''}`}>
                    {hasVoted ? '✓' : '○'}
                  </span>
                )}
              </div>
            );
          })}
        </div>
        {!currentUser.isObserver && (
          <div className="vote-progress">
            Votes: {votedCount} / {votingUsers.length}
          </div>
        )}
      </div>

      {!currentRoom.revealed ? (
        <>
          {!currentUser.isObserver && (
            <div className="cards-section">
              <h2>Select Your Card</h2>
              <div className="cards-grid">
                {CARD_VALUES.map((value) => (
                  <PokerCard
                    key={value}
                    value={value}
                    selected={currentVote?.value === value}
                    onClick={() => handleCardClick(value)}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="actions-section">
            <button
              className="reveal-button"
              onClick={handleReveal}
              disabled={!allVoted}
            >
              {allVoted ? 'Reveal Votes' : 'Waiting for all votes...'}
            </button>
          </div>
        </>
      ) : (
        <>
          <Results />
          <div className="actions-section">
            <button className="reset-button" onClick={handleReset}>
              Start New Round
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default PokerRoom;
