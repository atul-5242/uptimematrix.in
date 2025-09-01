"use client"
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  Settings, 
  Trash2, 
  Power, 
  PowerOff,
  Plus,
  CheckCircle,
  XCircle,
  Mail,
  Phone,
  MessageSquare,
  Webhook,
  Bell,
  Zap,
  Activity,
  Users,
  Code,
  Globe,
  Shield,
  AlertTriangle,
  ExternalLink,
  Copy,
  Eye,
  EyeOff,
  Smartphone,
  Bot,
  Hash,
  Video,
  Calendar,
  Database,
  Cloud,
  Cpu,
  Monitor,
  Server,
  Lock
} from 'lucide-react'

type IntegrationCategory = 'communication' | 'incident' | 'webhook' | 'monitoring' | 'automation' | 'mobile'

type Integration = {
  id: string
  name: string
  description: string
  category: IntegrationCategory
  icon: any
  isConnected: boolean
  isPopular: boolean
  isPremium: boolean
  configuredAt?: string
  lastUsed?: string
  usageCount: number
  status: 'active' | 'inactive' | 'error'
  config?: {
    webhookUrl?: string
    apiKey?: string
    channel?: string
    [key: string]: any
  }
}

const API_URL = "/api/integrations"

export default function IntegrationsPage() {
  const router = useRouter()
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [filteredIntegrations, setFilteredIntegrations] = useState<Integration[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<'all' | IntegrationCategory>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'connected' | 'available'>('all')
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null)
  const [showConfigModal, setShowConfigModal] = useState(false)

  // Mock data - replace with actual API call
  const mockIntegrations: Integration[] = [
    // Communication
    {
      id: 'slack',
      name: 'Slack',
      description: 'Send notifications to Slack channels and direct messages',
      category: 'communication',
      icon: MessageSquare,
      isConnected: true,
      isPopular: true,
      isPremium: false,
      configuredAt: '2024-01-15T10:30:00Z',
      lastUsed: '2024-01-20T14:22:00Z',
      usageCount: 156,
      status: 'active',
      config: {
        webhookUrl: 'https://hooks.slack.com/services/...',
        channel: '#alerts'
      }
    },
    {
      id: 'discord',
      name: 'Discord',
      description: 'Get uptime alerts in your Discord server channels',
      category: 'communication',
      icon: MessageSquare,
      isConnected: true,
      isPopular: true,
      isPremium: false,
      configuredAt: '2024-01-10T16:45:00Z',
      lastUsed: '2024-01-19T09:15:00Z',
      usageCount: 89,
      status: 'active',
      config: {
        webhookUrl: 'https://discord.com/api/webhooks/...',
        channel: 'uptime-alerts'
      }
    },
    {
      id: 'teams',
      name: 'Microsoft Teams',
      description: 'Integrate with Microsoft Teams for instant notifications',
      category: 'communication',
      icon: MessageSquare,
      isConnected: false,
      isPopular: true,
      isPremium: false,
      usageCount: 0,
      status: 'inactive'
    },
    {
      id: 'email',
      name: 'Email',
      description: 'Send detailed email notifications to your team',
      category: 'communication',
      icon: Mail,
      isConnected: true,
      isPopular: true,
      isPremium: false,
      configuredAt: '2024-01-05T12:00:00Z',
      lastUsed: '2024-01-20T18:30:00Z',
      usageCount: 234,
      status: 'active'
    },
    {
      id: 'sms',
      name: 'SMS',
      description: 'Receive critical alerts via text message',
      category: 'communication',
      icon: Smartphone,
      isConnected: true,
      isPopular: false,
      isPremium: true,
      configuredAt: '2024-01-12T09:20:00Z',
      lastUsed: '2024-01-18T22:10:00Z',
      usageCount: 12,
      status: 'active'
    },
    // Incident Management
    {
      id: 'pagerduty',
      name: 'PagerDuty',
      description: 'Create incidents and manage on-call schedules',
      category: 'incident',
      icon: Bell,
      isConnected: true,
      isPopular: true,
      isPremium: false,
      configuredAt: '2024-01-08T14:15:00Z',
      lastUsed: '2024-01-19T16:45:00Z',
      usageCount: 67,
      status: 'active',
      config: {
        apiKey: 'pd_api_***********',
        serviceKey: 'service_***'
      }
    },
    {
      id: 'opsgenie',
      name: 'Opsgenie',
      description: 'Alert management and incident response platform',
      category: 'incident',
      icon: Shield,
      isConnected: false,
      isPopular: true,
      isPremium: false,
      usageCount: 0,
      status: 'inactive'
    },
    {
      id: 'victorops',
      name: 'VictorOps',
      description: 'Incident management and on-call scheduling',
      category: 'incident',
      icon: Activity,
      isConnected: false,
      isPopular: false,
      isPremium: false,
      usageCount: 0,
      status: 'inactive'
    },
    // Webhooks & Custom
    {
      id: 'webhook',
      name: 'Custom Webhook',
      description: 'Send HTTP requests to your custom endpoints',
      category: 'webhook',
      icon: Webhook,
      isConnected: true,
      isPopular: true,
      isPremium: false,
      configuredAt: '2024-01-14T11:30:00Z',
      lastUsed: '2024-01-20T13:20:00Z',
      usageCount: 45,
      status: 'active',
      config: {
        webhookUrl: 'https://api.yourapp.com/webhook',
        method: 'POST'
      }
    },
    {
      id: 'zapier',
      name: 'Zapier',
      description: 'Connect to 5000+ apps with automated workflows',
      category: 'automation',
      icon: Zap,
      isConnected: false,
      isPopular: true,
      isPremium: false,
      usageCount: 0,
      status: 'inactive'
    },
    // Mobile
    {
      id: 'pushover',
      name: 'Pushover',
      description: 'Push notifications to your mobile device',
      category: 'mobile',
      icon: Smartphone,
      isConnected: false,
      isPopular: false,
      isPremium: true,
      usageCount: 0,
      status: 'inactive'
    },
    // Monitoring
    {
      id: 'datadog',
      name: 'Datadog',
      description: 'Send uptime metrics to your Datadog dashboard',
      category: 'monitoring',
      icon: Monitor,
      isConnected: false,
      isPopular: true,
      isPremium: true,
      usageCount: 0,
      status: 'inactive'
    },
    {
      id: 'newrelic',
      name: 'New Relic',
      description: 'Monitor application performance and uptime',
      category: 'monitoring',
      icon: Activity,
      isConnected: false,
      isPopular: true,
      isPremium: true,
      usageCount: 0,
      status: 'inactive'
    },
    {
      id: 'grafana',
      name: 'Grafana',
      description: 'Visualize uptime data in Grafana dashboards',
      category: 'monitoring',
      icon: Database,
      isConnected: false,
      isPopular: false,
      isPremium: false,
      usageCount: 0,
      status: 'inactive'
    }
  ]

  useEffect(() => {
    const fetchIntegrations = async () => {
      setLoading(true)
      try {
        // Simulate API call
        setTimeout(() => {
          setIntegrations(mockIntegrations)
          setFilteredIntegrations(mockIntegrations)
          setLoading(false)
        }, 1000)
      } catch (error) {
        console.error('Error fetching integrations:', error)
        setLoading(false)
      }
    }
    fetchIntegrations()
  }, [])

  useEffect(() => {
    let filtered = integrations

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(integration => 
        integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        integration.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(integration => integration.category === categoryFilter)
    }

    // Status filter
    if (statusFilter === 'connected') {
      filtered = filtered.filter(integration => integration.isConnected)
    } else if (statusFilter === 'available') {
      filtered = filtered.filter(integration => !integration.isConnected)
    }

    setFilteredIntegrations(filtered)
  }, [integrations, searchTerm, categoryFilter, statusFilter])

  const handleConnect = async (integrationId: string) => {
    const integration = integrations.find(i => i.id === integrationId)
    if (integration) {
      setSelectedIntegration(integration)
      setShowConfigModal(true)
    }
  }

  const handleDisconnect = async (integrationId: string) => {
    if (!confirm('Are you sure you want to disconnect this integration?')) {
      return
    }

    try {
      setLoading(true)
      // API call would go here
      setIntegrations(prev => prev.map(i => 
        i.id === integrationId 
          ? { ...i, isConnected: false, status: 'inactive' as const, configuredAt: undefined, config: undefined }
          : i
      ))
    } catch (error) {
      console.error('Error disconnecting integration:', error)
      alert('Failed to disconnect integration')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async (integrationId: string) => {
    try {
      setLoading(true)
      // API call would go here
      setIntegrations(prev => prev.map(i => 
        i.id === integrationId 
          ? { ...i, status: i.status === 'active' ? 'inactive' : 'active' }
          : i
      ))
    } catch (error) {
      console.error('Error toggling integration status:', error)
      alert('Failed to update integration status')
    } finally {
      setLoading(false)
    }
  }

  const getCategoryIcon = (category: IntegrationCategory) => {
    switch (category) {
      case 'communication': return MessageSquare
      case 'incident': return Shield
      case 'webhook': return Webhook
      case 'monitoring': return Monitor
      case 'automation': return Zap
      case 'mobile': return Smartphone
      default: return Settings
    }
  }

  const getCategoryLabel = (category: IntegrationCategory) => {
    switch (category) {
      case 'communication': return 'Communication'
      case 'incident': return 'Incident Management'
      case 'webhook': return 'Webhooks & API'
      case 'monitoring': return 'Monitoring Tools'
      case 'automation': return 'Automation'
      case 'mobile': return 'Mobile & Push'
      default: return 'Other'
    }
  }

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Never'
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    } else if (diffDays < 7) {
      return `${diffDays}d ago`
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  }

  // Stats calculation
  const stats = {
    total: integrations.length,
    connected: integrations.filter(i => i.isConnected).length,
    active: integrations.filter(i => i.status === 'active').length,
    popular: integrations.filter(i => i.isPopular).length
  }

  const categories = [
    { value: 'communication', label: 'Communication', count: integrations.filter(i => i.category === 'communication').length },
    { value: 'incident', label: 'Incident Management', count: integrations.filter(i => i.category === 'incident').length },
    { value: 'webhook', label: 'Webhooks & API', count: integrations.filter(i => i.category === 'webhook').length },
    { value: 'monitoring', label: 'Monitoring Tools', count: integrations.filter(i => i.category === 'monitoring').length },
    { value: 'automation', label: 'Automation', count: integrations.filter(i => i.category === 'automation').length },
    { value: 'mobile', label: 'Mobile & Push', count: integrations.filter(i => i.category === 'mobile').length }
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading integrations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Zap className="h-8 w-8 text-blue-600" />
                Integrations
              </h1>
              <p className="text-gray-600 mt-1">
                Connect UptimeMatrix with your favorite tools and services
              </p>
            </div>
            <Button className="flex items-center gap-2 bg-slate-900 hover:bg-blue-700">
              <Plus className="h-4 w-4" />
              Request Integration
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-sm">
              <CardContent className="flex items-center p-4">
                <div className="rounded-full bg-blue-100 p-2 mr-3">
                  <Globe className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  <p className="text-sm text-gray-600">Available</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-sm">
              <CardContent className="flex items-center p-4">
                <div className="rounded-full bg-green-100 p-2 mr-3">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.connected}</p>
                  <p className="text-sm text-gray-600">Connected</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-sm">
              <CardContent className="flex items-center p-4">
                <div className="rounded-full bg-orange-100 p-2 mr-3">
                  <Activity className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
                  <p className="text-sm text-gray-600">Active</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-sm">
              <CardContent className="flex items-center p-4">
                <div className="rounded-full bg-purple-100 p-2 mr-3">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.popular}</p>
                  <p className="text-sm text-gray-600">Popular</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card className="bg-white/70 backdrop-blur-sm border-gray-200/70 shadow-sm p-4 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search integrations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white"
                  />
                </div>
              </div>
              
              <div className="flex gap-3">
                <Select 
                  value={categoryFilter} 
                  onValueChange={(value: any) => setCategoryFilter(value)}
                >
                  <SelectTrigger className="w-48 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label} ({cat.count})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select 
                  value={statusFilter} 
                  onValueChange={(value: any) => setStatusFilter(value)}
                >
                  <SelectTrigger className="w-36 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="connected">Connected</SelectItem>
                    <SelectItem value="available">Available</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Filter Summary */}
            <div className="flex items-center gap-6 mt-4 text-sm text-gray-600">
              <span>Showing: {filteredIntegrations.length} of {integrations.length}</span>
              {searchTerm && <Badge variant="outline">Search: "{searchTerm}"</Badge>}
              {categoryFilter !== 'all' && <Badge variant="outline">Category: {getCategoryLabel(categoryFilter as IntegrationCategory)}</Badge>}
              {statusFilter !== 'all' && <Badge variant="outline">Status: {statusFilter}</Badge>}
            </div>
          </Card>
        </div>

        {/* Category Tabs */}
        <Tabs value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as any)} className="mb-6">
          <TabsList className="grid w-full grid-cols-7 bg-white/70 backdrop-blur-sm">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              All
            </TabsTrigger>
            {categories.map(category => {
              const IconComponent = getCategoryIcon(category.value as IntegrationCategory)
              return (
                <TabsTrigger key={category.value} value={category.value} className="flex items-center gap-2">
                  <IconComponent className="h-4 w-4" />
                  {category.label.split(' ')[0]}
                </TabsTrigger>
              )
            })}
          </TabsList>
        </Tabs>

        {/* Integrations Grid */}
        {filteredIntegrations.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white/70 backdrop-blur-sm rounded-lg border border-gray-200/70 p-8 max-w-md mx-auto">
              <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No integrations match your filters
              </h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search or filter criteria
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('')
                  setCategoryFilter('all')
                  setStatusFilter('all')
                }}
              >
                Clear All Filters
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredIntegrations.map((integration) => (
              <Card 
                key={integration.id} 
                className="bg-white/70 backdrop-blur-sm border-gray-200/70 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex-shrink-0">
                        <integration.icon className="h-10 w-10 text-gray-700" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <CardTitle className="text-lg font-semibold truncate">
                            {integration.name}
                          </CardTitle>
                          <div className="flex gap-1">
                            {integration.isPopular && (
                              <Badge variant="secondary" className="text-xs">Popular</Badge>
                            )}
                            {integration.isPremium && (
                              <Badge variant="outline" className="text-xs border-yellow-400 text-yellow-700">
                                Premium
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {integration.description}
                        </p>
                      </div>
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
                        {integration.isConnected ? (
                          <>
                            <DropdownMenuItem onClick={() => handleConnect(integration.id)}>
                              <Settings className="h-4 w-4 mr-2" />
                              Configure
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleStatus(integration.id)}>
                              {integration.status === 'active' ? (
                                <>
                                  <PowerOff className="h-4 w-4 mr-2" />
                                  Pause
                                </>
                              ) : (
                                <>
                                  <Power className="h-4 w-4 mr-2" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDisconnect(integration.id)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Disconnect
                            </DropdownMenuItem>
                          </>
                        ) : (
                          <DropdownMenuItem onClick={() => handleConnect(integration.id)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Connect
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>

                <CardContent className="pt-0 space-y-4">
                  {/* Status */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {integration.isConnected ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm font-medium text-green-700">Connected</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">Available</span>
                        </>
                      )}
                    </div>
                    
                    {integration.isConnected && (
                      <div className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${
                          integration.status === 'active' ? 'bg-green-500' : 
                          integration.status === 'error' ? 'bg-red-500' : 'bg-gray-400'
                        }`} />
                        <span className="text-xs text-gray-600 capitalize">{integration.status}</span>
                      </div>
                    )}
                  </div>

                  {/* Category */}
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {getCategoryLabel(integration.category)}
                    </Badge>
                  </div>

                  {/* Usage Stats */}
                  {integration.isConnected && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Notifications sent:</span>
                        <span className="font-medium">{integration.usageCount}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Last used:</span>
                        <span className="font-medium">{formatDate(integration.lastUsed)}</span>
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  <div className="pt-2">
                    {integration.isConnected ? (
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleConnect(integration.id)}
                          className="flex-1"
                        >
                          <Settings className="h-4 w-4 mr-1" />
                          Configure
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleToggleStatus(integration.id)}
                        >
                          {integration.status === 'active' ? (
                            <PowerOff className="h-4 w-4" />
                          ) : (
                            <Power className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        size="sm" 
                        variant="default"
                        onClick={() => handleConnect(integration.id)}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Connect
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Configuration Modal */}
        {showConfigModal && selectedIntegration && (
          <IntegrationConfigModal
            integration={selectedIntegration}
            onClose={() => setShowConfigModal(false)}
            onSave={(config) => {
              setIntegrations(prev => prev.map(i => 
                i.id === selectedIntegration.id 
                  ? { 
                      ...i, 
                      isConnected: true, 
                      status: 'active',
                      config,
                      configuredAt: new Date().toISOString()
                    }
                  : i
              ))
              setShowConfigModal(false)
            }}
          />
        )}
      </div>
    </div>
  )
}

// Configuration Modal Component
function IntegrationConfigModal({ 
  integration, 
  onClose, 
  onSave 
}: { 
  integration: Integration
  onClose: () => void
  onSave: (config: any) => void
}) {
  const [config, setConfig] = useState(integration.config || {})
  const [loading, setLoading] = useState(false)
  const [showSecrets, setShowSecrets] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      onSave(config)
    } catch (error) {
      console.error('Error saving configuration:', error)
      alert('Failed to save configuration')
    } finally {
      setLoading(false)
    }
  }

  const renderConfigForm = () => {
    switch (integration.id) {
      case 'slack':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Webhook URL *
              </label>
              <Input
                type={showSecrets ? 'text' : 'password'}
                placeholder="https://hooks.slack.com/services/..."
                value={config.webhookUrl || ''}
                onChange={(e) => setConfig({ ...config, webhookUrl: e.target.value })}
              />
              <p className="text-xs text-gray-500 mt-1">
                Get this from your Slack app's Incoming Webhooks settings
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Channel
              </label>
              <Input
                placeholder="#alerts"
                value={config.channel || ''}
                onChange={(e) => setConfig({ ...config, channel: e.target.value })}
              />
            </div>
          </div>
        )
      case 'discord':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Webhook URL *
              </label>
              <Input
                type={showSecrets ? 'text' : 'password'}
                placeholder="https://discord.com/api/webhooks/..."
                value={config.webhookUrl || ''}
                onChange={(e) => setConfig({ ...config, webhookUrl: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Channel Name
              </label>
              <Input
                placeholder="uptime-alerts"
                value={config.channel || ''}
                onChange={(e) => setConfig({ ...config, channel: e.target.value })}
              />
            </div>
          </div>
        )
      case 'webhook':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Webhook URL *
              </label>
              <Input
                placeholder="https://api.yourapp.com/webhook"
                value={config.webhookUrl || ''}
                onChange={(e) => setConfig({ ...config, webhookUrl: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                HTTP Method
              </label>
              <Select 
                value={config.method || 'POST'} 
                onValueChange={(value) => setConfig({ ...config, method: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="PATCH">PATCH</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Headers (Optional)
              </label>
              <Input
                placeholder="Authorization: Bearer token"
                value={config.headers || ''}
                onChange={(e) => setConfig({ ...config, headers: e.target.value })}
              />
            </div>
          </div>
        )
      case 'pagerduty':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Key *
              </label>
              <Input
                type={showSecrets ? 'text' : 'password'}
                placeholder="Your PagerDuty API key"
                value={config.apiKey || ''}
                onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Key *
              </label>
              <Input
                type={showSecrets ? 'text' : 'password'}
                placeholder="Service integration key"
                value={config.serviceKey || ''}
                onChange={(e) => setConfig({ ...config, serviceKey: e.target.value })}
              />
            </div>
          </div>
        )
      case 'teams':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Webhook URL *
              </label>
              <Input
                type={showSecrets ? 'text' : 'password'}
                placeholder="https://outlook.office.com/webhook/..."
                value={config.webhookUrl || ''}
                onChange={(e) => setConfig({ ...config, webhookUrl: e.target.value })}
              />
              <p className="text-xs text-gray-500 mt-1">
                Get this from your Teams channel connector settings
              </p>
            </div>
          </div>
        )
      case 'email':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Recipients *
              </label>
              <Input
                placeholder="alerts@company.com, admin@company.com"
                value={config.recipients || ''}
                onChange={(e) => setConfig({ ...config, recipients: e.target.value })}
              />
              <p className="text-xs text-gray-500 mt-1">
                Separate multiple emails with commas
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject Prefix (Optional)
              </label>
              <Input
                placeholder="[UptimeMatrix Alert]"
                value={config.subjectPrefix || ''}
                onChange={(e) => setConfig({ ...config, subjectPrefix: e.target.value })}
              />
            </div>
          </div>
        )
      default:
        return (
          <div className="text-center py-8">
            <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Configuration form will be available soon</p>
          </div>
        )
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <integration.icon className="h-8 w-8" />
              <div>
                <h2 className="text-xl font-semibold">Configure {integration.name}</h2>
                <p className="text-sm text-gray-600">{integration.description}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <XCircle className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-6">
            {renderConfigForm()}

            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSecrets(!showSecrets)}
                className="flex items-center gap-2"
              >
                {showSecrets ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showSecrets ? 'Hide' : 'Show'} Secrets
              </Button>
              
              <a 
                href="https://docs.uptimematrix.com/integrations" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
              >
                <ExternalLink className="h-3 w-3" />
                View Documentation
              </a>
            </div>
          </div>

          <div className="flex gap-3 mt-6 pt-6 border-t">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading} className="flex-1">
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Connecting...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Save & Connect
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}