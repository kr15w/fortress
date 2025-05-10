"use client"

import type React from "react"

import { useLocation, Link, useNavigate } from "react-router-dom"
import { ThemeProvider } from "@/components/theme-provider"
import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import { Trophy, User, LogOut, Home } from "lucide-react"
import { useEffect, useState } from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Navigation buttons component that shows conditionally based on authentication
const NavigationButtons = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    // Check if user is authenticated and get userId from sessionStorage
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

  // Direct style to remove background
  const noBackgroundStyle = { background: "none" }

  return (
    <div className="fixed top-4 right-4 flex items-center gap-2 z-10">
      <TooltipProvider>
        {/* Always show theme toggle on all routes */}
            <div style={noBackgroundStyle}>
              <ModeToggle />
            </div>
  

        {/* Only show these buttons on protected routes */}
        {!isPublicRoute && (
          <>
            {/* Home button - redirects to menu */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" asChild aria-label="Home" style={noBackgroundStyle}>
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
                  <Button variant="ghost" size="icon" asChild aria-label="Profile" style={noBackgroundStyle}>
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
                <Button variant="ghost" size="icon" asChild aria-label="Leaderboard" style={noBackgroundStyle}>
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
                  aria-label="Logout"
                  style={noBackgroundStyle}
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

export default NavigationButtons