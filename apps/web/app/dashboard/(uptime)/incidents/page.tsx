"use client"
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertTriangle, Clock, CheckCircle, XCircle, Search, Filter, Plus, Eye, MessageSquare, Users, Calendar, TrendingUp, Globe, Zap, Bell, Settings } from 'lucide-react'
import { Alert, AlertDescription } from "@/components/ui/alert"

type IncidentStatus = 'open' | 'acknowledged' | 'investigating' | 'resolved' | 'closed'
type IncidentSeverity = 'critical' | 'high' | 'medium' | 'low'

type Incident = {
  id: string
  title: string
  description: string
  status: IncidentStatus
  severity: IncidentSeverity
  affectedServices: string[]
  createdAt: string
  acknowledgedAt?: string
  resolvedAt?: string
  assignee?: string
  responseTime: number
  downtime: number
  impactedUsers: number
  escalationLevel: number
  tags: string[]
}

type IncidentStats = {
  total: number
  open: number
  acknowledged: number
  investigating: number
  resolved: number
  avgResponseTime: number
  avgResolutionTime: number
  mttr: number
  uptime: number
}

export default function IncidentsPage() {
  const router = useRouter()
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [stats, setStats] = useState<IncidentStats>({
    total: 0,
    open: 0,
    acknowledged: 0,
    investigating: 0,
    resolved: 0,
    avgResponseTime: 0,
    avgResolutionTime: 0,
    mttr: 0,
    uptime: 99.9
  })
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [severityFilter, setSeverityFilter] = useState<string>('all')
  const [activeTab, setActiveTab] = useState('active')

  // Demo data - replace with API calls
  useEffect(() => {
    const fetchIncidents = async () => {
      setLoading(true)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const demoIncidents: Incident[] = [
        {
          id: '1',
          title: 'YouTube.com API Gateway Timeout',
          description: 'API gateway experiencing high latency and timeout errors',
          status: 'investigating',
          severity: 'critical',
          affectedServices: ['youtube.com', 'API Gateway', 'Video Streaming'],
          createdAt: '2024-01-15T10:30:00Z',
          acknowledgedAt: '2024-01-15T10:32:00Z',
          assignee: 'John Doe',
          responseTime: 2,
          downtime: 45,
          impactedUsers: 15420,
          escalationLevel: 2,
          tags: ['api', 'timeout', 'performance']
        },
        {
          id: '2',
          title: 'Database Connection Pool Exhaustion',
          description: 'Production database connection pool reached maximum capacity',
          status: 'acknowledged',
          severity: 'high',
          affectedServices: ['Main Database', 'User Authentication'],
          createdAt: '2024-01-15T09:15:00Z',
          acknowledgedAt: '2024-01-15T09:17:00Z',
          assignee: 'Jane Smith',
          responseTime: 2,
          downtime: 0,
          impactedUsers: 8750,
          escalationLevel: 1,
          tags: ['database', 'connection', 'performance']
        },
        {
          id: '3',
          title: 'SSL Certificate Expiry Warning',
          description: 'SSL certificate for subdomain.example.com expires in 7 days',
          status: 'open',
          severity: 'medium',
          affectedServices: ['subdomain.example.com'],
          createdAt: '2024-01-15T08:00:00Z',
          responseTime: 0,
          downtime: 0,
          impactedUsers: 0,
          escalationLevel: 0,
          tags: ['ssl', 'certificate', 'security']
        },
        {
          id: '4',
          title: 'CDN Edge Server Performance Degradation',
          description: 'Edge servers in Asia-Pacific region showing increased response times',
          status: 'resolved',
          severity: 'medium',
          affectedServices: ['CDN', 'Static Assets', 'Image Delivery'],
          createdAt: '2024-01-14T16:45:00Z',
          acknowledgedAt: '2024-01-14T16:47:00Z',
          resolvedAt: '2024-01-14T18:30:00Z',
          assignee: 'Mike Wilson',
          responseTime: 2,
          downtime: 0,
          impactedUsers: 5200,
          escalationLevel: 1,
          tags: ['cdn', 'performance', 'asia-pacific']
        },
        {
          id: '5',
          title: 'Load Balancer Health Check Failures',
          description: 'Multiple backend servers failing health checks',
          status: 'closed',
          severity: 'high',
          affectedServices: ['Load Balancer', 'Web Servers'],
          createdAt: '2024-01-13T14:20:00Z',
          acknowledgedAt: '2024-01-13T14:22:00Z',
          resolvedAt: '2024-01-13T15:10:00Z',
          assignee: 'Sarah Johnson',
          responseTime: 2,
          downtime: 48,
          impactedUsers: 12300,
          escalationLevel: 2,
          tags: ['load-balancer', 'health-check', 'infrastructure']
        }
      ]
      
      setIncidents(demoIncidents)
      
      // Calculate stats
      const activeIncidents = demoIncidents.filter(i => ['open', 'acknowledged', 'investigating'].includes(i.status))
      const resolvedIncidents = demoIncidents.filter(i => ['resolved', 'closed'].includes(i.status))
      
      setStats({
        total: demoIncidents.length,
        open: demoIncidents.filter(i => i.status === 'open').length,
        acknowledged: demoIncidents.filter(i => i.status === 'acknowledged').length,
        investigating: demoIncidents.filter(i => i.status === 'investigating').length,
        resolved: demoIncidents.filter(i => ['resolved', 'closed'].includes(i.status)).length,
        avgResponseTime: Math.round(demoIncidents.reduce((acc, i) => acc + i.responseTime, 0) / demoIncidents.length),
        avgResolutionTime: 67,
        mttr: 45,
        uptime: 99.94
      })
      
      setLoading(false)
    }
    
    fetchIncidents()
  }, [])

  const getStatusColor = (status: IncidentStatus) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800 border-red-200'
      case 'acknowledged': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'investigating': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200'
      case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getSeverityColor = (severity: IncidentSeverity) => {
    switch (severity) {
      case 'critical': return 'bg-red-500'
      case 'high': return 'bg-orange-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-blue-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusIcon = (status: IncidentStatus) => {
    switch (status) {
      case 'open': return <XCircle className="h-4 w-4" />
      case 'acknowledged': return <Clock className="h-4 w-4" />
      case 'investigating': return <Search className="h-4 w-4" />
      case 'resolved': return <CheckCircle className="h-4 w-4" />
      case 'closed': return <CheckCircle className="h-4 w-4" />
      default: return <AlertTriangle className="h-4 w-4" />
    }
  }

  const filteredIncidents = incidents.filter(incident => {
    const matchesSearch = incident.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         incident.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         incident.affectedServices.some(service => service.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesStatus = statusFilter === 'all' || incident.status === statusFilter
    const matchesSeverity = severityFilter === 'all' || incident.severity === severityFilter
    
    const matchesTab = activeTab === 'all' || 
                      (activeTab === 'active' && ['open', 'acknowledged', 'investigating'].includes(incident.status)) ||
                      (activeTab === 'resolved' && ['resolved', 'closed'].includes(incident.status))
    
    return matchesSearch && matchesStatus && matchesSeverity && matchesTab
  })

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/30 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-300 rounded"></div>
              ))}
            </div>
            <div className="h-64 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/30 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <AlertTriangle className="h-8 w-8 text-red-600" />
                Incidents
              </h1>
              <p className="text-gray-600 mt-1">Monitor, track, and resolve incidents across your infrastructure</p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline"
                onClick={() => router.push('/dashboard/incidents/analytics')}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Analytics
              </Button>
              <Button onClick={() => router.push('/dashboard/incidents/create')}>
                <Plus className="h-4 w-4 mr-2" />
                Create Incident
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/70 backdrop-blur-sm border-red-200/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-600 text-sm font-medium">Active Incidents</p>
                  <p className="text-2xl font-bold text-red-700">{stats.open + stats.acknowledged + stats.investigating}</p>
                </div>
                <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-green-200/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">Resolved Today</p>
                  <p className="text-2xl font-bold text-green-700">{stats.resolved}</p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-blue-200/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">MTTR</p>
                  <p className="text-2xl font-bold text-blue-700">{formatDuration(stats.mttr)}</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-purple-200/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium">Uptime</p>
                  <p className="text-2xl font-bold text-purple-700">{stats.uptime}%</p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="bg-white/70 backdrop-blur-sm border-gray-200/70 mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search incidents, services, or descriptions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="acknowledged">Acknowledged</SelectItem>
                    <SelectItem value="investigating">Investigating</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={severityFilter} onValueChange={setSeverityFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severity</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  More Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Incident Tabs and List */}
        <Card className="bg-white/70 backdrop-blur-sm border-gray-200/70">
          <CardHeader>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="active">
                  Active ({stats.open + stats.acknowledged + stats.investigating})
                </TabsTrigger>
                <TabsTrigger value="resolved">
                  Resolved ({stats.resolved})
                </TabsTrigger>
                <TabsTrigger value="all">
                  All Incidents ({stats.total})
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-200/50">
              {filteredIncidents.length === 0 ? (
                <div className="p-12 text-center">
                  <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No incidents found</h3>
                  <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
                </div>
              ) : (
                filteredIncidents.map((incident) => (
                  <div 
                    key={incident.id} 
                    className="p-6 hover:bg-gray-50/50 cursor-pointer transition-colors"
                    onClick={() => router.push(`/dashboard/incidents/${incident.id}`)}
                  >
                    <div className="flex items-start gap-4">
                      {/* Severity Indicator */}
                      <div className={`w-1 h-16 rounded ${getSeverityColor(incident.severity)}`} />
                      
                      {/* Main Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600">
                              {incident.title}
                            </h3>
                            <Badge className={getStatusColor(incident.status)}>
                              {getStatusIcon(incident.status)}
                              <span className="ml-1 capitalize">{incident.status}</span>
                            </Badge>
                            <Badge variant="outline" className="capitalize">
                              {incident.severity}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatTimeAgo(incident.createdAt)}
                          </div>
                        </div>

                        <p className="text-gray-600 mb-3 line-clamp-2">
                          {incident.description}
                        </p>

                        {/* Affected Services */}
                        <div className="flex flex-wrap gap-1 mb-3">
                          {incident.affectedServices.map((service, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              <Globe className="h-3 w-3 mr-1" />
                              {service}
                            </Badge>
                          ))}
                        </div>

                        {/* Metadata */}
                        <div className="flex items-center gap-6 text-sm text-gray-500">
                          {incident.assignee && (
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              <span>{incident.assignee}</span>
                            </div>
                          )}
                          
                          {incident.responseTime > 0 && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>Response: {formatDuration(incident.responseTime)}</span>
                            </div>
                          )}
                          
                          {incident.downtime > 0 && (
                            <div className="flex items-center gap-1">
                              <XCircle className="h-4 w-4" />
                              <span>Downtime: {formatDuration(incident.downtime)}</span>
                            </div>
                          )}

                          {incident.impactedUsers > 0 && (
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              <span>{incident.impactedUsers.toLocaleString()} users affected</span>
                            </div>
                          )}

                          {incident.escalationLevel > 0 && (
                            <div className="flex items-center gap-1">
                              <Bell className="h-4 w-4" />
                              <span>Escalation Level {incident.escalationLevel}</span>
                            </div>
                          )}
                        </div>

                        {/* Tags */}
                        {incident.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-3">
                            {incident.tags.map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                #{tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/dashboard/incidents/${incident.id}`)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            // Handle comment action
                          }}
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}