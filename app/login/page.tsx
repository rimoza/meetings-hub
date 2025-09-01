"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Calendar, AlertCircle, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { isFirebaseConfigured } from "@/lib/firebase/config";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const {
    loginWithGoogle,
    loginWithEmail,
    signupWithEmail,
    resetPassword,
    isAuthenticated,
    isLoading: authLoading,
    error: authError,
  } = useAuth();
  const router = useRouter();
  const firebaseConfigured = isFirebaseConfigured();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      router.push("/");
    }
  }, [isAuthenticated, authLoading, router]);

  // Update error state when auth error changes
  useEffect(() => {
    if (authError) {
      setError(authError);
      setIsLoading(false);
    }
  }, [authError]);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await loginWithGoogle();
    } catch (error) {
      console.error("Login failed:", error);
      setError("Failed to sign in with Google. Please try again.");
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (isSignUp && !name)) return;

    setIsLoading(true);
    setError(null);
    
    try {
      if (isSignUp) {
        await signupWithEmail(email, password, name);
      } else {
        await loginWithEmail(email, password);
      }
    } catch (error) {
      console.error("Auth failed:", error);
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      await resetPassword(email);
      setResetEmailSent(true);
      setShowResetForm(false);
    } catch (error) {
      console.error("Reset password failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-background via-secondary to-accent relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-96 h-96 bg-gradient-to-br from-primary/20 to-primary/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-32 w-96 h-96 bg-gradient-to-br from-primary/20 to-primary/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-br from-primary/10 to-primary/20 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="absolute top-0 right-0 p-6 z-50">
        <div className="bg-card/80 backdrop-blur-sm rounded-lg p-1 border border-border/50">
          <ThemeToggle />
        </div>
      </header>

      {/* Main Login Container */}
      <div className="flex items-center justify-center min-h-screen p-4 relative z-10">
        <div className="w-full max-w-md space-y-8">
          {/* Logo and Branding */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2 mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-primary rounded-2xl blur-lg opacity-30"></div>
                <div className="relative p-4 bg-primary rounded-2xl shadow-xl">
                  <Calendar className="h-10 w-10 text-primary-foreground" />
                </div>
              </div>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground">
              Chairman Office
            </h1>
            <p className="text-lg text-muted-foreground max-w-sm mx-auto leading-relaxed">
              Modern meeting management application
            </p>
          </div>

          {/* Login Card */}
          <Card className="border-0 shadow-2xl bg-card/90 backdrop-blur-md ring-1 ring-border/20">
            <CardHeader className="space-y-3 text-center pb-6">
              <CardTitle className="text-2xl font-semibold">
                {showResetForm ? "Reset Password" : (isSignUp ? "Create Account" : "Welcome back")}
              </CardTitle>
              <CardDescription className="text-base text-muted-foreground">
                {showResetForm 
                  ? "Enter your email to receive password reset instructions"
                  : (isSignUp 
                    ? "Create a new account to get started"
                    : "Sign in to continue to your dashboard"
                  )
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 px-8 pb-8">
              {/* Firebase Setup Warning */}
              {!firebaseConfigured && (
                <div className="p-5 bg-secondary/50 border border-border rounded-xl">
                  <div className="flex items-start space-x-3">
                    <div className="p-1 bg-primary/10 rounded-lg">
                      <AlertCircle className="h-5 w-5 text-primary" />
                    </div>
                    <div className="text-sm flex-1">
                      <p className="font-semibold text-foreground mb-2">
                        Firebase Setup Required
                      </p>
                      <p className="text-muted-foreground mb-3 leading-relaxed">
                        To use authentication, you need to set up Firebase.
                        Follow these steps:
                      </p>
                      <ol className="list-decimal list-inside space-y-1.5 text-muted-foreground text-xs leading-relaxed">
                        <li>
                          Create a Firebase project at
                          console.firebase.google.com
                        </li>
                        <li>Enable Email/Password and Google Authentication</li>
                        <li>Copy your Firebase config to .env.local</li>
                        <li>Add localhost:3000 to authorized domains</li>
                      </ol>
                      <p className="text-primary mt-3 text-xs font-medium">
                        📖 See FIREBASE_SETUP.md for detailed instructions.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Success Message */}
              {resetEmailSent && (
                <div className="p-4 text-sm text-green-700 bg-green-50 dark:bg-green-900/20 dark:text-green-400 rounded-xl border border-green-200 dark:border-green-800">
                  Password reset email sent! Check your inbox for instructions.
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="p-4 text-sm text-destructive bg-destructive/10 rounded-xl border border-destructive/20">
                  {error}
                </div>
              )}

              {firebaseConfigured && (
                <>
                  {showResetForm ? (
                    /* Password Reset Form */
                    <form onSubmit={handleResetPassword} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="reset-email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input
                            id="reset-email"
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-10 h-12"
                            required
                          />
                        </div>
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="w-full h-12"
                        disabled={isLoading || !email}
                      >
                        {isLoading ? (
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
                            <span>Sending...</span>
                          </div>
                        ) : (
                          "Send Reset Email"
                        )}
                      </Button>

                      <Button 
                        type="button"
                        variant="ghost"
                        className="w-full"
                        onClick={() => {
                          setShowResetForm(false);
                          setError(null);
                          setResetEmailSent(false);
                        }}
                      >
                        Back to Login
                      </Button>
                    </form>
                  ) : (
                    /* Email/Password Form */
                    <>
                      <form onSubmit={handleEmailAuth} className="space-y-4">
                        {isSignUp && (
                          <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                              id="name"
                              type="text"
                              placeholder="Enter your full name"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              className="h-12"
                              required
                            />
                          </div>
                        )}
                        
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input
                              id="email"
                              type="email"
                              placeholder="Enter your email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="pl-10 h-12"
                              required
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="password">Password</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input
                              id="password"
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter your password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="pl-10 pr-10 h-12"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                          </div>
                        </div>

                        <Button 
                          type="submit" 
                          className="w-full h-12"
                          disabled={isLoading || !email || !password || (isSignUp && !name)}
                        >
                          {isLoading ? (
                            <div className="flex items-center space-x-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
                              <span>{isSignUp ? "Creating Account..." : "Signing In..."}</span>
                            </div>
                          ) : (
                            isSignUp ? "Create Account" : "Sign In"
                          )}
                        </Button>
                      </form>

                      {!isSignUp && (
                        <div className="text-center">
                          <button
                            type="button"
                            onClick={() => {
                              setShowResetForm(true);
                              setError(null);
                            }}
                            className="text-sm text-primary hover:text-primary/80 underline"
                          >
                            Forgot your password?
                          </button>
                        </div>
                      )}

                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <Separator className="w-full" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                        </div>
                      </div>

                      {/* Google Login Button */}
                      <Button
                        type="button"
                        onClick={handleGoogleLogin}
                        disabled={isLoading || authLoading}
                        className="w-full h-12 bg-background hover:bg-accent text-foreground border border-border shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 font-medium"
                        variant="outline"
                      >
                        {isLoading ? (
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                            <span>Signing in...</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-3">
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                              <path
                                fill="#4285F4"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                              />
                              <path
                                fill="#34A853"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                              />
                              <path
                                fill="#FBBC05"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                              />
                              <path
                                fill="#EA4335"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                              />
                            </svg>
                            <span>Continue with Google</span>
                          </div>
                        )}
                      </Button>

                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">
                          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                          <button
                            type="button"
                            onClick={() => {
                              setIsSignUp(!isSignUp);
                              setError(null);
                              setPassword("");
                              setName("");
                            }}
                            className="text-primary hover:text-primary/80 underline font-medium"
                          >
                            {isSignUp ? "Sign in" : "Sign up"}
                          </button>
                        </p>
                      </div>
                    </>
                  )}
                </>
              )}

              {!firebaseConfigured && (
                <Button
                  disabled
                  className="w-full h-14 bg-background hover:bg-accent text-foreground border border-border shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 font-medium text-base"
                  variant="outline"
                >
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="h-5 w-5" />
                    <span>Firebase Setup Required</span>
                  </div>
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center text-sm text-muted-foreground/80">
            <p>
              By signing in, you agree to our terms of service and privacy
              policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
