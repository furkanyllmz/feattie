"use client"

import { AdminLayout } from "@/components/admin-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Plus,
  Search,
  MoreVertical,
  Eye,
  Settings,
  RefreshCw,
  Sparkles,
  Power,
  Trash2,
  Loader2,
  Palette,
} from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { TenantConfigDrawer } from "@/components/tenant-config-drawer"

// Mock data
const mockTenants = [
  {
    id: 1,
    name: "Acme Corporation",
    slug: "acme-corp",
    status: "active",
    productCount: 1247,
    lastSync: new Date("2025-01-24T10:30:00"),
    createdAt: new Date("2024-01-15T08:00:00"),
  },
  {
    id: 2,
    name: "TechStart Inc",
    slug: "techstart",
    status: "active",
    productCount: 856,
    lastSync: new Date("2025-01-24T09:15:00"),
    createdAt: new Date("2024-03-22T14:30:00"),
  },
  {
    id: 3,
    name: "Global Retail Co",
    slug: "global-retail",
    status: "inactive",
    productCount: 2341,
    lastSync: new Date("2025-01-20T16:45:00"),
    createdAt: new Date("2023-11-08T11:20:00"),
  },
  {
    id: 4,
    name: "Fashion Hub",
    slug: "fashion-hub",
    status: "active",
    productCount: 3102,
    lastSync: new Date("2025-01-24T11:00:00"),
    createdAt: new Date("2024-06-10T09:45:00"),
  },
  {
    id: 5,
    name: "Electronics Plus",
    slug: "electronics-plus",
    status: "inactive",
    productCount: 567,
    lastSync: new Date("2025-01-18T13:20:00"),
    createdAt: new Date("2024-08-03T16:10:00"),
  },
]

type Tenant = (typeof mockTenants)[0]

export default function TenantsPage() {
  const router = useRouter()
  const user = {
    name: "John Doe",
    email: "john@example.com",
    role: 1,
    avatar: "/diverse-user-avatars.png",
  }

  const [tenants, setTenants] = useState(mockTenants)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; tenant: Tenant | null }>({
    open: false,
    tenant: null,
  })
  const [syncingTenants, setSyncingTenants] = useState<Set<number>>(new Set())
  const [embeddingTenants, setEmbeddingTenants] = useState<Set<number>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5
  const [configDrawer, setConfigDrawer] = useState<{ open: boolean; tenant: Tenant | null }>({
    open: false,
    tenant: null,
  })

  const filteredTenants = tenants.filter((tenant) => {
    const matchesSearch =
      tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.slug.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || tenant.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalPages = Math.ceil(filteredTenants.length / itemsPerPage)
  const paginatedTenants = filteredTenants.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const formatRelativeTime = (date: Date) => {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return "just now"
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    return `${Math.floor(diffInSeconds / 86400)}d ago`
  }

  const formatDateTime = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleSyncProducts = async (tenantId: number) => {
    setSyncingTenants((prev) => new Set(prev).add(tenantId))
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setSyncingTenants((prev) => {
      const next = new Set(prev)
      next.delete(tenantId)
      return next
    })
    // Update last sync time
    setTenants((prev) => prev.map((t) => (t.id === tenantId ? { ...t, lastSync: new Date() } : t)))
  }

  const handleGenerateEmbeddings = async (tenantId: number) => {
    setEmbeddingTenants((prev) => new Set(prev).add(tenantId))
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 3000))
    setEmbeddingTenants((prev) => {
      const next = new Set(prev)
      next.delete(tenantId)
      return next
    })
  }

  const handleToggleStatus = (tenantId: number) => {
    setTenants((prev) =>
      prev.map((t) => (t.id === tenantId ? { ...t, status: t.status === "active" ? "inactive" : "active" } : t)),
    )
  }

  const handleDelete = () => {
    if (deleteDialog.tenant) {
      setTenants((prev) => prev.filter((t) => t.id !== deleteDialog.tenant!.id))
      setDeleteDialog({ open: false, tenant: null })
    }
  }

  return (
    <AdminLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tenant Management</h1>
            <p className="text-muted-foreground">Manage all tenants in your system</p>
          </div>
          <Button className="bg-purple-600 hover:bg-purple-700">
            <Plus className="mr-2 h-4 w-4" />
            Create Tenant
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or slug..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="rounded-lg border bg-card">
          {isLoading ? (
            <div className="p-8">
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 animate-pulse rounded bg-muted" />
                ))}
              </div>
            </div>
          ) : paginatedTenants.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="rounded-full bg-muted p-3 mb-4">
                <Search className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-1">No tenants found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {searchQuery || statusFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Get started by creating your first tenant"}
              </p>
              {!searchQuery && statusFilter === "all" && (
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Tenant
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Products</TableHead>
                  <TableHead>Last Sync</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedTenants.map((tenant) => (
                  <TableRow key={tenant.id}>
                    <TableCell className="font-medium">#{tenant.id}</TableCell>
                    <TableCell className="font-medium">{tenant.name}</TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">{tenant.slug}</TableCell>
                    <TableCell>
                      <Badge
                        variant={tenant.status === "active" ? "default" : "secondary"}
                        className={
                          tenant.status === "active"
                            ? "bg-green-500 hover:bg-green-600"
                            : "bg-gray-500 hover:bg-gray-600"
                        }
                      >
                        {tenant.status === "active" ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">{tenant.productCount.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm">{formatRelativeTime(tenant.lastSync)}</span>
                        <span className="text-xs text-muted-foreground">{formatDateTime(tenant.lastSync)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDateTime(tenant.createdAt)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[200px]">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push(`/tenants/${tenant.id}/customize`)}>
                            <Palette className="mr-2 h-4 w-4" />
                            Customize Widget
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push(`/tenants/${tenant.id}/settings`)}>
                            <Settings className="mr-2 h-4 w-4" />
                            Settings
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleSyncProducts(tenant.id)}
                            disabled={syncingTenants.has(tenant.id)}
                          >
                            {syncingTenants.has(tenant.id) ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <RefreshCw className="mr-2 h-4 w-4" />
                            )}
                            Sync Products
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleGenerateEmbeddings(tenant.id)}
                            disabled={embeddingTenants.has(tenant.id)}
                          >
                            {embeddingTenants.has(tenant.id) ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Sparkles className="mr-2 h-4 w-4" />
                            )}
                            Generate Embeddings
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleToggleStatus(tenant.id)}>
                            <Power className="mr-2 h-4 w-4" />
                            {tenant.status === "active" ? "Deactivate" : "Activate"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setDeleteDialog({ open: true, tenant })}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, filteredTenants.length)} of {filteredTenants.length} tenants
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {[...Array(totalPages)].map((_, i) => (
                  <Button
                    key={i}
                    variant={currentPage === i + 1 ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(i + 1)}
                    className={currentPage === i + 1 ? "bg-purple-600 hover:bg-purple-700" : ""}
                  >
                    {i + 1}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, tenant: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Tenant</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{deleteDialog.tenant?.name}</strong>? This action cannot be undone
              and will permanently remove all associated data including{" "}
              <strong>{deleteDialog.tenant?.productCount.toLocaleString()} products</strong>.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog({ open: false, tenant: null })}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete Tenant
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tenant Config Drawer */}
      <TenantConfigDrawer
        open={configDrawer.open}
        onOpenChange={(open) => setConfigDrawer({ open, tenant: null })}
        tenant={configDrawer.tenant}
      />
    </AdminLayout>
  )
}
