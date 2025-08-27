"use client"
import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { AlertTriangle, Clock, CheckCircle, XCircle, ArrowLeft, MessageSquare, Users, Calendar, Activity, Globe, Zap, Bell, Send, Edit3, Save, X, Plus, TrendingUp, AlertCircle, Eye, FileText, Link2 } from 'lucide-react'
import { Alert, AlertDescription } from "@/components/ui/alert"

type IncidentStatus = 'open' | 'acknowledged' | 'investigating' | 'resolved' | 'closed'
type IncidentSeverity = 'critical' | 'high' | 'medium' | 'low'

type IncidentUpdate = {
  id: string
  message: string
  status?: IncidentStatus
  author: string
  timestamp: string
  type: 'status_change' | 'comment' | 'assignment' | 'escalation'
}

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
  updates: IncidentUpdate[]
  metrics: {
    responseTimeMs: number[]
    errorRate: number[]
    timestamps: string[]
  }
}

export default function IncidentDetailPage() {
  const router = useRouter()
  const params = useParams()
  const incidentId = params?.id as string
  
  const [incident, setIncident] = useState<Incident | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [newUpdate, setNewUpdate] = useState('')
  const [newStatus, setNewStatus] = useState<IncidentStatus | ''>('')
  const [isEditing, setIsEditing] = useState(false)
  const [editedTitle, setEditedTitle] = useState('')
  const [editedDescription, setEditedDescription] = useState('')
  const [activeTab, setActiveTab] = useState('timeline')

  useEffect(() => {
    const fetchIncident = async () => {
      setLoading(true)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Demo incident data
      const demoIncident: Incident = {
        id: incidentId,
        title: 'YouTube.com API Gateway Timeout',
        description: 'API gateway experiencing high latency and timeout errors affecting video streaming and user authentication services. Multiple regions reporting increased response times.',
        status: 'investigating',
        severity: 'critical',
        affectedServices: ['youtube.com', 'API Gateway', 'Video Streaming', 'User Authentication'],
        createdAt: '2024-01-15T10:30:00Z',
        acknowledgedAt: '2024-01-15T10:32:00Z',
        assignee: 'John Doe',
        responseTime: 2,
        downtime: 45,
        impactedUsers: 15420,
        escalationLevel: 2,
        tags: ['api', 'timeout', 'performance', 'critical'],
        updates: [
          {
            id: '1',
            message: 'Incident automatically created due to API gateway timeout alerts',
            type: 'status_change',
            author: 'System',
            timestamp: '2024-01-15T10:30:00Z'
          },
          {
            id: '2',
            message: 'Incident acknowledged by John Doe. Investigating root cause.',
            status: 'acknowledged',
            type: 'status_change',
            author: 'John Doe',
            timestamp: '2024-01-15T10:32:00Z'
          },
          {
            id: '3',
            message: 'Identified high CPU usage on gateway servers. Scaling up infrastructure.',
            type: 'comment',
            author: 'John Doe',
            timestamp: '2024-01-15T10:45:00Z'
          },
          {
            id: '4',
            message: 'Status changed to investigating. Working with infrastructure team to resolve.',
            status: 'investigating',
            type: 'status_change',
            author: 'Jane Smith',
            timestamp: '2024-01-15T11:00:00Z'
          },
          {
            id: '5',
            message: 'Added additional monitoring for API response times. Seeing some improvement.',
            type: 'comment',
            author: 'Mike Wilson',
            timestamp: '2024-01-15T11:15:00Z'
          }
        ],
        metrics: {
          responseTimeMs: [450, 520, 680, 890, 1200, 980, 750, 620, 540, 480],
          errorRate: [0.1, 0.3, 0.8, 1.5, 2.3, 1.8, 1.2, 0.7, 0.4, 0.2],
          timestamps: [
            '10:30', '10:35', '10:40', '10:45', '10:50', 
            '10:55', '11:00', '11:05', '11:10', '11:15'
          ]
        }
      }
      
      setIncident(demoIncident)
      setEditedTitle(demoIncident.title)
      setEditedDescription(demoIncident.description)
      setLoading(false)
    }
    
    fetchIncident()
  }, [incidentId])

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
      case 'investigating': return <Activity className="h-4 w-4" />
      case 'resolved': return <CheckCircle className="h-4 w-4" />
      case 'closed': return <CheckCircle className="h-4 w-4" />
      default: return <AlertTriangle className="h-4 w-4" />
    }
  }

  const handleUpdateSubmit = async () => {
    if (!newUpdate.trim() && !newStatus) return
    
    setUpdating(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const update: IncidentUpdate = {
        id: Date.now().toString(),
        message: newUpdate || `Status changed to ${newStatus}`,
        status: newStatus || undefined,
        type: newStatus ? 'status_change' : 'comment',
        author: 'Current User',
        timestamp: new Date().toISOString()
      }
      
      setIncident(prev => prev ? {
        ...prev,
        status: newStatus || prev.status,
        updates: [...prev.updates, update]
      } : null)
      
      setNewUpdate('')
      setNewStatus('')
    } catch (error) {
      console.error('Error updating incident:', error)
    } finally {
      setUpdating(false)
    }
  }

  const handleSaveEdit = async () => {
    setUpdating(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setIncident(prev => prev ? {
        ...prev,
        title: editedTitle,
        description: editedDescription
      } : null)
      
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating incident:', error)
    } finally {
      setUpdating(false)
    }
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

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/30 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-64 bg-gray-300 rounded"></div>
                <div className="h-96 bg-gray-300 rounded"></div>
              </div>
              <div className="space-y-6">
                <div className="h-48 bg-gray-300 rounded"></div>
                <div className="h-32 bg-gray-300 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!incident) {
    return (
      <div className="min-h-screen bg-gray-50/30 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Incident not found. The incident may have been deleted or you may not have permission to view it.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/30 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0"
              onClick={() => router.push('/dashboard/incidents')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-1 h-8 rounded ${getSeverityColor(incident.severity)}`} />
                {isEditing ? (
                  <Input
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="text-2xl font-bold border-none p-0 shadow-none focus-visible:ring-0"
                  />
                ) : (
                  <h1 className="text-2xl font-bold text-gray-900">{incident.title}</h1>
                )}
                <Badge className={getStatusColor(incident.status)}>
                  {getStatusIcon(incident.status)}
                  <span className="ml-1 capitalize">{incident.status}</span>
                </Badge>
                <Badge variant="outline" className="capitalize">
                  {incident.severity}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>Created {formatTimeAgo(incident.createdAt)}</span>
                {incident.assignee && (
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    Assigned to {incident.assignee}
                  </span>
                )}
                <span>Incident #{incident.id}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <Button size="sm" onClick={handleSaveEdit} disabled={updating}>
                    <Save className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                </>
              ) : (
                <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                  <Edit3 className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              )}
              <Button size="sm" onClick={() => router.push(`/dashboard/incidents/${incident.id}/postmortem`)}>
                <FileText className="h-4 w-4 mr-1" />
                Postmortem
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <Card className="bg-white/70 backdrop-blur-sm border-gray-200/70">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-blue-600" />
                  Description
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Textarea
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                ) : (
                  <p className="text-gray-700 leading-relaxed">{incident.description}</p>
                )}
              </CardContent>
            </Card>

            {/* Tabs */}
            <Card className="bg-white/70 backdrop-blur-sm border-gray-200/70">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <CardHeader>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="timeline">Timeline</TabsTrigger>
                    <TabsTrigger value="metrics">Metrics</TabsTrigger>
                    <TabsTrigger value="related">Related</TabsTrigger>
                  </TabsList>
                </CardHeader>
                
                <TabsContent value="timeline">
                  <CardContent className="space-y-4">
                    {/* Add Update Form */}
                    <div className="p-4 border border-gray-200 rounded-lg bg-gray-50/50">
                      <div className="space-y-4">
                        <Textarea
                          placeholder="Add an update, comment, or status change..."
                          value={newUpdate}
                          onChange={(e) => setNewUpdate(e.target.value)}
                          rows={3}
                        />
                        <div className="flex items-center justify-between">
                        <Select value={newStatus || "none"} onValueChange={(value) => 
  setNewStatus(value === "none" ? "" : (value as IncidentStatus))
}>
  <SelectTrigger className="w-48">
    <SelectValue placeholder="Change status (optional)" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="none">No status change</SelectItem>
    <SelectItem value="acknowledged">Acknowledged</SelectItem>
    <SelectItem value="investigating">Investigating</SelectItem>
    <SelectItem value="resolved">Resolved</SelectItem>
    <SelectItem value="closed">Closed</SelectItem>
  </SelectContent>
</Select>

                          <Button onClick={handleUpdateSubmit} disabled={updating || (!newUpdate.trim() && !newStatus)}>
                            <Send className="h-4 w-4 mr-2" />
                            {updating ? 'Posting...' : 'Post Update'}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="space-y-4">
                      {incident.updates.slice().reverse().map((update, index) => (
                        <div key={update.id} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              update.type === 'status_change' ? 'bg-blue-100' : 'bg-gray-100'
                            }`}>
                              {update.type === 'status_change' ? (
                                <Activity className="h-4 w-4 text-blue-600" />
                              ) : (
                                <MessageSquare className="h-4 w-4 text-gray-600" />
                              )}
                            </div>
                            {index < incident.updates.length - 1 && (
                              <div className="w-px h-16 bg-gray-200 mt-2" />
                            )}
                          </div>
                          <div className="flex-1 pb-4">
                            <div className="bg-white border border-gray-200 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-gray-900">{update.author}</span>
                                  {update.status && (
                                    <Badge className={getStatusColor(update.status)} variant="outline">
                                      changed status to {update.status}
                                    </Badge>
                                  )}
                                </div>
                                <span className="text-sm text-gray-500">
                                  {formatTimeAgo(update.timestamp)}
                                </span>
                              </div>
                              <p className="text-gray-700">{update.message}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </TabsContent>

                <TabsContent value="metrics">
                  <CardContent className="space-y-6">
                    {/* Response Time Chart */}
                    <div>
                      <h4 className="text-lg font-semibold mb-4">Response Time Trend</h4>
                      <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center border">
                        <div className="text-center">
                          <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-600">Response time metrics would be displayed here</p>
                          <p className="text-sm text-gray-500">Current avg: 650ms</p>
                        </div>
                      </div>
                    </div>

                    {/* Error Rate Chart */}
                    <div>
                      <h4 className="text-lg font-semibold mb-4">Error Rate</h4>
                      <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center border">
                        <div className="text-center">
                          <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-600">Error rate metrics would be displayed here</p>
                          <p className="text-sm text-gray-500">Current rate: 1.2%</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </TabsContent>

                <TabsContent value="related">
                  <CardContent>
                    <div className="text-center py-12">
                      <Link2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h4 className="text-lg font-semibold text-gray-600 mb-2">No related incidents</h4>
                      <p className="text-gray-500">Related incidents and dependencies would appear here</p>
                    </div>
                  </CardContent>
                </TabsContent>
              </Tabs>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Incident Details */}
            <Card className="bg-white/70 backdrop-blur-sm border-gray-200/70">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-green-600" />
                  Incident Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <div className="mt-1">
                      <Badge className={getStatusColor(incident.status)}>
                        {getStatusIcon(incident.status)}
                        <span className="ml-1 capitalize">{incident.status}</span>
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Severity</label>
                    <div className="mt-1">
                      <Badge variant="outline" className="capitalize">
                        <div className={`w-2 h-2 rounded-full mr-2 ${getSeverityColor(incident.severity)}`} />
                        {incident.severity}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Assignee</label>
                    <p className="mt-1 text-sm text-gray-900">{incident.assignee || 'Unassigned'}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Response Time</label>
                    <p className="mt-1 text-sm text-gray-900">{formatDuration(incident.responseTime)}</p>
                  </div>

                  {incident.downtime > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Downtime</label>
                      <p className="mt-1 text-sm text-gray-900">{formatDuration(incident.downtime)}</p>
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium text-gray-500">Impacted Users</label>
                    <p className="mt-1 text-sm text-gray-900">{incident.impactedUsers.toLocaleString()}</p>
                  </div>

                  {incident.escalationLevel > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Escalation Level</label>
                      <p className="mt-1 text-sm text-gray-900">Level {incident.escalationLevel}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Affected Services */}
            <Card className="bg-white/70 backdrop-blur-sm border-gray-200/70">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-purple-600" />
                  Affected Services
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {incident.affectedServices.map((service, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-red-50 rounded-lg border border-red-200">
                      <span className="text-sm font-medium text-red-800">{service}</span>
                      <XCircle className="h-4 w-4 text-red-600" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card className="bg-white/70 backdrop-blur-sm border-gray-200/70">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-orange-600" />
                  Tags
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {incident.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-white/70 backdrop-blur-sm border-gray-200/70">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-blue-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Reassign Incident
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Bell className="h-4 w-4 mr-2" />
                  Escalate
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Notify Team
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Create Postmortem
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}