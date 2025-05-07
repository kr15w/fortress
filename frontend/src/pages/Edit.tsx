"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useNavigate, Link, useParams } from "react-router-dom"
import axios from "axios"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { User, Mail, ArrowLeft, Loader2, CheckCircle, AlertCircle, FileText } from "lucide-react"
import { getCurrentUser, storeUsername } from "@/utils/auth"
import { Textarea } from "@/components/ui/textarea"

const EditProfile = () => {
  const navigate = useNavigate()
  const { userId } = useParams<{ userId: string }>()
  const [currentUsername, setCurrentUsername] = useState<string | null>(null)
  const [newUsername, setNewUsername] = useState("")
  const [newEmail, setNewEmail] = useState("")
  const [confirmEmail, setConfirmEmail] = useState("")
  const [biography, setBiography] = useState("")
  const [bioCharCount, setBioCharCount] = useState(0)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)


  // Validation states
  const [usernameError, setUsernameError] = useState("")
  const [emailError, setEmailError] = useState("")

  useEffect(() => {
    // Retrieve the current username from sessionStorage
    const username = getCurrentUser()
    setCurrentUsername(username)

    // Pre-fill the form with current username
    if (username) {
      setNewUsername(username)

      // Load biography from localStorage if it exists
      const savedBio = localStorage.getItem(`bio_${userId}`)
      if (savedBio) {
        setBiography(savedBio)
        setBioCharCount(savedBio.length)
      }
    }

    // Fetch current email if needed
    const fetchUserEmail = async () => {
      try {
        const response = await axios.get(`/api/profile/${userId}`)
        if (response.data && response.data.email) {
          setNewEmail(response.data.email)
          setConfirmEmail(response.data.email)
        }
      } catch (error) {
        console.error("Failed to fetch user email:", error)
      }
    }

    fetchUserEmail()
  }, [userId])

  // Validate username when it changes
  useEffect(() => {
    if (newUsername && newUsername.length < 3) {
      setUsernameError("Username must be at least 3 characters long")
    } else {
      setUsernameError("")
    }
  }, [newUsername])

  // Validate email match when either email field changes
  useEffect(() => {
    if (newEmail && confirmEmail && newEmail !== confirmEmail) {
      setEmailError("Emails do not match")
    } else {
      setEmailError("")
    }
  }, [newEmail, confirmEmail])

  const handleBiographyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    if (value.length <= 100) {
      setBiography(value)
      setBioCharCount(value.length)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    // Validate username length
    if (newUsername.length < 3) {
      setError("Username must be at least 3 characters long")
      return
    }

    // Ensure emails match before submitting
    if (newEmail !== confirmEmail) {
      setError("Emails do not match")
      return
    }

    // Save biography to localStorage
    localStorage.setItem(`bio_${userId}`, biography)

    setIsLoading(true)
    try {
      const response = await axios.post("/api/edit", {
        current_username: currentUsername,
        new_username: newUsername,
        new_email: newEmail,
      })

      setSuccess(response.data.message || "Profile updated successfully!")
      storeUsername(newUsername) // Store the new username in sessionStorage
      setCurrentUsername(newUsername) // Update the current username in state

      // Redirect after a short delay
      setTimeout(() => navigate(`/profile/${userId}`), 2000)
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to update profile")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background text-foreground">

      {/* Centered Edit Profile Card */}
      <div className="w-full max-w-md px-4 max-h-[90vh] overflow-y-auto py-4">
        <Card className="w-full border border-border bg-card text-card-foreground shadow-md">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mx-auto mb-4">
              <User className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-semibold text-center">Edit Profile</CardTitle>
            <CardDescription className="text-center">Update your profile information</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive" className="text-sm">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-900">
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="biography" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  About Me
                </Label>
                <Textarea
                  id="biography"
                  placeholder="Tell us a bit about yourself..."
                  value={biography}
                  onChange={handleBiographyChange}
                  className="resize-none"
                  rows={3}
                  maxLength={100}
                />
                <div className="flex justify-end">
                  <span
                    className={`text-xs ${bioCharCount >= 90 ? "text-orange-500 dark:text-orange-400" : "text-muted-foreground"}`}
                  >
                    {bioCharCount}/100 characters
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newUsername">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="newUsername"
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="pl-10"
                    required
                    disabled={isLoading}
                  />
                </div>
                {usernameError && <p className="text-xs text-red-500 dark:text-red-400">{usernameError}</p>}
                <p className="text-xs text-muted-foreground">Username must be at least 3 characters long</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newEmail">Email (Also for Reset Password)</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="newEmail"
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="pl-10"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmEmail">Confirm Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmEmail"
                    type="email"
                    value={confirmEmail}
                    onChange={(e) => setConfirmEmail(e.target.value)}
                    className="pl-10"
                    required
                    disabled={isLoading}
                  />
                </div>
                {emailError && <p className="text-xs text-red-500 dark:text-red-400">{emailError}</p>}
              </div>

              <Button
                type="submit"
                className="w-full text-white"
                disabled={isLoading || !!usernameError || !!emailError}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Profile"
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button variant="ghost" size="sm" asChild className="w-full">
              <Link to={`/profile/${userId}`} className="flex items-center justify-center text-muted-foreground">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Profile
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

export default EditProfile
