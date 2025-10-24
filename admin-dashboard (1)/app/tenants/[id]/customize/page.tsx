"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Copy, Check, Eye, EyeOff, RefreshCw, ExternalLink, Loader2, MessageCircle, X } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"

export default function TenantCustomizePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)
  const [copiedTenantId, setCopiedTenantId] = useState(false)
  const [copiedApiKey, setCopiedApiKey] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)
  const [regenerateDialog, setRegenerateDialog] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)

  // Mock tenant data
  const [tenant] = useState({
    id: params.id,
    name: "Acme Corporation",
    slug: "acme-corp",
  })

  // Configuration state
  const [config, setConfig] = useState({
    primaryColor: "#6366f1",
    secondaryColor: "#8b5cf6",
    accentColor: "#10b981",
    position: "bottom-right",
    welcomeMessage: "Hi! How can I help you today?",
    placeholderText: "Type your message...",
    buttonText: "Chat with us",
    tenantId: "acme-corp-12345",
    apiKey: "sk_live_abc123xyz789def456ghi012jkl345mno678pqr901stu234vwx567yz",
  })

  const updateConfig = (key: string, value: string) => {
    setConfig((prev) => ({ ...prev, [key]: value }))
    setHasUnsavedChanges(true)
  }

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsSaving(false)
    setHasUnsavedChanges(false)
    toast({
      title: "Changes saved",
      description: "Your widget configuration has been updated successfully.",
    })
  }

  const handleCopyCode = (text: string, setter: (val: boolean) => void) => {
    navigator.clipboard.writeText(text)
    setter(true)
    setTimeout(() => setter(false), 2000)
  }

  const handleRegenerateApiKey = async () => {
    setIsRegenerating(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))
    const newKey = "sk_live_" + Math.random().toString(36).substring(2, 15).repeat(4)
    updateConfig("apiKey", newKey)
    setIsRegenerating(false)
    setRegenerateDialog(false)
    toast({
      title: "API Key regenerated",
      description: "Your new API key has been generated. Make sure to update your integration.",
      variant: "destructive",
    })
  }

  const installationCode = `<!-- Feattie Chat Widget -->
<script>
  window.FeattieChat = {
    tenantSlug: '${tenant.slug}',
    apiUrl: 'https://api.feattie.com',
    primaryColor: '${config.primaryColor}',
    position: '${config.position}'
  };
</script>
<script src="https://cdn.feattie.com/widget.js"></script>`

  const getPositionStyles = () => {
    const base = "fixed z-50"
    switch (config.position) {
      case "bottom-right":
        return `${base} bottom-6 right-6`
      case "bottom-left":
        return `${base} bottom-6 left-6`
      case "top-right":
        return `${base} top-6 right-6`
      case "top-left":
        return `${base} top-6 left-6`
      default:
        return `${base} bottom-6 right-6`
    }
  }

  // Keyboard shortcut for save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault()
        if (hasUnsavedChanges) handleSave()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [hasUnsavedChanges])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => router.push("/tenants")} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Tenants
              </Button>
              <div className="h-6 w-px bg-border" />
              <div>
                <h1 className="text-2xl font-bold">Customize Widget</h1>
                <p className="text-sm text-muted-foreground">{tenant.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {hasUnsavedChanges && <span className="text-sm text-muted-foreground">Unsaved changes</span>}
              <Button
                onClick={handleSave}
                disabled={!hasUnsavedChanges || isSaving}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left Column - Configuration */}
          <div className="lg:col-span-3 space-y-8">
            <Tabs defaultValue="appearance" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="appearance">Appearance</TabsTrigger>
                <TabsTrigger value="integration">Integration</TabsTrigger>
              </TabsList>

              {/* Appearance Tab */}
              <TabsContent value="appearance" className="space-y-8 mt-8">
                {/* Brand Colors */}
                <Card className="p-6 rounded-xl space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">Brand Colors</h3>
                    <p className="text-sm text-muted-foreground">Customize the widget colors to match your brand</p>
                  </div>

                  <div className="space-y-6">
                    {/* Primary Color */}
                    <div className="space-y-3">
                      <Label htmlFor="primaryColor" className="text-sm font-medium">
                        Primary Color
                      </Label>
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <input
                            type="color"
                            id="primaryColor"
                            value={config.primaryColor}
                            onChange={(e) => updateConfig("primaryColor", e.target.value)}
                            className="sr-only"
                          />
                          <label
                            htmlFor="primaryColor"
                            className="block w-16 h-16 rounded-xl cursor-pointer border-2 border-border hover:border-indigo-500 transition-colors shadow-sm"
                            style={{ backgroundColor: config.primaryColor }}
                          />
                        </div>
                        <Input
                          value={config.primaryColor}
                          onChange={(e) => updateConfig("primaryColor", e.target.value)}
                          placeholder="#6366f1"
                          className="flex-1 rounded-xl"
                        />
                      </div>
                    </div>

                    {/* Secondary Color */}
                    <div className="space-y-3">
                      <Label htmlFor="secondaryColor" className="text-sm font-medium">
                        Secondary Color
                      </Label>
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <input
                            type="color"
                            id="secondaryColor"
                            value={config.secondaryColor}
                            onChange={(e) => updateConfig("secondaryColor", e.target.value)}
                            className="sr-only"
                          />
                          <label
                            htmlFor="secondaryColor"
                            className="block w-16 h-16 rounded-xl cursor-pointer border-2 border-border hover:border-indigo-500 transition-colors shadow-sm"
                            style={{ backgroundColor: config.secondaryColor }}
                          />
                        </div>
                        <Input
                          value={config.secondaryColor}
                          onChange={(e) => updateConfig("secondaryColor", e.target.value)}
                          placeholder="#8b5cf6"
                          className="flex-1 rounded-xl"
                        />
                      </div>
                    </div>

                    {/* Accent Color */}
                    <div className="space-y-3">
                      <Label htmlFor="accentColor" className="text-sm font-medium">
                        Accent Color
                      </Label>
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <input
                            type="color"
                            id="accentColor"
                            value={config.accentColor}
                            onChange={(e) => updateConfig("accentColor", e.target.value)}
                            className="sr-only"
                          />
                          <label
                            htmlFor="accentColor"
                            className="block w-16 h-16 rounded-xl cursor-pointer border-2 border-border hover:border-indigo-500 transition-colors shadow-sm"
                            style={{ backgroundColor: config.accentColor }}
                          />
                        </div>
                        <Input
                          value={config.accentColor}
                          onChange={(e) => updateConfig("accentColor", e.target.value)}
                          placeholder="#10b981"
                          className="flex-1 rounded-xl"
                        />
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Widget Position */}
                <Card className="p-6 rounded-xl space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">Widget Position</h3>
                    <p className="text-sm text-muted-foreground">Choose where the chat widget appears on your site</p>
                  </div>

                  <RadioGroup value={config.position} onValueChange={(val) => updateConfig("position", val)}>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { value: "bottom-right", label: "Bottom Right", icon: "↘" },
                        { value: "bottom-left", label: "Bottom Left", icon: "↙" },
                        { value: "top-right", label: "Top Right", icon: "↗" },
                        { value: "top-left", label: "Top Left", icon: "↖" },
                      ].map((position) => (
                        <label
                          key={position.value}
                          className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            config.position === position.value
                              ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/20"
                              : "border-border hover:border-indigo-300"
                          }`}
                        >
                          <RadioGroupItem value={position.value} id={position.value} />
                          <div className="flex items-center gap-3 flex-1">
                            <div className="text-3xl">{position.icon}</div>
                            <span className="font-medium">{position.label}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </RadioGroup>
                </Card>

                {/* Messages */}
                <Card className="p-6 rounded-xl space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">Messages</h3>
                    <p className="text-sm text-muted-foreground">Customize the text shown in your widget</p>
                  </div>

                  <div className="space-y-6">
                    {/* Welcome Message */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="welcomeMessage" className="text-sm font-medium">
                          Welcome Message
                        </Label>
                        <span className="text-xs text-muted-foreground">{config.welcomeMessage.length}/200</span>
                      </div>
                      <Textarea
                        id="welcomeMessage"
                        value={config.welcomeMessage}
                        onChange={(e) => updateConfig("welcomeMessage", e.target.value.slice(0, 200))}
                        placeholder="Hi! How can I help you today?"
                        rows={4}
                        className="rounded-xl resize-none"
                      />
                      <p className="text-xs text-muted-foreground">First message users see when opening the chat</p>
                    </div>

                    {/* Placeholder Text */}
                    <div className="space-y-3">
                      <Label htmlFor="placeholderText" className="text-sm font-medium">
                        Placeholder Text
                      </Label>
                      <Input
                        id="placeholderText"
                        value={config.placeholderText}
                        onChange={(e) => updateConfig("placeholderText", e.target.value)}
                        placeholder="Type your message..."
                        className="rounded-xl"
                      />
                    </div>

                    {/* Chat Button Text */}
                    <div className="space-y-3">
                      <Label htmlFor="buttonText" className="text-sm font-medium">
                        Chat Button Text
                      </Label>
                      <Input
                        id="buttonText"
                        value={config.buttonText}
                        onChange={(e) => updateConfig("buttonText", e.target.value)}
                        placeholder="Chat with us"
                        className="rounded-xl"
                      />
                    </div>
                  </div>
                </Card>
              </TabsContent>

              {/* Integration Tab */}
              <TabsContent value="integration" className="space-y-8 mt-8">
                {/* Installation Code */}
                <Card className="p-6 rounded-xl space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">Installation Code</h3>
                    <p className="text-sm text-muted-foreground">Add this code to your website</p>
                  </div>

                  <div className="relative">
                    <div className="rounded-xl overflow-hidden border border-border">
                      <SyntaxHighlighter
                        language="html"
                        style={vscDarkPlus}
                        customStyle={{
                          margin: 0,
                          padding: "24px",
                          background: "#2d2d2d",
                          fontSize: "14px",
                          borderRadius: "12px",
                        }}
                      >
                        {installationCode}
                      </SyntaxHighlighter>
                    </div>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="absolute top-3 right-3 rounded-lg"
                      onClick={() => handleCopyCode(installationCode, setCopiedCode)}
                    >
                      {copiedCode ? (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                </Card>

                {/* Installation Steps */}
                <Card className="p-6 rounded-xl space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">Installation Steps</h3>
                    <p className="text-sm text-muted-foreground">Follow these steps to add the widget</p>
                  </div>

                  <div className="space-y-4">
                    {[
                      { step: 1, text: "Copy the code snippet above" },
                      { step: 2, text: "Paste it before the closing </body> tag in your HTML" },
                      { step: 3, text: "The widget will appear automatically on your site" },
                    ].map((item) => (
                      <div
                        key={item.step}
                        className="flex gap-4 p-4 rounded-xl border-l-4 border-indigo-500 bg-indigo-50 dark:bg-indigo-950/20"
                      >
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold">
                          {item.step}
                        </div>
                        <p className="text-sm leading-8">{item.text}</p>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* API Credentials */}
                <Card className="p-6 rounded-xl space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">API Credentials</h3>
                    <p className="text-sm text-muted-foreground">Use these credentials for API integration</p>
                  </div>

                  <div className="space-y-4">
                    {/* Tenant ID */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Tenant ID</Label>
                      <div className="flex gap-2">
                        <Input value={config.tenantId} readOnly className="rounded-xl font-mono text-sm" />
                        <Button
                          size="icon"
                          variant="outline"
                          className="rounded-xl bg-transparent"
                          onClick={() => handleCopyCode(config.tenantId, setCopiedTenantId)}
                        >
                          {copiedTenantId ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    {/* API Key */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">API Key</Label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Input
                            value={config.apiKey}
                            type={showApiKey ? "text" : "password"}
                            readOnly
                            className="rounded-xl font-mono text-sm pr-10"
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            className="absolute right-0 top-0 h-full rounded-xl"
                            onClick={() => setShowApiKey(!showApiKey)}
                          >
                            {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                        <Button
                          size="icon"
                          variant="outline"
                          className="rounded-xl bg-transparent"
                          onClick={() => handleCopyCode(config.apiKey, setCopiedApiKey)}
                        >
                          {copiedApiKey ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <Button
                      variant="destructive"
                      className="w-full rounded-xl"
                      onClick={() => setRegenerateDialog(true)}
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Regenerate API Key
                    </Button>
                  </div>
                </Card>

                {/* Test Widget */}
                <Card className="p-6 rounded-xl space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">Test Widget</h3>
                    <p className="text-sm text-muted-foreground">Preview your widget in action</p>
                  </div>

                  <Button className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700" size="lg">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open Test Page
                  </Button>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Live Preview */}
          <div className="lg:col-span-2">
            <div className="sticky top-24">
              <Card className="p-6 rounded-2xl shadow-lg">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">Live Preview</h3>
                    <p className="text-sm text-muted-foreground">See how your widget looks</p>
                  </div>

                  {/* Mock Website Preview */}
                  <div className="relative bg-gray-100 dark:bg-gray-900 rounded-xl overflow-hidden border border-border h-[500px]">
                    {/* Mock website content */}
                    <div className="p-6 space-y-4">
                      <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded-lg w-1/3" />
                      <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-2/3" />
                      <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
                      <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-lg" />
                    </div>

                    {/* Chat Widget Button */}
                    <button
                      className={`${getPositionStyles()} rounded-full shadow-lg hover:scale-105 transition-transform flex items-center gap-2 px-5 py-3 font-medium text-white`}
                      style={{ backgroundColor: config.primaryColor }}
                      onClick={() => setChatOpen(!chatOpen)}
                    >
                      <MessageCircle className="h-5 w-5" />
                      {config.buttonText}
                    </button>

                    {/* Chat Window */}
                    {chatOpen && (
                      <div
                        className={`${getPositionStyles()} w-80 h-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden`}
                        style={{ bottom: "5rem", right: "1.5rem" }}
                      >
                        {/* Chat Header */}
                        <div
                          className="p-4 text-white flex items-center justify-between"
                          style={{ backgroundColor: config.primaryColor }}
                        >
                          <div className="flex items-center gap-2">
                            <MessageCircle className="h-5 w-5" />
                            <span className="font-semibold">{config.buttonText}</span>
                          </div>
                          <button
                            onClick={() => setChatOpen(false)}
                            className="hover:bg-white/20 rounded-lg p-1 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Chat Messages */}
                        <div className="flex-1 p-4 space-y-3 overflow-y-auto">
                          <div className="flex gap-2">
                            <div
                              className="rounded-2xl rounded-tl-sm px-4 py-2 max-w-[80%] text-white text-sm"
                              style={{ backgroundColor: config.secondaryColor }}
                            >
                              {config.welcomeMessage}
                            </div>
                          </div>
                        </div>

                        {/* Chat Input */}
                        <div className="p-4 border-t border-border">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder={config.placeholderText}
                              className="flex-1 px-3 py-2 rounded-xl border border-border text-sm bg-background"
                              disabled
                            />
                            <button
                              className="px-4 py-2 rounded-xl text-white font-medium text-sm"
                              style={{ backgroundColor: config.accentColor }}
                              disabled
                            >
                              Send
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Regenerate API Key Dialog */}
      <Dialog open={regenerateDialog} onOpenChange={setRegenerateDialog}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Regenerate API Key</DialogTitle>
            <DialogDescription>
              Are you sure you want to regenerate your API key? Your current key will stop working immediately and
              you'll need to update your integration.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRegenerateDialog(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRegenerateApiKey}
              disabled={isRegenerating}
              className="rounded-xl"
            >
              {isRegenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
    </div>
  )
}
