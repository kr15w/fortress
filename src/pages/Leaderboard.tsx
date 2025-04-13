import React, { useState, useEffect } from 'react';
import TopBar from '@/components/TopBar';
import '../Leaderboard.css';
/**
 * 
 * @todo Fetch data from server (Done)
 * @todo Sort by wins (Done)
 * @todo Add pages (Done)
 * @todo Add jump to my profile?
 * @todo styling (Done)
 */

type UserStats = {
  username: string;
  win_count: number;
  loss_count: number;
  total_bomb_count: number;
  total_shield_count: number;
};

const UserStatsTable: React.FC = () => {
  const [userStats, setUserStats] = useState<UserStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const response = await fetch('/api/user-stats'); // Fetch data from backend
        const data = await response.json();
        // Sort data by win_count in descending order
        const sortedData = data.sort((a: UserStats, b: UserStats) => b.win_count - a.win_count);
        // Limit to top 20 players
        const topPlayers = sortedData.slice(0, 20);
        setUserStats(topPlayers);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user stats:', error);
        setLoading(false);
      }
    };

    fetchUserStats();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <TopBar />
      <h1>Top 20 Players</h1>
      <table>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Username</th>
            <th>Win Count</th>
            <th>Loss Count</th>
            <th>Bomb Count</th>
            <th>Shield Count</th>
          </tr>
        </thead>
        <tbody>
          {userStats.map((user, index) => (
            <tr key={index}>
              <td>{index + 1}</td> {/* Display rank based on position */}
              <td>{user.username}</td>
              <td>{user.win_count}</td>
              <td>{user.loss_count}</td>
              <td>{user.total_bomb_count}</td>
              <td>{user.total_shield_count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

export default UserStatsTable;


