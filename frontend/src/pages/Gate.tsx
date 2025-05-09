"use client"

import type React from "react"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { login } from "@/utils/auth"
import { Moon, Sun, ChromeIcon as Google } from "lucide-react"

import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const Gate: React.FC = () => {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  })
  const [error, setError] = useState("")
  const navigate = useNavigate()
  const { setTheme } = useTheme()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      await login(credentials)
      navigate("/menu")
    } catch (err) {
      setError("Login failed. Please check your credentials.")
    }
  }

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:5000/auth/google/login" // Redirect to Google Login
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background text-foreground">

      {/* Centered Login Card */}
      <div className="w-full max-w-md px-4">
        <Card className="w-full border border-border bg-card text-card-foreground">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Login</CardTitle>
            <CardDescription className="text-center">Enter your credentials</CardDescription>
          </CardHeader>

          {error && (
            <div className="px-6 pb-4">
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </div>
          )}

          <form id="loginForm" onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username:</Label>
                <Input
                  id="username"
                  type="text"
                  name="username"
                  value={credentials.username}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password:</Label>
                <Input
                  id="password"
                  type="password"
                  name="password"
                  value={credentials.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </CardContent>
            <br/>

            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full text-white">
                Log in
              </Button>

              <div className="text-center text-sm text-muted-foreground">Or</div>

              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleLogin}
                className="w-full bg-white text-white hover:bg-gray-100 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600"
              >
                <Google className="mr-2 h-4 w-4" />
                Sign in with Google
              </Button>

              <div className="flex flex-col items-center gap-2 text-sm mt-4">
                <Link to="/signup" className="text-primary hover:underline transition-colors">
                  Create an Account
                </Link>
                <Link to="/change-password" className="text-primary hover:underline transition-colors">
                  Reset Password
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}

export default Gate
