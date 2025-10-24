"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { AdminLayout } from "@/components/admin-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useToast } from "@/hooks/use-toast"
import {
  Save,
  Copy,
  Check,
  Eye,
  EyeOff,
  RefreshCw,
  AlertCircle,
  MessageSquare,
  ExternalLink,
  Code2,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface TenantSettings {
  name: string
  slug: string
  description: string
  active: boolean
  primaryColor: string
  secondaryColor: string
  buttonColor: string
  textColor: string
  widgetPosition: "bottom-right" | "bottom-left" | "top-right" | "top-left"
  welcomeMessage: string
  placeholderText: string
  buttonText: string
  apiKey: string
  apiEndpoint: string
  tenantId: string
  lastApiKeyRegenerated: string | null
}

export default function TenantSettingsPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()

  const [settings, setSettings] = useState<TenantSettings>({
    name: "Acme Corporation",
    slug: "acme-corp",
    description: "Leading provider of innovative solutions",
    active: true,
    primaryColor: "#7C3AED",
    secondaryColor: "#3B82F6",
    buttonColor: "#7C3AED",
    textColor: "#FFFFFF",
    widgetPosition: "bottom-right",
    welcomeMessage: "Hello! How can we help you find the perfect product today?",
    placeholderText: "Type your message...",
    buttonText: "Chat with us",
    apiKey: "sk_live_51234567890abcdef",
    apiEndpoint: "https://api.feattie.com/v1",
    tenantId: params.id as string,
    lastApiKeyRegenerated: "2024-01-15T10:30:00Z",
  })

  const [hasChanges, setHasChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({})
  const [showRegenerateDialog, setShowRegenerateDialog] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)

  const user = { name: "John Doe", email: "john@example.com", role: 1 }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault()
        if (hasChanges) handleSave()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [hasChanges])

  const handleSave = async () => {
    if (!/^[a-z0-9-]+$/.test(settings.slug)) {
      toast({
        title: "Invalid slug",
        description: "Slug must be lowercase letters, numbers, and hyphens only.",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSaving(false)
    setHasChanges(false)
    toast({
      title: "Settings saved",
      description: "Your tenant settings have been updated successfully.",
    })
  }

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopiedStates({ ...copiedStates, [key]: true })
    setTimeout(() => {
      setCopiedStates({ ...copiedStates, [key]: false })
    }, 2000)
    toast({
      title: "Copied to clipboard",
      description: "The content has been copied to your clipboard.",
    })
  }

  const handleRegenerateApiKey = async () => {
    setIsRegenerating(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setSettings({
      ...settings,
      apiKey: `sk_live_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
      lastApiKeyRegenerated: new Date().toISOString(),
    })
    setIsRegenerating(false)
    setShowRegenerateDialog(false)
    toast({
      title: "API Key regenerated",
      description: "Your new API key has been generated. Update your integration code.",
      variant: "destructive",
    })
  }

  const handleTestWidget = () => {
    window.open("/widget-demo", "_blank")
  }

  const embedCode = `<!-- Feattie Chat Widget -->
<script>
  window.FeattieChat = {
    tenantSlug: '${settings.slug}',
    apiUrl: '${settings.apiEndpoint}'
  };
</script>
<script src="https://cdn.feattie.com/widget.js"></script>`

  const customColorCode = `<script>
  window.FeattieChat = {
    tenantSlug: '${settings.slug}',
    apiUrl: '${settings.apiEndpoint}',
    customization: {
      primaryColor: '${settings.primaryColor}',
      buttonColor: '${settings.buttonColor}',
      textColor: '${settings.textColor}'
    }
  };
</script>`

  const customPositionCode = `<script>
  window.FeattieChat = {
    tenantSlug: '${settings.slug}',
    apiUrl: '${settings.apiEndpoint}',
    position: '${settings.widgetPosition}'
  };
</script>`

  const customMessageCode = `<script>
  window.FeattieChat = {
    tenantSlug: '${settings.slug}',
    apiUrl: '${settings.apiEndpoint}',
    welcomeMessage: '${settings.welcomeMessage}',
    placeholder: '${settings.placeholderText}'
  };
</script>`

  const eventListenersCode = `<script>
  // Listen to widget events
  window.addEventListener('feattie:ready', () => {
    console.log('Widget is ready');
  });
  
  window.addEventListener('feattie:message', (event) => {
    console.log('New message:', event.detail);
  });
  
  window.addEventListener('feattie:close', () => {
    console.log('Widget closed');
  });
</script>`

  return (
    <AdminLayout user={user}>
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tenant Settings</h1>
            <p className="text-muted-foreground">{settings.name}</p>
          </div>
          <div className="flex items-center gap-3">
            {hasChanges && (
              <Badge variant="secondary" className="gap-1">
                <AlertCircle className="h-3 w-3" />
                Unsaved changes
              </Badge>
            )}
            {isSaving && (
              <Badge variant="secondary" className="gap-1">
                <RefreshCw className="h-3 w-3 animate-spin" />
                Saving...
              </Badge>
            )}
            <Button onClick={handleSave} disabled={!hasChanges || isSaving} className="gap-2">
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">General Settings</TabsTrigger>
            <TabsTrigger value="appearance">Appearance & Widget</TabsTrigger>
            <TabsTrigger value="embed">Embed Code & Integration</TabsTrigger>
          </TabsList>

          {/* Tab 1: General Settings */}
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>Basic information about your tenant</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Tenant Name</Label>
                  <Input
                    id="name"
                    value={settings.name}
                    onChange={(e) => {
                      setSettings({ ...settings, name: e.target.value })
                      setHasChanges(true)
                    }}
                    placeholder="Enter tenant name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={settings.slug}
                    onChange={(e) => {
                      const slug = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "")
                      setSettings({ ...settings, slug })
                      setHasChanges(true)
                    }}
                    placeholder="tenant-slug"
                    className="font-mono"
                  />
                  <p className="text-xs text-muted-foreground">
                    Lowercase letters, numbers, and hyphens only. Used in URLs and API endpoints.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    value={settings.description}
                    onChange={(e) => {
                      setSettings({ ...settings, description: e.target.value })
                      setHasChanges(true)
                    }}
                    placeholder="Enter tenant description"
                    rows={4}
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="active" className="flex items-center gap-2">
                      Status
                      <Badge variant={settings.active ? "default" : "secondary"} className="gap-1">
                        <div className={cn("h-2 w-2 rounded-full", settings.active ? "bg-green-500" : "bg-red-500")} />
                        {settings.active ? "Active" : "Inactive"}
                      </Badge>
                    </Label>
                    <p className="text-sm text-muted-foreground">Enable or disable this tenant</p>
                  </div>
                  <Switch
                    id="active"
                    checked={settings.active}
                    onCheckedChange={(checked) => {
                      setSettings({ ...settings, active: checked })
                      setHasChanges(true)
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 2: Appearance & Widget Configuration */}
          <TabsContent value="appearance" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Colors</CardTitle>
                    <CardDescription>Customize your widget color scheme</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="primaryColor">Primary Color</Label>
                      <div className="flex gap-2">
                        <div
                          className="h-10 w-10 rounded-md border"
                          style={{ backgroundColor: settings.primaryColor }}
                        />
                        <Input
                          id="primaryColor"
                          value={settings.primaryColor}
                          onChange={(e) => {
                            setSettings({ ...settings, primaryColor: e.target.value })
                            setHasChanges(true)
                          }}
                          placeholder="#7C3AED"
                          className="flex-1 font-mono"
                        />
                        <Input
                          type="color"
                          value={settings.primaryColor}
                          onChange={(e) => {
                            setSettings({ ...settings, primaryColor: e.target.value })
                            setHasChanges(true)
                          }}
                          className="h-10 w-16 cursor-pointer"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="secondaryColor">Secondary Color</Label>
                      <div className="flex gap-2">
                        <div
                          className="h-10 w-10 rounded-md border"
                          style={{ backgroundColor: settings.secondaryColor }}
                        />
                        <Input
                          id="secondaryColor"
                          value={settings.secondaryColor}
                          onChange={(e) => {
                            setSettings({ ...settings, secondaryColor: e.target.value })
                            setHasChanges(true)
                          }}
                          placeholder="#3B82F6"
                          className="flex-1 font-mono"
                        />
                        <Input
                          type="color"
                          value={settings.secondaryColor}
                          onChange={(e) => {
                            setSettings({ ...settings, secondaryColor: e.target.value })
                            setHasChanges(true)
                          }}
                          className="h-10 w-16 cursor-pointer"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="buttonColor">Button Color</Label>
                      <div className="flex gap-2">
                        <div
                          className="h-10 w-10 rounded-md border"
                          style={{ backgroundColor: settings.buttonColor }}
                        />
                        <Input
                          id="buttonColor"
                          value={settings.buttonColor}
                          onChange={(e) => {
                            setSettings({ ...settings, buttonColor: e.target.value })
                            setHasChanges(true)
                          }}
                          placeholder="#7C3AED"
                          className="flex-1 font-mono"
                        />
                        <Input
                          type="color"
                          value={settings.buttonColor}
                          onChange={(e) => {
                            setSettings({ ...settings, buttonColor: e.target.value })
                            setHasChanges(true)
                          }}
                          className="h-10 w-16 cursor-pointer"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="textColor">Text Color</Label>
                      <div className="flex gap-2">
                        <div className="h-10 w-10 rounded-md border" style={{ backgroundColor: settings.textColor }} />
                        <Input
                          id="textColor"
                          value={settings.textColor}
                          onChange={(e) => {
                            setSettings({ ...settings, textColor: e.target.value })
                            setHasChanges(true)
                          }}
                          placeholder="#FFFFFF"
                          className="flex-1 font-mono"
                        />
                        <Input
                          type="color"
                          value={settings.textColor}
                          onChange={(e) => {
                            setSettings({ ...settings, textColor: e.target.value })
                            setHasChanges(true)
                          }}
                          className="h-10 w-16 cursor-pointer"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Widget Settings</CardTitle>
                    <CardDescription>Configure widget behavior and text</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="position">Widget Position</Label>
                      <Select
                        value={settings.widgetPosition}
                        onValueChange={(value: any) => {
                          setSettings({ ...settings, widgetPosition: value })
                          setHasChanges(true)
                        }}
                      >
                        <SelectTrigger id="position">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bottom-right">Bottom Right</SelectItem>
                          <SelectItem value="bottom-left">Bottom Left</SelectItem>
                          <SelectItem value="top-right">Top Right</SelectItem>
                          <SelectItem value="top-left">Top Left</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="welcomeMessage">Welcome Message</Label>
                        <span className="text-xs text-muted-foreground">{settings.welcomeMessage.length}/200</span>
                      </div>
                      <Textarea
                        id="welcomeMessage"
                        value={settings.welcomeMessage}
                        onChange={(e) => {
                          if (e.target.value.length <= 200) {
                            setSettings({ ...settings, welcomeMessage: e.target.value })
                            setHasChanges(true)
                          }
                        }}
                        placeholder="Enter welcome message"
                        rows={3}
                        maxLength={200}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="placeholderText">Placeholder Text</Label>
                      <Input
                        id="placeholderText"
                        value={settings.placeholderText}
                        onChange={(e) => {
                          setSettings({ ...settings, placeholderText: e.target.value })
                          setHasChanges(true)
                        }}
                        placeholder="Type your message..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="buttonText">Button Text</Label>
                      <Input
                        id="buttonText"
                        value={settings.buttonText}
                        onChange={(e) => {
                          setSettings({ ...settings, buttonText: e.target.value })
                          setHasChanges(true)
                        }}
                        placeholder="Chat with us"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="lg:sticky lg:top-6">
                <CardHeader>
                  <CardTitle>Live Preview</CardTitle>
                  <CardDescription>See how your widget will look</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative h-[600px] overflow-hidden rounded-lg border bg-gradient-to-br from-muted/30 to-muted/10">
                    {/* Floating chat button */}
                    <div
                      className={cn(
                        "absolute flex h-14 w-14 cursor-pointer items-center justify-center rounded-full shadow-lg transition-all hover:scale-110",
                        settings.widgetPosition === "bottom-right" && "bottom-4 right-4",
                        settings.widgetPosition === "bottom-left" && "bottom-4 left-4",
                        settings.widgetPosition === "top-right" && "right-4 top-4",
                        settings.widgetPosition === "top-left" && "left-4 top-4",
                      )}
                      style={{ backgroundColor: settings.buttonColor }}
                    >
                      <MessageSquare className="h-6 w-6" style={{ color: settings.textColor }} />
                    </div>

                    {/* Chat window preview */}
                    <div
                      className={cn(
                        "absolute w-80 rounded-lg border bg-card shadow-2xl",
                        settings.widgetPosition === "bottom-right" && "bottom-20 right-4",
                        settings.widgetPosition === "bottom-left" && "bottom-20 left-4",
                        settings.widgetPosition === "top-right" && "right-4 top-20",
                        settings.widgetPosition === "top-left" && "left-4 top-20",
                      )}
                    >
                      {/* Header */}
                      <div
                        className="flex items-center gap-3 rounded-t-lg p-4"
                        style={{ backgroundColor: settings.primaryColor, color: settings.textColor }}
                      >
                        <div className="h-8 w-8 rounded-full bg-white/20" />
                        <div>
                          <p className="font-semibold">{settings.name}</p>
                          <p className="text-xs opacity-90">Online</p>
                        </div>
                      </div>

                      {/* Messages */}
                      <div className="space-y-3 p-4">
                        <div className="rounded-lg bg-muted p-3 text-sm">{settings.welcomeMessage}</div>
                        <div
                          className="ml-auto w-fit max-w-[80%] rounded-lg p-3 text-sm"
                          style={{ backgroundColor: settings.secondaryColor, color: settings.textColor }}
                        >
                          I'm looking for a laptop
                        </div>
                      </div>

                      {/* Input */}
                      <div className="border-t p-4">
                        <div className="flex gap-2">
                          <Input placeholder={settings.placeholderText} className="flex-1" disabled />
                          <Button
                            size="icon"
                            style={{ backgroundColor: settings.buttonColor, color: settings.textColor }}
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

          {/* Tab 3: Embed Code & Integration */}
          <TabsContent value="embed" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Widget Installation</CardTitle>
                <CardDescription>Copy and paste this code into your website</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <pre className="overflow-x-auto rounded-lg bg-[#1e1e1e] p-4 text-sm text-gray-100">
                    <code className="font-mono">{embedCode}</code>
                  </pre>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute right-2 top-2"
                    onClick={() => copyToClipboard(embedCode, "embed")}
                  >
                    {copiedStates["embed"] ? (
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

                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="instructions">
                    <AccordionTrigger>Installation Instructions</AccordionTrigger>
                    <AccordionContent>
                      <ol className="list-inside list-decimal space-y-2 text-sm">
                        <li>Copy the code snippet above</li>
                        <li>
                          Paste it before the closing{" "}
                          <code className="rounded bg-muted px-1 py-0.5">&lt;/body&gt;</code> tag of your website
                        </li>
                        <li>The widget will appear automatically on your website</li>
                        <li>Customize the appearance in the Appearance tab</li>
                      </ol>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customization Options</CardTitle>
                <CardDescription>Advanced configuration examples</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="colors">
                    <AccordionTrigger>
                      <div className="flex items-center gap-2">
                        <Code2 className="h-4 w-4" />
                        Custom Colors Override
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="relative">
                        <pre className="overflow-x-auto rounded-lg bg-[#1e1e1e] p-4 text-sm text-gray-100">
                          <code className="font-mono">{customColorCode}</code>
                        </pre>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="absolute right-2 top-2"
                          onClick={() => copyToClipboard(customColorCode, "colors")}
                        >
                          {copiedStates["colors"] ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="position">
                    <AccordionTrigger>
                      <div className="flex items-center gap-2">
                        <Code2 className="h-4 w-4" />
                        Custom Position
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="relative">
                        <pre className="overflow-x-auto rounded-lg bg-[#1e1e1e] p-4 text-sm text-gray-100">
                          <code className="font-mono">{customPositionCode}</code>
                        </pre>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="absolute right-2 top-2"
                          onClick={() => copyToClipboard(customPositionCode, "position")}
                        >
                          {copiedStates["position"] ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="message">
                    <AccordionTrigger>
                      <div className="flex items-center gap-2">
                        <Code2 className="h-4 w-4" />
                        Custom Welcome Message
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="relative">
                        <pre className="overflow-x-auto rounded-lg bg-[#1e1e1e] p-4 text-sm text-gray-100">
                          <code className="font-mono">{customMessageCode}</code>
                        </pre>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="absolute right-2 top-2"
                          onClick={() => copyToClipboard(customMessageCode, "message")}
                        >
                          {copiedStates["message"] ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="events">
                    <AccordionTrigger>
                      <div className="flex items-center gap-2">
                        <Code2 className="h-4 w-4" />
                        Event Listeners
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="relative">
                        <pre className="overflow-x-auto rounded-lg bg-[#1e1e1e] p-4 text-sm text-gray-100">
                          <code className="font-mono">{eventListenersCode}</code>
                        </pre>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="absolute right-2 top-2"
                          onClick={() => copyToClipboard(eventListenersCode, "events")}
                        >
                          {copiedStates["events"] ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Test Widget</CardTitle>
                <CardDescription>Try your widget in a demo environment</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button onClick={handleTestWidget} className="w-full gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Open Widget Demo
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  Opens in a new tab with your current widget configuration
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>API Information</CardTitle>
                <CardDescription>Your API credentials and endpoints</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="apiEndpoint">API Endpoint</Label>
                  <div className="flex gap-2">
                    <Input id="apiEndpoint" value={settings.apiEndpoint} readOnly className="font-mono" />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(settings.apiEndpoint, "endpoint")}
                    >
                      {copiedStates["endpoint"] ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tenantId">Tenant ID</Label>
                  <div className="flex gap-2">
                    <Input id="tenantId" value={settings.tenantId} readOnly className="font-mono" />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(settings.tenantId, "tenantId")}
                    >
                      {copiedStates["tenantId"] ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="apiKey">API Key</Label>
                  <div className="flex gap-2">
                    <Input
                      id="apiKey"
                      type={showApiKey ? "text" : "password"}
                      value={settings.apiKey}
                      readOnly
                      className="font-mono"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setShowApiKey(!showApiKey)}
                      title={showApiKey ? "Hide" : "Show"}
                    >
                      {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(settings.apiKey, "apiKey")}
                      title="Copy"
                    >
                      {copiedStates["apiKey"] ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      Last regenerated:{" "}
                      {settings.lastApiKeyRegenerated
                        ? new Date(settings.lastApiKeyRegenerated).toLocaleString()
                        : "Never"}
                    </span>
                  </div>
                </div>

                <Button variant="destructive" className="w-full gap-2" onClick={() => setShowRegenerateDialog(true)}>
                  <RefreshCw className="h-4 w-4" />
                  Regenerate API Key
                </Button>

                <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
                  <p className="text-sm text-destructive">
                    Warning: Regenerating your API key will invalidate the current key. You'll need to update your
                    integration code with the new key.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={showRegenerateDialog} onOpenChange={setShowRegenerateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Regenerate API Key?</DialogTitle>
            <DialogDescription>
              This action will invalidate your current API key. You'll need to update your integration code with the new
              key. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRegenerateDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRegenerateApiKey} disabled={isRegenerating}>
              {isRegenerating ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Regenerating...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Regenerate
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
