"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
	GamepadIcon,
	Code,
	ExternalLink,
	PlayCircle,
	LogIn,
	AlertTriangle,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { decryptUsername } from "@/utils/auth";
  GamepadIcon,
  PlayCircle,
  LogIn,
} from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { decryptUsername } from "@/utils/auth"

// Define UserStats type to match user-stats-table
type UserStats = {
	id: number;
	username: string;
	win_count: number;
	loss_count: number;
	total_bomb_count: number;
	total_shield_count: number;
};

const Menu: React.FC = () => {
	const [userId, setUserId] = useState<string | null>(null);

	useEffect(() => {
		// Try to get userId from sessionStorage first
		const storedUserId = sessionStorage.getItem("userId");
		if (storedUserId) {
			setUserId(storedUserId);
			return;
		}

		// If not in sessionStorage, fetch from API
		const fetchUserId = async () => {
			try {
				const response = await fetch("/api/user-stats");
				if (response.ok) {
					const data = (await response.json()) as UserStats[];
					console.log("user-stats", data);
					// Find the current user's data
					if (data && data.length > 0) {
						// Find the user that matches the current username in sessionStorage
						const username = decryptUsername(
							sessionStorage.getItem("currentUser")
						);
						const currentUser = data.find((user) => user.username === username);
						if (currentUser) {
							const currentUserId = currentUser.id.toString();
							sessionStorage.setItem("userId", currentUserId);
							setUserId(currentUserId);
							console.log("userId", currentUserId);
						}
					}
				}
			} catch (error) {
				console.error("Error fetching user ID:", error);
			}
		};

		fetchUserId();
	}, []);

	return (
		<div className="fixed inset-0 flex items-center justify-center bg-background text-foreground">
			<div className="w-full max-w-4xl px-4">
				<Card className="border border-border bg-card text-card-foreground shadow-md overflow-hidden">
					<div className="h-2 bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-600"></div>
					<CardHeader className="pb-4">
						<CardTitle className="text-3xl font-bold text-center flex items-center justify-center gap-2">
							<GamepadIcon className="h-8 w-8 text-primary" />
							Game Menu
						</CardTitle>
						<CardDescription className="text-center">
							Choose your next adventure
						</CardDescription>
					</CardHeader>

					<CardContent className="space-y-8 pb-8">
						{/* Main Game Options */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<Button
								variant="default"
								size="lg"
								className="h-20 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
								asChild
							>
								<Link
									//target="_blank"
									to="/game"
									className="flex items-center justify-center gap-3"
								>
									<PlayCircle className="h-6 w-6" />
									<span className="text-lg font-semibold text-white">
										Start a Game
									</span>
								</Link>
							</Button>

							<Button
								variant="default"
								size="lg"
								className="h-20 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
								asChild
							>
								<Link
									to="/game"
									//target="_blank"
									className="flex items-center justify-center gap-3"
								>
									<LogIn className="h-6 w-6" />
									<span className="text-lg font-semibold text-white">
										Join a Game
									</span>
								</Link>
							</Button>
						</div>

            <Separator />
     
         
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Menu;
