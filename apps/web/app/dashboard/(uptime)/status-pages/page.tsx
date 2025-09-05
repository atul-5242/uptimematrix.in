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
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Copy, 
  Trash2, 
  Eye,
  EyeOff,
  Globe,
  Users,
  BarChart3,
  Calendar,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ExternalLink,
  Settings,
  Share
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface StatusPage {
  id: string
  name: string
  subdomain: string
  customDomain?: string
  description: string
  status: 'operational' | 'degraded'
  visibility: 'public'
  services: ServiceGroup[]
  subscribers: number
  incidents: number
  uptime: number
  lastUpdated: string
  isPublished: boolean
  createdAt: string
  theme: 'light' | 'dark' | 'auto'
  branding: {
    logo?: string
    primaryColor: string
    headerBg: string
  }
}

interface ServiceGroup {
  id: string
  name: string
  services: Service[]
  status: 'operational' | 'degraded'
}

interface Service {
  id: string
  name: string
  status: 'operational' | 'degraded'
  uptime: number
  monitorId?: string
}

export default function StatusPagesDashboard() {
  const router = useRouter()
  const [statusPages, setStatusPages] = useState<StatusPage[]>([])
  const [filteredPages, setFilteredPages] = useState<StatusPage[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockStatusPages: StatusPage[] = [
      {
        id: '1',
        name: 'My Company Status',
        subdomain: 'mycompany',
        customDomain: 'status.mycompany.com',
        description: 'Track the status of our main services and infrastructure',
        status: 'operational',
        visibility: 'public',
        services: [
          {
            id: '1',
            name: 'Web Services',
            status: 'operational',
            services: [
              { id: '1', name: 'Main Website', status: 'operational', uptime: 99.95, monitorId: 'mon1' },
              { id: '2', name: 'API Gateway', status: 'operational', uptime: 99.98, monitorId: 'mon2' },
              { id: '3', name: 'CDN', status: 'operational', uptime: 100, monitorId: 'mon3' }
            ]
          },
          {
            id: '2',
            name: 'Database Services',
            status: 'operational',
            services: [
              { id: '4', name: 'Primary Database', status: 'operational', uptime: 99.99 },
              { id: '5', name: 'Redis Cache', status: 'operational', uptime: 99.97 }
            ]
          }
        ],
        subscribers: 1250,
        incidents: 2,
        uptime: 99.96,
        lastUpdated: new Date().toISOString(),
        isPublished: true,
        createdAt: '2024-01-15T10:30:00Z',
        theme: 'light',
        branding: {
          primaryColor: '#2563eb',
          headerBg: '#ffffff'
        }
      },
      {
        id: '2',
        name: 'E-commerce Platform',
        subdomain: 'ecommerce-platform',
        description: 'Status updates for our online store and payment systems',
        status: 'degraded',
        visibility: 'public',
        services: [
          {
            id: '3',
            name: 'Store Front',
            status: 'degraded',
            services: [
              { id: '6', name: 'Product Catalog', status: 'degraded', uptime: 98.5 },
              { id: '7', name: 'Shopping Cart', status: 'operational', uptime: 99.8 },
              { id: '8', name: 'Checkout Process', status: 'operational', uptime: 99.9 }
            ]
          }
        ],
        subscribers: 850,
        incidents: 1,
        uptime: 98.8,
        lastUpdated: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        isPublished: true,
        createdAt: '2024-02-20T14:15:00Z',
        theme: 'light',
        branding: {
          primaryColor: '#059669',
          headerBg: '#f8fafc'
        }
      },
      {
        id: '3',
        name: 'Internal Services',
        subdomain: 'internal',
        description: 'Private status page for internal team monitoring',
        status: 'operational',
        visibility: 'public',
        services: [
          {
            id: '4',
            name: 'Development Tools',
            status: 'operational',
            services: [
              { id: '9', name: 'CI/CD Pipeline', status: 'operational', uptime: 99.5 },
              { id: '10', name: 'Code Repository', status: 'operational', uptime: 100 }
            ]
          }
        ],
        subscribers: 45,
        incidents: 0,
        uptime: 99.8,
        lastUpdated: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        isPublished: false,
        createdAt: '2024-03-01T09:00:00Z',
        theme: 'dark',
        branding: {
          primaryColor: '#7c3aed',
          headerBg: '#1f2937'
        }
      }
    ]

    setTimeout(() => {
      setStatusPages(mockStatusPages)
      setFilteredPages(mockStatusPages)
      setLoading(false)
    }, 1000)
  }, [])

  useEffect(() => {
    let filtered = statusPages

    if (searchTerm) {
      filtered = filtered.filter(page => 
        page.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        page.subdomain.toLowerCase().includes(searchTerm.toLowerCase()) ||
        page.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(page => page.status === statusFilter)
    }

    // Only show public status pages
    filtered = filtered.filter(page => page.visibility === 'public')

    setFilteredPages(filtered)
  }, [statusPages, searchTerm, statusFilter])

  const getStatusColor = (status: StatusPage['status']): string => {
    switch (status) {
      case 'operational': return 'text-green-600 bg-green-50'
      case 'degraded': return 'text-yellow-600 bg-yellow-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatusIcon = (status: StatusPage['status']) => {
    switch (status) {
      case 'operational': return <CheckCircle className="h-4 w-4" />
      case 'degraded': return <AlertTriangle className="h-4 w-4" />
      default: return null
    }
  }

  const getVisibilityIcon = () => {
    return <Globe className="h-4 w-4 text-green-500" />
  }

  const formatLastUpdated = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)} hours ago`
    } else {
      return `${Math.floor(diffInMinutes / 1440)} days ago`
    }
  }

  const handleCreateStatusPage = (): void => {
    router.push('/dashboard/status-pages/new')
  }

  const handleViewStatusPage = (pageId: string): void => {
    router.push(`/dashboard/status-pages/${pageId}`)
  }

  const handleEditStatusPage = (pageId: string): void => {
    router.push(`/dashboard/status-pages/${pageId}/edit`)
  }

  const handleDeleteStatusPage = async (pageId: string): Promise<void> => {
    if (!confirm('Are you sure you want to delete this status page? This action cannot be undone.')) {
      return
    }

    try {
      // Replace with actual API call
      setStatusPages(prev => prev.filter(page => page.id !== pageId))
    } catch (error) {
      console.error('Error deleting status page:', error)
      alert('Failed to delete status page')
    }
  }

  const handleTogglePublish = async (pageId: string, currentPublished: boolean): Promise<void> => {
    try {
      setStatusPages(prev => 
        prev.map(page => 
          page.id === pageId 
            ? { ...page, isPublished: !currentPublished }
            : page
        )
      )
    } catch (error) {
      console.error('Error toggling publish status:', error)
      alert('Failed to update publish status')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading status pages...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Status Pages</h1>
              <p className="text-gray-600 mt-1">
                Create and manage public status pages for your services
              </p>
            </div>
            <Button onClick={handleCreateStatusPage} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Status Page
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-blue-500" />
                  <div className="text-sm text-gray-600">Total Pages</div>
                </div>
                <div className="text-2xl font-bold">{statusPages.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <div className="text-sm text-gray-600">Operational</div>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {statusPages.filter(p => p.status === 'operational').length}
                </div>
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
                    placeholder="Search status pages..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex gap-3">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="operational">Operational</SelectItem>
                    <SelectItem value="degraded">Degraded</SelectItem>
                  </SelectContent>
                </Select>

              </div>
            </div>
          </div>
        </div>

        {/* Status Pages List */}
        {filteredPages.length === 0 ? (
          <div className="text-center py-12">
            <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || statusFilter !== 'all' || visibilityFilter !== 'all'
                ? 'No status pages match your filters'
                : 'No status pages yet'
              }
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== 'all' || visibilityFilter !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'Create your first status page to communicate service status to your users'
              }
            </p>
            {(!searchTerm && statusFilter === 'all' && visibilityFilter === 'all') && (
              <Button onClick={handleCreateStatusPage}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Status Page
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPages.map((page) => (
              <Card key={page.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(page.status)}`}>
                          {getStatusIcon(page.status)}
                          {page.status.replace('_', ' ').toUpperCase()}
                        </div>
                        <div className="flex items-center gap-1">
                          {getVisibilityIcon(page.visibility)}
                          <Badge variant="outline" className="text-xs capitalize">
                            {page.visibility.replace('_', ' ')}
                          </Badge>
                        </div>
                        {!page.isPublished && (
                          <Badge variant="secondary" className="text-xs">
                            Draft
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {page.name}
                        </h3>
                        <ExternalLink 
                          className="h-4 w-4 text-gray-400 cursor-pointer hover:text-blue-500"
                          onClick={() => window.open(`/status/${page.subdomain}`, '_blank')}
                        />
                      </div>

                      <p className="text-sm text-gray-600 mb-2">
                        {page.customDomain || `status.yourdomain.com/${page.subdomain}`}
                      </p>
                      
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {page.description}
                      </p>

                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-gray-500 mb-1">Services</div>
                          <div className="font-semibold">
                            {page.services.reduce((sum, group) => sum + group.services.length, 0)}
                          </div>
                        </div>

                        <div>
                          <div className="text-gray-500 mb-1">Uptime</div>
                          <div className="font-semibold">{page.uptime.toFixed(2)}%</div>
                        </div>

                        <div>
                          <div className="text-gray-500 mb-1">Incidents</div>
                          <div className="font-semibold">{page.incidents}</div>
                        </div>
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
                        <DropdownMenuItem onClick={() => handleViewStatusPage(page.id)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Status Page
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => window.open(`/status/${page.subdomain}`, '_blank')}>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Open Public Page
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditStatusPage(page.id)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Settings
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => alert('Share status page')}>
                          <Share className="h-4 w-4 mr-2" />
                          Share
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => alert('Duplicate status page')}>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleTogglePublish(page.id, page.isPublished)}
                        >
                          {page.isPublished ? (
                            <>
                              <EyeOff className="h-4 w-4 mr-2" />
                              Unpublish
                            </>
                          ) : (
                            <>
                              <Eye className="h-4 w-4 mr-2" />
                              Publish
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDeleteStatusPage(page.id)}
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