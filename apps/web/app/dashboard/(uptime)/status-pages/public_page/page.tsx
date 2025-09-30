"use client"
import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Clock,
  Calendar,
  TrendingUp,
  Users,
  Bell,
  ExternalLink,
  Info,
  ChevronDown,
  ChevronUp,
  Activity,
  Globe,
  Zap,
  BarChart3
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts'

// Define the status types used throughout the application
type ServiceStatus = 'operational' | 'degraded' | 'down' | 'maintenance' | 'major_outage' | 'outage';

interface StatusPageData {
  id: string;
  name: string;
  description: string;
  status: ServiceStatus;
  lastUpdated: string;
  logo: string;
  branding: {
    primaryColor: string;
    headerBg: string;
  };
  serviceGroups: ServiceGroup[];
  incidents: Incident[];
  metrics: {
    overallUptime: number;
    avgResponseTime: number;
    totalChecks: number;
  };
  uptimeData: UptimeDataPoint[];
  responseTimeData: ResponseTimeDataPoint[];
}

interface ServiceGroup {
  id: string;
  name: string;
  status: ServiceStatus;
  services: Service[];
}

interface Service {
  id: string;
  name: string;
  description: string;
  status: ServiceStatus;
  uptime: {
    '24h': number;
    '7d': number;
    '30d': number;
    '90d': number;
  };
  responseTime: number;
  lastCheck: string;
  uptimeHistory: Array<{
    timestamp: string;
    status: ServiceStatus;
    responseTime: number;
  }>;
  history: any[];
}

interface UptimeDay {
  date: string;
  uptime: number;
  status: ServiceStatus;
}

interface Incident {
  id: string;
  title: string;
  description: string;
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved' | 'postmortem';
  severity: 'none' | 'minor' | 'major' | 'critical';
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null | undefined;
  updates: IncidentUpdate[];
  affectedServices: string[];
}

interface IncidentUpdate {
  id: string
  status: string
  message: string
  timestamp: string
}

interface UptimeDataPoint {
  date: string
  uptime: number
}

interface ResponseTimeDataPoint {
  timestamp: string;
  value: number;
}

interface ApiResponse {
  success: boolean;
  data: {
    id: string;
    title: string;
    description: string | null;
    customDomain: string | null;
    subdomain: string;
    services: Array<{
      id: string;
      name: string;
      description: string | null;
      status: 'operational' | 'degraded' | 'down' | 'maintenance' | 'major_outage';
      uptime24h: number;
      uptime7d: number;
      uptime30d: number;
      uptime90d: number;
      responseTime24h: number;
    }>;
    incidents: Array<{
      id: string;
      title: string;
      status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
      impact: 'none' | 'minor' | 'major' | 'critical';
      startedAt: string;
      resolvedAt: string | null;
      updates: Array<{
        id: string;
        status: 'investigating' | 'identified' | 'monitoring' | 'resolved' | 'postmortem';
        message: string;
        createdAt: string;
      }>;
    }>;
    responseTimeData: Array<{
      timestamp: string;
      value: number;
    }>;
    uptimeData: Array<{
      date: string;
      uptime: number;
    }>;
  };
}

