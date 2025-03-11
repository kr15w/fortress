import React from 'react'
import { Link } from "react-router-dom"
const Home = () => {
  return (
    <>
        <h1>Home, all users can see this page</h1>
        
        <form id="loginForm">
            <h2>Login</h2>
            <input type='text'></input>
            <input type='password'></input>
        </form>
        <a>New account</a>

        <Link to={"/game"}>Play le game lmaolmaolmao</Link>
        <Link to={"/leaderboard"}>See leaderboard</Link>
    </>
  )
}

export default Home