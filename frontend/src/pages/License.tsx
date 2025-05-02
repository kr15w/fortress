"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { license } from "@/utils/auth"
import { Key, CheckCircle2, XCircle, Loader2, AlertTriangle, Moon, Sun, Trophy } from "lucide-react"
import { useTheme } from "next-themes"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const License: React.FC = () => {
  const [displayLicenseKey, setDisplayLicenseKey] = useState("")
  const [actualLicenseKey, setActualLicenseKey] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [validationError, setValidationError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isValid, setIsValid] = useState(false)
  const navigate = useNavigate()
  const { setTheme, theme } = useTheme()

  // Validate license key format
  const validateLicenseKey = (key: string): boolean => {
    // Check if the key has exactly 16 characters (without dashes)
    if (key.length !== 16) {
      setValidationError("License key must be 16 characters long")
      return false
    }

    // Check if the key follows the expected pattern (alphanumeric)
    const validPattern = /^[A-Z0-9]{16}$/
    if (!validPattern.test(key)) {
      setValidationError("License key must contain only letters and numbers")
      return false
    }

    // Additional validation: Check if the key has at least one letter and one number
    if (!/[A-Z]/.test(key)) {
      setValidationError("License key must contain at least one letter")
      return false
    }

    if (!/[0-9]/.test(key)) {
      setValidationError("License key must contain at least one number")
      return false
    }

    // If all checks pass, clear validation error and return true
    setValidationError("")
    return true
  }

  // Validate the license key whenever it changes
  useEffect(() => {
    if (actualLicenseKey) {
      setIsValid(validateLicenseKey(actualLicenseKey))
    } else {
      setValidationError("")
      setIsValid(false)
    }
  }, [actualLicenseKey])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, "")

    // Format license key with dashes for display
    const cleaned = value.replace(/-/g, "")
    let formatted = ""
    for (let i = 0; i < cleaned.length; i++) {
      if (i > 0 && i % 4 === 0 && i <= 12) {
        // Add dash after every 4 chars, up to 3 dashes
        formatted += "-"
      }
      formatted += cleaned[i]
    }

    // Store both versions - with dashes for display, without dashes for backend
    setDisplayLicenseKey(formatted)
    setActualLicenseKey(cleaned)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setMessage("")

    // Validate license key before submission
    if (!validateLicenseKey(actualLicenseKey)) {
      return // Don't proceed if validation fails
    }

    setIsLoading(true)

    // Log the license key being sent to backend (without dashes)
    console.log("Sending license key to backend:", actualLicenseKey)

    try {
      await license({ licenseKey: actualLicenseKey })
      setMessage("License verification successful! Redirecting...")
      setTimeout(() => {
        navigate("/menu")
      }, 2000) // Delay redirection for user to see the message
    } catch (err: any) {
      setError(err.message || "License verification failed due to invalid license key. Please try again.")
      setIsLoading(false)
    }
  }

  // Get input border color based on validation state
  const getInputBorderClass = () => {
    if (!displayLicenseKey) return "border-border" // Default
    if (validationError) return "border-red-300 dark:border-red-700" // Error
    if (isValid) return "border-green-300 dark:border-green-700" // Valid
    return "border-yellow-300 dark:border-yellow-700" // Incomplete
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background text-foreground">
      {/* Theme Toggle and Leaderboard in top right corner */}
      <div className="fixed top-4 right-4 flex items-center gap-2 z-10">
        <Link to="/leaderboard">
          <Button variant="ghost" size="icon" aria-label="Go to leaderboard">
            <Trophy className="h-5 w-5" />
          </Button>
        </Link>

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

      {/* Centered License Verification Card */}
      <div className="w-full max-w-md px-4">
        <Card className="w-full border border-border bg-card text-card-foreground overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-400 via-indigo-500 to-purple-600"></div>

          <CardHeader className="space-y-1 pb-6">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 mx-auto mb-4 shadow-md">
              <Key className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400">
              License Verification
            </CardTitle>
            <CardDescription className="text-center">Enter your license key to activate the software</CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {message && (
              <Alert className="mb-6 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertDescription className="text-green-600 dark:text-green-400">{message}</AlertDescription>
              </Alert>
            )}

            <form id="licenseForm" onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="licenseKey">License Key</Label>
                <div className="relative">
                  <Key className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="licenseKey"
                    name="licenseKey"
                    type="text"
                    placeholder="XXXX-XXXX-XXXX-XXXX"
                    value={displayLicenseKey}
                    onChange={handleChange}
                    className={`pl-10 py-6 text-lg tracking-wider font-mono ${getInputBorderClass()}`}
                    required
                    disabled={isLoading || message !== ""}
                    maxLength={19} // 16 chars + 3 dashes
                  />
                  {displayLicenseKey && (
                    <div className="absolute right-3 top-3">
                      {isValid ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 dark:text-green-400" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />
                      )}
                    </div>
                  )}
                </div>

                {validationError ? (
                  <p className="text-xs text-red-500 dark:text-red-400 mt-1 flex items-center">
                    <XCircle className="h-3 w-3 mr-1" />
                    {validationError}
                  </p>
                ) : (
                  <div className="space-y-1 mt-2">
                    <p className="text-xs text-muted-foreground">
                      Your license key should meet the following requirements:
                    </p>
                    <ul className="text-xs space-y-1 pl-4">
                      <li
                        className={`flex items-center ${actualLicenseKey.length === 16 ? "text-green-500 dark:text-green-400" : "text-muted-foreground"}`}
                      >
                        {actualLicenseKey.length === 16 ? (
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                        ) : (
                          <div className="h-3 w-3 rounded-full border border-muted-foreground mr-1" />
                        )}
                        16 characters (without dashes)
                      </li>
                      <li
                        className={`flex items-center ${/[A-Z]/.test(actualLicenseKey) ? "text-green-500 dark:text-green-400" : "text-muted-foreground"}`}
                      >
                        {/[A-Z]/.test(actualLicenseKey) ? (
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                        ) : (
                          <div className="h-3 w-3 rounded-full border border-muted-foreground mr-1" />
                        )}
                        Contains at least one letter
                      </li>
                      <li
                        className={`flex items-center ${/[0-9]/.test(actualLicenseKey) ? "text-green-500 dark:text-green-400" : "text-muted-foreground"}`}
                      >
                        {/[0-9]/.test(actualLicenseKey) ? (
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                        ) : (
                          <div className="h-3 w-3 rounded-full border border-muted-foreground mr-1" />
                        )}
                        Contains at least one number
                      </li>
                    </ul>
                  </div>
                )}
              </div>

              <Button
                type="submit"
                className="w-full py-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 dark:from-purple-500 dark:to-indigo-500 dark:hover:from-purple-600 dark:hover:to-indigo-600 text-white"
                disabled={isLoading || message !== "" || !isValid}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Verifying...
                  </>
                ) : message !== "" ? (
                  <>
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                    Verified
                  </>
                ) : !isValid && displayLicenseKey ? (
                  "Invalid License Key"
                ) : (
                  "Verify License"
                )}
              </Button>

              <div className="flex justify-center">
                <Link to="/" className="text-sm text-primary hover:underline">
                  Back to Login
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default License
