
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Save, Copy, Eye, EyeOff, RefreshCw, Sparkles, AlertCircle, CheckCircle2, MessageSquare, ArrowLeft, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { tenantApi, productApi, tenantSettingsApi, ragConfigApi, TenantDetails, TenantSettingsResponse } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"

interface TenantSettings {
  name: string
  slug: string
  shopifyStoreUrl: string
  active: boolean
  primaryColor: string
  secondaryColor: string
  widgetPosition: "bottom-right" | "bottom-left" | "top-right" | "top-left"
  welcomeMessage: string
  chatTitle: string
  apiKey: string
  webhookUrl: string
  lastSync: string | null
  productCount: number
  embeddingsStatus: "idle" | "processing" | "completed" | "error"
}

export default function TenantSettingsPage() {
  const params = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { user } = useAuth()
  const [tenantData, setTenantData] = useState<TenantDetails | null>(null)
  const [tenantSettings, setTenantSettings] = useState<TenantSettingsResponse | null>(null)
  const [ragConfig, setRagConfig] = useState<any>(null)
  const [openAIApiKey, setOpenAIApiKey] = useState("")
  const [llmApiKey, setLlmApiKey] = useState("")
  const [showOpenAIKey, setShowOpenAIKey] = useState(false)
  const [showLlmKey, setShowLlmKey] = useState(false)
  const [settings, setSettings] = useState<TenantSettings>({
    name: "",
    slug: "",
    shopifyStoreUrl: "",
    active: true,
    primaryColor: "#6366F1",
    secondaryColor: "#8B5CF6",
    widgetPosition: "bottom-right",
    welcomeMessage: "Hello! How can we help you today?",
    chatTitle: "Chat Assistant",
    apiKey: "sk_live_51234567890abcdef",
    webhookUrl: "",
    lastSync: null,
    productCount: 0,
    embeddingsStatus: "idle",
  })
  const [hasChanges, setHasChanges] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    loadTenantData()
  }, [params.id])

  useEffect(() => {
    if (hasChanges && autoSaveTimer) {
      clearTimeout(autoSaveTimer)
    }
    return () => {
      if (autoSaveTimer) clearTimeout(autoSaveTimer)
    }
  }, [settings])

  const loadTenantData = async () => {
    if (!params.id) return
    
    setIsLoading(true)
    try {
      // Load tenant basic info FIRST
      const tenantResponse = await tenantApi.getById(Number(params.id))
      const tenant = tenantResponse.data
      console.log('Tenant details loaded:', tenant)
      setTenantData(tenant)

      // Load tenant settings with error handling
      let tenantSettingsData: TenantSettingsResponse | null = null
      try {
        const settingsResponse = await tenantSettingsApi.get(Number(params.id))
        tenantSettingsData = settingsResponse.data
        console.log('Tenant settings loaded:', tenantSettingsData)
        setTenantSettings(tenantSettingsData)
      } catch (settingsError) {
        console.warn('Could not load settings, using defaults:', settingsError)
        tenantSettingsData = null
      }

      // Load RAG Configuration
      try {
        const ragResponse = await ragConfigApi.get(Number(params.id))
        console.log('RAG config loaded:', ragResponse.data)
        setRagConfig(ragResponse.data)
        
        // Set API keys if they exist
        if (ragResponse.data?.openAIApiKey) {
          setOpenAIApiKey(ragResponse.data.openAIApiKey)
        }
        if (ragResponse.data?.llmApiKey) {
          setLlmApiKey(ragResponse.data.llmApiKey)
        }
      } catch (ragError) {
        console.warn('Could not load RAG config:', ragError)
        setRagConfig(null)
      }

      // Set settings with loaded data
      const newSettings = {
        name: tenant.name,
        slug: tenant.slug,
        shopifyStoreUrl: tenant.shopifyStoreUrl,
        active: tenant.isActive,
        primaryColor: tenantSettingsData?.brandColorPrimary || "#6366F1",
        secondaryColor: tenantSettingsData?.brandColorSecondary || "#8B5CF6",
        widgetPosition: (tenantSettingsData?.widgetPosition as any) || "bottom-right",
        welcomeMessage: tenantSettingsData?.welcomeMessage || "Hello! How can we help you today?",
        chatTitle: tenantSettingsData?.chatTitle || `${tenant.name} Assistant`,
        apiKey: "sk_live_51234567890abcdef",
        webhookUrl: "",
        lastSync: tenant.lastProductSync || null,
        productCount: tenant.productCount,
        embeddingsStatus: tenant.embeddingsStatus as any,
      }
      console.log('Setting new settings:', newSettings)
      setSettings(newSettings)
    } catch (error: any) {
      console.error('Failed to load tenant:', error)
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to load tenant data",
        variant: "destructive",
      })
      navigate('/tenants')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!params.id) return
    
    setIsSaving(true)
    try {
      // Update tenant basic info (General tab)
      await tenantApi.update(Number(params.id), {
        name: settings.name,
        shopifyStoreUrl: settings.shopifyStoreUrl,
        isActive: settings.active,
      })

      // Update tenant settings (Appearance tab)
      await tenantSettingsApi.update(Number(params.id), {
        brandColorPrimary: settings.primaryColor,
        brandColorSecondary: settings.secondaryColor,
        widgetPosition: settings.widgetPosition,
        chatTitle: settings.chatTitle,
        welcomeMessage: settings.welcomeMessage,
      })

      setHasChanges(false)
      toast({
        title: "Settings saved",
        description: "Your tenant settings have been updated successfully.",
      })
      loadTenantData()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to save settings",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSync = async () => {
    if (!params.id) return
    
    setIsSyncing(true)
    try {
      toast({
        title: "Syncing products",
        description: "This may take a few minutes...",
      })
      const response = await productApi.syncProducts(Number(params.id), false)
      toast({
        title: "Products synced",
        description: `Synced ${response.data.totalProducts} products successfully`,
      })
      loadTenantData()
    } catch (error: any) {
      toast({
        title: "Sync failed",
        description: error.response?.data?.message || "Failed to sync products",
        variant: "destructive",
      })
    } finally {
      setIsSyncing(false)
    }
  }

  const handleGenerateEmbeddings = async () => {
    if (!params.id) return
    
    setIsGenerating(true)
    setSettings((prev) => ({ ...prev, embeddingsStatus: "processing" }))
    try {
      toast({
        title: "Generating embeddings",
        description: "This may take a while...",
      })
      await productApi.generateEmbeddings(Number(params.id), false)
      setSettings((prev) => ({ ...prev, embeddingsStatus: "completed" }))
      toast({
        title: "Embeddings generated",
        description: "Product embeddings have been generated successfully.",
      })
      loadTenantData()
    } catch (error: any) {
      setSettings((prev) => ({ ...prev, embeddingsStatus: "error" }))
      toast({
        title: "Generation failed",
        description: error.response?.data?.message || "Failed to generate embeddings",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard",
      description: "The content has been copied to your clipboard.",
    })
  }

  const API_URL = typeof window !== 'undefined' && (window as any).VITE_API_URL ? (window as any).VITE_API_URL : 'http://localhost:5243'
  
  const embedCode = `<!-- Feattie Chat Widget -->
<script>
  window.FeattieChat = {
    tenantSlug: '${settings.slug}',
    apiUrl: '${API_URL}',
    primaryColor: '${settings.primaryColor}',
    position: '${settings.widgetPosition}'
  };
</script>
<script src="https://cdn.feattie.com/widget.js"></script>`

  if (!user) return null

  if (isLoading) {
    return (
      <div className="flex h-[600px] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading tenant settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/tenants')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tenant Settings</h1>
            <p className="text-muted-foreground">{settings.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {hasChanges && (
            <Badge variant="secondary" className="gap-1">
              <AlertCircle className="h-3 w-3" />
              Unsaved changes
            </Badge>
          )}
          <Button onClick={handleSave} disabled={!hasChanges || isSaving} className="gap-2">
            <Save className="h-4 w-4" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="integration">Integration</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
          </TabsList>

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
                      setSettings({ ...settings, slug: e.target.value })
                      setHasChanges(true)
                    }}
                    placeholder="tenant-slug"
                    className="font-mono"
                  />
                  <p className="text-xs text-muted-foreground">Used in URLs and API endpoints</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shopifyStoreUrl">Shopify Store URL</Label>
                  <Input
                    id="shopifyStoreUrl"
                    value={settings.shopifyStoreUrl}
                    onChange={(e) => {
                      setSettings({ ...settings, shopifyStoreUrl: e.target.value })
                      setHasChanges(true)
                    }}
                    placeholder="your-store.myshopify.com"
                    className="font-mono"
                  />
                  <p className="text-xs text-muted-foreground">Your Shopify store domain</p>
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="active">Active Status</Label>
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

          <TabsContent value="appearance" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Appearance Settings</CardTitle>
                  <CardDescription>Customize the look and feel of your widget</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="primaryColor">Primary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="primaryColor"
                        type="color"
                        value={settings.primaryColor}
                        onChange={(e) => {
                          setSettings({ ...settings, primaryColor: e.target.value })
                          setHasChanges(true)
                        }}
                        className="h-10 w-20"
                      />
                      <Input
                        value={settings.primaryColor}
                        onChange={(e) => {
                          setSettings({ ...settings, primaryColor: e.target.value })
                          setHasChanges(true)
                        }}
                        className="font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="secondaryColor">Secondary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="secondaryColor"
                        type="color"
                        value={settings.secondaryColor}
                        onChange={(e) => {
                          setSettings({ ...settings, secondaryColor: e.target.value })
                          setHasChanges(true)
                        }}
                        className="h-10 w-20"
                      />
                      <Input
                        value={settings.secondaryColor}
                        onChange={(e) => {
                          setSettings({ ...settings, secondaryColor: e.target.value })
                          setHasChanges(true)
                        }}
                        className="font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="chatTitle">Chat Title</Label>
                    <Input
                      id="chatTitle"
                      value={settings.chatTitle}
                      onChange={(e) => {
                        setSettings({ ...settings, chatTitle: e.target.value })
                        setHasChanges(true)
                      }}
                      placeholder="Chat Assistant"
                    />
                    <p className="text-xs text-muted-foreground">Title shown in widget header</p>
                  </div>

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
                    <Label htmlFor="welcomeMessage">Welcome Message</Label>
                    <Textarea
                      id="welcomeMessage"
                      value={settings.welcomeMessage}
                      onChange={(e) => {
                        setSettings({ ...settings, welcomeMessage: e.target.value })
                        setHasChanges(true)
                      }}
                      placeholder="Enter welcome message"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Widget Preview</CardTitle>
                  <CardDescription>Live preview of your chat widget</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative h-[400px] overflow-hidden rounded-lg border bg-muted/30">
                    <div
                      className={cn(
                        "absolute flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all",
                        settings.widgetPosition === "bottom-right" && "bottom-4 right-4",
                        settings.widgetPosition === "bottom-left" && "bottom-4 left-4",
                        settings.widgetPosition === "top-right" && "right-4 top-4",
                        settings.widgetPosition === "top-left" && "left-4 top-4",
                      )}
                      style={{ backgroundColor: settings.primaryColor }}
                    >
                      <MessageSquare className="h-6 w-6 text-white" />
                    </div>
                    <div
                      className={cn(
                        "absolute w-80 rounded-lg border bg-card shadow-xl",
                        settings.widgetPosition === "bottom-right" && "bottom-20 right-4",
                        settings.widgetPosition === "bottom-left" && "bottom-20 left-4",
                        settings.widgetPosition === "top-right" && "right-4 top-20",
                        settings.widgetPosition === "top-left" && "left-4 top-20",
                      )}
                    >
                      <div
                        className="flex items-center gap-3 rounded-t-lg p-4 text-white"
                        style={{ backgroundColor: settings.primaryColor }}
                      >
                        <div className="h-8 w-8 rounded-full bg-white/20" />
                        <div>
                          <p className="font-semibold">{settings.chatTitle}</p>
                          <p className="text-xs opacity-90">Online</p>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="rounded-lg bg-muted p-3 text-sm">{settings.welcomeMessage}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="integration" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>API Configuration</CardTitle>
                <CardDescription>Manage your API keys and webhook settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="openAIApiKey">OpenAI API Key</Label>
                  <div className="flex gap-2">
                    <Input
                      id="openAIApiKey"
                      type={showOpenAIKey ? "text" : "password"}
                      value={openAIApiKey}
                      onChange={(e) => setOpenAIApiKey(e.target.value)}
                      placeholder="sk-... (or leave empty to keep existing)"
                      className="font-mono"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setShowOpenAIKey(!showOpenAIKey)}
                      title={showOpenAIKey ? "Hide" : "Show"}
                    >
                      {showOpenAIKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    {openAIApiKey && (
                      <Button variant="outline" size="icon" onClick={() => copyToClipboard(openAIApiKey)} title="Copy">
                        <Copy className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Leave empty to keep the existing key
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="llmApiKey">LLM (Language Model) API Key</Label>
                  <div className="flex gap-2">
                    <Input
                      id="llmApiKey"
                      type={showLlmKey ? "text" : "password"}
                      value={llmApiKey}
                      onChange={(e) => setLlmApiKey(e.target.value)}
                      placeholder="sk-... (or leave empty to keep existing)"
                      className="font-mono"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setShowLlmKey(!showLlmKey)}
                      title={showLlmKey ? "Hide" : "Show"}
                    >
                      {showLlmKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    {llmApiKey && (
                      <Button variant="outline" size="icon" onClick={() => copyToClipboard(llmApiKey)} title="Copy">
                        <Copy className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Leave empty to keep the existing key
                  </p>
                </div>

                <Button
                  onClick={async () => {
                    try {
                      await ragConfigApi.update(Number(params.id), {
                        openAIApiKey: openAIApiKey || undefined,
                        llmApiKey: llmApiKey || undefined,
                      })
                      toast({
                        title: "Success",
                        description: "API keys updated successfully",
                      })
                      loadTenantData()
                    } catch (error: any) {
                      toast({
                        title: "Error",
                        description: error.response?.data?.message || "Failed to update API keys",
                        variant: "destructive",
                      })
                    }
                  }}
                  className="w-full"
                >
                  Save API Keys
                </Button>

                <div className="border-t pt-4 mt-4">
                  <h4 className="text-sm font-semibold mb-2">Widget Integration</h4>
                  <div className="space-y-2">
                    <Label htmlFor="webhookUrl">Webhook URL</Label>
                    <div className="flex gap-2">
                      <Input
                        id="webhookUrl"
                        value={settings.webhookUrl}
                        onChange={(e) => {
                          setSettings({ ...settings, webhookUrl: e.target.value })
                          setHasChanges(true)
                        }}
                        placeholder="https://api.example.com/webhooks"
                        className="font-mono"
                      />
                      <Button variant="outline">Test</Button>
                    </div>
                    <p className="text-xs text-muted-foreground">Receive real-time notifications about events</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Embed Code</CardTitle>
                <CardDescription>Copy this code to integrate the widget into your website</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-sm">
                    <code className="font-mono">{embedCode}</code>
                  </pre>
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute right-2 top-2 bg-transparent"
                    onClick={() => copyToClipboard(embedCode)}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                  </Button>
                </div>
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                  <h4 className="mb-2 font-semibold text-primary">Integration Instructions</h4>
                  <ol className="list-inside list-decimal space-y-1 text-sm text-muted-foreground">
                    <li>Copy the embed code above</li>
                    <li>Paste it before the closing &lt;/body&gt; tag in your HTML</li>
                    <li>The widget will automatically appear on your website</li>
                    <li>Customize the appearance in the Appearance tab</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            {user?.role === 1 ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Product Synchronization</CardTitle>
                    <CardDescription>Sync your product catalog and generate embeddings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div>
                        <p className="font-medium">Product Count</p>
                        <p className="text-2xl font-bold text-primary">{settings.productCount}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Last Sync</p>
                        <p className="text-sm font-medium">
                          {settings.lastSync ? new Date(settings.lastSync).toLocaleString() : "Never synchronized"}
                        </p>
                      </div>
                    </div>

                    <Button onClick={handleSync} disabled={isSyncing} className="w-full gap-2">
                      <RefreshCw className={cn("h-4 w-4", isSyncing && "animate-spin")} />
                      {isSyncing ? "Syncing Products..." : "Sync Products"}
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>AI Embeddings</CardTitle>
                    <CardDescription>Generate embeddings for semantic search and recommendations</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div>
                        <p className="font-medium">Embeddings Status</p>
                        <div className="mt-1 flex items-center gap-2">
                          {settings.embeddingsStatus === "completed" && (
                            <>
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                              <span className="text-sm text-green-600 dark:text-green-400">Completed</span>
                            </>
                          )}
                          {settings.embeddingsStatus === "partial" && (
                            <>
                              <RefreshCw className="h-4 w-4 text-yellow-500" />
                              <span className="text-sm text-yellow-600 dark:text-yellow-400">Partial</span>
                            </>
                          )}
                          {settings.embeddingsStatus === "processing" && (
                            <>
                              <RefreshCw className="h-4 w-4 animate-spin text-primary" />
                              <span className="text-sm text-primary">Processing...</span>
                            </>
                          )}
                          {settings.embeddingsStatus === "idle" && (
                            <>
                              <AlertCircle className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">Not generated</span>
                            </>
                          )}
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">
                          {tenantData?.embeddingsGeneratedCount || 0} / {settings.productCount} products embedded
                        </p>
                      </div>
                    </div>

                    <Button
                      onClick={handleGenerateEmbeddings}
                      disabled={isGenerating || settings.embeddingsStatus === "processing"}
                      className="w-full gap-2 bg-transparent"
                      variant="outline"
                    >
                      <Sparkles className="h-4 w-4" />
                      {isGenerating ? "Generating Embeddings..." : "Generate Embeddings"}
                    </Button>

                    <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                      <p className="text-sm text-muted-foreground">
                        Embeddings enable advanced AI features like semantic search and personalized recommendations.
                        This process may take several minutes depending on your product count.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <AlertCircle className="mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-2 text-lg font-semibold">Admin Access Required</h3>
                  <p className="text-center text-sm text-muted-foreground">
                    You need administrator privileges to access product management features.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
    </div>
  )
}
