"use client"
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertTriangle, Clock, CheckCircle, XCircle, Search, Plus, TrendingUp, Globe, Users } from 'lucide-react'
import { getIncidents, getIncidentStats } from '@/app/all-actions/incidents/actions'
import { Incident, IncidentStatus, IncidentSeverity, IncidentStats } from '@/types/incident'
import { formatTimeAgo, formatDuration } from '@/lib/time'
import { useAppSelector } from '@/store'
import { toast } from '@/hooks/use-toast'

export default function IncidentsPage() {
  const router = useRouter()
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [stats, setStats] = useState<IncidentStats>({
    total: 0,
    open: 0,
    acknowledged: 0,
    investigating: 0,
    resolved: 0,
    resolvedToday: 0,
    avgResponseTime: 0,
    avgResolutionTime: 0,
    uptime: 99.9
  })
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('active')

  const selectedOrganizationId = useAppSelector((state) => state.user.selectedOrganizationId);
  const authToken = useAppSelector((state) => state.auth.token);

  useEffect(() => {
    const fetchData = async () => {
      console.log('Selected Organization ID:', selectedOrganizationId);
      if (!selectedOrganizationId) {
        console.log('No organization selected, skipping fetch');
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        console.log('Fetching incidents and stats for organization:', selectedOrganizationId);
        
        if (!authToken) {
          throw new Error('Authentication token not found');
        }

        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        };

        const [incidentsResponse, statsResponse] = await Promise.all([
          fetch(`/api/incidents?organizationId=${encodeURIComponent(selectedOrganizationId)}`, {
            method: 'GET',
            headers,
          }),
          fetch(`/api/incidents/stats?organizationId=${encodeURIComponent(selectedOrganizationId)}`, {
            method: 'GET',
            headers,
          })
        ]);

        if (!incidentsResponse.ok) {
          const error = await incidentsResponse.text();
          throw new Error(`Failed to fetch incidents: ${error}`);
        }

        if (!statsResponse.ok) {
          const error = await statsResponse.text();
          throw new Error(`Failed to fetch stats: ${error}`);
        }

        const [incidentsData, statsData] = await Promise.all([
          incidentsResponse.json(),
          statsResponse.json()
        ]);
        
        console.log('Fetched incidents:', incidentsData);
        console.log('Fetched stats:', statsData);
        
        setIncidents(Array.isArray(incidentsData) ? incidentsData : []);
        setStats(statsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to fetch incidents. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedOrganizationId])

  const getStatusColor = (status: IncidentStatus) => {
    switch (status) {
      case 'DOWN':
        return 'bg-red-100 text-red-800 hover:bg-red-200'
      case 'MONITORING':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200'
      case 'INVESTIGATING':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-200'
      case 'RESOLVED':
        return 'bg-green-100 text-green-800 hover:bg-green-200'
      case 'MAINTENANCE':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200'
    }
  }

  const getStatusIcon = (status: IncidentStatus) => {
    switch (status) {
      case 'DOWN': return <AlertTriangle className="h-4 w-4" />
      case 'MONITORING': return <CheckCircle className="h-4 w-4" />
      case 'INVESTIGATING': return <Search className="h-4 w-4" />
      case 'RESOLVED': return <CheckCircle className="h-4 w-4" />
      case 'MAINTENANCE': return <Clock className="h-4 w-4" />
      default: return <AlertTriangle className="h-4 w-4" />
    }
  }

  const filteredIncidents = incidents.filter(incident => {
    const matchesSearch = searchQuery === '' || 
      incident.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (incident.impact?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    
    if (activeTab === 'active') {
      return matchesSearch && incident.status !== 'RESOLVED'
    } else if (activeTab === 'resolved') {
      return matchesSearch && incident.status === 'RESOLVED'
    }
    return matchesSearch
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/30 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-4"></div>
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
              <Button onClick={() => router.push('/dashboard/incidents/create')}>
                <Plus className="h-4 w-4 mr-2" />
                Create Incident
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards: Active, Resolved, Total */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
                  <p className="text-2xl font-bold text-green-700">{stats.resolvedToday}</p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <span className="text-xs absolute -mt-8">Today</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-gray-200/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Incidents</p>
                  <p className="text-2xl font-bold text-gray-700">{stats.total}</p>
                </div>
                <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search Only */}
        <Card className="bg-white/70 backdrop-blur-sm border-gray-200/70 mb-6">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search incidents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
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
                  <p className="text-gray-600">Try adjusting your search text.</p>
                </div>
              ) : (
                filteredIncidents.map((incident) => (
                  <div 
                    key={incident.id} 
                    className="p-6 hover:bg-gray-50/50 cursor-pointer"
                    onClick={() => router.push(`/dashboard/incidents/${incident.id}`)}
                  >
                    <div className="flex items-start gap-4">
                      {/* Main Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600">
                              {incident.title}
                            </h3>
                            <Badge className={getStatusColor(incident.status)}>
                              {getStatusIcon(incident.status)}
                              <span className="ml-1 capitalize">
                                {incident.status.toLowerCase()}
                              </span>
                            </Badge>
                            {incident.severity && incident.status !== 'RESOLVED' && (
                              <Badge variant="outline" className="border-red-200 text-red-700">
                                {incident.severity.toLowerCase()}
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatTimeAgo(incident.startTime)}
                          </div>
                        </div>

                        <p className="text-gray-600 mb-3 line-clamp-2">
                          {incident.impact || 'No impact description available'}
                        </p>

                        {/* Affected Service */}
                        {incident.website && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            <Badge variant="secondary" className="text-xs flex items-center gap-1">
                              <Globe className="h-3 w-3" />
                              {incident.website.name || 'Unknown Service'}
                            </Badge>
                          </div>
                        )}

                        {/* Metadata */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-2">
                          {incident.AcknowledgedBy && (
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              <span>Acknowledged by: {incident.AcknowledgedBy.fullName || incident.AcknowledgedBy.email}</span>
                            </div>
                          )}

                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>Duration: {formatDuration(parseInt(incident.duration) || 0)}</span>
                          </div>

                          {incident.ResolvedBy && (
                            <div className="flex items-center gap-1">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span>Resolved by: {incident.ResolvedBy.fullName || incident.ResolvedBy.email}</span>
                            </div>
                          )}
                        </div>

                        {/* Tags - Using service name as a tag */}
                        {incident.serviceName && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {incident.serviceName}
                            </Badge>
                          </div>
                        )}
                      </div>

                      {/* View Button */}
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/dashboard/incidents/analytics?incidentId=${incident.id}`)
                          }}
                          className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 border-blue-200 hover:bg-blue-50"
                        >
                          <TrendingUp className="h-3.5 w-3.5" />
                          <span>Analytics</span>
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
