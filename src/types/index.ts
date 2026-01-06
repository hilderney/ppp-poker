export type CardValue = '0' | '1' | '2' | '3' | '5' | '8' | '13' | '21' | '34' | '55' | '89' | '?' | '☕';

export interface User {
  id: string;
  name: string;
  isObserver: boolean;
}

export interface Vote {
  userId: string;
  value: CardValue | null;
  timestamp: number;
}

export interface Room {
  id: string;
  name: string;
  createdAt: number;
  users: User[];
  votes: Vote[];
  revealed: boolean;
  currentStory: string;
}

export type RoomState = 'lobby' | 'voting' | 'results';
