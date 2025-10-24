import type React from "react"

import { useState } from "react"
import { useLocation, Link } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import {
  Home,
  Building2,
  Users,
  Settings,
  MessageSquare,
  ChevronLeft,
  Menu,
  Search,
  Bell,
  Moon,
  Sun,
  LogOut,
  User,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  adminOnly?: boolean
}

const adminNavItems: NavItem[] = [
  { title: "Dashboard", href: "/", icon: Home },
  { title: "Tenants Management", href: "/tenants", icon: Building2, adminOnly: true },
  { title: "Users Management", href: "/users", icon: Users, adminOnly: true },
  { title: "Settings", href: "/settings", icon: Settings },
  { title: "Chat Test", href: "/chat", icon: MessageSquare },
]

const userNavItems: NavItem[] = [
  { title: "Dashboard", href: "/", icon: Home },
  { title: "Widget Settings", href: "/tenant-settings", icon: Settings },
  { title: "Chat Test", href: "/chat", icon: MessageSquare },
]

interface AdminLayoutProps {
  children: React.ReactNode
  user: {
    name: string
    email: string
    role: number // 1 = admin, 0 = regular user
    avatar?: string
  }
}

export function AdminLayout({
  children,
  user,
}: AdminLayoutProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { pathname } = useLocation()
  const { logout } = useAuth()

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle("dark")
  }

  const navItems = user.role === 1 ? adminNavItems : userNavItems
  const filteredNavItems = navItems.filter((item) => !item.adminOnly || user.role === 1)

  const getBreadcrumbs = () => {
    const paths = pathname.split("/").filter(Boolean)
    if (paths.length === 0) return ["Dashboard"]
    return ["Dashboard", ...paths.map((path) => path.charAt(0).toUpperCase() + path.slice(1))]
  }

  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className={cn("flex h-16 items-center border-b px-4", mobile ? "border-border" : "border-sidebar-border")}>
        <Link to="/" className="flex items-center gap-2">
          {(!collapsed || mobile) && <span className="text-lg font-semibold text-sidebar-foreground">Feattie Admin Panel</span>}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3">
        {filteredNavItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => mobile && setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-sidebar-primary/20"
                  : mobile
                    ? "text-foreground hover:bg-accent hover:text-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {(!collapsed || mobile) && <span>{item.title}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Dark Mode Toggle */}
      <div className={cn("border-t p-3", mobile ? "border-border" : "border-sidebar-border")}>
        <Button
          variant="ghost"
          size={collapsed && !mobile ? "icon" : "default"}
          onClick={toggleDarkMode}
          className={cn(
            "w-full justify-start gap-3",
            mobile
              ? "text-foreground hover:bg-accent hover:text-accent-foreground"
              : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
          )}
        >
          {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          {(!collapsed || mobile) && <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>}
        </Button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-300 lg:block",
          collapsed ? "w-16" : "w-64",
        )}
      >
        <SidebarContent />
        {/* Collapse Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 h-6 w-6 rounded-full border border-sidebar-border bg-sidebar text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
        >
          <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
        </Button>
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent mobile />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="flex h-16 items-center gap-4 border-b bg-card px-4 lg:px-6">
          {/* Mobile Menu Button */}
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>

          {/* Breadcrumbs */}
          <div className="hidden items-center gap-2 text-sm text-muted-foreground md:flex">
            {getBreadcrumbs().map((crumb, index) => (
              <div key={index} className="flex items-center gap-2">
                {index > 0 && <span>/</span>}
                <span className={index === getBreadcrumbs().length - 1 ? "text-foreground font-medium" : ""}>
                  {crumb}
                </span>
              </div>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative ml-auto flex-1 md:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search..." className="pl-9" />
          </div>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-accent p-0 text-xs text-accent-foreground">
              3
            </Badge>
          </Button>

          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 px-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="hidden flex-col items-start text-left text-sm md:flex">
                  <span className="font-medium">{user.name}</span>
                  <Badge variant="secondary" className="h-4 px-1 text-xs bg-primary/10 text-primary">
                    {user.role === 1 ? "Admin" : "User"}
                  </Badge>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-background p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
