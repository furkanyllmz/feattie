"use client"

import { AdminLayout } from "@/components/admin-layout"
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
import { Plus, Search, MoreVertical, Eye, UserCog, Shield, Ban, Trash2, Building2, X } from "lucide-react"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

type UserRole = 0 | 1
type UserStatus = "active" | "banned"

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role: UserRole
  status: UserStatus
  lastLogin: Date
  createdAt: Date
  avatar?: string
}

interface Tenant {
  id: string
  name: string
  slug: string
}

interface TenantAssignment {
  tenantId: string
  tenantName: string
  role: "viewer" | "editor" | "admin"
}

export default function UsersPage() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Modals state
  const [createUserOpen, setCreateUserOpen] = useState(false)
  const [assignTenantsOpen, setAssignTenantsOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  // Create user form state
  const [newUser, setNewUser] = useState({
    email: "",
    firstName: "",
    lastName: "",
    password: "",
    role: "0" as "0" | "1",
  })

  // Tenant assignment state
  const [assignedTenants, setAssignedTenants] = useState<TenantAssignment[]>([])
  const [selectedTenant, setSelectedTenant] = useState("")
  const [selectedTenantRole, setSelectedTenantRole] = useState<"viewer" | "editor" | "admin">("viewer")

  // Mock data
  const [users, setUsers] = useState<User[]>([
    {
      id: "1",
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      role: 1,
      status: "active",
      lastLogin: new Date(Date.now() - 1000 * 60 * 30),
      createdAt: new Date("2024-01-15"),
      avatar: "/diverse-user-avatars.png",
    },
    {
      id: "2",
      firstName: "Jane",
      lastName: "Smith",
      email: "jane@example.com",
      role: 0,
      status: "active",
      lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 2),
      createdAt: new Date("2024-02-20"),
    },
    {
      id: "3",
      firstName: "Mike",
      lastName: "Johnson",
      email: "mike@example.com",
      role: 0,
      status: "banned",
      lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
      createdAt: new Date("2024-03-10"),
    },
    {
      id: "4",
      firstName: "Sarah",
      lastName: "Williams",
      email: "sarah@example.com",
      role: 1,
      status: "active",
      lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 24),
      createdAt: new Date("2024-01-05"),
    },
    {
      id: "5",
      firstName: "David",
      lastName: "Brown",
      email: "david@example.com",
      role: 0,
      status: "active",
      lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 3),
      createdAt: new Date("2024-02-28"),
    },
  ])

  const availableTenants: Tenant[] = [
    { id: "1", name: "Acme Corp", slug: "acme-corp" },
    { id: "2", name: "TechStart Inc", slug: "techstart" },
    { id: "3", name: "Global Solutions", slug: "global-solutions" },
  ]

  const currentUser = {
    name: "John Doe",
    email: "john@example.com",
    role: 1,
    avatar: "/diverse-user-avatars.png",
  }

  // Filter users
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || user.status === statusFilter
    const matchesRole = roleFilter === "all" || user.role.toString() === roleFilter
    return matchesSearch && matchesStatus && matchesRole
  })

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  // Helper functions
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const getRelativeTime = (date: Date) => {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return "Just now"
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
    return date.toLocaleDateString()
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Action handlers
  const handleCreateUser = () => {
    const user: User = {
      id: (users.length + 1).toString(),
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
      role: Number.parseInt(newUser.role) as UserRole,
      status: "active",
      lastLogin: new Date(),
      createdAt: new Date(),
    }
    setUsers([...users, user])
    setCreateUserOpen(false)
    setNewUser({ email: "", firstName: "", lastName: "", password: "", role: "0" })
    toast({
      title: "User created",
      description: `${user.firstName} ${user.lastName} has been created successfully.`,
    })
  }

  const handleBanUser = (user: User) => {
    const newStatus = user.status === "active" ? "banned" : "active"
    setUsers(users.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u)))
    toast({
      title: newStatus === "banned" ? "User banned" : "User unbanned",
      description: `${user.firstName} ${user.lastName} has been ${newStatus}.`,
    })
  }

  const handleDeleteUser = () => {
    if (selectedUser) {
      setUsers(users.filter((u) => u.id !== selectedUser.id))
      toast({
        title: "User deleted",
        description: `${selectedUser.firstName} ${selectedUser.lastName} has been deleted.`,
        variant: "destructive",
      })
      setDeleteConfirmOpen(false)
      setSelectedUser(null)
    }
  }

  const handleEditRole = (user: User) => {
    const newRole = user.role === 1 ? 0 : 1
    setUsers(users.map((u) => (u.id === user.id ? { ...u, role: newRole as UserRole } : u)))
    toast({
      title: "Role updated",
      description: `${user.firstName} ${user.lastName} is now ${newRole === 1 ? "an Admin" : "a User"}.`,
    })
  }

  const handleOpenAssignTenants = (user: User) => {
    setSelectedUser(user)
    // Mock assigned tenants
    setAssignedTenants([
      { tenantId: "1", tenantName: "Acme Corp", role: "admin" },
      { tenantId: "2", tenantName: "TechStart Inc", role: "editor" },
    ])
    setAssignTenantsOpen(true)
  }

  const handleAddTenant = () => {
    if (selectedTenant) {
      const tenant = availableTenants.find((t) => t.id === selectedTenant)
      if (tenant && !assignedTenants.find((a) => a.tenantId === tenant.id)) {
        setAssignedTenants([
          ...assignedTenants,
          { tenantId: tenant.id, tenantName: tenant.name, role: selectedTenantRole },
        ])
        setSelectedTenant("")
        setSelectedTenantRole("viewer")
        toast({
          title: "Tenant assigned",
          description: `${tenant.name} has been assigned to the user.`,
        })
      }
    }
  }

  const handleRemoveTenant = (tenantId: string) => {
    const tenant = assignedTenants.find((a) => a.tenantId === tenantId)
    setAssignedTenants(assignedTenants.filter((a) => a.tenantId !== tenantId))
    if (tenant) {
      toast({
        title: "Tenant removed",
        description: `${tenant.tenantName} has been removed from the user.`,
      })
    }
  }

  return (
    <AdminLayout user={currentUser}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Users Management</h1>
            <p className="text-muted-foreground">Manage all users in your system</p>
          </div>
          <Button onClick={() => setCreateUserOpen(true)} className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="mr-2 h-4 w-4" />
            Create User
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="banned">Banned</SelectItem>
              </SelectContent>
            </Select>
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
              {paginatedUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <p className="text-sm">No users found</p>
                      <p className="text-xs">Try adjusting your search or filters</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">#{user.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={user.avatar || "/placeholder.svg"}
                            alt={`${user.firstName} ${user.lastName}`}
                          />
                          <AvatarFallback className="text-xs">
                            {getInitials(user.firstName, user.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">
                          {user.firstName} {user.lastName}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                    <TableCell>
                      {user.role === 1 ? (
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
                      {user.status === "active" ? (
                        <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20">
                          Active
                        </Badge>
                      ) : (
                        <Badge className="bg-red-500/10 text-red-600 hover:bg-red-500/20 border-red-500/20">
                          Banned
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
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleOpenAssignTenants(user)}>
                            <Building2 className="mr-2 h-4 w-4" />
                            Assign Tenants
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditRole(user)}>
                            <UserCog className="mr-2 h-4 w-4" />
                            Edit Role
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleBanUser(user)}>
                            <Ban className="mr-2 h-4 w-4" />
                            {user.status === "active" ? "Ban User" : "Unban User"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUser(user)
                              setDeleteConfirmOpen(true)
                            }}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users
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
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className={currentPage === page ? "bg-indigo-600 hover:bg-indigo-700" : ""}
                  >
                    {page}
                  </Button>
                ))}
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
      </div>

      {/* Create User Modal */}
      <Dialog open={createUserOpen} onOpenChange={setCreateUserOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>
              Add a new user to your system. They will receive an email with login instructions.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  placeholder="John"
                  value={newUser.firstName}
                  onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  placeholder="Doe"
                  value={newUser.lastName}
                  onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <RadioGroup
                value={newUser.role}
                onValueChange={(value) => setNewUser({ ...newUser, role: value as "0" | "1" })}
              >
                <div className="flex items-center space-x-2 rounded-lg border p-3 hover:bg-accent">
                  <RadioGroupItem value="0" id="role-user" />
                  <Label htmlFor="role-user" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">User</Badge>
                      <span className="text-sm text-muted-foreground">Standard user access</span>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 rounded-lg border p-3 hover:bg-accent">
                  <RadioGroupItem value="1" id="role-admin" />
                  <Label htmlFor="role-admin" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                        <Shield className="mr-1 h-3 w-3" />
                        Admin
                      </Badge>
                      <span className="text-sm text-muted-foreground">Full system access</span>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateUserOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateUser}
              disabled={!newUser.email || !newUser.firstName || !newUser.lastName || !newUser.password}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              Create User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Tenants Modal */}
      <Dialog open={assignTenantsOpen} onOpenChange={setAssignTenantsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Assign Tenants</DialogTitle>
            <DialogDescription>
              {selectedUser && (
                <div className="mt-2 flex items-center gap-3 rounded-lg border bg-muted/50 p-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={selectedUser.avatar || "/placeholder.svg"}
                      alt={`${selectedUser.firstName} ${selectedUser.lastName}`}
                    />
                    <AvatarFallback>{getInitials(selectedUser.firstName, selectedUser.lastName)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-foreground">
                      {selectedUser.firstName} {selectedUser.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                  </div>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Assigned Tenants List */}
            <div className="space-y-2">
              <Label>Assigned Tenants</Label>
              {assignedTenants.length === 0 ? (
                <div className="rounded-lg border border-dashed p-8 text-center">
                  <Building2 className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">No tenants assigned yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {assignedTenants.map((assignment) => (
                    <div key={assignment.tenantId} className="flex items-center justify-between rounded-lg border p-3">
                      <div className="flex items-center gap-3">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{assignment.tenantName}</p>
                          <Badge variant="outline" className="mt-1 text-xs">
                            {assignment.role.charAt(0).toUpperCase() + assignment.role.slice(1)}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveTenant(assignment.tenantId)}
                        className="h-8 w-8 text-muted-foreground hover:text-red-600"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add Tenant Section */}
            <div className="space-y-3 rounded-lg border bg-muted/50 p-4">
              <Label>Add Tenant</Label>
              <div className="flex gap-2">
                <Select value={selectedTenant} onValueChange={setSelectedTenant}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select tenant" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTenants
                      .filter((t) => !assignedTenants.find((a) => a.tenantId === t.id))
                      .map((tenant) => (
                        <SelectItem key={tenant.id} value={tenant.id}>
                          {tenant.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Select
                  value={selectedTenantRole}
                  onValueChange={(value) => setSelectedTenantRole(value as "viewer" | "editor" | "admin")}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="viewer">Viewer</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleAddTenant}
                  disabled={!selectedTenant}
                  size="icon"
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignTenantsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="py-4">
              <div className="flex items-center gap-3 rounded-lg border bg-muted/50 p-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={selectedUser.avatar || "/placeholder.svg"}
                    alt={`${selectedUser.firstName} ${selectedUser.lastName}`}
                  />
                  <AvatarFallback>{getInitials(selectedUser.firstName, selectedUser.lastName)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
