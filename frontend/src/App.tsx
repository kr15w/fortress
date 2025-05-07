"use client"

import { BrowserRouter, Routes, Route, useLocation, Link, useNavigate } from "react-router-dom"
import ProtectedRoute from "@/components/ProtectedRoute"
import Gate from "@/pages/Gate"
import Signup from "@/pages/Signup"
import License from "./pages/License"
import Profile from "@/pages/Profile"
import EditProfile from "@/pages/Edit"
import BattleHistory from "@/pages/BattleHistory"
import ChangePassword from "./pages/ResetPW"
import Menu from "@/pages/Menu"
import Game from "@/pages/Game"
import AccountBanned from "./pages/AccountBanned"
import NoMatch from "@/pages/NoMatch"
import Leaderboard from "@/pages/Leaderboard"
import Processing from "./pages/Processing"
import { ThemeProvider } from "@/components/theme-provider"
import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import { Trophy, User, LogOut, Home } from "lucide-react"
import { useEffect, useState } from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const NavigationButtons = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    // Check if user authenticated, get userId from sessionStorage
    const checkAuth = async () => {
      try {
        // Get userId from sessionStorage
        const storedUserId = sessionStorage.getItem("userId")
        if (storedUserId) {
          setUserId(storedUserId)
        }
      } catch (error) {
        console.error("Error fetching user ID:", error)
      }
    }

    checkAuth()
  }, [location.pathname])

  // Handle logout
  const handleLogout = () => {
    // Clear all sessionStorage
    sessionStorage.clear()
    // Redirect to gate
    navigate("/")
  }

  // Public routes where we only want to show the theme toggle
  const publicRoutes = ["/", "/signup", "/license", "/account-banned", "/change-password", "/processing"]
  const isPublicRoute = publicRoutes.includes(location.pathname)

  // Custom button style for transparent background
  const buttonStyle = "hover:bg-transparent focus:bg-transparent active:bg-transparent"

  return (
    <div className="fixed top-4 right-4 flex items-center gap-2 z-10">
      <TooltipProvider>
        {/* Only show these buttons on protected routes */}
        {!isPublicRoute && (
          <>
            {/* Home button - redirects to menu */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  asChild
                  aria-label="Home"
                  className={`bg-transparent ${buttonStyle}`}
                >
                  <Link to="/menu">
                    <Home className="h-5 w-5" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Home</p>
              </TooltipContent>
            </Tooltip>

            {/* Profile button */}
            {userId && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    asChild
                    aria-label="Profile"
                    className={`bg-transparent ${buttonStyle}`}
                  >
                    <Link to={`/profile/${userId}`}>
                      <User className="h-5 w-5" />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Profile</p>
                </TooltipContent>
              </Tooltip>
            )}

            {/* Leaderboard button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  asChild
                  aria-label="Leaderboard"
                  className={`bg-transparent ${buttonStyle}`}
                >
                  <Link to="/leaderboard">
                    <Trophy className="h-5 w-5" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Leaderboard</p>
              </TooltipContent>
            </Tooltip>

            {/* Logout button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  asChild
                  aria-label="Logout"
                  className={`bg-transparent ${buttonStyle}`}
                >
                  <LogOut className="h-5 w-5 text-red-500" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Logout</p>
              </TooltipContent>
            </Tooltip>
          </>
        )}
      </TooltipProvider>
    </div>
  )
}

const App = () => {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <BrowserRouter>
        <NavigationButtons />
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
  )
}

export default App
