import React from 'react'

const Signup = () => {
  return (
    <>
        <h1>Signup</h1>
        <form id="loginForm">
            <h2>Get a new account!</h2>
            <label>Your name (You can change it later):</label>
            <input type='text' name="username"></input>

            <label for="password">Password:</label>
            <input type='password' name="password"></input>

            <label for="passwordConfirm">Type it again:</label>
            <input type='password' name="passwordConfirm"></input>

            <label for="licenseKey">License key (find it in your email?):</label>
            <input type='text' name='licenseKey'></input>
        </form>
    </>
  )
}

export default Signup