
import type React from "react"

import { useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MessageSquare, Eye, EyeOff, AlertCircle, CheckCircle2, Loader2, Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function RegisterPage() {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Field-specific errors
  const [firstNameError, setFirstNameError] = useState("")
  const [lastNameError, setLastNameError] = useState("")
  const [emailError, setEmailError] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [confirmPasswordError, setConfirmPasswordError] = useState("")
  const [termsError, setTermsError] = useState("")

  // Password strength
  const [passwordStrength, setPasswordStrength] = useState(0)

  const calculatePasswordStrength = (password: string) => {
    let strength = 0
    if (password.length >= 6) strength += 25
    if (password.length >= 10) strength += 25
    if (/[A-Z]/.test(password)) strength += 25
    if (/[0-9]/.test(password)) strength += 25

    setPasswordStrength(strength)
    return strength
  }

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 25) return "bg-red-500"
    if (passwordStrength <= 50) return "bg-orange-500"
    if (passwordStrength <= 75) return "bg-yellow-500"
    return "bg-green-500"
  }

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 25) return "Weak"
    if (passwordStrength <= 50) return "Fair"
    if (passwordStrength <= 75) return "Good"
    return "Strong"
  }

  const validateFirstName = (name: string) => {
    if (!name.trim()) {
      setFirstNameError("First name is required")
      return false
    }
    setFirstNameError("")
    return true
  }

  const validateLastName = (name: string) => {
    if (!name.trim()) {
      setLastNameError("Last name is required")
      return false
    }
    setLastNameError("")
    return true
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
    if (!/[A-Z]/.test(password)) {
      setPasswordError("Password must contain at least one uppercase letter")
      return false
    }
    if (!/[0-9]/.test(password)) {
      setPasswordError("Password must contain at least one number")
      return false
    }
    setPasswordError("")
    return true
  }

  const validateConfirmPassword = (confirmPassword: string) => {
    if (!confirmPassword) {
      setConfirmPasswordError("Please confirm your password")
      return false
    }
    if (confirmPassword !== password) {
      setConfirmPasswordError("Passwords do not match")
      return false
    }
    setConfirmPasswordError("")
    return true
  }

  const validateTerms = (accepted: boolean) => {
    if (!accepted) {
      setTermsError("You must accept the terms and conditions")
      return false
    }
    setTermsError("")
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    // Validate all inputs
    const isFirstNameValid = validateFirstName(firstName)
    const isLastNameValid = validateLastName(lastName)
    const isEmailValid = validateEmail(email)
    const isPasswordValid = validatePassword(password)
    const isConfirmPasswordValid = validateConfirmPassword(confirmPassword)
    const isTermsValid = validateTerms(acceptTerms)

    if (
      !isFirstNameValid ||
      !isLastNameValid ||
      !isEmailValid ||
      !isPasswordValid ||
      !isConfirmPasswordValid ||
      !isTermsValid
    ) {
      return
    }

    setIsLoading(true)

    // Simulate API call
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Mock registration logic
      setSuccess("Account created successfully! Redirecting to dashboard...")
      setTimeout(() => {
        window.location.href = "/"
      }, 1500)
    } catch (err) {
      setError("An error occurred during registration. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-black p-4">
      <div className="w-full max-w-5xl">
        <Card className="overflow-hidden shadow-2xl border-0">
          <div className="grid md:grid-cols-2">
            {/* Left Side - Registration Form */}
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
                  <CardTitle className="text-3xl font-bold">Create your account</CardTitle>
                  <CardDescription className="text-base">Get started with Feattie in minutes</CardDescription>
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

              {/* Registration Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name Fields - Two Columns */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="John"
                      value={firstName}
                      onChange={(e) => {
                        setFirstName(e.target.value)
                        if (firstNameError) validateFirstName(e.target.value)
                      }}
                      onBlur={() => validateFirstName(firstName)}
                      className={firstNameError ? "border-red-500 focus-visible:ring-red-500" : ""}
                      disabled={isLoading}
                    />
                    {firstNameError && <p className="text-sm text-red-600">{firstNameError}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Doe"
                      value={lastName}
                      onChange={(e) => {
                        setLastName(e.target.value)
                        if (lastNameError) validateLastName(e.target.value)
                      }}
                      onBlur={() => validateLastName(lastName)}
                      className={lastNameError ? "border-red-500 focus-visible:ring-red-500" : ""}
                      disabled={isLoading}
                    />
                    {lastNameError && <p className="text-sm text-red-600">{lastNameError}</p>}
                  </div>
                </div>

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

                {/* Password Input with Strength Indicator */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="left" className="max-w-xs">
                          <div className="space-y-1 text-sm">
                            <p className="font-semibold">Password requirements:</p>
                            <ul className="list-disc list-inside space-y-1">
                              <li>Minimum 6 characters</li>
                              <li>At least one uppercase letter</li>
                              <li>At least one number</li>
                            </ul>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value)
                        calculatePasswordStrength(e.target.value)
                        if (passwordError) validatePassword(e.target.value)
                        if (confirmPassword) validateConfirmPassword(confirmPassword)
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

                  {/* Password Strength Meter */}
                  {password && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Password strength:</span>
                        <span
                          className={`font-medium ${passwordStrength >= 75 ? "text-green-600" : passwordStrength >= 50 ? "text-yellow-600" : "text-red-600"}`}
                        >
                          {getPasswordStrengthText()}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                          style={{ width: `${passwordStrength}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {passwordError && <p className="text-sm text-red-600">{passwordError}</p>}
                </div>

                {/* Confirm Password Input */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Re-enter your password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value)
                        if (confirmPasswordError) validateConfirmPassword(e.target.value)
                      }}
                      onBlur={() => validateConfirmPassword(confirmPassword)}
                      className={confirmPasswordError ? "border-red-500 focus-visible:ring-red-500 pr-10" : "pr-10"}
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  {confirmPasswordError && <p className="text-sm text-red-600">{confirmPasswordError}</p>}
                </div>

                {/* Terms and Conditions */}
                <div className="space-y-2">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="terms"
                      checked={acceptTerms}
                      onCheckedChange={(checked) => {
                        setAcceptTerms(checked as boolean)
                        if (termsError) validateTerms(checked as boolean)
                      }}
                      disabled={isLoading}
                      className={termsError ? "border-red-500" : ""}
                    />
                    <Label
                      htmlFor="terms"
                      className="text-sm font-normal leading-relaxed cursor-pointer select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      I agree to the{" "}
                      <Link
                        to="/terms"
                        className="font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400"
                      >
                        Terms and Conditions
                      </Link>{" "}
                      and{" "}
                      <Link
                        to="/privacy"
                        className="font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400"
                      >
                        Privacy Policy
                      </Link>
                    </Label>
                  </div>
                  {termsError && <p className="text-sm text-red-600">{termsError}</p>}
                </div>

                {/* Create Account Button */}
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium h-11"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>

                {/* Sign In Link */}
                <p className="text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link
                    to="/auth/login"
                    className="font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
                  >
                    Sign in
                  </Link>
                </p>
              </form>
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
                    <span className="text-sm font-medium">Join 5,000+ Businesses</span>
                  </div>

                  <h2 className="text-4xl font-bold leading-tight text-balance">
                    Start growing your business with AI today
                  </h2>

                  <p className="text-lg text-purple-100 leading-relaxed text-balance">
                    Get instant access to powerful AI chat features that help you engage customers, recommend products,
                    and increase conversions.
                  </p>

                  {/* Benefits List */}
                  <div className="space-y-4 pt-6">
                    <div className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Free 14-day trial</h3>
                        <p className="text-sm text-purple-100">No credit card required to get started</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Setup in 5 minutes</h3>
                        <p className="text-sm text-purple-100">Simple integration with one line of code</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">24/7 Support</h3>
                        <p className="text-sm text-purple-100">Our team is here to help you succeed</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Cancel anytime</h3>
                        <p className="text-sm text-purple-100">No long-term contracts or commitments</p>
                      </div>
                    </div>
                  </div>

                  {/* Testimonial */}
                  <div className="pt-8 border-t border-white/20">
                    <p className="text-sm italic text-purple-100 mb-3">
                      "Feattie transformed our customer experience. We saw a 40% increase in conversions within the
                      first month!"
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center font-semibold">
                        SK
                      </div>
                      <div>
                        <div className="font-semibold text-sm">Sarah Kim</div>
                        <div className="text-xs text-purple-100">CEO, TechStore</div>
                      </div>
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
