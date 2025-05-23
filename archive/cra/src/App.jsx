import React from 'react';
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Gate from './pages/Gate';
import Game from "./pages/Game";
import Signup from "./pages/Signup";
import Leaderboard from "./pages/Leaderboard"
import User from "./pages/User";
import UserConfig from "./pages/UserConfig"
import NoMatch from "./pages/NoMatch"
//import PrivateRoute from './PrivateRoute';
import Menu from './pages/Menu';

const App = () => {
  return (
  <BrowserRouter>
    <div id="topBar">
      <Link to="/">
        <h1>Go back to Gate</h1>
      </Link>
    </div>
    <div id="body">      
      <Routes>
        <Route path="/" element={<Gate/>}/>
        <Route path='/leaderboard' element={<Leaderboard/>}/>
        <Route path='/signup' element={<Signup/>}/>

        <Route path='/menu' element={<Menu/>}/>
        <Route path='/game' element={<Game/>}/>
        <Route path="/user" element={<User/>}>
          <Route path=":userId" element={<UserConfig/>}/>
        </Route>

        <Route path="*" element={<NoMatch/>}/>
      </Routes>
      
    </div>
  </BrowserRouter>
  )
}

export default App