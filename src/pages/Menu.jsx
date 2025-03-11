import React from 'react'

const Menu = () => {
  return (
    <>
      <h1>Menu</h1>
      <Link to="/leaderboard">View leaderboard</Link>

      <section id="userProfile">
        <h2>Username</h2>
        <h5>Register date:</h5>
        <button>Edit profile (appear only when this is your page)</button>
        <hr/>
        <section id="userStats">
          <ul>
            <li></li>
            <li>Total games player:</li>
            <li>Wins:</li>
            <li>Total shields placed:</li>
            <li>Total bombs placed:</li>
            <li>Rank:</li>
          </ul>
        </section>
        <div>
          <h2>Customize character lol</h2>
          <div>Hats</div>
          <div>Torso</div>
        </div>
      </section>
    </>
  )
}

export default Menu