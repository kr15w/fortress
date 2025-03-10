import React from 'react'
import {Link } from "react-router-dom"
const Home = () => {
  return (
    <>
        <div>Home, all users can see this page</div>
        <a>See leaderboard</a>
        <div>
            Login
            <input type='text'></input>
            <input type='password'></input>
        </div>
        <a>New account</a>

        <Link to={"/game"}>Play le game lmaolmaolmao</Link>
    </>
  )
}

export default Home