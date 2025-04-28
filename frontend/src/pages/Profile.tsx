"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { Trophy, Medal, Shield, Bomb, Loader2, ArrowLeft, Swords, Skull, User } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import TopBar from "@/components/TopBar"

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

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch(`/api/profile/${userId}`)
        const data = await response.json()
        setUserProfile(data)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching user profile:", error)
        setLoading(false)
      }
    }

    fetchUserProfile()
  }, [userId])

  // Function to calculate win rate percentage
  const calculateWinRate = (wins: number, losses: number) => {
    const total = wins + losses
    if (total === 0) return 0
    return Math.round((wins / total) * 100)
  }

  // Function to determine player rank title based on win count
  const getPlayerRankTitle = (wins: number) => {
    if (wins >= 100) return { title: "Legendary Grandmaster", color: "text-yellow-500" }
    if (wins >= 50) return { title: "Master", color: "text-purple-500" }
    if (wins >= 25) return { title: "Expert", color: "text-blue-500" }
    if (wins >= 10) return { title: "Skilled", color: "text-green-500" }
    return { title: "Novice", color: "text-gray-500" }
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-white">
      <TopBar />

      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <Button variant="ghost" className="mb-6" asChild>
          <Link
            to="/leaderboard"
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Leaderboard
          </Link>
        </Button>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-purple-500 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading player profile...</p>
          </div>
        ) : !userProfile ? (
          <Card className="w-full border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-800/50 backdrop-blur-sm shadow-lg mx-auto text-center p-8">
            <div className="flex flex-col items-center justify-center gap-4">
              <User className="h-16 w-16 text-gray-400" />
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Player Not Found</h2>
              <p className="text-gray-600 dark:text-gray-400">
                The player profile you're looking for doesn't exist or has been removed.
              </p>
              <Button asChild>
                <Link to="/leaderboard">Return to Leaderboard</Link>
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid gap-6">
            <Card className="w-full border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-800/50 backdrop-blur-sm shadow-lg mx-auto">
              <CardHeader className="border-b border-gray-200 dark:border-gray-700 pb-6">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center p-1">
                      <div className="w-full h-full rounded-full bg-white dark:bg-gray-800 p-2 overflow-hidden">
                        <div className="w-full h-full rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                          <img
                            src="/placeholder-user.jpg"
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
                      <div className="absolute -bottom-2 -right-2 bg-white dark:bg-gray-800 rounded-full p-1 shadow-md">
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
                      <CardTitle className="text-3xl font-bold text-gray-800 dark:text-white">
                        {userProfile.username}
                      </CardTitle>
                      <Badge
                        className={`${getPlayerRankTitle(userProfile.win_count).color} bg-opacity-10 dark:bg-opacity-20`}
                      >
                        {getPlayerRankTitle(userProfile.win_count).title} 
                      </Badge>
                    </div>
                    <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-3">
             
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
                </div>
              </CardHeader>

              <CardContent className="py-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Battle Statistics</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col items-center p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                          <div className="flex items-center gap-2 text-green-600 dark:text-green-500 mb-1">
                            <Swords className="h-5 w-5" />
                            <span className="font-bold">Wins</span>
                          </div>
                          <span className="text-2xl font-bold text-gray-800 dark:text-white">
                            {userProfile.win_count}
                          </span>
                        </div>
                        <div className="flex flex-col items-center p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                          <div className="flex items-center gap-2 text-red-600 dark:text-red-500 mb-1">
                            <Skull className="h-5 w-5" />
                            <span className="font-bold">Losses</span>
                          </div>
                          <span className="text-2xl font-bold text-gray-800 dark:text-white">
                            {userProfile.loss_count}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Win Rate</h3>
                      <div className="flex flex-col items-center">
                        <div className="w-32 h-32 relative flex items-center justify-center mb-2">
                          <svg className="w-full h-full" viewBox="0 0 100 100">
                            <circle
                              cx="50"
                              cy="50"
                              r="45"
                              fill="none"
                              stroke="#e5e7eb"
                              strokeWidth="10"
                              className="dark:stroke-gray-700"
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
                            <span className="text-3xl font-bold text-gray-800 dark:text-white">
                              {calculateWinRate(userProfile.win_count, userProfile.loss_count)}%
                            </span>
                          </div>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-center">
                          Based on {userProfile.win_count + userProfile.loss_count} total battles
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Items Used</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col items-center p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                          <div className="flex items-center gap-2 text-orange-600 dark:text-orange-500 mb-1">
                            <Bomb className="h-5 w-5" />
                            <span className="font-bold">Bombs</span>
                          </div>
                          <span className="text-2xl font-bold text-gray-800 dark:text-white">
                            {userProfile.total_bomb_count}
                          </span>
                        </div>
                        <div className="flex flex-col items-center p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-500 mb-1">
                            <Shield className="h-5 w-5" />
                            <span className="font-bold">Shields</span>
                          </div>
                          <span className="text-2xl font-bold text-gray-800 dark:text-white">
                            {userProfile.total_shield_count}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Battle Style</h3>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Offensive</span>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Defensive</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
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
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Cautious</span>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Aggressive</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
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
              </CardContent>

              <CardFooter className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Player ID: #{userId}</p>
                  <div className="flex gap-2">
                    {/*
                    <Button variant="outline">Challenge Player</Button>
                    <Button>View Battle History</Button>
                    */}
                  </div>
                </div>
              </CardFooter>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

export default UserProfile
