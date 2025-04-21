import { BrowserRouter, Routes, Route } from "react-router-dom";
import Gate from '@/pages/Gate';
import Game from "@/pages/Game";
import Signup from "@/pages/Signup";
import Leaderboard from "@/pages/Leaderboard"
import User from "@/pages/User";
import UserConfig from "@/pages/UserConfig"
import NoMatch from "@/pages/NoMatch"
//import PrivateRoute from './PrivateRoute';
import Menu from "@/pages/Menu";
import Profile from "@/pages/Profile";

const App = () => {
  return (
  <BrowserRouter>  
      <Routes>
        <Route path="/" element={<Gate/>}/>
        <Route path='/leaderboard' element={<Leaderboard/>}/>
        <Route path='/signup' element={<Signup/>}/>
        <Route path="/profile/:userId" element={<Profile />} />
        <Route path='/menu' element={<Menu/>}/>
        <Route path='/game' element={<Game/>}/>
        <Route path="/user" element={<User/>}>
          <Route path=":userId" element={<UserConfig/>}/>
        </Route>

        <Route path="*" element={<NoMatch/>}/>
      </Routes>
  </BrowserRouter>
  )
}

export default App