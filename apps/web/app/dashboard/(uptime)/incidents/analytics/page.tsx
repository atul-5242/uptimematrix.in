"use client"
import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSelector } from 'react-redux'
import { useAppSelector } from '@/store'
import { usePermissions } from '@/hooks/usePermissions'
import { SYSTEM_PERMISSIONS } from '@/lib/permissions'
import { PermissionGate } from '@/components/permissions/PermissionGate'
import { formatDistanceToNow } from 'date-fns';
import { getIncidentAnalytics, updateIncidentStatus, createIncidentUpdate, getIncidentUpdates, acknowledgeIncident, resolveIncident } from "@/app/all-actions/incidents/actions";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { AlertTriangle, Clock, CheckCircle, XCircle, ArrowLeft, MessageSquare, Users, Calendar, Activity, Globe, Zap, Bell, Send, Edit3, Save, X, Plus, TrendingUp, AlertCircle, Eye, FileText, Link2, BookOpen, Bot } from 'lucide-react'
import { Alert, AlertDescription } from "@/components/ui/alert"

type IncidentStatus = 'open' | 'acknowledged' | 'investigating' | 'resolved' | 'closed'
type IncidentSeverity = 'critical' | 'high' | 'medium' | 'low' | 'maintenance' // Re-added 'maintenance'

type IncidentUpdate = {
  id: string
  message: string
  status?: IncidentStatus
  author: string
  timestamp: string
  type: 'status_change' | 'comment' | 'assignment' | 'escalation' | 'incident_report'
}

