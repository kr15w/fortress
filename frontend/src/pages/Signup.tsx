"use client"

import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { license } from "@/utils/auth"
import TopBar from "@/components/TopBar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Key, CheckCircle2, XCircle, Loader2 } from "lucide-react"

const License: React.FC = () => {
  const [licenseKey, setLicenseKey] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, "")
    const formatted = formatLicenseKey(value)
    setLicenseKey(formatted)
  }

  const formatLicenseKey = (key: string) => {
    // Remove any existing dashes
    const cleaned = key.replace(/-/g, "")
    // Add a dash after every 4 characters
    let formatted = ""
    for (let i = 0; i < cleaned.length; i++) {
      if (i > 0 && i % 4 === 0) {
        formatted += "-"
      }
      formatted += cleaned[i]
    }
    return formatted
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setMessage("")
    setIsLoading(true)

    try {
      await license({ licenseKey })
      setMessage("License verification successful! Redirecting...")
      setTimeout(() => {
        navigate("/menu")
      }, 2000) // Delay redirection for user to see the message
    } catch (err: any) {
      setError(err.message || "License verification failed due to invalid license key. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      <TopBar />

      <div className="container mx-auto px-4 py-12 flex flex-col items-center">
        <Card className="w-full max-w-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
          <CardHeader className="space-y-1 pb-6">
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-700 mx-auto mb-4">
              <Key className="h-6 w-6 text-gray-600 dark:text-gray-300" />
            </div>
            <CardTitle className="text-2xl font-semibold text-center text-gray-800 dark:text-gray-100">
              License Verification
            </CardTitle>
            <CardDescription className="text-center text-gray-600 dark:text-gray-400">
              Enter your license key to activate the software
            </CardDescription>
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
                <Label htmlFor="licenseKey" className="text-gray-700 dark:text-gray-300">
                  License Key
                </Label>
                <div className="relative">
                  <Key className="absolute left-3 top-3 h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <Input
                    id="licenseKey"
                    name="licenseKey"
                    type="text"
                    placeholder="XXXX-XXXX-XXXX-XXXX"
                    value={licenseKey}
                    onChange={handleChange}
                    className="pl-10 font-mono border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500"
                    required
                    disabled={isLoading || message !== ""}
                    maxLength={19} // 16 chars + 3 dashes
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Your license key should be in the format XXXX-XXXX-XXXX-XXXX
                </p>
              </div>

              <Button
                type="submit"
                className="w-full bg-gray-900 hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 text-white"
                disabled={isLoading || message !== ""}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : message !== "" ? (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Verified
                  </>
                ) : (
                  "Verify License"
                )}
              </Button>
            </form>
          </CardContent>


        </Card>


      </div>
    </div>
  )
}

export default License
