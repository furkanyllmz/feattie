"use client"

import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import {
  Settings,
  Palette,
  Brain,
  Code,
  Copy,
  Check,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Save,
  AlertCircle,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface TenantConfig {
  // Widget Customization
  widgetTitle: string
  widgetButtonText: string
  primaryColor: string
  position: "bottom-right" | "bottom-left"

  // RAG Configuration
  embeddingProvider: "LOCAL" | "OPENAI"
  embeddingModel: string
  minSimilarityScore: number
  defaultTopK: number
  enableContextInjection: boolean
  enableConversationHistory: boolean
  deduplicateResults: boolean
  language: "tr" | "en" | "es" | "de" | "fr"
  systemPrompt: string

  // LLM Configuration
  llmProvider: "OPENAI" | "LOCAL"
  llmModel: string
  llmApiKey: string
  temperature: number
  maxTokens: number
}

interface TenantConfigDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tenant: {
    id: number
    name: string
    slug: string
  } | null
}

const defaultConfig: TenantConfig = {
  widgetTitle: "Chat Assistant",
  widgetButtonText: "💬",
  primaryColor: "#7C3AED",
  position: "bottom-right",
  embeddingProvider: "LOCAL",
  embeddingModel: "intfloat/multilingual-e5-large",
  minSimilarityScore: 0.3,
  defaultTopK: 5,
  enableContextInjection: true,
  enableConversationHistory: true,
  deduplicateResults: true,
  language: "tr",
  systemPrompt:
    "Sen bir e-ticaret alışveriş asistanısın. Müşterilere ürün önerileri sunarak ve sorularını yanıtlayarak yardımcı oluyorsun. Her zaman nazik, yardımsever ve profesyonel ol.",
  llmProvider: "OPENAI",
  llmModel: "gpt-4o-mini",
  llmApiKey: "",
  temperature: 0.7,
  maxTokens: 500,
}

