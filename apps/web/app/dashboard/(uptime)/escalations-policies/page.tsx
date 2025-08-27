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
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Copy, 
  Trash2, 
  Power, 
  PowerOff,
  Clock,
  Users,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Globe,
  Zap,
  Bell,
  TrendingUp,
  Activity,
  Shield,
  Mail,
  Phone,
  MessageSquare,
  Webhook
} from 'lucide-react'

type EscalationPolicy = {
  id: string;
  name: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  triggerConditions: string[];
  assignedMonitors: string[];
  isActive: boolean;
  steps: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  lastTriggered: string | null;
  triggeredCount: number;
  avgResponseTime: number | null;
  alertMethods: string[];
}

const API_URL = "/api/escalation-policies";

export default function EscalationPoliciesListPage() {
  const router = useRouter()
  const [policies, setPolicies] = useState<EscalationPolicy[]>([])
  const [filteredPolicies, setFilteredPolicies] = useState<EscalationPolicy[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [severityFilter, setSeverityFilter] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all')
  const [triggerFilter, setTriggerFilter] = useState<'all' | 'recent' | 'never'>('all')

  // Fetch policies from API
  useEffect(() => {
    const fetchPolicies = async () => {
      setLoading(true)
      try {
        const res = await fetch(API_URL, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          },
        });
        const data = await res.json();
        setPolicies(data.policies || [])
        setFilteredPolicies(data.policies || [])
      } catch (error) {
        console.error('Error fetching policies:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchPolicies()
  }, [])

  useEffect(() => {
    let filtered = policies

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(policy => 
        policy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        policy.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        policy.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
        policy.assignedMonitors.some(monitor => monitor.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(policy => 
        statusFilter === 'active' ? policy.isActive : !policy.isActive
      )
    }

    // Severity filter
    if (severityFilter !== 'all') {
      filtered = filtered.filter(policy => policy.severity === severityFilter)
    }

    // Trigger filter
    if (triggerFilter === 'recent') {
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
      filtered = filtered.filter(policy => 
        policy.lastTriggered && new Date(policy.lastTriggered) > oneWeekAgo
      )
    } else if (triggerFilter === 'never') {
      filtered = filtered.filter(policy => !policy.lastTriggered)
    }

    setFilteredPolicies(filtered)
  }, [policies, searchTerm, statusFilter, severityFilter, triggerFilter])

  // Replace handleToggleActive, handleDeletePolicy, handleDuplicatePolicy with API calls
  const handleToggleActive = async (policyId: string, currentStatus: boolean) => {
    try {
      setLoading(true)
      const policy = policies.find(p => p.id === policyId)
      if (!policy) return
      const res = await fetch(API_URL, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({ ...policy, isActive: !currentStatus }),
      })
      if (res.ok) {
        const updated = await res.json()
        setPolicies(prev => prev.map(p => p.id === policyId ? updated.policy : p))
      }
    } catch (error) {
      console.error('Error toggling policy status:', error)
      alert('Failed to update policy status')
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePolicy = async (policyId: string) => {
    if (!confirm('Are you sure you want to delete this escalation policy? This action cannot be undone.')) {
      return
    }
    try {
      setLoading(true)
      const res = await fetch(API_URL, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({ id: policyId }),
      })
      if (res.ok) {
        setPolicies(prev => prev.filter(policy => policy.id !== policyId))
      }
    } catch (error) {
      console.error('Error deleting policy:', error)
      alert('Failed to delete policy')
    } finally {
      setLoading(false)
    }
  }

  const handleDuplicatePolicy = async (policyId: string) => {
    try {
      setLoading(true)
      const originalPolicy = policies.find(p => p.id === policyId)
      if (!originalPolicy) return
      const newPolicy = {
        ...originalPolicy,
        id: undefined,
        name: `${originalPolicy.name} (Copy)`
      }
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify(newPolicy),
      })
      if (res.ok) {
        const created = await res.json()
        setPolicies(prev => [created.policy, ...prev])
      }
    } catch (error) {
      console.error('Error duplicating policy:', error)
      alert('Failed to duplicate policy')
    } finally {
      setLoading(false)
    }
  }

  const getSeverityColor = (severity: EscalationPolicy['severity']) => {
    switch (severity) {
      case 'critical': return 'bg-red-500'
      case 'high': return 'bg-orange-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-blue-500'
      default: return 'bg-gray-500'
    }
  }

  const getSeverityBadgeVariant = (severity: EscalationPolicy['severity']) => {
    switch (severity) {
      case 'critical': return 'destructive'
      case 'high': return 'secondary'
      case 'medium': return 'outline'
      case 'low': return 'default'
      default: return 'outline'
    }
  }

  const getAlertMethodIcon = (method: string) => {
    switch (method) {
      case 'email': return <Mail className="h-3 w-3" />
      case 'sms': return <MessageSquare className="h-3 w-3" />
      case 'phone': return <Phone className="h-3 w-3" />
      case 'slack': return <MessageSquare className="h-3 w-3" />
      case 'teams': return <MessageSquare className="h-3 w-3" />
      case 'discord': return <MessageSquare className="h-3 w-3" />
      case 'webhook': return <Webhook className="h-3 w-3" />
      default: return <Bell className="h-3 w-3" />
    }
  }

  const formatDate = (dateString: string | null) => {
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

  const navigateToCreate = () => {
    router.push('/dashboard/escalations-policies/new')
  }

  const handleEditPolicy = (policyId: string) => {
    alert(`Navigate to edit policy: ${policyId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your escalation policies...</p>
        </div>
      </div>
    )
  }

  // Stats calculation
  const stats = {
    total: policies.length,
    active: policies.filter(p => p.isActive).length,
    inactive: policies.filter(p => !p.isActive).length,
    triggered24h: policies.filter(p => {
      if (!p.lastTriggered) return false
      const dayAgo = new Date()
      dayAgo.setDate(dayAgo.getDate() - 1)
      return new Date(p.lastTriggered) > dayAgo
    }).length
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Shield className="h-8 w-8 text-blue-600" />
                Escalation Policies
              </h1>
              <p className="text-gray-600 mt-1">
                Configure automated notifications for when your monitors detect issues
              </p>
            </div>
            <Button onClick={navigateToCreate} className="flex items-center gap-2 bg-slate-900 hover:bg-blue-700">
              <Plus className="h-4 w-4" />
              Create New Policy
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-sm">
              <CardContent className="flex items-center p-4">
                <div className="rounded-full bg-blue-100 p-2 mr-3">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  <p className="text-sm text-gray-600">Total Policies</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-sm">
              <CardContent className="flex items-center p-4">
                <div className="rounded-full bg-green-100 p-2 mr-3">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
                  <p className="text-sm text-gray-600">Active</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-sm">
              <CardContent className="flex items-center p-4">
                <div className="rounded-full bg-red-100 p-2 mr-3">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.inactive}</p>
                  <p className="text-sm text-gray-600">Inactive</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-sm">
              <CardContent className="flex items-center p-4">
                <div className="rounded-full bg-orange-100 p-2 mr-3">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.triggered24h}</p>
                  <p className="text-sm text-gray-600">Triggered (24h)</p>
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
                    placeholder="Search policies, monitors, or tags..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white"
                  />
                </div>
              </div>
              
              <div className="flex gap-3">
                <Select 
                  value={statusFilter} 
                  onValueChange={(value: 'all' | 'active' | 'inactive') => setStatusFilter(value)}
                >
                  <SelectTrigger className="w-32 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active Only</SelectItem>
                    <SelectItem value="inactive">Inactive Only</SelectItem>
                  </SelectContent>
                </Select>

                <Select 
                  value={severityFilter} 
                  onValueChange={(value: 'all' | 'critical' | 'high' | 'medium' | 'low') => setSeverityFilter(value)}
                >
                  <SelectTrigger className="w-32 bg-white">
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

                <Select 
                  value={triggerFilter} 
                  onValueChange={(value: 'all' | 'recent' | 'never') => setTriggerFilter(value)}
                >
                  <SelectTrigger className="w-36 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Activity</SelectItem>
                    <SelectItem value="recent">Recent Triggers</SelectItem>
                    <SelectItem value="never">Never Triggered</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Filter Summary */}
            <div className="flex items-center gap-6 mt-4 text-sm text-gray-600">
              <span>Showing: {filteredPolicies.length} of {policies.length}</span>
              {searchTerm && <Badge variant="outline">Search: "{searchTerm}"</Badge>}
              {statusFilter !== 'all' && <Badge variant="outline">Status: {statusFilter}</Badge>}
              {severityFilter !== 'all' && <Badge variant="outline">Severity: {severityFilter}</Badge>}
              {triggerFilter !== 'all' && <Badge variant="outline">Activity: {triggerFilter}</Badge>}
            </div>
          </Card>
        </div>

        {/* Policies Grid */}
        {filteredPolicies.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white/70 backdrop-blur-sm rounded-lg border border-gray-200/70 p-8 max-w-md mx-auto">
              {searchTerm || statusFilter !== 'all' || severityFilter !== 'all' || triggerFilter !== 'all' ? (
                <>
                  <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No policies match your filters
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Try adjusting your search or filter criteria to find what you're looking for
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchTerm('')
                      setStatusFilter('all')
                      setSeverityFilter('all')
                      setTriggerFilter('all')
                    }}
                  >
                    Clear All Filters
                  </Button>
                </>
              ) : (
                <>
                  <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No escalation policies yet
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Get started by creating your first escalation policy to automate incident notifications
                  </p>
                  <Button onClick={navigateToCreate} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Policy
                  </Button>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredPolicies.map((policy) => (
              <Card 
                key={policy.id} 
                className="bg-white/70 backdrop-blur-sm border-gray-200/70 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-lg font-semibold truncate">
                          {policy.name}
                        </CardTitle>
                        <div className={`w-2 h-2 rounded-full ${getSeverityColor(policy.severity)}`} />
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                        {policy.description}
                      </p>
                      
                      {/* Status and Severity */}
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {policy.isActive ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                          <span className="text-xs font-medium">
                            {policy.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <Badge variant={getSeverityBadgeVariant(policy.severity)} className="capitalize text-xs">
                          {policy.severity}
                        </Badge>
                      </div>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Policy Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleEditPolicy(policy.id)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Policy
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicatePolicy(policy.id)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleToggleActive(policy.id, policy.isActive)}
                        >
                          {policy.isActive ? (
                            <>
                              <PowerOff className="h-4 w-4 mr-2" />
                              Disable
                            </>
                          ) : (
                            <>
                              <Power className="h-4 w-4 mr-2" />
                              Enable
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDeletePolicy(policy.id)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Policy
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>

                <CardContent className="pt-0 space-y-4">
                  {/* Assigned Monitors */}
                  <div>
                    <div className="flex items-center gap-1 mb-2">
                      <Globe className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">Monitors:</span>
                    </div>
                    {/* <div className="flex flex-wrap gap-1">
                      {policy.assignedMonitors.slice(0, 2).map((monitor, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {monitor}
                        </Badge>
                      ))}
                      {policy.assignedMonitors.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{policy.assignedMonitors.length - 2} more
                        </Badge>
                      )}
                    </div> */}
                  </div>

                  {/* Trigger Conditions */}
                  <div>
                    <div className="flex items-center gap-1 mb-2">
                      <Zap className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">Triggers:</span>
                    </div>
                    {/* <div className="flex flex-wrap gap-1">
                      {policy.triggerConditions.slice(0, 2).map((condition, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {condition}
                        </Badge>
                      ))}
                      {policy.triggerConditions.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{policy.triggerConditions.length - 2}
                        </Badge>
                      )}
                    </div> */}
                  </div>

                  {/* Alert Methods */}
                  <div>
                    <div className="flex items-center gap-1 mb-2">
                      <Bell className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">Alerts via:</span>
                    </div>
                    {/* <div className="flex items-center gap-2">
                      {policy.alertMethods.slice(0, 4).map((method, index) => (
                        <div key={index} className="flex items-center gap-1 text-gray-600">
                          {getAlertMethodIcon(method)}
                          <span className="text-xs capitalize">{method}</span>
                        </div>
                      ))}
                      {policy.alertMethods.length > 4 && (
                        <span className="text-xs text-gray-500">+{policy.alertMethods.length - 4}</span>
                      )}
                    </div> */}
                  </div>

                  {/* Performance Stats */}
                  <div className="grid grid-cols-2 gap-4 text-sm pt-2 border-t border-gray-200">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <div>
                        {/* <p className="font-medium text-gray-900">{JSON.stringify(policy.steps)}</p> */}
                        <p className="text-xs text-gray-600">Steps</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">{policy.triggeredCount}</p>
                        <p className="text-xs text-gray-600">Triggered</p>
                      </div>
                    </div>
                  </div>

                  {/* Response Time */}
                  {policy.avgResponseTime && (
                    <div className="pt-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Avg. Response:</span>
                        <span className={`font-medium ${
                          policy.avgResponseTime < 5 ? 'text-green-600' : 
                          policy.avgResponseTime < 10 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {policy.avgResponseTime}m
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                        <div 
                          className={`h-1 rounded-full ${
                            policy.avgResponseTime < 5 ? 'bg-green-500' : 
                            policy.avgResponseTime < 10 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min((policy.avgResponseTime / 15) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  {policy.tags && policy.tags.length > 0 && (
                    <div className="pt-2">
                      <div className="flex flex-wrap gap-1">
                        {policy.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                            #{tag}
                          </Badge>
                        ))}
                        {policy.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{policy.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Last Activity */}
                  <div className="pt-3 border-t border-gray-200 text-xs text-gray-500">
                    <div className="flex justify-between items-center">
                      <span>Last triggered:</span>
                      <span className={policy.lastTriggered ? 'text-gray-700 font-medium' : ''}>
                        {formatDate(policy.lastTriggered)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span>Updated:</span>
                      <span>{formatDate(policy.updatedAt)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Quick Actions Footer */}
        {filteredPolicies.length > 0 && (
          <div className="mt-8 text-center">
            <Card className="bg-white/70 backdrop-blur-sm border-gray-200/70 shadow-sm p-6 inline-block">
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-600">
                  Need help? Check out our 
                  <Button variant="link" className="p-0 h-auto font-normal underline ml-1">
                    escalation policy guide
                  </Button>
                </div>
                <div className="h-4 w-px bg-gray-300" />
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Create Another Policy
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}