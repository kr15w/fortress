import React from 'react'
import { Link } from "react-router-dom"
const Home = () => {
  return (
    <>
        <h1>Home, all users can see this page</h1>
        
        <form id="loginForm">
            <h2>Login</h2>
            <input type='text'></input><br/>
            <input type='password'></input><br/>
            <input type="submit" value="Log in"/>
        </form>
        <p>Or <button>Sign up with google</button></p>
        
        <Link to="/signup">Get an account</Link><br/>

        {/*<Link to={"/game"}>Play le game lmaolmaolmao</Link> <br/>*/}
        <Link to={"/leaderboard"}>See leaderboard</Link><br/>
    </>
  )
}

export default Home