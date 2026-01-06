import type { CardValue, Vote, User } from '../types';

export const calculateAverage = (votes: Vote[], users: User[]): number => {
  const numericVotes = votes
    .filter((vote) => {
      const user = users.find((u) => u.id === vote.userId);
      return !user?.isObserver && vote.value && !isNaN(Number(vote.value));
    })
    .map((vote) => Number(vote.value));

  if (numericVotes.length === 0) return 0;

  const sum = numericVotes.reduce((acc, val) => acc + val, 0);
  return Math.round((sum / numericVotes.length) * 10) / 10;
};

export const getMostCommonVote = (votes: Vote[], users: User[]): CardValue | null => {
  const validVotes = votes.filter((vote) => {
    const user = users.find((u) => u.id === vote.userId);
    return !user?.isObserver && vote.value;
  });

  if (validVotes.length === 0) return null;

  const voteCounts: { [key: string]: number } = {};
  validVotes.forEach((vote) => {
    if (vote.value) {
      voteCounts[vote.value] = (voteCounts[vote.value] || 0) + 1;
    }
  });

  let maxCount = 0;
  let mostCommon: CardValue | null = null;

  Object.entries(voteCounts).forEach(([value, count]) => {
    if (count > maxCount) {
      maxCount = count;
      mostCommon = value as CardValue;
    }
  });

  return mostCommon;
};

export const allVotedExceptObservers = (votes: Vote[], users: User[]): boolean => {
  const votingUsers = users.filter((user) => !user.isObserver);
  
  // Create a Set of voted user IDs for O(n+m) performance instead of O(n*m)
  const votedUserIds = new Set(
    votes
      .filter((vote) => vote.value !== null)
      .map((vote) => vote.userId)
  );
  
  return votingUsers.every((user) => votedUserIds.has(user.id));
};
