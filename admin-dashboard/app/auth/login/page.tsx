
import type React from "react"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MessageSquare, Eye, EyeOff, AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, user } = useAuth()

  // All hooks must be called before any early returns
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [emailError, setEmailError] = useState("")
  const [passwordError, setPasswordError] = useState("")

  // Redirect if already logged in (after all hooks are declared)
  if (user) {
    navigate('/')
    return null
  }

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email) {
      setEmailError("Email is required")
      return false
    }
    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address")
      return false
    }
    setEmailError("")
    return true
  }

  const validatePassword = (password: string) => {
    if (!password) {
      setPasswordError("Password is required")
      return false
    }
    if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters")
      return false
    }
    setPasswordError("")
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    // Validate inputs
    const isEmailValid = validateEmail(email)
    const isPasswordValid = validatePassword(password)

    if (!isEmailValid || !isPasswordValid) {
      return
    }

    setIsLoading(true)

    try {
      await login(email, password)
      setSuccess("Login successful! Redirecting to dashboard...")
    } catch (err: any) {
      setError(err.response?.data?.error || "Invalid email or password. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-black p-4">
      <div className="w-full max-w-5xl">
        <Card className="overflow-hidden shadow-2xl border-0">
          <div className="grid md:grid-cols-2">
            {/* Left Side - Login Form */}
            <div className="p-8 md:p-12">
              {/* Logo and Title */}
              <div className="mb-8">
                <Link to="/landing" className="flex items-center gap-2 mb-6">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                    <MessageSquare className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-2xl font-bold">Feattie</span>
                </Link>
                <CardHeader className="p-0">
                  <CardTitle className="text-3xl font-bold">Welcome back</CardTitle>
                  <CardDescription className="text-base">Sign in to your account to continue</CardDescription>
                </CardHeader>
              </div>

              {/* Error Alert */}
              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Success Alert */}
              {success && (
                <Alert className="mb-6 border-green-500 bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-100">
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Input */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      if (emailError) validateEmail(e.target.value)
                    }}
                    onBlur={() => validateEmail(email)}
                    className={emailError ? "border-red-500 focus-visible:ring-red-500" : ""}
                    disabled={isLoading}
                  />
                  {emailError && <p className="text-sm text-red-600">{emailError}</p>}
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value)
                        if (passwordError) validatePassword(e.target.value)
                      }}
                      onBlur={() => validatePassword(password)}
                      className={passwordError ? "border-red-500 focus-visible:ring-red-500 pr-10" : "pr-10"}
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  {passwordError && <p className="text-sm text-red-600">{passwordError}</p>}
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                      disabled={isLoading}
                    />
                    <Label
                      htmlFor="remember"
                      className="text-sm font-normal cursor-pointer select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Remember me
                    </Label>
                  </div>
                  <Link
                    to="/auth/forgot-password"
                    className="text-sm font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
                  >
                    Forgot password?
                  </Link>
                </div>

                {/* Sign In Button */}
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium h-11"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>

                {/* Sign Up Link */}
                <p className="text-center text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <Link
                    to="/auth/register"
                    className="font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
                  >
                    Sign up
                  </Link>
                </p>
              </form>

              {/* Demo Credentials */}
              <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border">
                <p className="text-xs font-medium text-muted-foreground mb-2">Demo Credentials:</p>
                <p className="text-xs text-muted-foreground">
                  Email: <span className="font-mono">admin@example.com</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  Password: <span className="font-mono">Admin123!</span>
                </p>
              </div>
            </div>

            {/* Right Side - Gradient Background */}
            <div className="hidden md:block relative bg-gradient-to-br from-purple-600 via-purple-700 to-blue-700 p-12">
              {/* Decorative Elements */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_50%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(255,255,255,0.1),transparent_50%)]" />

              <div className="relative h-full flex flex-col justify-center text-white">
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                    <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-sm font-medium">AI-Powered Platform</span>
                  </div>

                  <h2 className="text-4xl font-bold leading-tight text-balance">
                    Transform your e-commerce with intelligent chat
                  </h2>

                  <p className="text-lg text-purple-100 leading-relaxed text-balance">
                    Join thousands of businesses using Feattie to provide exceptional customer experiences and boost
                    sales with AI-powered conversations.
                  </p>

                  {/* Features List */}
                  <div className="space-y-4 pt-6">
                    <div className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Smart Product Recommendations</h3>
                        <p className="text-sm text-purple-100">
                          AI understands customer needs and suggests perfect products
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">24/7 Customer Support</h3>
                        <p className="text-sm text-purple-100">
                          Instant responses to customer queries anytime, anywhere
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Easy Integration</h3>
                        <p className="text-sm text-purple-100">Get started in minutes with simple one-line setup</p>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/20">
                    <div>
                      <div className="text-3xl font-bold">99.9%</div>
                      <div className="text-sm text-purple-100">Uptime</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold">2.5M+</div>
                      <div className="text-sm text-purple-100">Messages</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold">5K+</div>
                      <div className="text-sm text-purple-100">Businesses</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
