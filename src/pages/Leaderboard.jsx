import React from 'react'
import { Link } from 'react-router-dom'

const Leaderboard = () => {
  return (
    <>
      <h1>Leaderboard</h1>
      <table>
        <tr>
          <th>Rank</th><th>Name</th><th>Wins</th>
        </tr>
        <tr>
          <td>{1}</td><td><Link to={"user/discovry"}>discovry</Link></td><td>3890</td>
        </tr>
        <tr>
          <td>{2}</td><td><Link to={"user/noogai67"}>noogai67</Link></td><td>3889</td>
        </tr>
      </table>
    </>
  )
}

export default Leaderboard