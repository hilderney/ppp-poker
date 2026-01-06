import React from 'react';
import { usePoker } from '../contexts/PokerContext';
import { calculateAverage, getMostCommonVote } from '../utils/voteUtils';
import './Results.css';

const Results: React.FC = () => {
  const { currentRoom } = usePoker();

  if (!currentRoom || !currentRoom.revealed) return null;

  const votesWithUsers = currentRoom.votes
    .map((vote) => {
      const user = currentRoom.users.find((u) => u.id === vote.userId);
      return { ...vote, userName: user?.name || 'Unknown', isObserver: user?.isObserver || false };
    })
    .filter((vote) => !vote.isObserver)
    .sort((a, b) => {
      const aNum = Number(a.value);
      const bNum = Number(b.value);
      if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
      if (!isNaN(aNum)) return -1;
      if (!isNaN(bNum)) return 1;
      return 0;
    });

  const average = calculateAverage(currentRoom.votes, currentRoom.users);
  const mostCommon = getMostCommonVote(currentRoom.votes, currentRoom.users);

  const voteDistribution: { [key: string]: number } = {};
  votesWithUsers.forEach((vote) => {
    if (vote.value) {
      voteDistribution[vote.value] = (voteDistribution[vote.value] || 0) + 1;
    }
  });

  return (
    <div className="results-container">
      <h2>Voting Results</h2>

      <div className="results-summary">
        <div className="summary-card">
          <div className="summary-label">Average</div>
          <div className="summary-value">{average > 0 ? average : 'N/A'}</div>
        </div>
        <div className="summary-card">
          <div className="summary-label">Most Common</div>
          <div className="summary-value">{mostCommon || 'N/A'}</div>
        </div>
        <div className="summary-card">
          <div className="summary-label">Total Votes</div>
          <div className="summary-value">{votesWithUsers.length}</div>
        </div>
      </div>

      <div className="votes-chart">
        <h3>Vote Distribution</h3>
        <div className="chart-bars">
          {Object.entries(voteDistribution).map(([value, count]) => {
            const maxCount = Math.max(...Object.values(voteDistribution));
            const percentage = (count / maxCount) * 100;
            return (
              <div key={value} className="chart-bar-container">
                <div className="chart-label">{value}</div>
                <div className="chart-bar-wrapper">
                  <div
                    className="chart-bar"
                    style={{ width: `${percentage}%` }}
                  >
                    <span className="chart-count">{count}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="individual-votes">
        <h3>Individual Votes</h3>
        <div className="votes-list">
          {votesWithUsers.map((vote, index) => (
            <div key={index} className="vote-item">
              <span className="vote-user">{vote.userName}</span>
              <span className="vote-value-display">{vote.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Results;
