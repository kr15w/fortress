import React from 'react';
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Home from './pages/Home';
import Game from "./pages/Game";
import Signup from "./pages/Signup";
import Leaderboard from "./pages/Leaderboard"

const App = () => {
  return (
  <BrowserRouter>
    <div id="topBar">
      <Link to="/">
        <h1>Go back to home</h1>
      </Link>
    </div>
    <div id="body">
      {
        /*<Routes>
  <Route index element={<Home />} />
  <Route path="about" element={<About />} />

  <Route element={<AuthLayout />}>
    <Route path="login" element={<Login />} />
    <Route path="register" element={<Register />} />
  </Route>

  <Route path="concerts">
    <Route index element={<ConcertsHome />} />
    <Route path=":city" element={<City />} />
    <Route path="trending" element={<Trending />} />
  </Route>
</Routes>
*/}
      
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path='/game' element={<Game/>}/>
        <Route path='/leaderboard' element={<Leaderboard/>}/>
        <Route path='/signup' element={<Signup/>}/>
      </Routes>
    </div>
  </BrowserRouter>
  )
}

export default App