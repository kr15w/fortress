"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import {
  Trophy,
  Medal,
  Shield,
  Bomb,
  Loader2,
  Swords,
  Skull,
  User,
  FileText,
  Quote,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getCurrentUser } from "@/utils/auth"

type UserProfileData = {
  username: string
  win_count: number
  loss_count: number
  total_bomb_count: number
  total_shield_count: number
}

const UserProfile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>()
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<string | null>(null)
  const [biography, setBiography] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch(`/api/profile/${userId}`)
        const data = await response.json()
        setUserProfile(data)
        setLoading(false)

        // Load biography from localStorage
        const savedBio = localStorage.getItem(`bio_${userId}`)
        setBiography(savedBio)
      } catch (error) {
        console.error("Error fetching user profile:", error)
        setLoading(false)
      }
    }

    fetchUserProfile()

    // Get current user from sessionStorage instead of fetching from backend
    const username = getCurrentUser()
    setCurrentUser(username)
  }, [userId])

  // Function to calculate win rate percentage
  const calculateWinRate = (wins: number, losses: number) => {
    const total = wins + losses
    if (total === 0) return 0
    return Math.round((wins / total) * 100)
  }

  // Function to determine player rank title based on win count
  const getPlayerRankTitle = (wins: number) => {
    if (wins >= 100) return { title: "Legendary", color: "text-yellow-500" }
    if (wins >= 50) return { title: "Master", color: "text-purple-500" }
    if (wins >= 25) return { title: "Expert", color: "text-blue-500" }
    if (wins >= 10) return { title: "Skilled", color: "text-green-500" }
    return { title: "Novice", color: "text-gray-500" }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background text-foreground">
      {/* Centered Profile Content */}
      <div className="w-full max-w-4xl px-4 max-h-[90vh] overflow-y-auto py-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading player profile...</p>
          </div>
        ) : !userProfile ? (
          <Card className="w-full border border-border bg-card text-card-foreground text-center p-8">
            <div className="flex flex-col items-center justify-center gap-4">
              <User className="h-16 w-16 text-muted-foreground" />
              <h2 className="text-2xl font-bold">Player Not Found</h2>
              <p className="text-muted-foreground">
                The player profile you're looking for doesn't exist or has been removed.
              </p>
              <Button asChild>
                <Link to="/leaderboard">Return to Leaderboard</Link>
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid gap-6">
            <Card className="w-full border border-border bg-card text-card-foreground shadow-md">
              <CardHeader className="border-b border-border pb-6">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="relative">
                    <div
                      className={`w-32 h-32 rounded-full ${
                        userProfile.win_count >= 100
                          ? "bg-gradient-to-br from-yellow-500 to-amber-600"
                          : userProfile.win_count >= 50
                            ? "bg-gradient-to-br from-purple-500 to-indigo-600"
                            : userProfile.win_count >= 25
                              ? "bg-gradient-to-br from-blue-500 to-cyan-600"
                              : userProfile.win_count >= 10
                                ? "bg-gradient-to-br from-green-500 to-emerald-600"
                                : "bg-gradient-to-br from-gray-500 to-slate-600"
                      } flex items-center justify-center p-1`}
                    >
                      <div className="w-full h-full rounded-full bg-background p-2 overflow-hidden">
                        <div className="w-full h-full rounded-full bg-muted flex items-center justify-center overflow-hidden">
                          <img
                            src="/placeholder.svg?height=128&width=128"
                            alt={`${userProfile.username}'s avatar`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userProfile.username)}&background=random`
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    {userProfile.win_count >= 10 && (
                      <div className="absolute -bottom-2 -right-2 bg-background rounded-full p-1 shadow-md">
                        {userProfile.win_count >= 100 ? (
                          <Trophy className="h-8 w-8 text-yellow-500" />
                        ) : userProfile.win_count >= 50 ? (
                          <Medal className="h-8 w-8 text-purple-500" />
                        ) : (
                          <Medal className="h-8 w-8 text-blue-500" />
                        )}
                      </div>
                    )}
                  </div>

                  <div className="text-center md:text-left flex-1">
                    <div className="flex flex-col md:flex-row items-center gap-2 mb-2">
                      <CardTitle className="text-3xl font-bold">{userProfile.username}</CardTitle>
                      <Badge
                        className={`${getPlayerRankTitle(userProfile.win_count).color} bg-opacity-10 dark:bg-opacity-20`}
                      >
                        {getPlayerRankTitle(userProfile.win_count).title}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-3">
                      {userProfile.win_count > 0 && (
                        <Badge
                          variant="outline"
                          className="text-green-600 dark:text-green-500 border-green-400 dark:border-green-800 px-3 py-1"
                        >
                          <Swords className="h-4 w-4 mr-1" /> {userProfile.win_count} Wins
                        </Badge>
                      )}
                      {userProfile.total_bomb_count > 20 && (
                        <Badge
                          variant="outline"
                          className="text-orange-600 dark:text-orange-500 border-orange-400 dark:border-orange-800 px-3 py-1"
                        >
                          <Bomb className="h-4 w-4 mr-1" /> Bomber
                        </Badge>
                      )}
                      {userProfile.total_shield_count > 20 && (
                        <Badge
                          variant="outline"
                          className="text-blue-600 dark:text-blue-500 border-blue-400 dark:border-blue-800 px-3 py-1"
                        >
                          <Shield className="h-4 w-4 mr-1" /> Guardian
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 md:mt-0 md:ml-auto flex flex-col gap-2">
                    {currentUser === userProfile.username && (
                      <Button variant="outline" asChild>
                        <Link to={`/profile/edit/${userId}`}>Edit Identifiers</Link>
                      </Button>
                    )}
                    <Button variant="outline" asChild>
                      <Link to={`/battle-history/${userId}`}>Battle History</Link>
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="py-6">
                {/* About Me Section */}
                <div className="mb-6 bg-muted/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">About Me</h3>
                  </div>
                  <div className="flex items-start gap-2">
                    <Quote className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <p className="text-muted-foreground italic">
                      {biography
                        ? biography
                        : `We don't know too much about them, but we're sure ${userProfile.username} is great!`}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div className="bg-muted/50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold mb-4">Battle Statistics</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col items-center p-3 bg-card rounded-lg shadow-sm">
                          <div className="flex items-center gap-2 text-green-600 dark:text-green-500 mb-1">
                            <Swords className="h-5 w-5" />
                            <span className="font-bold">Wins</span>
                          </div>
                          <span className="text-2xl font-bold">{userProfile.win_count}</span>
                        </div>
                        <div className="flex flex-col items-center p-3 bg-card rounded-lg shadow-sm">
                          <div className="flex items-center gap-2 text-red-600 dark:text-red-500 mb-1">
                            <Skull className="h-5 w-5" />
                            <span className="font-bold">Losses</span>
                          </div>
                          <span className="text-2xl font-bold">{userProfile.loss_count}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-muted/50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold mb-4">Win Rate</h3>
                      <div className="flex flex-col items-center">
                        <div className="w-32 h-32 relative flex items-center justify-center mb-2">
                          <svg className="w-full h-full" viewBox="0 0 100 100">
                            <circle
                              cx="50"
                              cy="50"
                              r="45"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="10"
                              className="text-muted stroke-current"
                            />
                            <circle
                              cx="50"
                              cy="50"
                              r="45"
                              fill="none"
                              stroke={
                                calculateWinRate(userProfile.win_count, userProfile.loss_count) > 75
                                  ? "#059669" // green-600
                                  : calculateWinRate(userProfile.win_count, userProfile.loss_count) > 50
                                    ? "#2563eb" // blue-600
                                    : calculateWinRate(userProfile.win_count, userProfile.loss_count) > 25
                                      ? "#d97706" // yellow-600
                                      : "#dc2626" // red-600
                              }
                              strokeWidth="10"
                              strokeDasharray={`${calculateWinRate(userProfile.win_count, userProfile.loss_count) * 2.83} 283`}
                              strokeDashoffset="0"
                              strokeLinecap="round"
                              transform="rotate(-90 50 50)"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-3xl font-bold">
                              {calculateWinRate(userProfile.win_count, userProfile.loss_count)}%
                            </span>
                          </div>
                        </div>
                        <p className="text-muted-foreground text-center">
                          Based on {userProfile.win_count + userProfile.loss_count} total battles
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-muted/50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold mb-4">Items Used</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col items-center p-3 bg-card rounded-lg shadow-sm">
                          <div className="flex items-center gap-2 text-orange-600 dark:text-orange-500 mb-1">
                            <Bomb className="h-5 w-5" />
                            <span className="font-bold">Bombs</span>
                          </div>
                          <span className="text-2xl font-bold">{userProfile.total_bomb_count}</span>
                        </div>
                        <div className="flex flex-col items-center p-3 bg-card rounded-lg shadow-sm">
                          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-500 mb-1">
                            <Shield className="h-5 w-5" />
                            <span className="font-bold">Shields</span>
                          </div>
                          <span className="text-2xl font-bold">{userProfile.total_shield_count}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-muted/50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold mb-4">Battle Style</h3>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium text-muted-foreground">Offensive</span>
                            <span className="text-sm font-medium text-muted-foreground">Defensive</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2.5">
                            {/* Calculate battle style based on bombs vs shields ratio */}
                            <div
                              className="h-2.5 rounded-full bg-purple-600"
                              style={{
                                width: `${Math.min(100, Math.max(0, (userProfile.total_bomb_count / (userProfile.total_bomb_count + userProfile.total_shield_count || 1)) * 100))}%`,
                              }}
                            ></div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium text-muted-foreground">Cautious</span>
                            <span className="text-sm font-medium text-muted-foreground">Aggressive</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2.5">
                            {/* Calculate aggression based on win/loss ratio and total games */}
                            <div
                              className="h-2.5 rounded-full bg-purple-600"
                              style={{
                                width: `${Math.min(100, Math.max(0, (userProfile.win_count / (userProfile.win_count + userProfile.loss_count || 1)) * 100))}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <p className="text-muted-foreground text-sm">Player ID: #{userId}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

export default UserProfile
