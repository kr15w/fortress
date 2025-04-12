import React from 'react';
import { Link } from 'react-router-dom';
import TopBar from '@/components/TopBar';

const Menu: React.FC = () => {
  return (
    <>
    <TopBar/>
      <h1>Menu</h1>
      <Link to="/leaderboard">View leaderboard</Link><br/>
      <Link to="/game">Start a game</Link><br/>
      <Link to="/game">Join a game</Link><br/>
      {/* DEV ONLY - REMOVE IN PRODUCTION */}
      <div style={{color: 'red', fontStyle: 'italic'}}>
        DEV ONLY: <a href="/api/token" target="_blank" rel="noopener noreferrer">Get API Token</a>
      </div>
      {/* DEV ONLY - REMOVE IN PRODUCTION */}
      <div style={{color: 'red', fontStyle: 'italic'}}>
        DEV ONLY: <a href="/api/match_demo" target="_blank" rel="noopener noreferrer">Match Demo</a>
      </div>
    </>
  );
};

export default Menu;
