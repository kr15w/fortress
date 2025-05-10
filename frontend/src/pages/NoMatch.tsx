"use client"

import type React from "react"
import { Link } from "react-router-dom"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Home, ArrowLeft, Moon, Sun } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

/*
 *
 * @todo add easter eggs lol
 */
const NoMatch: React.FC = () => {
  const { setTheme } = useTheme()

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background text-foreground">
      {/* Theme Toggle in top right corner */}
      <div className="fixed top-4 right-4 flex items-center gap-2 z-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Toggle theme">
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

 

      <div className="w-full max-w-md px-4">
        <Card className="border border-border bg-card text-card-foreground shadow-md">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">
              <span className="text-5xl block mb-2">404</span>
              Oops! Page Not Found
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="relative w-64 h-64">
                <img
                  src="/placeholder.svg?height=320&width=320"
                  alt="Tung Tung Tung Sahur"
                  className="w-full h-full object-contain rounded-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src =
                      "https://tr.rbxcdn.com/180DAY-4c077d0d72a520f50e4180aef89c2ece/420/420/Hat/Webp/noFilter"
                  }}
                />
              </div>
            </div>              
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-orange-600 dark:from-orange-400 dark:to-orange-400">
                You shall not pass...
              </span>
            <br></br>
            <p className="text-muted-foreground mt-[20px]">The page you're looking for doesn't exist or has been moved.</p>
            <div className="py-2">

            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button variant="outline" asChild className="w-full">
              <Link to="/" className="flex items-center justify-center">
                <Home className="mr-2 h-4 w-4" />
                Return to Home
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link to="/leaderboard" className="flex items-center justify-center">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go to Leaderboard
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

export default NoMatch
