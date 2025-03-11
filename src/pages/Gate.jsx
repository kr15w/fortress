import React from 'react'
import { Link } from "react-router-dom"
const Gate = () => {
  return (
    <>
        <h1>Gate, all users can see this page</h1>
        
        <form id="loginForm">
            <h2>Login</h2>
            <input type='text'></input><br/>
            <input type='password'></input><br/>
            <input type="submit" value="Log in"/>
        </form>
        <p>Or <button>Sign in with google</button></p>
        
        <Link to="/menu">Pretend you logged in.</Link><br/>
        <Link to="/signup">Get an account</Link><br/>

        {/*<Link to={"/game"}>Play le game lmaolmaolmao</Link> <br/>*/}
        <Link to={"/leaderboard"}>See leaderboard</Link><br/>
    </>
  )
}

export default Gate