type Incident = {
  id: string
  title: string
  description: string
  status: IncidentStatus
  severity: IncidentSeverity // Changed back to IncidentSeverity
  affectedServices: string[]
  createdAt: string
  acknowledgedAt?: string
  resolvedAt?: string
  assignee?: string
  acknowledgedBy?: string
  resolvedBy?: string
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
  const searchParams = useSearchParams()
  const incidentId = searchParams.get('incidentId')
  const currentUser = useSelector((state: any) => state.user)
  const authToken = useAppSelector((state) => state.auth.token)
  const { hasPermission } = usePermissions()
  
  // State declarations
  const [incident, setIncident] = useState<Incident | null>(null)
  const [loading, setLoading] = useState(true)
  // NOTE: two separate loading states to keep action button UI and posting UI independent
  const [updating, setUpdating] = useState(false) // used for Post Update
  const [actionLoading, setActionLoading] = useState(false) // used for Acknowledge/Resolve
  const [newUpdate, setNewUpdate] = useState('')
  const [updateType, setUpdateType] = useState<'comment' | 'incident_report'>('comment')
  const [isEditing, setIsEditing] = useState(false)
  const [editedTitle, setEditedTitle] = useState('')
  const [editedDescription, setEditedDescription] = useState('')
  const [activeTab, setActiveTab] = useState('timeline')

  // Debug logging
  useEffect(() => {
    console.log('Analytics Page Debug:', {
      authToken: authToken ? 'Present' : 'Missing',
      hasIncidentPermission: hasPermission(SYSTEM_PERMISSIONS.INCIDENT_MANAGEMENT),
      currentUser: currentUser?.fullName || currentUser?.email || 'Unknown',
      userRole: currentUser?.selectedOrganizationRole
    });
  }, [authToken, hasPermission, currentUser])
  
  // Debug incident state
  useEffect(() => {
    if (incident) {
      console.log('🔍 Incident State Debug:', {
        id: incident.id,
        status: incident.status,
        acknowledgedAt: incident.acknowledgedAt ? 'Present' : 'Missing',
        resolvedAt: incident.resolvedAt ? 'Present' : 'Missing',
        acknowledgedBy: incident.acknowledgedBy || 'Missing',
        resolvedBy: incident.resolvedBy || 'Missing',
        shouldShowAcknowledge: !incident.resolvedAt && !incident.acknowledgedAt,
        shouldShowResolve: !incident.resolvedAt && incident.acknowledgedAt,
        shouldShowNoButtons: !!incident.resolvedAt,
        rawResolvedAt: incident.resolvedAt,
        rawAcknowledgedAt: incident.acknowledgedAt
      });
    }
  }, [incident])

  useEffect(() => {
    const fetchIncident = async () => {
      if (!incidentId) return;
      
      setLoading(true)
      
      try {
        const [data, updatesResponse] = await Promise.all([
          getIncidentAnalytics(incidentId),
          getIncidentUpdates(incidentId)
        ]);
        
        // Extract updates data properly
        // Handle both direct array response and wrapped response
        let updatesData = [];
        if (Array.isArray(updatesResponse)) {
          updatesData = updatesResponse;
        } else if (updatesResponse && updatesResponse.data && Array.isArray(updatesResponse.data)) {
          updatesData = updatesResponse.data;
        } else if (updatesResponse && updatesResponse.success && Array.isArray(updatesResponse.data)) {
          updatesData = updatesResponse.data;
        }
  
        // Transform backend data to match frontend interface
        const status = data?.status ? String(data.status).toLowerCase() : 'open';
        const severity = data?.severity ? String(data.severity).toLowerCase() : 'medium';
        
        // Safely extract metrics with defaults
        const metrics = data?.metrics || {};
        const responseTimeMs = typeof metrics.responseTimeMs === 'number' ? metrics.responseTimeMs : 0;
        const resolutionTimeMs = typeof metrics.resolutionTimeMs === 'number' ? metrics.resolutionTimeMs : 0;
        
        // Transform updates to match frontend interface
        const transformedUpdates = updatesData.map((update: any) => ({
          id: update.id,
          message: update.message,
          type: update.type,
          author: typeof update.author === 'string' ? update.author : 
                  (update.author?.name || update.author?.email || 'Unknown'),
          timestamp: update.createdAt || update.timestamp
        }));
        
        const transformedIncident: Incident = {
          id: data.id || incidentId || '',
          title: data.title || 'Untitled Incident',
          description: data.description || 'No description provided',
          status: (status as IncidentStatus) || 'open',
          severity: (severity as IncidentSeverity) || 'medium',
          affectedServices: [data.service?.name || 'Unknown Service'],
          createdAt: data.createdAt,
          acknowledgedAt: data.acknowledgedAt,
          resolvedAt: data.resolvedAt,
          assignee: data.acknowledgedBy?.name || data.acknowledgedBy?.email || data.resolvedBy?.name || data.resolvedBy?.email,
          acknowledgedBy: data.acknowledgedBy?.name || data.acknowledgedBy?.email || (typeof data.acknowledgedBy === 'string' ? data.acknowledgedBy : null),
          resolvedBy: data.resolvedBy?.name || data.resolvedBy?.email || (typeof data.resolvedBy === 'string' ? data.resolvedBy : null),
          responseTime: responseTimeMs ? Math.floor(responseTimeMs / 60000) : 0,
          downtime: resolutionTimeMs ? Math.floor(resolutionTimeMs / 60000) : 0,
          impactedUsers: 0,
          escalationLevel: 1,
          tags: ['incident'],
          updates: transformedUpdates, // Ensure this is always an array
          metrics: {
            responseTimeMs: [],
            errorRate: [],
            timestamps: []
          }
        };
        
        setIncident(transformedIncident);
        setEditedTitle(transformedIncident.title);
        setEditedDescription(transformedIncident.description);
      } catch (error) {
        console.error('Error fetching incident:', error);
        // Set a default incident with empty updates array to prevent crashes
        setIncident(prev => prev || {
          id: incidentId || '',
          title: 'Error Loading Incident',
          description: 'Failed to load incident details',
          status: 'open',
          severity: 'medium',
          affectedServices: ['Unknown'],
          createdAt: new Date().toISOString(),
          responseTime: 0,
          downtime: 0,
          impactedUsers: 0,
          escalationLevel: 1,
          tags: [],
          updates: [], // Ensure updates is always an array
          metrics: { responseTimeMs: [], errorRate: [], timestamps: [] }
        });
      } finally {
        setLoading(false);
      }
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
      case 'maintenance': return 'bg-purple-500' // Re-added maintenance case
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
    if (!newUpdate.trim() || !incidentId) return
    
    setUpdating(true)
    
    try {
      const response = await createIncidentUpdate(incidentId, newUpdate, updateType);
      
      if (response.success) {
        const update: IncidentUpdate = {
          id: response.data.id,
          message: response.data.message,
          type: response.data.type,
          author: response.data.author,
          timestamp: response.data.timestamp
        }
        
        setIncident(prev => prev ? ({
          ...prev,
          updates: [update, ...prev.updates]
        } as Incident) : null)
        
        setNewUpdate('')
        setUpdateType('comment')
      }
    } catch (error) {
      console.error('Error updating incident:', error)
    } finally {
      setUpdating(false)
    }
  }

  const handleAcknowledge = async () => {
    if (!incident || !incidentId) return
    setActionLoading(true)
    try {
      await acknowledgeIncident(incidentId, authToken || undefined);
      
      // Add acknowledgment update to timeline via API
      const currentUserName = currentUser?.fullName || currentUser?.email || 'Current User';
      try {
        await createIncidentUpdate(incidentId, `Incident acknowledged by ${currentUserName}. Escalations have been stopped.`, 'status_change');
      } catch (updateError) {
        console.error('Error creating acknowledgment update:', updateError);
      }
      
      // Refresh both incident data and updates
      const [updatedData, updatesResponse] = await Promise.all([
        getIncidentAnalytics(incidentId),
        getIncidentUpdates(incidentId)
      ]);
      
      console.log('🔄 After Acknowledge - API Response:', {
        status: updatedData.status,
        acknowledgedAt: updatedData.acknowledgedAt,
        resolvedAt: updatedData.resolvedAt,
        acknowledgedBy: updatedData.acknowledgedBy,
        resolvedBy: updatedData.resolvedBy
      });
      
      console.log('🔄 After Resolve - API Response:', {
        status: updatedData.status,
        acknowledgedAt: updatedData.acknowledgedAt,
        resolvedAt: updatedData.resolvedAt,
        acknowledgedBy: updatedData.acknowledgedBy,
        resolvedBy: updatedData.resolvedBy,
        rawAcknowledgedBy: JSON.stringify(updatedData.acknowledgedBy),
        rawResolvedBy: JSON.stringify(updatedData.resolvedBy)
      });
      
      // Extract updates data properly
      let updatesData = [];
      if (Array.isArray(updatesResponse)) {
        updatesData = updatesResponse;
      } else if (updatesResponse && updatesResponse.data && Array.isArray(updatesResponse.data)) {
        updatesData = updatesResponse.data;
      } else if (updatesResponse && updatesResponse.success && Array.isArray(updatesResponse.data)) {
        updatesData = updatesResponse.data;
      }
      
      // Transform updates to match frontend interface
      const transformedUpdates = updatesData.map((update: any) => ({
        id: update.id,
        message: update.message,
        type: update.type,
        author: typeof update.author === 'string' ? update.author : 
                (update.author?.name || update.author?.email || 'Unknown'),
        timestamp: update.createdAt || update.timestamp
      }));
      
      const transformedIncident: Incident = {
        id: updatedData.id,
        title: updatedData.title,
        description: updatedData.description,
        status: updatedData.status.toLowerCase() as IncidentStatus,
        severity: updatedData.severity.toLowerCase() as IncidentSeverity,
        affectedServices: [updatedData.service?.name || 'Unknown Service'],
        createdAt: updatedData.createdAt,
        acknowledgedAt: updatedData.acknowledgedAt,
        resolvedAt: updatedData.resolvedAt,
        assignee: updatedData.acknowledgedBy?.name || updatedData.acknowledgedBy?.email || updatedData.resolvedBy?.name || updatedData.resolvedBy?.email,
        acknowledgedBy: updatedData.acknowledgedBy?.name || updatedData.acknowledgedBy?.email || (typeof updatedData.acknowledgedBy === 'string' ? updatedData.acknowledgedBy : null),
        resolvedBy: updatedData.resolvedBy?.name || updatedData.resolvedBy?.email || (typeof updatedData.resolvedBy === 'string' ? updatedData.resolvedBy : null),
        responseTime: updatedData.metrics?.responseTimeMs ? Math.floor(updatedData.metrics.responseTimeMs / 60000) : 0,
        downtime: updatedData.metrics?.resolutionTimeMs ? Math.floor(updatedData.metrics.resolutionTimeMs / 60000) : 0,
        impactedUsers: 0,
        escalationLevel: 1,
        tags: ['incident'],
        updates: transformedUpdates,
        metrics: {
          responseTimeMs: [],
          errorRate: [],
          timestamps: []
        }
      };
      
      console.log('🚀 Transformed Incident After Resolve:', {
        resolvedAt: transformedIncident.resolvedAt,
        resolvedBy: transformedIncident.resolvedBy,
        status: transformedIncident.status,
        shouldShowButtons: !transformedIncident.resolvedAt
      });
      
      setIncident(transformedIncident);
    } catch (error) {
      console.error('Error acknowledging incident:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleResolve = async () => {
    if (!incident || !incidentId) return
    setActionLoading(true)
    try {
      await resolveIncident(incidentId, 'Incident resolved via dashboard', authToken || undefined);
      
      // Add resolution update to timeline via API
      const currentUserName = currentUser?.fullName || currentUser?.email || 'Current User';
      try {
        await createIncidentUpdate(incidentId, `Incident manually resolved by ${currentUserName}. All affected services are now operational.`, 'status_change');
      } catch (updateError) {
        console.error('Error creating resolution update:', updateError);
      }
      
      // Refresh both incident data and updates
      const [updatedData, updatesResponse] = await Promise.all([
        getIncidentAnalytics(incidentId),
        getIncidentUpdates(incidentId)
      ]);
      
      // Extract updates data properly
      let updatesData = [];
      if (Array.isArray(updatesResponse)) {
        updatesData = updatesResponse;
      } else if (updatesResponse && updatesResponse.data && Array.isArray(updatesResponse.data)) {
        updatesData = updatesResponse.data;
      } else if (updatesResponse && updatesResponse.success && Array.isArray(updatesResponse.data)) {
        updatesData = updatesResponse.data;
      }
      
      // Transform updates to match frontend interface
      const transformedUpdates = updatesData.map((update: any) => ({
        id: update.id,
        message: update.message,
        type: update.type,
        author: typeof update.author === 'string' ? update.author : 
                (update.author?.name || update.author?.email || 'Unknown'),
        timestamp: update.createdAt || update.timestamp
      }));
      
      const transformedIncident: Incident = {
        id: updatedData.id,
        title: updatedData.title,
        description: updatedData.description,
        status: updatedData.status.toLowerCase() as IncidentStatus,
        severity: updatedData.severity.toLowerCase() as IncidentSeverity,
        affectedServices: [updatedData.service?.name || 'Unknown Service'],
        createdAt: updatedData.createdAt,
        acknowledgedAt: updatedData.acknowledgedAt,
        resolvedAt: updatedData.resolvedAt,
        assignee: updatedData.acknowledgedBy?.name || updatedData.acknowledgedBy?.email || updatedData.resolvedBy?.name || updatedData.resolvedBy?.email,
        acknowledgedBy: updatedData.acknowledgedBy?.name || updatedData.acknowledgedBy?.email || (typeof updatedData.acknowledgedBy === 'string' ? updatedData.acknowledgedBy : null),
        resolvedBy: updatedData.resolvedBy?.name || updatedData.resolvedBy?.email || (typeof updatedData.resolvedBy === 'string' ? updatedData.resolvedBy : null),
        responseTime: updatedData.metrics.responseTimeMs ? Math.floor(updatedData.metrics.responseTimeMs / 60000) : 0,
        downtime: updatedData.metrics.resolutionTimeMs ? Math.floor(updatedData.metrics.resolutionTimeMs / 60000) : 0,
        impactedUsers: 0,
        escalationLevel: 1,
        tags: ['incident'],
        updates: transformedUpdates,
        metrics: {
          responseTimeMs: [],
          errorRate: [],
          timestamps: []
        }
      };
      
      setIncident(transformedIncident);
    } catch (error) {
      console.error('Error resolving incident:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleSaveEdit = async () => {
    setUpdating(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setIncident(prev => prev ? ({
        ...prev,
        title: editedTitle,
        description: editedDescription
      } as Incident) : null)
      
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
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
    return 'Just now'
  }

  const formatUserFriendlyDate = (dateString: string | null) => {
    if (!dateString) return 'Just now'
    
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    
    // If less than 1 hour ago, show "X minutes ago"
    if (hours === 0) {
      if (minutes <= 0) return 'Just now'
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
    }
    
    // If less than 24 hours ago, show "X hours ago"
    if (days === 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`
    }
    
    // If more than 24 hours, show friendly date
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days} days ago`
    
    // For older dates, show formatted date
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    }) + ' at ' + date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
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
              <div className="flex items-center gap-3 mb-2 flex-wrap">
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

            {/* Action Buttons and acknowledgements/resolution info */}
            <div className="flex flex-col items-end gap-3">
              {/* Action Buttons */}
              <PermissionGate 
                permissions={[SYSTEM_PERMISSIONS.INCIDENT_MANAGEMENT]}
                fallback={
                  <div className="flex gap-2">
                    {/* Show disabled buttons only if incident is not resolved */}
                    {(!incident.resolvedAt && incident.status !== 'resolved') && (
                      <>
                        {/* Show disabled Acknowledge button only if not acknowledged yet */}
                        {!incident.acknowledgedAt && (
                          <Button 
                            size="sm" 
                            disabled 
                            className="opacity-50 cursor-not-allowed"
                            title="You don't have permission to acknowledge incidents"
                          >
                            <Clock className="h-4 w-4 mr-1" />
                            Acknowledge
                          </Button>
                        )}
                        
                        {/* Show disabled Resolve button only if acknowledged */}
                        {incident.acknowledgedAt && (
                          <Button 
                            size="sm" 
                            disabled 
                            variant="default" 
                            className="opacity-50 cursor-not-allowed"
                            title="You don't have permission to resolve incidents"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Resolve
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                }
              >
                <div className="flex gap-2">
                  {/* Button Logic: Only show buttons if NOT resolved (check both resolvedAt and status) */}
                  {(!incident.resolvedAt && incident.status !== 'resolved') && (
                    <>
                      {/* Acknowledge button: Show only if NOT acknowledged */}
                      {!incident.acknowledgedAt && (
                        <Button size="sm" onClick={handleAcknowledge} disabled={actionLoading}>
                          <Clock className="h-4 w-4 mr-1" />
                          {actionLoading ? 'Acknowledging...' : 'Acknowledge'}
                        </Button>
                      )}
                      
                      {/* Resolve button: Show only if acknowledged */}
                      {incident.acknowledgedAt && (
                        <Button size="sm" onClick={handleResolve} disabled={actionLoading} variant="default">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          {actionLoading ? 'Resolving...' : 'Resolve'}
                        </Button>
                      )}
                    </>
                  )}
                  

                </div>
              </PermissionGate>

              {/* Status Information */}
              <div className="text-right space-y-2">
                {/* Priority: Show resolved status first if resolved (check both resolvedAt and status) */}
                {(incident.resolvedAt || incident.status === 'resolved') ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-green-800 font-bold mb-2">
                      <CheckCircle className="h-5 w-5" />
                      ✅ INCIDENT RESOLVED
                    </div>
                    <div className="text-sm text-green-700 font-medium">
                      Resolved by: {(() => {
                        // If API provides resolver info, use it (could be from manual or auto resolution)
                        if (incident.resolvedBy) {
                          return incident.resolvedBy;
                        }
                        // If incident is resolved but no resolvedBy, check if it was manual (recent) or auto
                        if (incident.status === 'resolved') {
                          // If resolvedAt is null/recent, likely manual by current user
                          if (!incident.resolvedAt) {
                            return currentUser?.fullName || currentUser?.email || 'Current User';
                          }
                          // If has resolvedAt but no resolvedBy, could be auto-resolution
                          return 'System (Auto-resolved)';
                        }
                        return 'System';
                      })()} 
                    </div>
                    <div className="text-xs text-green-600 mt-1">
                      🕒 {formatUserFriendlyDate(incident.resolvedAt || null)}
                    </div>
                    {incident.acknowledgedAt && (
                      <div className="text-xs text-gray-600 mt-3 pt-2 border-t border-green-200">
                        💡 Previously acknowledged by {incident.acknowledgedBy || 'Unknown User'}<br/>
                        🕒 {formatUserFriendlyDate(incident.acknowledgedAt)}
                      </div>
                    )}
                  </div>
                ) : incident.acknowledgedAt && incident.status !== 'closed' ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-yellow-800 font-bold mb-2">
                      <Clock className="h-5 w-5" />
                      ⏳ ACKNOWLEDGED - AWAITING RESOLUTION
                    </div>
                    <div className="text-sm text-yellow-700 font-medium">
                      Acknowledged by: {incident.acknowledgedBy || (
                        incident.status === 'acknowledged' && !incident.acknowledgedBy ? 'System (Auto-acknowledged)' : 'Unknown User'
                      )}
                    </div>
                    <div className="text-xs text-yellow-600 mt-1">
                      🕒 {formatUserFriendlyDate(incident.acknowledgedAt)}
                    </div>
                  </div>
                ) : (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-red-800 font-bold mb-2">
                      <AlertTriangle className="h-5 w-5" />
                      🚨 AWAITING ACKNOWLEDGMENT
                    </div>
                    <div className="text-sm text-red-700">
                      This incident requires immediate acknowledgment
                    </div>
                  </div>
                )}
              </div>
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

            {/* Tabs (only Timeline) */}
            <Card className="bg-white/70 backdrop-blur-sm border-gray-200/70">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <CardHeader>
                  <TabsList className="grid w-full grid-cols-1">
                    <TabsTrigger value="timeline">Timeline</TabsTrigger>
                  </TabsList>
                </CardHeader>
                
                <TabsContent value="timeline">
                  <CardContent className="space-y-4">
                    {/* Add Update Form */}
                    <div className="p-4 border border-gray-200 rounded-lg bg-gray-50/50">
                      <div className="space-y-4">
                        <Textarea
                          placeholder="Add an update, comment, or incident report..."
                          value={newUpdate}
                          onChange={(e) => setNewUpdate(e.target.value)}
                          rows={3}
                        />
                        <div className="flex items-center justify-between">
                          <Select value={updateType} onValueChange={(value) => setUpdateType(value as 'comment' | 'incident_report')}>
                            <SelectTrigger className="w-48">
                              <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="comment">Comment</SelectItem>
                              <SelectItem value="incident_report">Incident Report</SelectItem>
                            </SelectContent>
                          </Select>

                          <Button onClick={handleUpdateSubmit} disabled={updating || !newUpdate.trim()}>
                            <Send className="h-4 w-4 mr-2" />
                            {updating ? 'Posting...' : 'Post Update'}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Timeline */}
                    {/* Timeline */}
<div className="space-y-4">
  {Array.isArray(incident.updates) && incident.updates.length > 0 ? (
    incident.updates.slice().reverse().map((update, index) => (
      <div key={update.id} className="flex gap-4">
        <div className="flex flex-col items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            update.type === 'status_change' ? 'bg-blue-100' : 'bg-gray-100'
          }`}>
            {update.type === 'status_change' ? (
              <Activity className="h-4 w-4 text-blue-600" />
            ) : update.type === 'incident_report' ? (
              <BookOpen className="h-4 w-4 text-purple-600" />
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
    ))
  ) : (
    <div className="text-center py-8 text-gray-500">
      <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
      <p>No updates yet. Be the first to add an update!</p>
    </div>
  )}
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
                    <label className="text-sm font-medium text-gray-500">Current Handler</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {incident.resolvedBy ? (
                        <span className="text-green-700 font-medium">Resolved by {incident.resolvedBy}</span>
                      ) : incident.acknowledgedBy ? (
                        <span className="text-yellow-700 font-medium">Acknowledged by {incident.acknowledgedBy}</span>
                      ) : incident.assignee ? (
                        incident.assignee
                      ) : (
                        'Unassigned'
                      )}
                    </p>
                  </div>

                  {incident.acknowledgedAt && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Acknowledged</label>
                      <p className="mt-1 text-sm text-gray-900 font-medium">{formatUserFriendlyDate(incident.acknowledgedAt)}</p>
                      <p className="mt-1 text-xs text-gray-600">
                        by {incident.acknowledgedBy || 'System'}
                      </p>
                    </div>
                  )}

                  {(incident.resolvedAt || incident.status === 'resolved') && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Resolved</label>
                      <p className="mt-1 text-sm text-gray-900 font-medium">{formatUserFriendlyDate(incident.resolvedAt || null)}</p>
                      <p className="mt-1 text-xs text-gray-600">
                        by {(() => {
                          // If API provides resolver info, use it
                          if (incident.resolvedBy) {
                            return incident.resolvedBy;
                          }
                          // If incident is resolved but no resolvedBy
                          if (incident.status === 'resolved') {
                            // If resolvedAt is null, likely manual by current user
                            if (!incident.resolvedAt) {
                              return currentUser?.fullName || currentUser?.email || 'Current User';
                            }
                            // If has resolvedAt but no resolvedBy, could be auto-resolution
                            return 'System';
                          }
                          return 'System';
                        })()} 
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium text-gray-500">Response Time</label>
                    <p className="mt-1 text-sm text-gray-900">{formatDuration(incident.responseTime)}</p>
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

            {/* Quick Actions removed as requested */}
          </div>
        </div>
      </div>
    </div>
  )
}
