"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Link, useNavigate } from "react-router-dom"
import { login } from "@/utils/auth"
import { ChromeIcon as Google } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

declare global {
  interface Window {
    turnstile?: {
      render: (selector: string, options: { sitekey: string; callback: (token: string) => void }) => string
      reset: (widgetId: string) => void
      remove: (widgetId: string) => void
    }
    onloadTurnstileCallback?: () => void
  }
}

const GATE_SITE_KEY = "0x4AAAAAABcva8kH45Bm2f67"
const VERIFICATION_DELAY = 2500

const Gate: React.FC = () => {
  const [credentials, setCredentials] = useState({ username: "", password: "" })
  const [error, setError] = useState("")
  const [botVerified, setBotVerified] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [scriptLoaded, setScriptLoaded] = useState(false)
  const widgetIdRef = useRef<string>("")
  const turnstileContainerRef = useRef<HTMLDivElement>(null)
  const verificationTimerRef = useRef<NodeJS.Timeout | null>(null)

  const navigate = useNavigate()
  const { setTheme } = useTheme()

  // Check for existing token on mount
  useEffect(() => {
    const existingToken = localStorage.getItem("turnstile_token")
    if (existingToken) {
      setBotVerified(true)
    }
  }, [])

  // Define the callback function in the global scope before loading the script
  useEffect(() => {
    // Define the callback in the global scope
    window.onloadTurnstileCallback = () => {
      console.log("Turnstile script loaded successfully")
      setScriptLoaded(true)
      setIsLoading(false)
    }

    return () => {
      // Clean up callback on unmount
      delete window.onloadTurnstileCallback
    }
  }, [])

  // Load Turnstile script
  useEffect(() => {
    // Only load if not already verified
    if (!botVerified) {
      setIsLoading(true)

      // Check if script already exists
      const existingScript = document.querySelector('script[src*="turnstile/v0/api.js"]')

      if (!existingScript) {
        const turnstileScript = document.createElement("script")
        turnstileScript.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstileCallback"
        turnstileScript.async = true
        turnstileScript.defer = true

        document.head.appendChild(turnstileScript)

        return () => {
          if (document.head.contains(turnstileScript)) {
            document.head.removeChild(turnstileScript)
          }
        }
      } else {
        // Script already exists
        setScriptLoaded(true)
        setIsLoading(false)
      }
    }
  }, [botVerified])

  // Initialize or re-initialize Turnstile when script is loaded
  useEffect(() => {
    if (scriptLoaded && turnstileContainerRef.current && !botVerified) {
      // Clean up previous widget if it exists
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.reset(widgetIdRef.current)
          window.turnstile.remove(widgetIdRef.current)
        } catch (e) {
          console.error("Error cleaning up previous Turnstile widget:", e)
        }
        widgetIdRef.current = ""
      }

      // Re-render the widget
      renderTurnstileWidget()
    }

    return () => {
      // Clean up on unmount
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current)
        } catch (e) {
          console.error("Error removing Turnstile widget:", e)
        }
      }

      // Clear any pending timers
      if (verificationTimerRef.current) {
        clearTimeout(verificationTimerRef.current)
      }
    }
  }, [scriptLoaded, botVerified])

  const renderTurnstileWidget = () => {
    if (!window.turnstile || !turnstileContainerRef.current) {
      setIsLoading(true)
      console.error("Turnstile not available or container not found")
      return
    }

    setIsLoading(true)

    try {
      // Clear the container first
      if (turnstileContainerRef.current) {
        turnstileContainerRef.current.innerHTML = ""
      }

      // Render new widget
      widgetIdRef.current = window.turnstile.render("#turnstile-container", {
        sitekey: GATE_SITE_KEY,
        callback: (token: string) => {
          console.log(`Challenge Success: ${token}`)
          localStorage.setItem("turnstile_token", token)
          setIsLoading(false)

          // Set a timer to show the login form after delay
          // Keep showing the Turnstile widget during this time
          if (verificationTimerRef.current) {
            clearTimeout(verificationTimerRef.current)
          }

          verificationTimerRef.current = setTimeout(() => {
            setBotVerified(true)
          }, VERIFICATION_DELAY)
        },
      })
    } catch (e) {
      console.error("Error rendering Turnstile widget:", e)
      setError("Failed to load verification. Please refresh the page.")
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      await login(credentials)
      navigate("/menu")
    } catch (err) {
      if (err === 403) {
        navigate("account-banned")
    }
    else{
        setError("Invalid username or password. Please try again.")
      }
    }
  }

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:5000/auth/google/login" // Redirect to Google Login
  }

  const resetVerification = () => {
    // This is only used for verification errors, not login errors
    localStorage.removeItem("turnstile_token")
    setBotVerified(false)
    renderTurnstileWidget()
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background text-foreground">
      <div className="w-full max-w-md px-4">
        <Card className="w-full border border-border bg-card text-card-foreground">
          <CardHeader>
            <CardTitle className="text-2xl text-center">{botVerified ? "Login" : "Human Verification"}</CardTitle>
            <CardDescription className="text-center">
              {botVerified ? "Enter your credentials" : "Please complete the verification below"}
            </CardDescription>
          </CardHeader>

          {error && (
            <div className="px-6 pb-4">
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
                {error.includes("verification") && (
                  <Button variant="outline" size="sm" className="mt-2" onClick={resetVerification}>
                    Try Again
                  </Button>
                )}
              </Alert>
            </div>
          )}

          {!botVerified ? (
            <CardContent className="flex flex-col items-center justify-center py-8">
              <div id="turnstile-container" ref={turnstileContainerRef} className="mx-auto"></div>
            </CardContent>
          ) : (
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

              <CardFooter className="flex flex-col gap-4">
                <br />
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
          )}
        </Card>
      </div>
    </div>
  )
}

export default Gate
