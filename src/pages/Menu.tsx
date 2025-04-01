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
    </>
  );
};

export default Menu;
