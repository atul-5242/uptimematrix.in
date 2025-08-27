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

interface Monitor {
  id: string
  name: string
  url: string
  type: 'http' | 'ping' | 'tcp' | 'dns'
  status: 'up' | 'down' | 'degraded' | 'paused'
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
  uptimeTrend: 'up' | 'down' | 'stable'
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

  // Mock data - replace with actual API calls
  const mockMonitors: Monitor[] = [
    {
      id: '1',
      name: 'Main Website',
      url: 'https://example.com',
      type: 'http',
      status: 'up',
      uptime: 99.9,
      responseTime: 245,
      lastCheck: '2024-08-24T10:30:00Z',
      regions: ['us-east-1', 'eu-west-1'],
      checkInterval: 60,
      isActive: true,
      createdAt: '2024-01-15T10:00:00Z',
      tags: ['production', 'critical'],
      incidents: 2,
      downtimeToday: 0,
      avgResponseTime24h: 251,
      uptimeTrend: 'stable'
    },
    {
      id: '2',
      name: 'API Gateway',
      url: 'https://api.example.com/health',
      type: 'http',
      status: 'down',
      uptime: 94.2,
      responseTime: 0,
      lastCheck: '2024-08-24T10:29:00Z',
      regions: ['us-east-1', 'us-west-2'],
      checkInterval: 30,
      isActive: true,
      createdAt: '2024-01-10T09:00:00Z',
      tags: ['api', 'backend'],
      incidents: 8,
      downtimeToday: 15,
      avgResponseTime24h: 892,
      uptimeTrend: 'down'
    },
    {
      id: '3',
      name: 'Database Server',
      url: 'db.example.com:5432',
      type: 'tcp',
      status: 'up',
      uptime: 99.8,
      responseTime: 12,
      lastCheck: '2024-08-24T10:30:00Z',
      regions: ['us-east-1'],
      checkInterval: 120,
      isActive: true,
      createdAt: '2024-01-05T14:00:00Z',
      tags: ['database', 'infrastructure'],
      incidents: 1,
      downtimeToday: 0,
      avgResponseTime24h: 14,
      uptimeTrend: 'up'
    },
    {
      id: '4',
      name: 'CDN Endpoint',
      url: 'https://cdn.example.com',
      type: 'http',
      status: 'degraded',
      uptime: 97.5,
      responseTime: 1250,
      lastCheck: '2024-08-24T10:30:00Z',
      regions: ['us-east-1', 'eu-west-1', 'ap-southeast-1'],
      checkInterval: 60,
      isActive: true,
      createdAt: '2024-01-12T11:30:00Z',
      tags: ['cdn', 'performance'],
      incidents: 5,
      downtimeToday: 5,
      avgResponseTime24h: 1180,
      uptimeTrend: 'down'
    },
    {
      id: '5',
      name: 'Monitoring Service',
      url: 'https://status.example.com',
      type: 'http',
      status: 'paused',
      uptime: 100.0,
      responseTime: 0,
      lastCheck: '2024-08-23T15:20:00Z',
      regions: ['us-west-2'],
      checkInterval: 300,
      isActive: false,
      createdAt: '2024-01-08T16:00:00Z',
      tags: ['monitoring', 'status'],
      incidents: 0,
      downtimeToday: 0,
      avgResponseTime24h: 0,
      uptimeTrend: 'stable'
    }
  ]

  useEffect(() => {
    const fetchMonitors = async (): Promise<void> => {
      setLoading(true)
      try {
        // Replace with actual API call
        // const response = await fetch('/api/monitors')
        // const data = await response.json()
        
        await new Promise(resolve => setTimeout(resolve, 1000))
        setMonitors(mockMonitors)
        setFilteredMonitors(mockMonitors)
        
        // Calculate stats
        const totalMonitors = mockMonitors.length
        const upMonitors = mockMonitors.filter(m => m.status === 'up').length
        const downMonitors = mockMonitors.filter(m => m.status === 'down').length
        const avgUptime = mockMonitors.reduce((sum, m) => sum + m.uptime, 0) / totalMonitors
        const avgResponseTime = mockMonitors
          .filter(m => m.status !== 'paused')
          .reduce((sum, m) => sum + m.responseTime, 0) / (totalMonitors - mockMonitors.filter(m => m.status === 'paused').length)
        const totalIncidents = mockMonitors.reduce((sum, m) => sum + m.incidents, 0)

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
              ? { ...monitor, isActive: !currentStatus, status: !currentStatus ? 'up' : 'paused' }
              : monitor
          )
        )
      }
    } catch (error) {
      console.error('Error toggling monitor:', error)
      alert('Failed to update monitor status')
    }
  }

  const handleDeleteMonitor = async (monitorId: string): Promise<void> => {
    if (!confirm('Are you sure you want to delete this monitor?')) {
      return
    }

    try {
      const response = await fetch(`/api/monitors/${monitorId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setMonitors(prev => prev.filter(monitor => monitor.id !== monitorId))
      }
    } catch (error) {
      console.error('Error deleting monitor:', error)
      alert('Failed to delete monitor')
    }
  }

  const getStatusColor = (status: Monitor['status']): string => {
    switch (status) {
      case 'up': return 'text-green-600 bg-green-50'
      case 'down': return 'text-red-600 bg-red-50'
      case 'degraded': return 'text-yellow-600 bg-yellow-50'
      case 'paused': return 'text-gray-600 bg-gray-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatusIcon = (status: Monitor['status']) => {
    switch (status) {
      case 'up': return <CheckCircle className="h-4 w-4" />
      case 'down': return <XCircle className="h-4 w-4" />
      case 'degraded': return <AlertTriangle className="h-4 w-4" />
      case 'paused': return <PowerOff className="h-4 w-4" />
    }
  }

  const getTrendIcon = (trend: Monitor['uptimeTrend']) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />
      case 'stable': return <Activity className="h-4 w-4 text-blue-500" />
    }
  }

  const formatLastCheck = (dateString: string): string => {
    const now = new Date()
    const lastCheck = new Date(dateString)
    const diffMs = now.getTime() - lastCheck.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
    return `${Math.floor(diffMins / 1440)}d ago`
  }

  const navigateToCreate = (): void => {
    // Navigate to create monitor page
    alert('Navigate to create monitor page')
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
                    <SelectItem value="up">Up</SelectItem>
                    <SelectItem value="down">Down</SelectItem>
                    <SelectItem value="degraded">Degraded</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
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
              <span>Up: {monitors.filter(m => m.status === 'up').length}</span>
              <span>Down: {monitors.filter(m => m.status === 'down').length}</span>
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
                        <DropdownMenuItem onClick={() => alert('View details')}>
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