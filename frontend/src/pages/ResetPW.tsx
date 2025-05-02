"use client"

import type React from "react"
import { useState } from "react"
import axios from "axios"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Label } from "@/components/ui/label"
import { Mail, Lock, KeyRound, ArrowRight, CheckCircle, AlertCircle, Loader2 } from "lucide-react"

const ChangePassword: React.FC = () => {
  const [email, setEmail] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [step, setStep] = useState(1)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSendEmail = async () => {
    if (!email) {
      setError("Please enter your email address")
      return
    }

    setIsLoading(true)
    try {
      await axios.post("http://localhost:5000/api/auth/send-reset-code", { email })
      setStep(2)
      setMessage("Verification code sent to your email.")
      setError("")
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to send email. Please check your email address and try again.")
      setMessage("")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (!verificationCode || !newPassword) {
      setError("Please enter both verification code and new password")
      return
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long")
      return
    }

    setIsLoading(true)
    try {
      await axios.post("http://localhost:5000/api/auth/change-password", {
        email,
        code: verificationCode,
        newPassword,
      })
      setMessage("Password changed successfully. Redirecting to login page...")
      setError("")
      setTimeout(() => {
        window.location.href = "http://localhost:5173/login"
      }, 2000)
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to change password. Please check the code and try again.")
      setMessage("")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md border-gray-200 dark:border-gray-800 shadow-lg">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mx-auto mb-4">
            <KeyRound className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Reset Password</CardTitle>
          <CardDescription className="text-center">
            {step === 1
              ? "Enter your email to receive a verification code"
              : "Enter the verification code and your new password"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive" className="text-sm">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {message && (
            <Alert className="bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-900">
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          {step === 1 ? (
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Verification Code</Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="Enter the 6-digit code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Create a new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-10"
                    required
                    disabled={isLoading}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">Password must be at least 8 characters long</p>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          
        <div className = "text-white px-6 pb-6 text-center w-full">
          <Button className="text-white px-6 pb-6 text-center " onClick={step === 1 ? handleSendEmail : handleChangePassword} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {step === 1 ? "Sending..." : "Changing..."}
              </>
            ) : (
              <>
                {step === 1 ? "Send Verification Code" : "Change Password"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
        </CardFooter>
        {step === 2 && (
          <div className="text-white px-6 pb-6 mt-[-20px] text-center w-full">
            <Button className="text-white px-6 mt-[-10px] pb-6 text-center"
              variant="link"
              onClick={() => {
                setStep(1)
                setVerificationCode("")
                setNewPassword("")
                setError("")
                setMessage("")
              }}
              
            >
              Change Email Address
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
}

export default ChangePassword
