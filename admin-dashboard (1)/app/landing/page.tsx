import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Search, Zap, Code2, ArrowRight, Sparkles, ShoppingCart, CheckCircle2 } from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="border-b border-white/10 bg-black/50 backdrop-blur-xl fixed top-0 w-full z-50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/landing" className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">Feattie</span>
              </Link>
              <div className="hidden md:flex items-center gap-6">
                <Link href="#features" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Features
                </Link>
                <Link href="#pricing" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Pricing
                </Link>
                <Link href="#docs" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Docs
                </Link>
              </div>
            </div>
            <Button variant="ghost" className="text-white hover:bg-white/10">
              Sign In
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(124,58,237,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(59,130,246,0.15),transparent_50%)]" />

        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center space-y-8">
            <Badge
              variant="secondary"
              className="bg-purple-600/20 text-purple-300 border-purple-600/30 hover:bg-purple-600/30"
            >
              <Sparkles className="h-3 w-3 mr-1" />
              AI-Powered E-commerce Assistant
            </Badge>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-balance">
              Transform Your E-commerce
              <br />
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                with AI-Powered Chat
              </span>
            </h1>

            <p className="text-xl text-gray-400 max-w-2xl mx-auto text-balance leading-relaxed">
              Intelligent product recommendations, instant customer support, and seamless shopping experience
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button size="lg" className="bg-white text-black hover:bg-gray-100 text-base px-8">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 text-base px-8 bg-transparent"
              >
                View Demo
              </Button>
            </div>

            {/* Social Proof */}
            <div className="pt-12 flex flex-col items-center gap-4">
              <p className="text-sm text-gray-500">Trusted by leading e-commerce brands</p>
              <div className="flex items-center gap-8 opacity-50">
                <div className="text-2xl font-bold">Shopify</div>
                <div className="text-2xl font-bold">WooCommerce</div>
                <div className="text-2xl font-bold">BigCommerce</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-gradient-to-b from-black to-gray-950">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="bg-blue-600/20 text-blue-300 border-blue-600/30 mb-4">
              Features
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Everything you need to
              <br />
              <span className="text-gray-400">boost your sales</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all group">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Search className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-white text-xl">Smart Product Search</CardTitle>
                <CardDescription className="text-gray-400 leading-relaxed">
                  AI-powered semantic search understands customer intent and finds the perfect products instantly
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-purple-400" />
                    Natural language processing
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-purple-400" />
                    Context-aware results
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-purple-400" />
                    Multi-language support
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all group">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <ShoppingCart className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-white text-xl">Instant Recommendations</CardTitle>
                <CardDescription className="text-gray-400 leading-relaxed">
                  Personalized product suggestions based on customer preferences and browsing behavior
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-400" />
                    Real-time personalization
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-400" />
                    Behavioral analysis
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-400" />
                    Conversion optimization
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all group">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-white text-xl">Easy Integration</CardTitle>
                <CardDescription className="text-gray-400 leading-relaxed">
                  Get started in minutes with a single line of code. No complex setup required
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-purple-400" />
                    One-line installation
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-purple-400" />
                    Platform agnostic
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-purple-400" />
                    Customizable UI
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Integration Code Section */}
      <section className="py-20 px-4 bg-black">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="bg-purple-600/20 text-purple-300 border-purple-600/30 mb-4">
              <Code2 className="h-3 w-3 mr-1" />
              Integration
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Start in seconds</h2>
            <p className="text-gray-400 text-lg">Add Feattie to your website with just one line of code</p>
          </div>

          <Card className="bg-gray-950 border-white/10 overflow-hidden">
            <CardHeader className="border-b border-white/10 bg-white/5">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-500/50" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500/50" />
                  <div className="h-3 w-3 rounded-full bg-green-500/50" />
                </div>
                <span className="text-sm text-gray-500 ml-2">index.html</span>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <pre className="text-sm font-mono text-gray-300 overflow-x-auto">
                <code className="language-html">
                  {`<!-- Add this script to your website -->
<script 
  src="https://cdn.feattie.com/widget.js"
  data-tenant-id="your-tenant-id"
  async
></script>`}
                </code>
              </pre>
            </CardContent>
          </Card>

          <div className="mt-8 text-center">
            <p className="text-gray-400 mb-4">Need help with integration? Check out our documentation</p>
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 bg-transparent">
              View Documentation
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-black">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-balance">
            Ready to transform your
            <br />
            customer experience?
          </h2>
          <p className="text-xl text-gray-400 mb-8 text-balance">
            Join thousands of e-commerce businesses using Feattie to boost sales
          </p>
          <Button size="lg" className="bg-white text-black hover:bg-gray-100 text-base px-8">
            Get Started Free
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <p className="text-sm text-gray-500 mt-4">No credit card required • 14-day free trial</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-4 bg-black">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">Feattie</span>
              </div>
              <p className="text-sm text-gray-400">AI-powered chat widget for modern e-commerce</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="#features" className="hover:text-white transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#pricing" className="hover:text-white transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#docs" className="hover:text-white transition-colors">
                    Documentation
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="#about" className="hover:text-white transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#contact" className="hover:text-white transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="#privacy" className="hover:text-white transition-colors">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="#terms" className="hover:text-white transition-colors">
                    Terms
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 text-center text-sm text-gray-500">
            © 2025 Feattie. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
