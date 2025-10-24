
import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Upload, Check, X, Eye, EyeOff } from "lucide-react"
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"

export default function SettingsPage() {
  const { toast } = useToast()
  const { user } = useAuth()

  // Profile state - initialize from logged in user
  const [profileData, setProfileData] = useState({
    fullName: user?.email?.split('@')[0] || "",
    email: user?.email || "",
    phone: "",
    bio: "",
    avatar: "/placeholder.svg",
  })
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [profileUnsaved, setProfileUnsaved] = useState(false)

  // Security state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })
  const [passwordStrength, setPasswordStrength] = useState(0)

  // Notifications state
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    newTenantAssigned: true,
    productSyncCompleted: true,
    systemUpdates: false,
  })
  const [notificationsUnsaved, setNotificationsUnsaved] = useState(false)

  // Preferences state
  const [preferences, setPreferences] = useState({
    language: "en",
    timezone: "America/New_York",
    dateFormat: "MM/DD/YYYY",
    theme: "system",
  })
  const [preferencesUnsaved, setPreferencesUnsaved] = useState(false)

  // Update profile data when user changes
  useEffect(() => {
    if (user) {
      setProfileData({
        fullName: user.email?.split('@')[0] || "",
        email: user.email || "",
        phone: "",
        bio: "",
        avatar: "/placeholder.svg",
      })
    }
  }, [user])

  // Calculate password strength
  useEffect(() => {
    const password = passwordData.newPassword
    if (!password) {
      setPasswordStrength(0)
      return
    }

    let strength = 0
    if (password.length >= 8) strength += 25
    if (password.length >= 12) strength += 25
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25
    if (/\d/.test(password)) strength += 15
    if (/[^a-zA-Z0-9]/.test(password)) strength += 10

    setPasswordStrength(Math.min(strength, 100))
  }, [passwordData.newPassword])

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
        setProfileUnsaved(true)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleProfileSave = () => {
    if (avatarPreview) {
      setProfileData({ ...profileData, avatar: avatarPreview })
      setAvatarPreview(null)
    }
    setProfileUnsaved(false)
    toast({
      title: "Profile updated",
      description: "Your profile has been saved successfully.",
    })
  }

  const handlePasswordUpdate = () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all password fields.",
        variant: "destructive",
      })
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match.",
        variant: "destructive",
      })
      return
    }

    if (passwordStrength < 50) {
      toast({
        title: "Weak password",
        description: "Please choose a stronger password.",
        variant: "destructive",
      })
      return
    }

    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
    toast({
      title: "Password updated",
      description: "Your password has been changed successfully.",
    })
  }

  const handleNotificationsSave = () => {
    setNotificationsUnsaved(false)
    toast({
      title: "Notifications updated",
      description: "Your notification preferences have been saved.",
    })
  }

  const handlePreferencesSave = () => {
    setPreferencesUnsaved(false)
    toast({
      title: "Preferences updated",
      description: "Your preferences have been saved successfully.",
    })
  }

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 30) return "bg-red-500"
    if (passwordStrength < 60) return "bg-orange-500"
    if (passwordStrength < 80) return "bg-yellow-500"
    return "bg-green-500"
  }

  const getPasswordStrengthText = () => {
    if (passwordStrength < 30) return "Weak"
    if (passwordStrength < 60) return "Fair"
    if (passwordStrength < 80) return "Good"
    return "Strong"
  }

  return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal information and profile picture</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar Upload */}
                <div className="flex items-center gap-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={avatarPreview || profileData.avatar} />
                    <AvatarFallback>
                      {profileData.fullName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <Label htmlFor="avatar-upload" className="cursor-pointer">
                      <div className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors w-fit">
                        <Upload className="h-4 w-4" />
                        <span className="text-sm font-medium">Upload Photo</span>
                      </div>
                      <Input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarUpload}
                      />
                    </Label>
                    <p className="text-xs text-muted-foreground">JPG, PNG or GIF. Max size 2MB.</p>
                  </div>
                </div>

                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={profileData.fullName}
                    onChange={(e) => {
                      setProfileData({ ...profileData, fullName: e.target.value })
                      setProfileUnsaved(true)
                    }}
                  />
                </div>

                {/* Email (Read-only) */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={profileData.email} disabled className="bg-muted" />
                  <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number (Optional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => {
                      setProfileData({ ...profileData, phone: e.target.value })
                      setProfileUnsaved(true)
                    }}
                  />
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    rows={4}
                    value={profileData.bio}
                    onChange={(e) => {
                      setProfileData({ ...profileData, bio: e.target.value })
                      setProfileUnsaved(true)
                    }}
                    placeholder="Tell us about yourself..."
                  />
                  <p className="text-xs text-muted-foreground">{profileData.bio.length}/500 characters</p>
                </div>

                {/* Save Button */}
                <div className="flex items-center justify-between pt-4">
                  {profileUnsaved && (
                    <p className="text-sm text-orange-600 dark:text-orange-400">You have unsaved changes</p>
                  )}
                  <Button onClick={handleProfileSave} disabled={!profileUnsaved} className="ml-auto">
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your password to keep your account secure</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Current Password */}
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showPasswords.current ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                    >
                      {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {/* New Password */}
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showPasswords.new ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                    >
                      {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>

                  {/* Password Strength Meter */}
                  {passwordData.newPassword && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Password strength:</span>
                        <span
                          className={`font-medium ${passwordStrength >= 80 ? "text-green-600" : passwordStrength >= 60 ? "text-yellow-600" : "text-red-600"}`}
                        >
                          {getPasswordStrengthText()}
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                          style={{ width: `${passwordStrength}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showPasswords.confirm ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                    >
                      {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                    <p className="text-xs text-red-600 flex items-center gap-1">
                      <X className="h-3 w-3" />
                      Passwords do not match
                    </p>
                  )}
                  {passwordData.confirmPassword && passwordData.newPassword === passwordData.confirmPassword && (
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <Check className="h-3 w-3" />
                      Passwords match
                    </p>
                  )}
                </div>

                {/* Update Button */}
                <div className="pt-4">
                  <Button onClick={handlePasswordUpdate}>Update Password</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Manage how you receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Email Notifications */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="emailNotifications">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                  </div>
                  <Switch
                    id="emailNotifications"
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) => {
                      setNotificationSettings({ ...notificationSettings, emailNotifications: checked })
                      setNotificationsUnsaved(true)
                    }}
                  />
                </div>

                {/* Push Notifications */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="pushNotifications">Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive push notifications in your browser</p>
                  </div>
                  <Switch
                    id="pushNotifications"
                    checked={notificationSettings.pushNotifications}
                    onCheckedChange={(checked) => {
                      setNotificationSettings({ ...notificationSettings, pushNotifications: checked })
                      setNotificationsUnsaved(true)
                    }}
                  />
                </div>

                <div className="border-t pt-6">
                  <h4 className="text-sm font-medium mb-4">Notification Types</h4>
                  <div className="space-y-4">
                    {/* New Tenant Assigned */}
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="newTenantAssigned">New Tenant Assigned</Label>
                        <p className="text-sm text-muted-foreground">When you are assigned to a new tenant</p>
                      </div>
                      <Switch
                        id="newTenantAssigned"
                        checked={notificationSettings.newTenantAssigned}
                        onCheckedChange={(checked) => {
                          setNotificationSettings({ ...notificationSettings, newTenantAssigned: checked })
                          setNotificationsUnsaved(true)
                        }}
                      />
                    </div>

                    {/* Product Sync Completed */}
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="productSyncCompleted">Product Sync Completed</Label>
                        <p className="text-sm text-muted-foreground">When product synchronization finishes</p>
                      </div>
                      <Switch
                        id="productSyncCompleted"
                        checked={notificationSettings.productSyncCompleted}
                        onCheckedChange={(checked) => {
                          setNotificationSettings({ ...notificationSettings, productSyncCompleted: checked })
                          setNotificationsUnsaved(true)
                        }}
                      />
                    </div>

                    {/* System Updates */}
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="systemUpdates">System Updates</Label>
                        <p className="text-sm text-muted-foreground">Important system updates and announcements</p>
                      </div>
                      <Switch
                        id="systemUpdates"
                        checked={notificationSettings.systemUpdates}
                        onCheckedChange={(checked) => {
                          setNotificationSettings({ ...notificationSettings, systemUpdates: checked })
                          setNotificationsUnsaved(true)
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex items-center justify-between pt-4">
                  {notificationsUnsaved && (
                    <p className="text-sm text-orange-600 dark:text-orange-400">You have unsaved changes</p>
                  )}
                  <Button onClick={handleNotificationsSave} disabled={!notificationsUnsaved} className="ml-auto">
                    Save Preferences
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Application Preferences</CardTitle>
                <CardDescription>Customize your application experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Language */}
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select
                    value={preferences.language}
                    onValueChange={(value) => {
                      setPreferences({ ...preferences, language: value })
                      setPreferencesUnsaved(true)
                    }}
                  >
                    <SelectTrigger id="language">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                      <SelectItem value="tr">Turkish</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Timezone */}
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={preferences.timezone}
                    onValueChange={(value) => {
                      setPreferences({ ...preferences, timezone: value })
                      setPreferencesUnsaved(true)
                    }}
                  >
                    <SelectTrigger id="timezone">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                      <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                      <SelectItem value="Europe/London">London (GMT)</SelectItem>
                      <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
                      <SelectItem value="Europe/Istanbul">Istanbul (TRT)</SelectItem>
                      <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Format */}
                <div className="space-y-2">
                  <Label htmlFor="dateFormat">Date Format</Label>
                  <Select
                    value={preferences.dateFormat}
                    onValueChange={(value) => {
                      setPreferences({ ...preferences, dateFormat: value })
                      setPreferencesUnsaved(true)
                    }}
                  >
                    <SelectTrigger id="dateFormat">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (12/31/2024)</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (31/12/2024)</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (2024-12-31)</SelectItem>
                      <SelectItem value="DD.MM.YYYY">DD.MM.YYYY (31.12.2024)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Theme */}
                <div className="space-y-2">
                  <Label htmlFor="theme">Theme</Label>
                  <Select
                    value={preferences.theme}
                    onValueChange={(value) => {
                      setPreferences({ ...preferences, theme: value })
                      setPreferencesUnsaved(true)
                    }}
                  >
                    <SelectTrigger id="theme">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Choose your preferred color scheme</p>
                </div>

                {/* Save Button */}
                <div className="flex items-center justify-between pt-4">
                  {preferencesUnsaved && (
                    <p className="text-sm text-orange-600 dark:text-orange-400">You have unsaved changes</p>
                  )}
                  <Button onClick={handlePreferencesSave} disabled={!preferencesUnsaved} className="ml-auto">
                    Save Preferences
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
  )
}
