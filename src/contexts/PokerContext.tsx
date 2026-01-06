/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { Room, User, Vote, CardValue } from '../types';

interface PokerContextType {
  currentUser: User | null;
  currentRoom: Room | null;
  setCurrentUser: (user: User | null) => void;
  createRoom: (roomName: string, userName: string) => void;
  joinRoom: (roomId: string, userName: string, isObserver: boolean) => void;
  leaveRoom: () => void;
  submitVote: (value: CardValue) => void;
  revealVotes: () => void;
  resetVotes: () => void;
  updateStory: (story: string) => void;
}

const PokerContext = createContext<PokerContextType | undefined>(undefined);

export const usePoker = () => {
  const context = useContext(PokerContext);
  if (!context) {
    throw new Error('usePoker must be used within a PokerProvider');
  }
  return context;
};

interface PokerProviderProps {
  children: ReactNode;
}

export const PokerProvider: React.FC<PokerProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);

  const generateId = () => {
    // Use crypto.randomUUID() for better uniqueness and security
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    // Fallback for environments without crypto.randomUUID()
    return Math.random().toString(36).substring(2, 11);
  };

  const createRoom = (roomName: string, userName: string) => {
    const userId = generateId();
    const roomId = generateId();
    
    const user: User = {
      id: userId,
      name: userName,
      isObserver: false,
    };

    const room: Room = {
      id: roomId,
      name: roomName,
      createdAt: Date.now(),
      users: [user],
      votes: [],
      revealed: false,
      currentStory: '',
    };

    setCurrentUser(user);
    setCurrentRoom(room);
  };

  const joinRoom = (roomId: string, userName: string, isObserver: boolean) => {
    const userId = generateId();
    
    const user: User = {
      id: userId,
      name: userName,
      isObserver,
    };

    // TODO: Backend Integration - Replace this mock with actual room fetching from backend
    // This should make an API call to fetch the room details from the server
    // Example: const room = await fetchRoom(roomId);
    const room: Room = {
      id: roomId,
      name: `Room ${roomId}`,
      createdAt: Date.now(),
      users: [user],
      votes: [],
      revealed: false,
      currentStory: '',
    };

    setCurrentUser(user);
    setCurrentRoom(room);
  };

  const leaveRoom = () => {
    setCurrentUser(null);
    setCurrentRoom(null);
  };

  const submitVote = (value: CardValue) => {
    if (!currentUser || !currentRoom || currentUser.isObserver) return;

    const existingVoteIndex = currentRoom.votes.findIndex(
      (vote) => vote.userId === currentUser.id
    );

    const newVote: Vote = {
      userId: currentUser.id,
      value,
      timestamp: Date.now(),
    };

    const updatedVotes = [...currentRoom.votes];
    if (existingVoteIndex >= 0) {
      updatedVotes[existingVoteIndex] = newVote;
    } else {
      updatedVotes.push(newVote);
    }

    setCurrentRoom({
      ...currentRoom,
      votes: updatedVotes,
    });
  };

  const revealVotes = () => {
    if (!currentRoom) return;
    setCurrentRoom({
      ...currentRoom,
      revealed: true,
    });
  };

  const resetVotes = () => {
    if (!currentRoom) return;
    setCurrentRoom({
      ...currentRoom,
      votes: [],
      revealed: false,
    });
  };

  const updateStory = (story: string) => {
    if (!currentRoom) return;
    setCurrentRoom({
      ...currentRoom,
      currentStory: story,
    });
  };

  return (
    <PokerContext.Provider
      value={{
        currentUser,
        currentRoom,
        setCurrentUser,
        createRoom,
        joinRoom,
        leaveRoom,
        submitVote,
        revealVotes,
        resetVotes,
        updateStory,
      }}
    >
      {children}
    </PokerContext.Provider>
  );
};
