"use client"

import { AdminLayout } from "@/components/admin-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Send, Trash2, Copy, ShoppingCart } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

interface Message {
  id: string
  type: "user" | "bot"
  content: string
  timestamp: Date
  products?: Array<{
    id: string
    name: string
    price: number
    image: string
  }>
}

const mockTenants = [
  { id: "1", name: "Acme Corp", slug: "acme-corp" },
  { id: "2", name: "TechStart Inc", slug: "techstart" },
  { id: "3", name: "Global Solutions", slug: "global-solutions" },
]

const mockProducts = [
  {
    id: "1",
    name: "Premium Wireless Headphones",
    price: 299.99,
    image: "/wireless-headphones.png",
  },
  {
    id: "2",
    name: "Smart Watch Pro",
    price: 399.99,
    image: "/smartwatch-lifestyle.png",
  },
  {
    id: "3",
    name: "Laptop Stand Aluminum",
    price: 79.99,
    image: "/laptop-stand.png",
  },
]

export default function ChatPage() {
  const user = {
    name: "John Doe",
    email: "john@example.com",
    role: 1,
    avatar: "/diverse-user-avatars.png",
  }

  const [selectedTenant, setSelectedTenant] = useState<string>("")
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !selectedTenant) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsTyping(true)

    // Simulate bot response
    setTimeout(() => {
      const shouldIncludeProducts =
        inputValue.toLowerCase().includes("product") ||
        inputValue.toLowerCase().includes("recommend") ||
        inputValue.toLowerCase().includes("show")

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content: shouldIncludeProducts
          ? "Here are some products I think you'll love based on your preferences:"
          : "Thank you for your message! I'm here to help you find the perfect products. You can ask me about product recommendations, pricing, or availability.",
        timestamp: new Date(),
        products: shouldIncludeProducts ? mockProducts : undefined,
      }

      setMessages((prev) => [...prev, botMessage])
      setIsTyping(false)
    }, 1500)
  }

  const handleClearChat = () => {
    setMessages([])
    toast({
      title: "Chat cleared",
      description: "All messages have been removed.",
    })
  }

  const handleCopyConversation = () => {
    const conversation = messages.map((msg) => `[${msg.type.toUpperCase()}] ${msg.content}`).join("\n\n")

    navigator.clipboard.writeText(conversation)
    toast({
      title: "Copied to clipboard",
      description: "Conversation has been copied.",
    })
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <AdminLayout user={user}>
      <div className="h-[calc(100vh-8rem)] flex gap-6">
        {/* Left Sidebar - Tenant Selector */}
        <div className="w-[30%] space-y-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Chat Test</h1>
            <p className="text-muted-foreground">Test chat functionality</p>
          </div>

          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Tenant</label>
                <Select value={selectedTenant} onValueChange={setSelectedTenant}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a tenant..." />
                  </SelectTrigger>
                  <SelectContent>
                    {mockTenants.map((tenant) => (
                      <SelectItem key={tenant.id} value={tenant.id}>
                        {tenant.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedTenant && (
                <div className="pt-4 border-t space-y-2">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Tenant:</span>
                    <p className="font-medium">{mockTenants.find((t) => t.id === selectedTenant)?.name}</p>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Slug:</span>
                    <p className="font-mono text-xs">{mockTenants.find((t) => t.id === selectedTenant)?.slug}</p>
                  </div>
                  <Badge variant="outline" className="mt-2">
                    Connected
                  </Badge>
                </div>
              )}

              {messages.length > 0 && (
                <div className="pt-4 border-t space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full bg-transparent"
                    onClick={handleCopyConversation}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Conversation
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-destructive hover:text-destructive bg-transparent"
                    onClick={handleClearChat}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear Chat
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-white dark:bg-gray-950 rounded-lg border">
          {!selectedTenant ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-2">
                <div className="text-4xl mb-4">💬</div>
                <h3 className="text-lg font-semibold">Select a tenant and start chatting</h3>
                <p className="text-sm text-muted-foreground">
                  Choose a tenant from the sidebar to begin testing the chat interface
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Messages Container */}
              <ScrollArea className="flex-1 p-6" ref={scrollAreaRef}>
                <div className="space-y-4">
                  {messages.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
                    </div>
                  )}

                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] space-y-2 ${message.type === "user" ? "items-end" : "items-start"} flex flex-col`}
                      >
                        <div
                          className={`rounded-2xl px-4 py-3 ${
                            message.type === "user"
                              ? "bg-purple-600 text-white"
                              : "bg-gray-100 dark:bg-gray-800 text-foreground"
                          }`}
                        >
                          <p className="text-sm leading-relaxed">{message.content}</p>
                        </div>

                        {/* Product Cards */}
                        {message.products && message.products.length > 0 && (
                          <div className="space-y-2 w-full">
                            {message.products.map((product) => (
                              <Card key={product.id} className="overflow-hidden">
                                <CardContent className="p-3 flex gap-3">
                                  <img
                                    src={product.image || "/placeholder.svg"}
                                    alt={product.name}
                                    className="w-20 h-20 object-cover rounded"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-sm truncate">{product.name}</h4>
                                    <p className="text-lg font-bold text-primary mt-1">${product.price}</p>
                                    <Button size="sm" className="mt-2 h-7 text-xs">
                                      <ShoppingCart className="h-3 w-3 mr-1" />
                                      Add to Cart
                                    </Button>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        )}

                        <span className="text-xs text-muted-foreground px-2">{formatTime(message.timestamp)}</span>
                      </div>
                    </div>
                  ))}

                  {/* Typing Indicator */}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-3">
                        <div className="flex gap-1">
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0ms" }}
                          />
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "150ms" }}
                          />
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "300ms" }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Input Area */}
              <div className="border-t p-4 bg-gray-50 dark:bg-gray-900">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Input
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault()
                          handleSendMessage()
                        }
                      }}
                      placeholder="Type your message..."
                      className="pr-16"
                      disabled={isTyping}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                      {inputValue.length}/500
                    </span>
                  </div>
                  <Button onClick={handleSendMessage} disabled={!inputValue.trim() || isTyping} size="icon">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Try asking: "Show me some products" or "What do you recommend?"
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
