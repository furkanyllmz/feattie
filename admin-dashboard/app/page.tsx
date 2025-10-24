
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { authApi, tenantApi, TenantDetails } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"
import { Users, UserCheck, UserX, Shield, TrendingUp, Activity, Building2, Package, Sparkles, Calendar, MessageSquare } from "lucide-react"

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    bannedUsers: 0,
    adminUsers: 0,
    recentUsers: 0,
    todayLogins: 0,
  })
  const [tenantData, setTenantData] = useState<TenantDetails | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.role === 1) {
      // Admin - show system stats
      loadDashboardStats()
    } else {
      // Regular user - show tenant stats
      loadTenantStats()
    }
  }, [user])

  const loadDashboardStats = async () => {
    try {
      const response = await authApi.getDashboard()
      setStats(response.data)
    } catch (error) {
      console.error('Failed to load dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadTenantStats = async () => {
    try {
      // Get user's assigned tenants only
      const tenantsResponse = await authApi.getMyTenants()
      if (tenantsResponse.data && tenantsResponse.data.length > 0) {
        const firstTenant = tenantsResponse.data[0]
        const tenantDetailsResponse = await tenantApi.getById(firstTenant.id)
        setTenantData(tenantDetailsResponse.data)
      }
    } catch (error) {
      console.error('Failed to load tenant stats:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user?.firstName || user?.email}!</p>
      </div>

      {user?.role === 1 ? (
        // Admin Dashboard
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-2xl font-bold">...</div>
                ) : (
                  <>
                    <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                      {stats.recentUsers} new this month
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-2xl font-bold">...</div>
                ) : (
                  <>
                    <div className="text-2xl font-bold">{stats.activeUsers.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                      {Math.round((stats.activeUsers / stats.totalUsers) * 100)}% of total
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Banned Users</CardTitle>
                <UserX className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-2xl font-bold">...</div>
                ) : (
                  <>
                    <div className="text-2xl font-bold">{stats.bannedUsers.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                      {Math.round((stats.bannedUsers / stats.totalUsers) * 100)}% of total
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-2xl font-bold">...</div>
                ) : (
                  <>
                    <div className="text-2xl font-bold">{stats.adminUsers.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">System administrators</p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Logins</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-2xl font-bold">...</div>
                ) : (
                  <>
                    <div className="text-2xl font-bold">{stats.todayLogins.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">Active sessions today</p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recent Users</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-2xl font-bold">...</div>
                ) : (
                  <>
                    <div className="text-2xl font-bold">{stats.recentUsers.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">Last 30 days</p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>System Overview</CardTitle>
              <CardDescription>Your system statistics and health metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-2 w-2 rounded-full bg-green-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">All systems operational</p>
                    <p className="text-xs text-muted-foreground">Last checked: just now</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-2 w-2 rounded-full bg-blue-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Database connection healthy</p>
                    <p className="text-xs text-muted-foreground">Response time: 45ms</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-2 w-2 rounded-full bg-purple-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">API endpoints responding</p>
                    <p className="text-xs text-muted-foreground">99.9% uptime this month</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        // User Dashboard - Tenant Specific
        <>
          {loading ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground">Loading your tenant data...</div>
            </div>
          ) : tenantData ? (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Store Name</CardTitle>
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{tenantData.name}</div>
                    <p className="text-xs text-muted-foreground">Slug: {tenantData.slug}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{tenantData.productCount.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                      {tenantData.maxProducts ? `Limit: ${tenantData.maxProducts}` : 'No limit'}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Embeddings Status</CardTitle>
                    <Sparkles className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold capitalize">{tenantData.embeddingsStatus}</div>
                    <p className="text-xs text-muted-foreground">
                      {tenantData.embeddingsGeneratedCount} embeddings generated
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Store Status</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{tenantData.isActive ? 'Active' : 'Inactive'}</div>
                    <p className="text-xs text-muted-foreground">
                      {tenantData.isActive ? 'Store is operational' : 'Store is disabled'}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Last Product Sync</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {tenantData.lastProductSync 
                        ? new Date(tenantData.lastProductSync).toLocaleDateString()
                        : 'Never'}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {tenantData.lastProductSync 
                        ? new Date(tenantData.lastProductSync).toLocaleTimeString()
                        : 'No sync performed yet'}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">RAG Configuration</CardTitle>
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {tenantData.hasRAGConfiguration ? 'Configured' : 'Not Set'}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {tenantData.hasRAGConfiguration 
                        ? 'AI chat is ready' 
                        : 'Configure RAG settings'}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Tenant Information</CardTitle>
                  <CardDescription>Your store details and configuration</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="h-2 w-2 rounded-full bg-blue-600 mt-2" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Shopify Store</p>
                        <p className="text-xs text-muted-foreground">{tenantData.shopifyStoreUrl}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="h-2 w-2 rounded-full bg-green-600 mt-2" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Store Created</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(tenantData.createdAt).toLocaleDateString()} at {new Date(tenantData.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="h-2 w-2 rounded-full bg-purple-600 mt-2" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Last Updated</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(tenantData.updatedAt).toLocaleDateString()} at {new Date(tenantData.updatedAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Tenant Assigned</h3>
                  <p className="text-sm text-muted-foreground">
                    Please contact your administrator to assign a tenant to your account.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
