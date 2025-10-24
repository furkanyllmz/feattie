
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
import { Plus, Search, MoreVertical, Eye, Settings, RefreshCw, Sparkles, Power, Trash2, Loader2, Download, Zap } from "lucide-react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useToast } from "@/hooks/use-toast"
import { tenantApi, productApi, TenantListItem, CreateTenantRequest } from "@/lib/api"
import { Label } from "@/components/ui/label"

export default function TenantsPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [tenants, setTenants] = useState<TenantListItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; tenant: TenantListItem | null }>({
    open: false,
    tenant: null,
  })
  const [createDialog, setCreateDialog] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [newTenant, setNewTenant] = useState<CreateTenantRequest>({
    Name: "",
    Slug: "",
    ShopifyStoreUrl: "",
    ShopifyAccessToken: "",
    MaxProducts: 10000,
  })
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  useEffect(() => {
    loadTenants()
  }, [statusFilter])

  const loadTenants = async () => {
    setIsLoading(true)
    try {
      console.log('Fetching tenants with params:', {
        isActive: statusFilter === "all" ? undefined : statusFilter === "active",
        page: currentPage,
        pageSize: itemsPerPage,
      })
      const response = await tenantApi.getAll({
        isActive: statusFilter === "all" ? undefined : statusFilter === "active",
        page: currentPage,
        pageSize: itemsPerPage,
      })
      console.log('Tenants response:', response.data)
      setTenants(response.data)
    } catch (error: any) {
      console.error('Failed to load tenants:', error)
      console.error('Error details:', error.response?.data, error.response?.status)
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to load tenants",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Filter tenants locally by search
  const filteredTenants = tenants.filter((tenant) => {
    const matchesSearch =
      tenant.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.slug?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  const totalPages = Math.ceil(filteredTenants.length / itemsPerPage)
  const paginatedTenants = filteredTenants.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const formatRelativeTime = (dateString?: string) => {
    if (!dateString) return "never"
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return "just now"
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    return `${Math.floor(diffInSeconds / 86400)}d ago`
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleToggleStatus = async (tenantId: number, currentStatus: boolean) => {
    try {
      await tenantApi.update(tenantId, { isActive: !currentStatus })
      toast({
        title: "Status updated",
        description: `Tenant ${!currentStatus ? "activated" : "deactivated"} successfully`,
      })
      loadTenants()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update status",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async () => {
    if (deleteDialog.tenant) {
      try {
        await tenantApi.delete(deleteDialog.tenant.id, false)
        toast({
          title: "Tenant deleted",
          description: `${deleteDialog.tenant.name} has been deleted.`,
        })
        setDeleteDialog({ open: false, tenant: null })
        loadTenants()
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.response?.data?.message || "Failed to delete tenant",
          variant: "destructive",
        })
      }
    }
  }

  const handleSyncProducts = async (tenantId: number) => {
    try {
      toast({
        title: "Syncing products",
        description: "This may take a few minutes...",
      })
      const response = await productApi.syncProducts(tenantId, false)
      toast({
        title: "Sync completed",
        description: `Synced ${response.data.totalProducts} products successfully`,
      })
      loadTenants()
    } catch (error: any) {
      toast({
        title: "Sync failed",
        description: error.response?.data?.message || "Failed to sync products",
        variant: "destructive",
      })
    }
  }

  const handleGenerateEmbeddings = async (tenantId: number) => {
    try {
      toast({
        title: "Generating embeddings",
        description: "This may take a while...",
      })
      const response = await productApi.generateEmbeddings(tenantId, false)
      toast({
        title: "Embeddings generated",
        description: `Generated embeddings for products`,
      })
      loadTenants()
    } catch (error: any) {
      toast({
        title: "Generation failed",
        description: error.response?.data?.message || "Failed to generate embeddings",
        variant: "destructive",
      })
    }
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
  }

  const handleNameChange = (value: string) => {
    setNewTenant((prev) => ({
      ...prev,
      Name: value,
      Slug: generateSlug(value),
    }))
  }

  const handleCreateTenant = async () => {
    if (!newTenant.Name || !newTenant.Slug || !newTenant.ShopifyStoreUrl) {
      toast({
        title: "Validation error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setCreateLoading(true)
    try {
      await tenantApi.create(newTenant)
      toast({
        title: "Tenant created",
        description: `${newTenant.Name} has been created successfully`,
      })
      setCreateDialog(false)
      setNewTenant({
        Name: "",
        Slug: "",
        ShopifyStoreUrl: "",
        ShopifyAccessToken: "",
        MaxProducts: 10000,
      })
      loadTenants()
    } catch (error: any) {
      toast({
        title: "Creation failed",
        description: error.response?.data?.message || "Failed to create tenant",
        variant: "destructive",
      })
    } finally {
      setCreateLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tenant Management</h1>
          <p className="text-muted-foreground">Manage all tenants in your system</p>
        </div>
        <Button onClick={() => setCreateDialog(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Create New Tenant
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
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
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
                      variant={tenant.isActive ? "default" : "secondary"}
                      className={
                        tenant.isActive
                          ? "bg-green-500 hover:bg-green-600"
                          : "bg-gray-500 hover:bg-gray-600"
                      }
                    >
                      {tenant.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">{tenant.productCount.toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm">{formatRelativeTime(tenant.lastProductSync)}</span>
                      {tenant.lastProductSync && (
                        <span className="text-xs text-muted-foreground">{formatDateTime(tenant.lastProductSync)}</span>
                      )}
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
                      <DropdownMenuContent align="end" className="w-[220px]">
                        <DropdownMenuItem onClick={() => navigate(`/tenants/${tenant.id}/settings`)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/tenants/${tenant.id}/settings`)}>
                          <Settings className="mr-2 h-4 w-4" />
                          Edit Settings
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleSyncProducts(tenant.id)}>
                          <Download className="mr-2 h-4 w-4" />
                          Sync Products
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleGenerateEmbeddings(tenant.id)}>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Generate Embeddings
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleToggleStatus(tenant.id, tenant.isActive)}>
                          <Power className="mr-2 h-4 w-4" />
                          {tenant.isActive ? "Deactivate" : "Activate"}
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

      {/* Create Tenant Dialog */}
      <Dialog open={createDialog} onOpenChange={setCreateDialog}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Create New Tenant</DialogTitle>
            <DialogDescription>Add a new tenant to your system with their Shopify store details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Tenant Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g., My Store"
                value={newTenant.Name}
                onChange={(e) => handleNameChange(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">The display name for this tenant</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">
                Slug <span className="text-red-500">*</span>
              </Label>
              <Input
                id="slug"
                placeholder="my-store"
                value={newTenant.Slug}
                onChange={(e) => setNewTenant((prev) => ({ ...prev, Slug: e.target.value }))}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">URL-friendly unique identifier (auto-generated from name)</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="shopifyUrl">
                Shopify Store URL <span className="text-red-500">*</span>
              </Label>
              <Input
                id="shopifyUrl"
                type="url"
                placeholder="https://my-store.myshopify.com"
                value={newTenant.ShopifyStoreUrl}
                onChange={(e) => setNewTenant((prev) => ({ ...prev, ShopifyStoreUrl: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">The full URL of the Shopify store</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accessToken">Shopify Access Token</Label>
              <Input
                id="accessToken"
                type="password"
                placeholder="shpat_..."
                value={newTenant.ShopifyAccessToken}
                onChange={(e) => setNewTenant((prev) => ({ ...prev, ShopifyAccessToken: e.target.value }))}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Optional: Required for private API access (leave empty for public API)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxProducts">Maximum Products</Label>
              <Input
                id="maxProducts"
                type="number"
                min="1"
                placeholder="10000"
                value={newTenant.MaxProducts}
                onChange={(e) => setNewTenant((prev) => ({ ...prev, MaxProducts: parseInt(e.target.value) || 10000 }))}
              />
              <p className="text-xs text-muted-foreground">Maximum number of products allowed for this tenant</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialog(false)} disabled={createLoading}>
              Cancel
            </Button>
            <Button onClick={handleCreateTenant} disabled={createLoading}>
              {createLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Tenant
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