export function TenantConfigDrawer({ open, onOpenChange, tenant }: TenantConfigDrawerProps) {
  const [config, setConfig] = useState<TenantConfig>(defaultConfig)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [copiedScript, setCopiedScript] = useState(false)
  const [copiedSlug, setCopiedSlug] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (tenant) {
      // Load tenant config (in real app, fetch from API)
      setConfig(defaultConfig)
      setHasUnsavedChanges(false)
    }
  }, [tenant])

  const handleConfigChange = <K extends keyof TenantConfig>(key: K, value: TenantConfig[K]) => {
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
      title: "Settings saved",
      description: "Tenant configuration has been updated successfully.",
    })
  }

  const generateEmbedScript = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.feattie.com"
    return `<script>
  window.FeattieChat = {
    tenantSlug: '${tenant?.slug}',
    apiUrl: '${apiUrl}'
  };
</script>
<script src="${apiUrl}/widget/widget.js"></script>`
  }

  const copyToClipboard = async (text: string, type: "script" | "slug") => {
    await navigator.clipboard.writeText(text)
    if (type === "script") {
      setCopiedScript(true)
      setTimeout(() => setCopiedScript(false), 2000)
    } else {
      setCopiedSlug(true)
      setTimeout(() => setCopiedSlug(false), 2000)
    }
    toast({
      title: "Copied to clipboard",
      description: type === "script" ? "Embed script copied" : "Tenant slug copied",
    })
  }

  const handleClose = () => {
    if (hasUnsavedChanges) {
      if (confirm("You have unsaved changes. Are you sure you want to close?")) {
        onOpenChange(false)
        setHasUnsavedChanges(false)
      }
    } else {
      onOpenChange(false)
    }
  }

  if (!tenant) return null

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader className="sticky top-0 bg-background pb-4 border-b z-10">
          <SheetTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Tenant Configuration
          </SheetTitle>
          <SheetDescription>
            Configure settings for <strong>{tenant.name}</strong>
          </SheetDescription>
          {hasUnsavedChanges && (
            <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 dark:bg-amber-950/20 px-3 py-2 rounded-md">
              <AlertCircle className="h-4 w-4" />
              You have unsaved changes
            </div>
          )}
        </SheetHeader>

        <div className="space-y-8 py-6">
          {/* Widget Customization Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b">
              <Palette className="h-5 w-5 text-purple-600" />
              <h3 className="text-lg font-semibold">Widget Customization</h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="widgetTitle">Widget Title</Label>
                <Input
                  id="widgetTitle"
                  value={config.widgetTitle}
                  onChange={(e) => handleConfigChange("widgetTitle", e.target.value)}
                  placeholder="Chat Assistant"
                />
                <p className="text-xs text-muted-foreground">The title shown in the chat widget header</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="widgetButtonText">Widget Button Text/Emoji</Label>
                <Input
                  id="widgetButtonText"
                  value={config.widgetButtonText}
                  onChange={(e) => handleConfigChange("widgetButtonText", e.target.value)}
                  placeholder="💬"
                  maxLength={10}
                />
                <p className="text-xs text-muted-foreground">Text or emoji shown on the chat button</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="primaryColor">Primary Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="primaryColor"
                    type="color"
                    value={config.primaryColor}
                    onChange={(e) => handleConfigChange("primaryColor", e.target.value)}
                    className="w-20 h-10 cursor-pointer"
                  />
                  <Input
                    value={config.primaryColor}
                    onChange={(e) => handleConfigChange("primaryColor", e.target.value)}
                    placeholder="#7C3AED"
                    className="flex-1 font-mono"
                  />
                </div>
                <p className="text-xs text-muted-foreground">Main color for the widget interface</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="position">Widget Position</Label>
                <Select value={config.position} onValueChange={(value: any) => handleConfigChange("position", value)}>
                  <SelectTrigger id="position">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bottom-right">Bottom Right</SelectItem>
                    <SelectItem value="bottom-left">Bottom Left</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Where the widget button appears on the page</p>
              </div>

              {/* Widget Preview */}
              <div className="space-y-2">
                <Label>Live Preview</Label>
                <div className="relative h-32 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-lg border overflow-hidden">
                  <div
                    className={`absolute ${config.position === "bottom-right" ? "bottom-4 right-4" : "bottom-4 left-4"}`}
                  >
                    <button
                      className="flex items-center justify-center w-14 h-14 rounded-full shadow-lg text-white text-xl transition-transform hover:scale-110"
                      style={{ backgroundColor: config.primaryColor }}
                    >
                      {config.widgetButtonText}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RAG Configuration Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b">
              <Brain className="h-5 w-5 text-indigo-600" />
              <h3 className="text-lg font-semibold">RAG Configuration</h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="embeddingProvider">Embedding Provider</Label>
                <Select
                  value={config.embeddingProvider}
                  onValueChange={(value: any) => handleConfigChange("embeddingProvider", value)}
                >
                  <SelectTrigger id="embeddingProvider">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOCAL">LOCAL</SelectItem>
                    <SelectItem value="OPENAI">OPENAI</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Provider for generating product embeddings</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="embeddingModel">Embedding Model</Label>
                <Input
                  id="embeddingModel"
                  value={config.embeddingModel}
                  onChange={(e) => handleConfigChange("embeddingModel", e.target.value)}
                  placeholder="intfloat/multilingual-e5-large"
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Model used for embeddings (default: intfloat/multilingual-e5-large for LOCAL, text-embedding-3-large
                  for OPENAI)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="minSimilarityScore">
                  Minimum Similarity Score: <Badge variant="secondary">{config.minSimilarityScore.toFixed(1)}</Badge>
                </Label>
                <Slider
                  id="minSimilarityScore"
                  min={0}
                  max={1}
                  step={0.1}
                  value={[config.minSimilarityScore]}
                  onValueChange={([value]) => handleConfigChange("minSimilarityScore", value)}
                  className="py-4"
                />
                <p className="text-xs text-muted-foreground">
                  Minimum similarity threshold for product matches (0.0 - 1.0)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="defaultTopK">Default Top K Results</Label>
                <Input
                  id="defaultTopK"
                  type="number"
                  min={1}
                  max={20}
                  value={config.defaultTopK}
                  onChange={(e) => handleConfigChange("defaultTopK", Number.parseInt(e.target.value) || 5)}
                />
                <p className="text-xs text-muted-foreground">Number of top results to return (1-20)</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="enableContextInjection">Enable Context Injection</Label>
                    <p className="text-xs text-muted-foreground">Inject product context into LLM prompts</p>
                  </div>
                  <Switch
                    id="enableContextInjection"
                    checked={config.enableContextInjection}
                    onCheckedChange={(checked) => handleConfigChange("enableContextInjection", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="enableConversationHistory">Enable Conversation History</Label>
                    <p className="text-xs text-muted-foreground">Maintain chat history for context</p>
                  </div>
                  <Switch
                    id="enableConversationHistory"
                    checked={config.enableConversationHistory}
                    onCheckedChange={(checked) => handleConfigChange("enableConversationHistory", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="deduplicateResults">Deduplicate Results</Label>
                    <p className="text-xs text-muted-foreground">Remove duplicate products from results</p>
                  </div>
                  <Switch
                    id="deduplicateResults"
                    checked={config.deduplicateResults}
                    onCheckedChange={(checked) => handleConfigChange("deduplicateResults", checked)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select value={config.language} onValueChange={(value: any) => handleConfigChange("language", value)}>
                  <SelectTrigger id="language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tr">Turkish (TR)</SelectItem>
                    <SelectItem value="en">English (EN)</SelectItem>
                    <SelectItem value="es">Spanish (ES)</SelectItem>
                    <SelectItem value="de">German (DE)</SelectItem>
                    <SelectItem value="fr">French (FR)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Default language for chat responses</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="systemPrompt">System Prompt</Label>
                <Textarea
                  id="systemPrompt"
                  value={config.systemPrompt}
                  onChange={(e) => handleConfigChange("systemPrompt", e.target.value)}
                  rows={6}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Instructions for the AI assistant behavior and personality
                </p>
              </div>
            </div>
          </div>

          {/* LLM Configuration Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b">
              <Sparkles className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold">LLM Configuration</h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="llmProvider">LLM Provider</Label>
                <Select
                  value={config.llmProvider}
                  onValueChange={(value: any) => handleConfigChange("llmProvider", value)}
                >
                  <SelectTrigger id="llmProvider">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OPENAI">OPENAI</SelectItem>
                    <SelectItem value="LOCAL">LOCAL</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Provider for the language model</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="llmModel">LLM Model</Label>
                <Input
                  id="llmModel"
                  value={config.llmModel}
                  onChange={(e) => handleConfigChange("llmModel", e.target.value)}
                  placeholder="gpt-4o-mini"
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">Model name (e.g., gpt-4o-mini, gpt-4, claude-3-opus)</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="llmApiKey">LLM API Key</Label>
                <Input
                  id="llmApiKey"
                  type="password"
                  value={config.llmApiKey}
                  onChange={(e) => handleConfigChange("llmApiKey", e.target.value)}
                  placeholder="sk-..."
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">API key for the LLM provider (kept secure)</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="temperature">
                  Temperature: <Badge variant="secondary">{config.temperature.toFixed(1)}</Badge>
                </Label>
                <Slider
                  id="temperature"
                  min={0}
                  max={2}
                  step={0.1}
                  value={[config.temperature]}
                  onValueChange={([value]) => handleConfigChange("temperature", value)}
                  className="py-4"
                />
                <p className="text-xs text-muted-foreground">
                  Controls randomness: lower is more focused, higher is more creative (0.0 - 2.0)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxTokens">Max Tokens</Label>
                <Input
                  id="maxTokens"
                  type="number"
                  min={100}
                  max={2000}
                  value={config.maxTokens}
                  onChange={(e) => handleConfigChange("maxTokens", Number.parseInt(e.target.value) || 500)}
                />
                <p className="text-xs text-muted-foreground">Maximum length of generated responses (100-2000)</p>
              </div>
            </div>
          </div>

          {/* Widget Script Generation Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b">
              <Code className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold">Widget Script</h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Tenant Slug</Label>
                <div className="flex gap-2">
                  <Input value={tenant.slug} readOnly className="font-mono text-sm bg-muted" />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(tenant.slug, "slug")}
                    className="shrink-0"
                  >
                    {copiedSlug ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Unique identifier for this tenant</p>
              </div>

              <div className="space-y-2">
                <Label>Embed Code</Label>
                <div className="relative">
                  <pre className="bg-gray-950 text-gray-100 p-4 rounded-lg text-xs overflow-x-auto">
                    <code>{generateEmbedScript()}</code>
                  </pre>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => copyToClipboard(generateEmbedScript(), "script")}
                    className="absolute top-2 right-2"
                  >
                    {copiedScript ? (
                      <>
                        <Check className="h-3 w-3 mr-1" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Add this code to your website before the closing &lt;/body&gt; tag
                </p>
              </div>

              <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <MessageSquare className="h-4 w-4 text-blue-600" />
                <div className="flex-1 text-sm">
                  <p className="font-medium text-blue-900 dark:text-blue-100">Test your widget</p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    Preview how the chat widget looks on your site
                  </p>
                </div>
                <Button variant="outline" size="sm" className="shrink-0 bg-transparent">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Preview
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Save Button */}
        <div className="sticky bottom-0 bg-background pt-4 pb-2 border-t mt-6">
          <Button
            onClick={handleSave}
            disabled={!hasUnsavedChanges || isSaving}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {isSaving ? (
              <>
                <div className="h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
