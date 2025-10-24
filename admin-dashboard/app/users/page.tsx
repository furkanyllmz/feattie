
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Plus, Search, MoreVertical, Eye, UserCog, Shield, Ban, Trash2, Building2, X, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { authApi, tenantApi, UserListItem, TenantListItem, UserTenant } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"
import { Checkbox } from "@/components/ui/checkbox"

export default function UsersPage() {
  const { toast } = useToast()
  const { user: currentUser } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const itemsPerPage = 20

  const [users, setUsers] = useState<UserListItem[]>([])
  const [loading, setLoading] = useState(true)

  // Modals state
  const [banDialogOpen, setBanDialogOpen] = useState(false)
  const [tenantsDialogOpen, setTenantsDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null)
  const [banReason, setBanReason] = useState("")
  const [banDuration, setBanDuration] = useState("0")

  // Tenant management state
  const [allTenants, setAllTenants] = useState<TenantListItem[]>([])
  const [userTenants, setUserTenants] = useState<UserTenant[]>([])
  const [loadingTenants, setLoadingTenants] = useState(false)
  const [assigningTenant, setAssigningTenant] = useState(false)

  useEffect(() => {
    loadUsers()
  }, [searchQuery, currentPage])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const response = await authApi.getUsers({
        search: searchQuery || undefined,
        page: currentPage,
        pageSize: itemsPerPage,
      })
      console.log('Users API response:', response.data)
      console.log('First user:', response.data.users?.[0])
      setUsers(response.data.users)
      setTotalPages(response.data.pagination.totalPages)
    } catch (error) {
      console.error('Failed to load users:', error)
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Filter users locally by role
  const filteredUsers = users.filter((user) => {
    const matchesRole = roleFilter === "all" || user.roleNumber.toString() === roleFilter
    return matchesRole
  })

  const getInitials = (fullName: string | null | undefined, email: string | null | undefined) => {
    if (fullName && fullName.trim()) {
      const parts = fullName.trim().split(' ')
      if (parts.length >= 2) {
        return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase()
      }
      return parts[0].substring(0, 2).toUpperCase()
    }
    if (email && email.length >= 2) {
      return email.substring(0, 2).toUpperCase()
    }
    return "??"
  }

  const getRelativeTime = (dateString?: string) => {
    if (!dateString) return "Never"
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return "Just now"
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
    return date.toLocaleDateString()
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const handleEditRole = async (user: UserListItem) => {
    const newRole = user.roleNumber === 1 ? 0 : 1
    try {
      await authApi.updateUserRole(user.id, newRole)
      toast({
        title: "Role updated",
        description: `${user.fullName || user.email} is now ${newRole === 1 ? "an Admin" : "a User"}.`,
      })
      loadUsers()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to update role",
        variant: "destructive",
      })
    }
  }

  const handleOpenBanDialog = (user: UserListItem) => {
    setSelectedUser(user)
    setBanReason("")
    setBanDuration("0")
    setBanDialogOpen(true)
  }

  const handleOpenTenantsDialog = async (user: UserListItem) => {
    setSelectedUser(user)
    setLoadingTenants(true)
    setTenantsDialogOpen(true)

    try {
      // Load all tenants
      const tenantsRes = await tenantApi.getAll()
      setAllTenants(tenantsRes.data)

      // Load user's current tenants
      const userTenantsRes = await authApi.getUserTenants(user.id)
      setUserTenants(userTenantsRes.data)
    } catch (error) {
      console.error('Failed to load tenants:', error)
      toast({
        title: "Error",
        description: "Failed to load tenants",
        variant: "destructive",
      })
    } finally {
      setLoadingTenants(false)
    }
  }

  const handleAssignTenant = async (tenantId: number) => {
    if (!selectedUser) return
    setAssigningTenant(true)

    try {
      await authApi.assignUserToTenant(selectedUser.id, tenantId, 0) // 0 = VIEWER role
      toast({
        title: "Tenant assigned",
        description: "User has been assigned to the tenant successfully.",
      })

      // Reload user's tenants
      const userTenantsRes = await authApi.getUserTenants(selectedUser.id)
      setUserTenants(userTenantsRes.data)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to assign tenant",
        variant: "destructive",
      })
    } finally {
      setAssigningTenant(false)
    }
  }

  const handleRemoveTenant = async (tenantId: number) => {
    if (!selectedUser) return
    setAssigningTenant(true)

    try {
      await authApi.removeUserFromTenant(selectedUser.id, tenantId)
      toast({
        title: "Tenant removed",
        description: "User has been removed from the tenant.",
      })

      // Reload user's tenants
      const userTenantsRes = await authApi.getUserTenants(selectedUser.id)
      setUserTenants(userTenantsRes.data)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to remove tenant",
        variant: "destructive",
      })
    } finally {
      setAssigningTenant(false)
    }
  }

  const handleBanUser = async () => {
    if (!selectedUser) return
    try {
      if (selectedUser.isBanned) {
        await authApi.unbanUser(selectedUser.id)
        toast({
          title: "User unbanned",
          description: `${selectedUser.fullName || selectedUser.email} has been unbanned.`,
        })
      } else {
        await authApi.banUser(selectedUser.id, banReason, parseInt(banDuration))
        const banDurationText = banDuration === "0" ? "permanently" : `for ${banDuration} days`
        toast({
          title: "User banned",
          description: `${selectedUser.fullName || selectedUser.email} has been banned ${banDurationText}.`,
        })
      }
      setBanDialogOpen(false)
      setSelectedUser(null)
      loadUsers()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to ban/unban user",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users Management</h1>
          <p className="text-muted-foreground">Manage all users in your system</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search users by name or email..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="1">Admin</SelectItem>
              <SelectItem value="0">User</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">ID</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <p className="text-sm">No users found</p>
                      <p className="text-xs">Try adjusting your search or filters</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">#{user.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src="/placeholder.svg" alt={user.fullName || user.email} />
                          <AvatarFallback className="text-xs">
                            {getInitials(user.fullName, user.email)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{user.fullName || user.email}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                    <TableCell>
                      {user.roleNumber === 1 ? (
                        <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-amber-500/20">
                          <Shield className="mr-1 h-3 w-3" />
                          Admin
                        </Badge>
                      ) : (
                        <Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border-blue-500/20">
                          User
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.isBanned ? (
                        <Badge className="bg-red-500/10 text-red-600 hover:bg-red-500/20 border-red-500/20">
                          🚫 Banned
                        </Badge>
                      ) : user.status === "✅ ACTIVE" ? (
                        <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20">
                          Active
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-500/10 text-gray-600 hover:bg-gray-500/20 border-gray-500/20">
                          Inactive
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{getRelativeTime(user.lastLogin)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDate(user.createdAt)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => handleOpenTenantsDialog(user)}>
                            <Building2 className="mr-2 h-4 w-4" />
                            Manage Tenants
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem disabled={user.roleNumber !== 1} onClick={() => handleEditRole(user)}>
                            <UserCog className="mr-2 h-4 w-4" />
                            {user.roleNumber === 1 ? "Make User" : "Make Admin"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleOpenBanDialog(user)}
                            disabled={user.roleNumber === 1}
                          >
                            <Ban className="mr-2 h-4 w-4" />
                            {user.isBanned ? "Unban User" : "Ban User"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let page = i + 1
                if (totalPages > 5 && currentPage > 3) {
                  page = currentPage - 2 + i
                  if (page > totalPages) page = totalPages - 4 + i
                }
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className={currentPage === page ? "bg-indigo-600 hover:bg-indigo-700" : ""}
                  >
                    {page}
                  </Button>
                )
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Ban/Unban Dialog */}
      <Dialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{selectedUser?.isBanned ? "Unban User" : "Ban User"}</DialogTitle>
            <DialogDescription>
              {selectedUser?.isBanned
                ? "Remove the ban from this user account"
                : "Temporarily or permanently restrict this user's access"}
            </DialogDescription>
          </DialogHeader>
          {selectedUser && !selectedUser.isBanned && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="reason">Ban Reason</Label>
                <Input
                  id="reason"
                  placeholder="Reason for banning..."
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Duration</Label>
                <RadioGroup value={banDuration} onValueChange={setBanDuration}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="7" id="7days" />
                    <Label htmlFor="7days" className="font-normal cursor-pointer">
                      7 days
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="30" id="30days" />
                    <Label htmlFor="30days" className="font-normal cursor-pointer">
                      30 days
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="0" id="permanent" />
                    <Label htmlFor="permanent" className="font-normal cursor-pointer">
                      Permanent
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setBanDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={selectedUser?.isBanned ? "default" : "destructive"}
              onClick={handleBanUser}
              disabled={!selectedUser?.isBanned && !banReason}
            >
              {selectedUser?.isBanned ? "Unban User" : "Ban User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tenant Management Dialog */}
      <Dialog open={tenantsDialogOpen} onOpenChange={setTenantsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Manage Tenants - {selectedUser?.fullName || selectedUser?.email}</DialogTitle>
            <DialogDescription>
              Assign or remove tenants for this user
            </DialogDescription>
          </DialogHeader>

          {loadingTenants ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-4 py-4 max-h-[400px] overflow-y-auto">
              {allTenants.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No tenants available
                </div>
              ) : (
                allTenants.map((tenant) => {
                  const isAssigned = userTenants.some((ut) => ut.id === tenant.id)
                  return (
                    <div
                      key={tenant.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={isAssigned}
                          disabled={assigningTenant}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              handleAssignTenant(tenant.id)
                            } else {
                              handleRemoveTenant(tenant.id)
                            }
                          }}
                        />
                        <div>
                          <p className="font-medium">{tenant.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {tenant.slug} • {tenant.productCount} products
                          </p>
                        </div>
                      </div>
                      <Badge variant={tenant.isActive ? "default" : "secondary"}>
                        {tenant.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  )
                })
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setTenantsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
