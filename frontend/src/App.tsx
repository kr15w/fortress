import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute";  
import Gate from "@/pages/Gate";
import Signup from "@/pages/Signup";
import License from "./pages/License";
import Profile from "@/pages/Profile";
import EditProfile from "@/pages/Edit";
import BattleHistory from "@/pages/BattleHistory";
import ChangePassword from "./pages/ResetPW";
import Menu from "@/pages/Menu";
import Game from "@/pages/Game";
import AccountBanned from "./pages/AccountBanned";
import NoMatch from "@/pages/NoMatch";
import Leaderboard from "@/pages/Leaderboard";
import Processing from "./pages/Processing";
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
          {/* Public Pages */}
          <Route path="/" element={<Gate />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/license" element={<License />} />
          <Route path="/account-banned" element={<AccountBanned />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/processing" element={<Processing />} />
          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/profile/:userId" element={<Profile />} />
            <Route path="/profile/edit/:userId" element={<EditProfile />} /> 
            <Route path="/menu" element={<Menu />} />
            <Route path="/game" element={<Game />} />
            <Route path="/battle-history/:userId" element={<BattleHistory />} />  
          </Route>
          {/* Fallback Route */}
          <Route path="*" element={<NoMatch />} />
        </Routes>
      </BrowserRouter>    
    </ThemeProvider>
  );
};

export default App;
