import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from './pages/Home';
import Game from "./pages/Game"
const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path='/game' element={<Game/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App