"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { Trophy, Loader2, Swords, User, Moon, Sun, Home, Crown, Calendar, ArrowLeft } from "lucide-react"
import { useTheme } from "next-themes"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

type BattleHistoryItem = {
  match_id: number
  match_end_time: string
  player1: string
  player2: string
  winner: string
}

const BattleHistory: React.FC = () => {
  const { userId } = useParams<{ userId: string }>()
  const [battleHistory, setBattleHistory] = useState<BattleHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { setTheme } = useTheme()
  const [username, setUsername] = useState<string | null>(null)

  // Replace the formatDateTime function with this simpler version that doesn't try to parse the date
  const formatDateTime = (dateTimeString: string) => {
    // Just return the raw string from the API
    return dateTimeString || "Unknown date/time"
  }

  useEffect(() => {
    const fetchBattleHistory = async () => {
      try {
        setLoading(true)
        // Fetch the user's name first to display in the header
        const userResponse = await fetch(`/api/profile/${userId}`)
        const userData = await userResponse.json()
        setUsername(userData.username)

        // Fetch battle history
        const response = await fetch(`/api/battle-history/${userId}`)

        if (!response.ok) {
          throw new Error(`Failed to fetch battle history: ${response.status}`)
        }

        const data = await response.json()
        setBattleHistory(data)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching battle history:", error)
        setError(error instanceof Error ? error.message : "Failed to load battle history")
        setLoading(false)
      }
    }

    fetchBattleHistory()
  }, [userId])

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background text-foreground">
      {/* Theme Toggle and Navigation in top right corner */}
      <div className="fixed top-4 right-4 flex items-center gap-2 z-10">
        <Link to="/">
          <Button variant="ghost" size="icon" aria-label="Go to home">
            <Home className="h-5 w-5" />
          </Button>
        </Link>

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

      {/* Centered Battle History Content */}
      <div className="w-full max-w-4xl px-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading battle history...</p>
          </div>
        ) : error ? (
          <Card className="w-full border border-border bg-card text-card-foreground text-center p-8">
            <div className="flex flex-col items-center justify-center gap-4">
              <Swords className="h-16 w-16 text-muted-foreground" />
              <h2 className="text-2xl font-bold">Error Loading Battle History</h2>
              <p className="text-muted-foreground">{error}</p>
              <Button asChild>
                <Link to={`/profile/${userId}`}>Return to Profile</Link>
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="w-full border border-border bg-card text-card-foreground shadow-md">
            <CardHeader className="border-b border-border pb-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Swords className="h-6 w-6 text-primary" />
                    <CardTitle className="text-2xl font-bold">Battle History</CardTitle>
                  </div>
                  <CardDescription className="mt-2">
                    {username ? `Viewing ${username}'s battle records` : `Battle records for player ${userId}`}
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/profile/${userId}`} className="flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Profile
                  </Link>
                </Button>
              </div>
            </CardHeader>

            <CardContent className="py-6">
              {battleHistory.length === 0 ? (
                <div className="text-center py-12">
                  <div className="flex justify-center mb-4">
                    <Swords className="h-12 w-12 text-muted-foreground opacity-50" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No Battles Found</h3>
                  <p className="text-muted-foreground">This player hasn't participated in any battles yet.</p>
                </div>
              ) : (
                <div className="rounded-md border overflow-auto max-h-[60vh]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[80px]">Match ID</TableHead>
                        <TableHead className="w-[180px]">Date & Time</TableHead>
                        <TableHead>Players</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {battleHistory.map((battle) => (
                        <TableRow key={battle.match_id}>
                          <TableCell className="font-mono text-sm">{battle.match_id}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="text-sm">{formatDateTime(battle.match_end_time)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6">
                              <div className="flex items-center gap-2">
                                <Link
                                  to={`/profile/${battle.player1}`}
                                  className="font-medium hover:underline flex items-center gap-1.5"
                                >
                                  <User className="h-4 w-4 text-primary" />
                                  {battle.player1}
                                </Link>
                                {battle.winner === battle.player1 && (
                                  <Badge className="bg-yellow-500 text-yellow-950 border-yellow-400">
                                    <Crown className="h-3 w-3 mr-0.5" />
                                    Win
                                  </Badge>
                                )}
                              </div>

                              <Badge variant="outline" className="px-3">
                                VS
                              </Badge>

                              <div className="flex items-center gap-2">
                                <Link
                                  to={`/profile/${battle.player2}`}
                                  className="font-medium hover:underline flex items-center gap-1.5"
                                >
                                  <User className="h-4 w-4 text-primary" />
                                  {battle.player2}
                                </Link>
                                {battle.winner === battle.player2 && (
                                  <Badge className="bg-yellow-500 text-yellow-950 border-yellow-400">
                                    <Crown className="h-3 w-3 mr-0.5" />
                                    Win
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default BattleHistory
