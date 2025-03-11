import React from 'react'
import { useParams, Outlet } from 'react-router-dom'

const User = () => {
  const {userId} = useParams();
  return (
    <>
    <section id="userProfile">
        <h2>Username: {userId} </h2>
        <h5>Register date:</h5>
        
        <hr/>
        <section id="userStats">
          <ul>
            <li>Total games played:</li>
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
          <div>Color</div>
        </div>
      </section>

    <Outlet/>
    </>
  )
}

export default User