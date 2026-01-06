import React, { useState } from 'react';
import { usePoker } from '../contexts/PokerContext';
import './Home.css';

const Home: React.FC = () => {
  const { createRoom, joinRoom } = usePoker();
  const [mode, setMode] = useState<'create' | 'join' | null>(null);
  const [roomName, setRoomName] = useState('');
  const [userName, setUserName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [isObserver, setIsObserver] = useState(false);

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomName.trim() && userName.trim()) {
      createRoom(roomName, userName);
    }
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomId.trim() && userName.trim()) {
      joinRoom(roomId, userName, isObserver);
    }
  };

  const resetForm = () => {
    setMode(null);
    setRoomName('');
    setUserName('');
    setRoomId('');
    setIsObserver(false);
  };

  return (
    <div className="home-container">
      <div className="home-content">
        <h1 className="home-title">Planning Poker</h1>
        <p className="home-subtitle">
          Agile estimation tool for teams to collaboratively estimate story points
        </p>

        {!mode ? (
          <div className="mode-selection">
            <button
              className="mode-button create-button"
              onClick={() => setMode('create')}
            >
              <div className="button-icon">+</div>
              <div className="button-text">Create Room</div>
            </button>
            <button
              className="mode-button join-button"
              onClick={() => setMode('join')}
            >
              <div className="button-icon">→</div>
              <div className="button-text">Join Room</div>
            </button>
          </div>
        ) : mode === 'create' ? (
          <form className="room-form" onSubmit={handleCreateRoom}>
            <h2>Create a New Room</h2>
            <input
              type="text"
              placeholder="Room Name"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              className="form-input"
              required
            />
            <input
              type="text"
              placeholder="Your Name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="form-input"
              required
            />
            <div className="form-actions">
              <button type="submit" className="submit-button">
                Create Room
              </button>
              <button
                type="button"
                className="cancel-button"
                onClick={resetForm}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <form className="room-form" onSubmit={handleJoinRoom}>
            <h2>Join a Room</h2>
            <input
              type="text"
              placeholder="Room ID"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="form-input"
              required
            />
            <input
              type="text"
              placeholder="Your Name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="form-input"
              required
            />
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={isObserver}
                onChange={(e) => setIsObserver(e.target.checked)}
              />
              <span>Join as Observer (can't vote)</span>
            </label>
            <div className="form-actions">
              <button type="submit" className="submit-button">
                Join Room
              </button>
              <button
                type="button"
                className="cancel-button"
                onClick={resetForm}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Home;
