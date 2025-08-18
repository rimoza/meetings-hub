"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, AlertCircle } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { isFirebaseConfigured } from "@/lib/firebase/config"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { loginWithGoogle, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const firebaseConfigured = isFirebaseConfigured()

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      router.push('/')
    }
  }, [isAuthenticated, authLoading, router])

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    setError(null)
    try {
      await loginWithGoogle()
    } catch (error) {
      console.error("Login failed:", error)
      setError("Failed to sign in with Google. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="absolute top-0 right-0 p-4">
        <ThemeToggle />
      </header>

      {/* Main Login Container */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md space-y-6">
          {/* Logo and Branding */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                <Calendar className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Kulan Space</h1>
            <p className="text-muted-foreground">
              Sign in with your Gmail to manage meetings
            </p>
          </div>

          {/* Login Card */}
          <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="space-y-1 text-center pb-4">
              <CardTitle className="text-xl">Welcome back</CardTitle>
              <CardDescription>
                Enter your Gmail address to continue
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Firebase Setup Warning */}
              {!firebaseConfigured && (
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium text-amber-800 dark:text-amber-200 mb-2">
                        Firebase Setup Required
                      </p>
                      <p className="text-amber-700 dark:text-amber-300 mb-3">
                        To use authentication, you need to set up Firebase. Follow these steps:
                      </p>
                      <ol className="list-decimal list-inside space-y-1 text-amber-700 dark:text-amber-300 text-xs">
                        <li>Create a Firebase project at console.firebase.google.com</li>
                        <li>Enable Google Authentication</li>
                        <li>Copy your Firebase config to .env.local</li>
                        <li>Add localhost:3000 to authorized domains</li>
                      </ol>
                      <p className="text-amber-600 dark:text-amber-400 mt-2 text-xs">
                        See FIREBASE_SETUP.md for detailed instructions.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-md">
                  {error}
                </div>
              )}

              {/* Google Login Button */}
              <Button 
                onClick={handleGoogleLogin}
                disabled={isLoading || authLoading || !firebaseConfigured}
                className="w-full h-12 bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 shadow-sm disabled:opacity-50"
                variant="outline"
              >
                {!firebaseConfigured ? (
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="h-5 w-5" />
                    <span>Firebase Setup Required</span>
                  </div>
                ) : isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span>Continue with Google</span>
                  </div>
                )}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                Sign in with your Google account to access all features
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center text-xs text-muted-foreground">
            <p>By signing in, you agree to our terms of service.</p>
          </div>
        </div>
      </div>
    </div>
  )
}