"use client"

import type React from "react"
import { Ban, AlertTriangle, Mail } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const AccountBanned: React.FC = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background text-foreground">
      <div className="w-full max-w-md px-4">
        <Card className="w-full border-red-300 dark:border-red-900 bg-card text-card-foreground shadow-lg overflow-hidden">
          {/* Red warning bar at the top */}
          <div className="h-2 bg-red-600 dark:bg-red-700 w-full"></div>

          <CardContent className="pt-8 pb-8">
            <div className="flex flex-col items-center text-center space-y-8">
              {/* Ban icon and title */}
              <div className="flex flex-col items-center">
                <div className="h-20 w-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
                  <Ban className="h-12 w-12 text-red-600 dark:text-red-500" />
                </div>
                <h1 className="text-2xl font-bold text-red-600 dark:text-red-500 mb-2">Account Banned</h1>
              </div>

              {/* Message 1 */}
              <div className="space-y-2">
                <div className="flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-500 mr-2" />
                  <h2 className="text-lg font-semibold">Ban Notice</h2>
                </div>
                <p className="text-foreground">
                  The ban hammer has spoken. You have been banned from Fortress due to possible boosting
                  behaviour/abusing unfair advantages.
                </p>
              </div>

              {/* Message 2 */}
              <div className="space-y-2">
                <div className="flex items-center justify-center">
                  <Mail className="h-5 w-5 text-blue-600 dark:text-blue-500 mr-2" />
                  <h2 className="text-lg font-semibold">Appeal Process</h2>
                </div>
                <p className="text-foreground">
                  If you think this ban is unjustified, contact our staff at{" "}
                  <span className="font-medium text-blue-600 dark:text-blue-500">fortressgameee@gmail.com</span>.
                </p>
              </div>

              {/* Decorative elements */}
              <div className="w-full pt-4">
                <div className="border-t border-red-200 dark:border-red-800 w-1/3 mx-auto"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default AccountBanned
