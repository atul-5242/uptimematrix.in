"use client"
import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Copy, 
  Trash2, 
  Power, 
  PowerOff,
  Globe,
  Clock,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Zap,
  Activity,
  MapPin,
  Calendar
} from 'lucide-react'
import { getAllMonitorsAction } from "./new/action";
import { useRouter } from 'next/navigation'

interface Monitor {
  id: string
  name: string
  url: string
  type: 'http' | 'ping' | 'tcp' | 'dns'
  status: 'online' | 'offline' | 'unknown' | 'paused' | 'maintenance' // Changed 'degraded' to 'maintenance'
  uptime: number
  responseTime: number
  lastCheck: string
  regions: string[]
  checkInterval: number
  isActive: boolean
  createdAt: string
  tags: string[]
  incidents: number
  downtimeToday: number
  avgResponseTime24h: number
  uptimeTrend: 'online' | 'offline' ;
}

interface DashboardStats {
  totalMonitors: number
  upMonitors: number
  downMonitors: number
  avgUptime: number
  avgResponseTime: number
  totalIncidents: number
}

export default function MonitorsDashboard() {
  const router = useRouter()
  const [monitors, setMonitors] = useState<Monitor[]>([])
  const [filteredMonitors, setFilteredMonitors] = useState<Monitor[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    totalMonitors: 0,
    upMonitors: 0,
    downMonitors: 0,
    avgUptime: 0,
    avgResponseTime: 0,
    totalIncidents: 0
  })
  const [loading, setLoading] = useState<boolean>(true)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  useEffect(() => {
    const fetchMonitors = async (): Promise<void> => {
      setLoading(true)
      try {
        const data = await getAllMonitorsAction();
        console.log("data>>>>>>>>>>>>>>>>>>>>>>>>>>--------------from Main page.", data);
        setMonitors(data)
        setFilteredMonitors(data)
        // Calculate stats
        const totalMonitors = data.length
        const upMonitors = data.filter((m: any) => m.status === 'online').length
        const downMonitors = data.filter((m: any) => m.status === 'offline').length
        const avgUptime = data.reduce((sum: any, m: any) => sum + (m.uptime || 0), 0) / (totalMonitors || 1)
        const avgResponseTime = data.reduce((sum: any, m: any) => sum + (m.responseTime || 0), 0) / (totalMonitors || 1)
        const totalIncidents = data.reduce((sum: any, m: any) => sum + (m.incidents || 0), 0)
        setStats({
          totalMonitors,
          upMonitors,
          downMonitors,
          avgUptime,
          avgResponseTime,
          totalIncidents
        })
      } catch (error) {
        console.error('Error fetching monitors:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchMonitors()
  }, [])

  useEffect(() => {
    let filtered = monitors

    if (searchTerm) {
      filtered = filtered.filter(monitor => 
        monitor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        monitor.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
        monitor.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(monitor => monitor.status === statusFilter)
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(monitor => monitor.type === typeFilter)
    }

    setFilteredMonitors(filtered)
  }, [monitors, searchTerm, statusFilter, typeFilter])

  const handleToggleMonitor = async (monitorId: string, currentStatus: boolean): Promise<void> => {
    try {
      const response = await fetch(`/api/monitors/${monitorId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus })
      })

      if (response.ok) {
        setMonitors(prev => 
          prev.map(monitor => 
            monitor.id === monitorId 
              ? { ...monitor, isActive: !currentStatus, status: !currentStatus ? 'online' : 'paused' }
              : monitor
          )
        )
      }
    } catch (error) {
      console.error('Error toggling monitor:', error)
      alert('Failed to update monitor status')
    }
  }

  const handleViewDetails = async (monitorId: string): Promise<void> => {
    router.push(`/dashboard/monitoring/${monitorId}`);
  }

  const handleDeleteMonitor = async (monitorId: string): Promise<void> => {
    if (!confirm("Are you sure you want to delete this monitor?")) {
      return;
    }
  
    try {
      const response = await fetch(`/api/uptime/monitor`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify({ id: monitorId }),
      });
      if (!response.ok) {
        const { message } = await response.json().catch(() => ({ message: "Failed to delete monitor" }));
        throw new Error(message);
      }
  
      setMonitors((prev) => prev.filter((monitor) => monitor.id !== monitorId));
    } catch (error) {
      console.error("Error deleting monitor:", error);
      alert("Failed to delete monitor");
    }
  };
  

  const getStatusColor = (status: Monitor['status']): string => {
    switch (status) {
      case 'online': return 'text-green-600 bg-green-50'
      case 'offline': return 'text-red-600 bg-red-50'
      case 'unknown': return 'text-yellow-600 bg-yellow-50'
      case 'paused': return 'text-gray-600 bg-gray-50'
      case 'maintenance': return 'text-blue-600 bg-blue-50' // Added maintenance case
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatusIcon = (status: Monitor['status']) => {
    switch (status) {
      case 'online': return <CheckCircle className="h-4 w-4" />
      case 'offline': return <XCircle className="h-4 w-4" />
      case 'unknown': return <AlertTriangle className="h-4 w-4" />
      case 'paused': return <PowerOff className="h-4 w-4" />
      case 'maintenance': return <Clock className="h-4 w-4" /> // Added maintenance case
    }
  }

  const getTrendIcon = (trend: Monitor['uptimeTrend']) => {
    switch (trend) {
      case 'online': return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'offline': return <TrendingDown className="h-4 w-4 text-red-500" />
      default: return <Activity className="h-4 w-4 text-blue-500" />
    }
  }

  const formatLastCheck = (dateString: string): string => {
    // Create Date objects from the provided UTC string and the current time.
    // The Date constructor handles the 'Z' (UTC) correctly.
    const lastCheck = new Date(dateString);
    return `Date: ${lastCheck.toLocaleDateString()} Time: ${lastCheck.toLocaleTimeString()}`;
};



  const navigateToCreate = (): void => {
    // Navigate to create monitor page
    // alert('Navigate to create monitor page')
    router.push('/dashboard/monitoring/new')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading monitors...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Monitors</h1>
              <p className="text-gray-600 mt-1">
                Monitor your websites and services for uptime and performance
              </p>
            </div>
            <Button onClick={navigateToCreate} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Monitor
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-blue-500" />
                  <div className="text-sm text-gray-600">Total</div>
                </div>
                <div className="text-2xl font-bold">{stats.totalMonitors}</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <div className="text-sm text-gray-600">Up</div>
                </div>
                <div className="text-2xl font-bold text-green-600">{stats.upMonitors}</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <div className="text-sm text-gray-600">Down</div>
                </div>
                <div className="text-2xl font-bold text-red-600">{stats.downMonitors}</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-blue-500" />
                  <div className="text-sm text-gray-600">Avg Uptime</div>
                </div>
                <div className="text-2xl font-bold">{stats.avgUptime.toFixed(1)}%</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  <div className="text-sm text-gray-600">Avg Response</div>
                </div>
                <div className="text-2xl font-bold">{Math.round(stats.avgResponseTime)}ms</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  <div className="text-sm text-gray-600">Incidents</div>
                </div>
                <div className="text-2xl font-bold">{stats.totalIncidents}</div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg border p-4 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search monitors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex gap-3">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="offline">Offline</SelectItem>
                    <SelectItem value="unknown">Unknown</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem> // Added maintenance filter
                  </SelectContent>
                </Select>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="http">HTTP</SelectItem>
                    <SelectItem value="ping">Ping</SelectItem>
                    <SelectItem value="tcp">TCP</SelectItem>
                    <SelectItem value="dns">DNS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-6 mt-4 text-sm text-gray-600">
              <span>Total: {monitors.length}</span>
              <span>Up: {monitors.filter(m => m.status === 'online').length}</span>
              <span>Down: {monitors.filter(m => m.status === 'offline').length}</span>
              {searchTerm && <span>Filtered: {filteredMonitors.length}</span>}
            </div>
          </div>
        </div>

        {/* Monitors List */}
        {filteredMonitors.length === 0 ? (
          <div className="text-center py-12">
            <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                ? 'No monitors match your filters'
                : 'No monitors yet'
              }
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'Create your first monitor to start tracking uptime'
              }
            </p>
            {(!searchTerm && statusFilter === 'all' && typeFilter === 'all') && (
              <Button onClick={navigateToCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Monitor
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMonitors.map((monitor) => (
              <Card key={monitor.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(monitor.status)}`}>
                          {getStatusIcon(monitor.status)}
                          {monitor.status.toUpperCase()}
                        </div>
                        <Badge variant="outline" className="text-xs uppercase">
                          {monitor.type}
                        </Badge>
                      </div>

                      <h3 className="text-lg font-semibold text-gray-900 truncate mb-1">
                        {monitor.name}
                      </h3>
                      <p className="text-sm text-gray-600 truncate mb-3">
                        {monitor.url}
                      </p>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="flex items-center gap-1 text-gray-500 mb-1">
                            <Activity className="h-3 w-3" />
                            Uptime
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{monitor.uptime.toFixed(1)}%</span>
                            {getTrendIcon(monitor.uptimeTrend)}
                          </div>
                          <Progress value={monitor.uptime} className="h-1 mt-1" />
                        </div>

                        <div>
                          <div className="flex items-center gap-1 text-gray-500 mb-1">
                            <Zap className="h-3 w-3" />
                            Response Time
                          </div>
                          <div className="font-semibold">
                            {monitor.status === 'paused' ? '-' : `${monitor.responseTime}ms`}
                          </div>
                          <div className="text-xs text-gray-500">
                            24h avg: {monitor.avgResponseTime24h}ms
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center gap-1 text-gray-500 mb-1">
                            <Clock className="h-3 w-3" />
                            Last Check
                          </div>
                          <div className="font-semibold">
                            {formatLastCheck(monitor.lastCheck)}
                          </div>
                          <div className="text-xs text-gray-500">
                            Every {monitor.checkInterval}s
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center gap-1 text-gray-500 mb-1">
                            <MapPin className="h-3 w-3" />
                            Regions
                          </div>
                          <div className="font-semibold">
                           {monitor.regions.length} region{monitor.regions.length !== 1 ? 's' : ''}
                          </div>
                          <div className="text-xs text-gray-500">
                            {monitor.incidents} incidents
                          </div>
                        </div>
                      </div>

                      {monitor.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {monitor.tags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {monitor.tags.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{monitor.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleViewDetails(monitor.id)}>
                          <Activity className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => alert('Edit monitor')}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => alert('Duplicate monitor')}>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleToggleMonitor(monitor.id, monitor.isActive)}
                        >
                          {monitor.isActive ? (
                            <>
                              <PowerOff className="h-4 w-4 mr-2" />
                              Pause
                            </>
                          ) : (
                            <>
                              <Power className="h-4 w-4 mr-2" />
                              Resume
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDeleteMonitor(monitor.id)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}