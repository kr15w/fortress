import { BrowserRouter, Routes, Route } from "react-router-dom";
import Gate from "@/pages/Gate";
import Game from "@/pages/Game";
import Signup from "@/pages/Signup";
import Leaderboard from "@/pages/Leaderboard";
import User from "@/pages/User";
import UserConfig from "@/pages/UserConfig";
import NoMatch from "@/pages/NoMatch";
import License from "./pages/License";
import Menu from "@/pages/Menu";
import Profile from "@/pages/Profile";
import ChangePassword from "./pages/ResetPW";
import EditProfile from "@/pages/Edit"; // Import the new edit profile page
import { ThemeProvider } from "@/components/theme-provider";
import { ModeToggle } from "@/components/mode-toggle";

const App = () => {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="fixed top-4 right-4 flex items-center gap-2 z-10">
        <ModeToggle />
      </div>
      <BrowserRouter>  
        <Routes>
          <Route path="/" element={<Gate />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/profile/:userId" element={<Profile />} />
          <Route path="/profile/edit/:userId" element={<EditProfile />} /> 
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/license" element={<License />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/game" element={<Game />} />
          <Route path="/user" element={<User />}>
            <Route path=":userId" element={<UserConfig />} />
          </Route>
          <Route path="*" element={<NoMatch />} />
        </Routes>
      </BrowserRouter>    
    </ThemeProvider>
  );
};

export default App;