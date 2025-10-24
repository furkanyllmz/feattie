import { useEffect, useState } from "react"
import { tenantApi, authApi, tenantSettingsApi, TenantDetails, TenantSettingsResponse } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Copy, Check, Palette, Settings, Code, Loader2, AlertCircle, MessageSquare } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

const API_URL = 'http://localhost:5078'

export default function TenantSettingsPage() {
  const { user } = useAuth()
  const [tenant, setTenant] = useState<TenantDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)

  // Form state
  const [brandColorPrimary, setBrandColorPrimary] = useState("#6366f1")
  const [brandColorSecondary, setBrandColorSecondary] = useState("#8b5cf6")
  const [widgetPosition, setWidgetPosition] = useState("bottom-right")
  const [chatTitle, setChatTitle] = useState("Chat with us")
  const [welcomeMessage, setWelcomeMessage] = useState("Hello! How can I help you today?")
  const [autoOpen, setAutoOpen] = useState(false)
  const [autoOpenDelaySeconds, setAutoOpenDelaySeconds] = useState(5)
  const [showTypingIndicator, setShowTypingIndicator] = useState(true)

  useEffect(() => {
    loadTenantData()
  }, [])

  const loadTenantData = async () => {
    try {
      setLoading(true)
      // Get user's assigned tenant(s) only
      const tenantsResponse = await authApi.getMyTenants()
      if (tenantsResponse.data && tenantsResponse.data.length > 0) {
        const firstTenant = tenantsResponse.data[0]
        const tenantDetailsResponse = await tenantApi.getById(firstTenant.id)
        setTenant(tenantDetailsResponse.data)

        // Load tenant settings
        try {
          const settingsResponse = await tenantSettingsApi.get(firstTenant.id)
          const settings = settingsResponse.data

          // Populate form with existing settings
          setBrandColorPrimary(settings.brandColorPrimary)
          setBrandColorSecondary(settings.brandColorSecondary)
          setWidgetPosition(settings.widgetPosition)
          setChatTitle(settings.chatTitle)
          setWelcomeMessage(settings.welcomeMessage)
          setAutoOpen(settings.autoOpen)
          setAutoOpenDelaySeconds(settings.autoOpenDelaySeconds)
          setShowTypingIndicator(settings.showTypingIndicator)
        } catch (error) {
          console.log("No existing settings, using defaults")
        }
      }
    } catch (error) {
      console.error("Failed to load tenant data:", error)
      toast({
        title: "Error",
        description: "Failed to load tenant settings",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSettings = async () => {
    if (!tenant) return

    try {
      setSaving(true)

      // Save settings to API
      await tenantSettingsApi.update(tenant.id, {
        brandColorPrimary,
        brandColorSecondary,
        widgetPosition,
        chatTitle,
        welcomeMessage,
        autoOpen,
        autoOpenDelaySeconds,
        showTypingIndicator,
      })

      toast({
        title: "Success",
        description: "Widget settings saved successfully!",
      })

      // Reload settings
      await loadTenantData()
    } catch (error) {
      console.error("Failed to save settings:", error)
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!tenant) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Tenant Assigned</h3>
            <p className="text-sm text-muted-foreground">
              Please contact your administrator to assign a tenant to your account.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Widget Settings</h1>
        <p className="text-muted-foreground">
          Customize your chat widget appearance and behavior for {tenant.name}
        </p>
      </div>

      <Tabs defaultValue="appearance" className="space-y-6">
        <TabsList>
          <TabsTrigger value="appearance" className="gap-2">
            <Palette className="h-4 w-4" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="behavior" className="gap-2">
            <Settings className="h-4 w-4" />
            Behavior
          </TabsTrigger>
          <TabsTrigger value="embed" className="gap-2">
            <Code className="h-4 w-4" />
            Embed Code
          </TabsTrigger>
        </TabsList>

        <TabsContent value="appearance" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Brand Colors</CardTitle>
                  <CardDescription>
                    Customize the colors to match your brand identity
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="primaryColor">Primary Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="primaryColor"
                          type="color"
                          value={brandColorPrimary}
                          onChange={(e) => setBrandColorPrimary(e.target.value)}
                          className="h-10 w-20 cursor-pointer"
                        />
                        <Input
                          type="text"
                          value={brandColorPrimary}
                          onChange={(e) => setBrandColorPrimary(e.target.value)}
                          placeholder="#6366f1"
                          className="flex-1 font-mono"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="secondaryColor">Secondary Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="secondaryColor"
                          type="color"
                          value={brandColorSecondary}
                          onChange={(e) => setBrandColorSecondary(e.target.value)}
                          className="h-10 w-20 cursor-pointer"
                        />
                        <Input
                          type="text"
                          value={brandColorSecondary}
                          onChange={(e) => setBrandColorSecondary(e.target.value)}
                          placeholder="#8b5cf6"
                          className="flex-1 font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="chatTitle">Chat Title</Label>
                    <Input
                      id="chatTitle"
                      value={chatTitle}
                      onChange={(e) => setChatTitle(e.target.value)}
                      placeholder="Chat with us"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="welcomeMessage">Welcome Message</Label>
                    <Textarea
                      id="welcomeMessage"
                      value={welcomeMessage}
                      onChange={(e) => setWelcomeMessage(e.target.value)}
                      placeholder="Hello! How can I help you today?"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Widget Position</CardTitle>
                  <CardDescription>
                    Choose where the chat widget appears on your website
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {["bottom-right", "bottom-left", "top-right", "top-left"].map((position) => (
                      <Button
                        key={position}
                        variant={widgetPosition === position ? "default" : "outline"}
                        onClick={() => setWidgetPosition(position)}
                        className="justify-start"
                      >
                        {position.split("-").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Live Preview */}
            <Card className="lg:sticky lg:top-6 h-fit">
              <CardHeader>
                <CardTitle>Live Preview</CardTitle>
                <CardDescription>See how your widget will look</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative h-[600px] overflow-hidden rounded-lg border bg-gradient-to-br from-muted/30 to-muted/10">
                  {/* Chat button */}
                  <div
                    className={cn(
                      "absolute flex h-14 w-14 cursor-pointer items-center justify-center rounded-full shadow-lg transition-all hover:scale-110",
                      widgetPosition === "bottom-right" && "bottom-4 right-4",
                      widgetPosition === "bottom-left" && "bottom-4 left-4",
                      widgetPosition === "top-right" && "right-4 top-4",
                      widgetPosition === "top-left" && "left-4 top-4"
                    )}
                    style={{ backgroundColor: brandColorPrimary }}
                  >
                    <MessageSquare className="h-6 w-6 text-white" />
                  </div>

                  {/* Chat window */}
                  <div
                    className={cn(
                      "absolute w-80 rounded-lg border bg-card shadow-2xl",
                      widgetPosition === "bottom-right" && "bottom-20 right-4",
                      widgetPosition === "bottom-left" && "bottom-20 left-4",
                      widgetPosition === "top-right" && "right-4 top-20",
                      widgetPosition === "top-left" && "left-4 top-20"
                    )}
                  >
                    {/* Header */}
                    <div
                      className="flex items-center gap-3 rounded-t-lg p-4 text-white"
                      style={{ backgroundColor: brandColorPrimary }}
                    >
                      <div className="h-8 w-8 rounded-full bg-white/20" />
                      <div>
                        <p className="font-semibold">{chatTitle}</p>
                        <p className="text-xs opacity-90">Online</p>
                      </div>
                    </div>

                    {/* Messages */}
                    <div className="space-y-3 p-4">
                      <div className="rounded-lg bg-muted p-3 text-sm">
                        {welcomeMessage}
                      </div>
                      <div
                        className="ml-auto w-fit max-w-[80%] rounded-lg p-3 text-sm text-white"
                        style={{ backgroundColor: brandColorSecondary }}
                      >
                        I'm looking for a laptop
                      </div>
                    </div>

                    {/* Input */}
                    <div className="border-t p-4">
                      <div className="flex gap-2">
                        <Input placeholder="Type your message..." className="flex-1" disabled />
                        <Button
                          size="icon"
                          className="text-white"
                          style={{ backgroundColor: brandColorPrimary }}
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="behavior" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Widget Behavior</CardTitle>
              <CardDescription>
                Configure how the chat widget behaves
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="autoOpen">Auto-open Widget</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically open the chat widget after a delay
                  </p>
                </div>
                <Switch
                  id="autoOpen"
                  checked={autoOpen}
                  onCheckedChange={setAutoOpen}
                />
              </div>

              {autoOpen && (
                <div className="space-y-2">
                  <Label htmlFor="autoOpenDelay">Auto-open Delay (seconds)</Label>
                  <Input
                    id="autoOpenDelay"
                    type="number"
                    min="1"
                    max="60"
                    value={autoOpenDelaySeconds}
                    onChange={(e) => setAutoOpenDelaySeconds(parseInt(e.target.value) || 5)}
                  />
                </div>
              )}

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="typingIndicator">Show Typing Indicator</Label>
                  <p className="text-sm text-muted-foreground">
                    Display animated dots when AI is generating response
                  </p>
                </div>
                <Switch
                  id="typingIndicator"
                  checked={showTypingIndicator}
                  onCheckedChange={setShowTypingIndicator}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="embed" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Widget Embed Code</CardTitle>
              <CardDescription>
                Copy and paste this code into your website to add the chat widget
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Add this code snippet before the closing <code className="px-1.5 py-0.5 bg-muted rounded">&lt;/body&gt;</code> tag in your HTML
                </AlertDescription>
              </Alert>

              <div className="relative">
                <pre className="overflow-x-auto rounded-lg bg-[#1e1e1e] p-4 text-sm text-gray-100 min-h-[200px]">
                  <code className="font-mono">{`<!-- Feattie Chat Widget -->
<script>
  window.FeattieChat = {
    tenantId: ${tenant?.id || 'YOUR_TENANT_ID'},
    tenantSlug: '${tenant?.slug || 'your-store'}',
    apiUrl: 'http://localhost:5078',
    customization: {
      primaryColor: '${brandColorPrimary}',
      secondaryColor: '${brandColorSecondary}',
      position: '${widgetPosition}',
      chatTitle: '${chatTitle}',
      welcomeMessage: '${welcomeMessage}',
      autoOpen: ${autoOpen},
      autoOpenDelay: ${autoOpenDelaySeconds},
      showTypingIndicator: ${showTypingIndicator}
    }
  };
</script>
<script src="http://localhost:5078/widget/widget.js"></script>`}</code>
                </pre>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    const code = `<!-- Feattie Chat Widget -->
<script>
  window.FeattieChat = {
    tenantId: ${tenant?.id || 'YOUR_TENANT_ID'},
    tenantSlug: '${tenant?.slug || 'your-store'}',
    apiUrl: 'http://localhost:5078',
    customization: {
      primaryColor: '${brandColorPrimary}',
      secondaryColor: '${brandColorSecondary}',
      position: '${widgetPosition}',
      chatTitle: '${chatTitle}',
      welcomeMessage: '${welcomeMessage}',
      autoOpen: ${autoOpen},
      autoOpenDelay: ${autoOpenDelaySeconds},
      showTypingIndicator: ${showTypingIndicator}
    }
  };
</script>
<script src="http://localhost:5078/widget/widget.js"></script>`
                    navigator.clipboard.writeText(code)
                    setCopied(true)
                    toast({
                      title: "Copied!",
                      description: "Embed code copied to clipboard",
                    })
                    setTimeout(() => setCopied(false), 2000)
                  }}
                  className="absolute right-2 top-2"
                >
                  {copied ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy Code
                    </>
                  )}
                </Button>
              </div>

              <div className="rounded-lg bg-muted p-4 space-y-2">
                <p className="text-sm font-medium">Installation Steps:</p>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Copy the embed code above</li>
                  <li>Open your website's HTML file</li>
                  <li>Paste the code before the closing &lt;/body&gt; tag</li>
                  <li>Save and publish your changes</li>
                  <li>The chat widget will appear on your website with your custom settings</li>
                </ol>
              </div>

              <div className="space-y-4">
                <Separator />
                <div className="space-y-2">
                  <Label>Widget Status</Label>
                  <div className="flex items-center gap-2">
                    <Badge variant={tenant?.isActive ? "default" : "secondary"}>
                      {tenant?.isActive ? "Active" : "Inactive"}
                    </Badge>
                    {!tenant?.isActive && (
                      <span className="text-sm text-muted-foreground">
                        Widget is disabled. Contact admin to activate.
                      </span>
                    )}
                  </div>
                </div>

                {tenant && (
                  <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                    <div>
                      <p className="text-xs text-muted-foreground">Tenant ID</p>
                      <p className="font-mono text-sm font-medium">{tenant.id}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Slug</p>
                      <p className="font-mono text-sm font-medium">{tenant.slug}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Products</p>
                      <p className="font-mono text-sm font-medium">{tenant.productCount}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">RAG Status</p>
                      <Badge variant={tenant.hasRAGConfiguration ? "default" : "secondary"} className="text-xs">
                        {tenant.hasRAGConfiguration ? "Configured" : "Not Set"}
                      </Badge>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={loadTenantData}>
          Reset Changes
        </Button>
        <Button onClick={handleSaveSettings} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Settings"
          )}
        </Button>
      </div>
    </div>
  )
}
