import React from 'react'
import { Link } from 'react-router-dom'

const Signup = () => {
  return (
    <>
        <h1>Signup</h1>
        <form id="loginForm">
            <h2>Get a new account!</h2>
            <label>Your name (You can change it later):</label>
            <input type='text' name="username"></input><br/>

            <label for="password">Password:</label>
            <input type='password' name="password"></input><br/>

            <label for="passwordConfirm">Type it again:</label>
            <input type='password' name="passwordConfirm"></input><br/>

            <label for="licenseKey">License key (find it in your email?):</label>
            <input type='text' name='licenseKey'></input><hr/>

            <input type='submit' value="Get account" method="POST"/>
        </form>
        <Link to="/">Go back</Link><br/>
    </>
  )
}

export default Signup