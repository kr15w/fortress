"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Trophy, Medal, Shield, Bomb, Loader2, Swords, Skull } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"


type UserStats = {
  id: number
  username: string
  win_count: number
  loss_count: number
  total_bomb_count: number
  total_shield_count: number
}

const UserStatsTable: React.FC = () => {
  const [userStats, setUserStats] = useState<UserStats[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const response = await fetch("/api/user-stats") // Fetch data from backend
        const data = await response.json()
        // Sort data by win_count in descending order
        const sortedData = data.sort((a: UserStats, b: UserStats) => b.win_count - a.win_count)
        const topPlayers = sortedData.slice(0, 20)
        setUserStats(topPlayers)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching user stats:", error)
        setLoading(false)
      }
    }

    fetchUserStats()
  }, [])

  // Function to get rank badge based on position
  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />
    if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />
    return null
  }

  // Function to calculate win rate percentage
  const calculateWinRate = (wins: number, losses: number) => {
    const total = wins + losses
    if (total === 0) return 0
    return Math.round((wins / total) * 100)
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-background text-foreground overflow-hidden">

      {/* Title and content */}
      <div className="flex-1 flex flex-col items-center justify-start w-full pt-16 px-4">
        <div className="w-full max-w-[1200px] flex-1 flex flex-col">
          <Card className="w-full border border-border bg-card text-card-foreground shadow-lg flex-1 flex flex-col overflow-hidden">
            <CardHeader className="border-b border-border pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-3xl font-bold flex items-center gap-2">
                  <Trophy className="h-8 w-8 text-yellow-500" />
                  Top 20 Players
                </CardTitle>
                {loading && (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-purple-500" />
                    <span className="text-sm text-muted-foreground">Loading stats...</span>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-auto">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 className="h-12 w-12 animate-spin text-purple-500 mb-4" />
                  <p className="text-muted-foreground">Loading leaderboard data...</p>
                </div>
              ) : (
                <div className="w-full h-full overflow-auto max-h-[70vh]">
                  <Table className="w-full">
                    <TableHeader>
                      <TableRow className="hover:bg-muted/50">
                        <TableHead className="w-16 text-center">Rank</TableHead>
                        <TableHead>Player</TableHead>
                        <TableHead>
                          <div className="flex items-center gap-1">
                            <Swords className="h-4 w-4 text-green-600 dark:text-green-500" />
                            Wins
                          </div>
                        </TableHead>
                        <TableHead>
                          <div className="flex items-center gap-1">
                            <Skull className="h-4 w-4 text-red-600 dark:text-red-500" />
                            Losses
                          </div>
                        </TableHead>
                        <TableHead>
                          <div className="flex items-center gap-1">
                            <Bomb className="h-4 w-4 text-orange-600 dark:text-orange-500" />
                            Bombs
                          </div>
                        </TableHead>
                        <TableHead>
                          <div className="flex items-center gap-1">
                            <Shield className="h-4 w-4 text-blue-600 dark:text-blue-500" />
                            Shields
                          </div>
                        </TableHead>
                        <TableHead className="text-right">Win Rate</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {userStats.map((user, index) => {
                        const rank = index + 1
                        const winRate = calculateWinRate(user.win_count, user.loss_count)

                        return (
                          <TableRow
                            key={user.id}
                            className={`
                              transition-colors
                              ${rank === 1 ? "bg-yellow-50 dark:bg-yellow-900/20" : ""}
                              ${rank === 2 ? "bg-gray-50 dark:bg-gray-700/20" : ""}
                              ${rank === 3 ? "bg-amber-50 dark:bg-amber-900/20" : ""}
                              hover:bg-muted/50
                            `}
                          >
                            <TableCell className="font-medium text-center">
                              <div className="flex items-center justify-center">
                                {getRankBadge(rank) || <span className="text-muted-foreground">{rank}</span>}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Link
                                to={`/profile/${user.id}`}
                                className="font-bold text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 transition-colors flex items-center gap-2"
                              >
                                {user.username}
                                {rank <= 3 && (
                                  <Badge
                                    variant={rank === 1 ? "default" : "outline"}
                                    className={`
                                    ${rank === 1 ? "bg-yellow-600 hover:bg-yellow-700 text-white" : ""}
                                    ${rank === 2 ? "text-gray-700 dark:text-gray-300 border-gray-400" : ""}
                                    ${rank === 3 ? "text-amber-700 dark:text-amber-600 border-amber-700" : ""}
                                  `}
                                  >
                                    {rank === 1 ? "Champion" : rank === 2 ? "Runner-up" : "Bronze"}
                                  </Badge>
                                )}
                              </Link>
                            </TableCell>
                            <TableCell className="font-semibold text-green-600 dark:text-green-500">
                              {user.win_count}
                            </TableCell>
                            <TableCell className="font-semibold text-red-600 dark:text-red-500">
                              {user.loss_count}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <span>{user.total_bomb_count}</span>
                                {user.total_bomb_count > 50 && (
                                  <Badge
                                    variant="outline"
                                    className="text-orange-600 dark:text-orange-500 border-orange-400 dark:border-orange-800"
                                  >
                                    Bomber
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <span>{user.total_shield_count}</span>
                                {user.total_shield_count > 50 && (
                                  <Badge
                                    variant="outline"
                                    className="text-blue-600 dark:text-blue-500 border-blue-400 dark:border-blue-800"
                                  >
                                    Guardian
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-1">
                                <div
                                  className={`h-2.5 rounded-full ${
                                    winRate > 75
                                      ? "bg-green-600"
                                      : winRate > 50
                                        ? "bg-blue-600"
                                        : winRate > 25
                                          ? "bg-yellow-600"
                                          : "bg-red-600"
                                  }`}
                                  style={{ width: `${winRate}%` }}
                                ></div>
                              </div>
                              <span className="text-xs text-muted-foreground">{winRate}%</span>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default UserStatsTable