export async function getServerSideProps(context: { req: { headers: { host: string } } }) {
  try {
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const host = context.req.headers.host;
    const apiUrl = `${protocol}://${host}/api/status-pages/by-domain?domain=${host}`;
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch status page data: ${response.statusText}`);
    }
    
    const result: ApiResponse = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error('Invalid response from API');
    }

    // Transform the API response to match the component's expected props
    const statusPageData: StatusPageData = {
      id: result.data.id,
      name: result.data.title,
      description: result.data.description || 'Our services are running smoothly.',
      status: 'operational', 
      lastUpdated: new Date().toISOString(),
      logo: '', 
      branding: {
        primaryColor: '#3498db',
        headerBg: '#f9f9f9'
      },
      serviceGroups: [{
        id: 'default',
        name: 'Services',
        status: 'operational',
        services: result.data.services.map(service => ({
          id: service.id,
          name: service.name,
          description: service.description || '',
          status: service.status as 'operational' | 'degraded' | 'down' | 'maintenance' | 'major_outage',
          uptime: {
            '24h': service.uptime24h,
            '7d': service.uptime7d,
            '30d': service.uptime30d,
            '90d': service.uptime90d
          },
          responseTime: service.responseTime24h,
          lastCheck: new Date().toISOString(),
          uptimeHistory: [],
          history: [],
        }))
      }],
      incidents: result.data.incidents.map((incident: {
        id: string;
        title: string;
        status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
        impact: 'none' | 'minor' | 'major' | 'critical';
        startedAt: string;
        resolvedAt: string | null;
        updates: Array<{
          id: string;
          status: 'investigating' | 'identified' | 'monitoring' | 'resolved' | 'postmortem';
          message: string;
          createdAt: string;
        }>;
      }) => ({
        id: incident.id,
        title: incident.title,
        description: '',
        status: incident.status,
        severity: incident.impact === 'none' ? 'minor' : incident.impact === 'minor' ? 'minor' : incident.impact === 'major' ? 'major' : 'critical',
        createdAt: incident.startedAt,
        updatedAt: incident.startedAt,
        resolvedAt: incident.resolvedAt || undefined,
        updates: incident.updates.map((update: {
          id: string;
          status: 'investigating' | 'identified' | 'monitoring' | 'resolved' | 'postmortem';
          message: string;
          createdAt: string;
        }) => ({
          id: update.id,
          status: update.status,
          message: update.message,
          timestamp: update.createdAt
        })),
        affectedServices: []
      })),
      metrics: {
        overallUptime: 99.99,
        avgResponseTime: 200,
        totalChecks: 10000
      },
      uptimeData: result.data.uptimeData,
      responseTimeData: result.data.responseTimeData
    };

    return {
      props: {
        statusPageData,
      },
    };
  } catch (error) {
    console.error('Error in getServerSideProps:', error);
    
    // Return a minimal error state that the component can handle
    return {
      props: {
        statusPageData: {
          id: '',
          name: 'Status Page',
          description: 'Unable to load status information. Please try again later.',
          status: 'degraded',
          lastUpdated: new Date().toISOString(),
          logo: null,
          branding: {
            primaryColor: '#3498db',
            headerBg: '#f9f9f9'
          },
          serviceGroups: [],
          incidents: [],
          metrics: {
            overallUptime: 0,
            avgResponseTime: 0,
            totalChecks: 0
          },
          uptimeData: [],
          responseTimeData: []
        },
      },
    };
  }
};

export default function PublicStatusPage({ statusPageData }: { statusPageData: StatusPageData }) {
  const [statusData, setStatusData] = useState<StatusPageData | null>(statusPageData)
  const [loading, setLoading] = useState<boolean>(false)
  const [subscriberEmail, setSubscriberEmail] = useState<string>('')
  const [expandedServices, setExpandedServices] = useState<Set<string>>(new Set())
  const [selectedTimeRange, setSelectedTimeRange] = useState<'24h' | '7d' | '30d' | '90d'>('7d')
  const [expandedIncidents, setExpandedIncidents] = useState<Set<string>>(new Set())

  const getStatusColor = (status: ServiceStatus): string => {
    switch (status) {
      case 'operational': return 'text-green-600 bg-green-50 border-green-200';
      case 'down':
      case 'outage':
      case 'major_outage': 
        return 'text-red-600 bg-red-50 border-red-200';
      case 'maintenance': 
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'degraded': 
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: 
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  }

  const getStatusIcon = (status: ServiceStatus) => {
    switch (status) {
      case 'operational':
        return <CheckCircle className="h-4 w-4" />;
      case 'down':
      case 'outage':
      case 'major_outage':
        return <XCircle className="h-4 w-4" />;
      case 'maintenance':
        return <Clock className="h-4 w-4" />;
      case 'degraded':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        // This should never happen if all status values are handled
        return <AlertTriangle className="h-4 w-4" />;
    }
  }

  const getIncidentSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'minor': return 'text-yellow-600 bg-yellow-50'
      case 'major': return 'text-orange-600 bg-orange-50'
      case 'critical': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  const toggleServiceExpansion = (serviceId: string): void => {
    setExpandedServices(prev => {
      const newSet = new Set(prev)
      if (newSet.has(serviceId)) {
        newSet.delete(serviceId)
      } else {
        newSet.add(serviceId)
      }
      return newSet
    })
  }

  const toggleIncidentExpansion = (incidentId: string): void => {
    setExpandedIncidents(prev => {
      const newSet = new Set(prev)
      if (newSet.has(incidentId)) {
        newSet.delete(incidentId)
      } else {
        newSet.add(incidentId)
      }
      return newSet
    })
  }

  const handleSubscribe = async (): Promise<void> => {
    if (!subscriberEmail.trim()) return
    
    try {
      // Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      alert('Successfully subscribed to status updates!')
      setSubscriberEmail('')
    } catch (error) {
      alert('Failed to subscribe. Please try again.')
    }
  }

  const renderUptimeHistory = (uptimeHistory: Array<{ timestamp: string; status: ServiceStatus; responseTime: number }>): React.ReactElement => {
    // Convert the uptime history to the format expected by the UptimeDay type
    const uptimeDays: UptimeDay[] = uptimeHistory.map(entry => ({
      date: new Date(entry.timestamp).toISOString().split('T')[0],
      uptime: entry.status === 'operational' ? 100 : 0,
      status: entry.status
    }));
    
    return (
      <div className="flex items-center gap-1 mt-2">
        {uptimeDays.slice(-90).map((day, index) => (
          <div
            key={index}
            className={`w-1 h-6 rounded-sm ${
              day.uptime >= 99 ? 'bg-green-500' :
              day.uptime >= 95 ? 'bg-yellow-500' :
              'bg-red-500'
            }`}
            title={`${day.date}: ${day.uptime.toFixed(1)}% uptime`}
          />
        ))}
        <span className="text-xs text-gray-500 ml-2">90 days</span>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading status page...</p>
        </div>
      </div>
    )
  }

  if (!statusData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Status Page Not Found</h1>
          <p className="text-gray-600">The requested status page could not be found.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div 
        className="border-b shadow-sm"
        style={{ backgroundColor: statusData.branding.headerBg }}
      >
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {statusData.logo && (
                <img src={statusData.logo} alt="Logo" className="h-10 w-auto" />
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{statusData.name}</h1>
                <p className="text-gray-600 mt-1">{statusData.description}</p>
              </div>
            </div>
            <div className="text-right">
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border ${getStatusColor(statusData.status)}`}>
                {getStatusIcon(statusData.status)}
                {statusData.status === 'operational' && 'All Systems Operational'}
                {statusData.status === 'down' && 'Some Systems Down'}
                {statusData.status === 'major_outage' && 'Major Outage'}
                {statusData.status === 'maintenance' && 'Under Maintenance'}
                {statusData.status === 'outage' && 'Major Outage'}
                {statusData.status === 'degraded' && 'Degraded Performance'}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Last updated {formatTimeAgo(statusData.lastUpdated)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Overall Metrics */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Activity className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-gray-600">Overall Uptime</span>
                </div>
                <div className="text-3xl font-bold text-green-600">
                  {statusData.metrics.overallUptime.toFixed(2)}%
                </div>
                <Progress value={statusData.metrics.overallUptime} className="mt-2 h-2" />
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Zap className="h-5 w-5 text-blue-500" />
                  <span className="text-sm text-gray-600">Avg Response Time</span>
                </div>
                <div className="text-3xl font-bold text-blue-600">
                  {statusData.metrics.avgResponseTime}ms
                </div>
                <div className="text-sm text-gray-500 mt-1">Last 24 hours</div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <BarChart3 className="h-5 w-5 text-purple-500" />
                  <span className="text-sm text-gray-600">Total Checks</span>
                </div>
                <div className="text-3xl font-bold text-purple-600">
                  {statusData.metrics.totalChecks.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500 mt-1">All time</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Incidents */}
        {statusData.incidents.filter(i => i.status !== 'resolved').length > 0 && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-800">
                <AlertTriangle className="h-5 w-5" />
                Active Incidents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {statusData.incidents
                  .filter(incident => incident.status !== 'resolved')
                  .map(incident => (
                    <div key={incident.id} className="bg-white rounded-lg border border-yellow-200 p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{incident.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{incident.description}</p>
                        </div>
                        <Badge className={getIncidentSeverityColor(incident.severity)}>
                          {incident.severity}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">
                          Started {formatTimeAgo(incident.createdAt)}
                        </span>
                        <Badge variant="outline">{incident.status}</Badge>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Service Status */}
        <Card>
          <CardHeader>
            <CardTitle>Service Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {statusData.serviceGroups.map(group => (
              <div key={group.id}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
                  <div className={`flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(group.status)}`}>
                    {getStatusIcon(group.status)}
                    {group.status.replace('_', ' ').toUpperCase()}
                  </div>
                </div>

                <div className="space-y-3">
                  {group.services.map(service => (
                    <div key={service.id} className="border rounded-lg">
                      <div 
                        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                        onClick={() => toggleServiceExpansion(service.id)}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}>
                            {getStatusIcon(service.status)}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{service.name}</h4>
                            {service.description && (
                              <p className="text-sm text-gray-600">{service.description}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right text-sm">
                            <div className="font-semibold">
                              {service.uptime[selectedTimeRange].toFixed(2)}%
                            </div>
                            <div className="text-gray-500">uptime ({selectedTimeRange})</div>
                          </div>
                          {service.responseTime && (
                            <div className="text-right text-sm">
                              <div className="font-semibold">{service.responseTime}ms</div>
                              <div className="text-gray-500">response</div>
                            </div>
                          )}
                          <div className="text-right text-sm">
                            <div className="text-gray-500">checked</div>
                            <div className="font-semibold">{formatTimeAgo(service.lastCheck)}</div>
                          </div>
                          {expandedServices.has(service.id) ? (
                            <ChevronUp className="h-4 w-4 text-gray-400" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                      </div>

                      {expandedServices.has(service.id) && (
                        <div className="border-t bg-gray-50 p-4">
                          <div className="mb-4">
                            <h5 className="text-sm font-medium text-gray-900 mb-2">90-day uptime history</h5>
                            {renderUptimeHistory(service.uptimeHistory)}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Response Time Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Response Time (Last 24 Hours)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={statusData.responseTimeData}>
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="responseTime" 
                    stroke="#3b82f6" 
                    fill="#bfdbfe" 
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Incident History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Incident History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statusData.incidents.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No incidents reported</h3>
                <p className="text-gray-600">All systems have been operational with no reported incidents.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {statusData.incidents.map(incident => (
                  <div key={incident.id} className="border rounded-lg">
                    <div 
                      className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                      onClick={() => toggleIncidentExpansion(incident.id)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge className={getIncidentSeverityColor(incident.severity)}>
                            {incident.severity}
                          </Badge>
                          <Badge variant="outline">{incident.status}</Badge>
                        </div>
                        <h4 className="font-medium text-gray-900">{incident.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{incident.description}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right text-sm">
                          <div className="text-gray-500">Created</div>
                          <div className="font-medium">{formatTimeAgo(incident.createdAt)}</div>
                        </div>
                        {expandedIncidents.has(incident.id) ? (
                          <ChevronUp className="h-4 w-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    </div>

                    {expandedIncidents.has(incident.id) && (
                      <div className="border-t bg-gray-50 p-4">
                        <h5 className="text-sm font-medium text-gray-900 mb-3">Incident Updates</h5>
                        <div className="space-y-3">
                          {incident.updates.map(update => (
                            <div key={update.id} className="flex gap-3">
                              <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2" />
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant="outline" className="text-xs">
                                    {update.status}
                                  </Badge>
                                  <span className="text-xs text-gray-500">
                                    {formatTimeAgo(update.timestamp)}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-700">{update.message}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Subscription */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Get Notified
            </CardTitle>
            <p className="text-sm text-gray-600">
              Subscribe to status updates and get notified when incidents occur.
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="Enter your email address"
                value={subscriberEmail}
                onChange={(e) => setSubscriberEmail(e.target.value)}
                className="flex-1"
                type="email"
              />
              <Button onClick={handleSubscribe}>
                <Users className="h-4 w-4 mr-2" />
                Subscribe
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 border-t pt-8">
          <p>Powered by Your Monitoring Platform</p>
          <div className="flex items-center justify-center gap-4 mt-2">
            <a href="#" className="hover:text-gray-700 flex items-center gap-1">
              <ExternalLink className="h-3 w-3" />
              Status Page API
            </a>
            <a href="#" className="hover:text-gray-700">Privacy Policy</a>
            <a href="#" className="hover:text-gray-700">Terms of Service</a>
          </div>
        </div>
      </div>
    </div>
  )
}