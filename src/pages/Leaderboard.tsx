import TopBar from '@/components/TopBar';
import React from 'react';
import { Link } from 'react-router-dom';

/**
 * 
 * @todo Fetch data from server
 * @todo Sort by wins
 * @todo Add pages
 * @todo Add jump to my profile?
 * @todo styling
 */
const Leaderboard: React.FC = () => {
  return (
    <>
    <TopBar/>
      <h1>Leaderboard</h1>
      <table>
        <thead>
          <tr>
            <th>Rank</th><th>Name</th><th>Wins</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{1}</td><td><Link to={"/user/discovry"}>discovry</Link></td><td>3890</td>
          </tr>
          <tr>
            <td>{2}</td><td><Link to={"/user/noogai67"}>noogai67</Link></td><td>3889</td>
          </tr>
        </tbody>
      </table>
    </>
  );
};

export default Leaderboard;
