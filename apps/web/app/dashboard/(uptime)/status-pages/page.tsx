"use client"
import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
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
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ChevronRight,
  Wifi,
  WifiOff,
  AlertCircle,
  Settings
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { getStatusPages } from '@/app/all-actions/status-page/status-page-actions'

// Define the StatusPageData interface
export interface Service {
  id: string;
  name: string;
  status: string;
  uptime: number;
  monitorId: string;
}

export interface ServiceGroup {
  id: string;
  name: string;
  status: string;
  services: Service[];
}

export interface Organization {
  id: string;
  name: string;
}

export interface CreatedBy {
  id: string;
  name: string;
}

export interface Branding {
  primaryColor: string;
  headerBg: string;
  logo: string;
}

export interface StatusPageData {
  id: string;
  name: string;
  subdomain: string;
  customDomain: string | null;
  description: string;
  status: string;
  visibility: string;
  services: ServiceGroup[];
  subscribers: number;
  incidents: number;
  uptime: number;
  isPublished: boolean;
  theme: string;
  branding: Branding;
  organization: Organization;
  createdBy: CreatedBy;
  lastUpdated: string;
  createdAt: string;
}

// Reusing the StatusPageData interface from status-page-actions.ts

export default function StatusPagesDashboard() {
  const router = useRouter()
  const [statusPages, setStatusPages] = useState<StatusPageData[]>([])
  const [filteredPages, setFilteredPages] = useState<StatusPageData[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [visibilityFilter, setVisibilityFilter] = useState<string>('all')

  // Handler functions
  const handleViewStatusPage = (id: string) => {
    router.push(`/dashboard/status-pages/${id}`)
  }

  const handleEditStatusPage = (id: string) => {
    router.push(`/dashboard/status-pages/${id}/edit`)
  }

  const handleTogglePublish = async (id: string, isPublished: boolean) => {
    try {
      // TODO: Implement toggle publish API call
      console.log(`Toggling publish for status page ${id} to ${!isPublished}`)
    } catch (error) {
      console.error('Error toggling publish status:', error)
    }
  }

  const handleDeleteStatusPage = async (id: string) => {
    if (confirm('Are you sure you want to delete this status page? This action cannot be undone.')) {
      try {
        // TODO: Implement delete API call
        console.log('Deleting status page:', id)
        setStatusPages(prev => prev.filter(page => page.id !== id))
        setFilteredPages(prev => prev.filter(page => page.id !== id))
      } catch (error) {
        console.error('Error deleting status page:', error)
      }
    }
  }

  // Fetch status pages from API
  useEffect(() => {
    const fetchStatusPages = async () => {
      try {
        setLoading(true);
        const response = await getStatusPages();
        if (response.success && Array.isArray(response.data)) {
          // Ensure all required fields have proper default values
          const formattedData = response.data.map((page: StatusPageData) => ({
            ...page,
            services: page.services || [],
            branding: page.branding || {
              primaryColor: '#3b82f6',
              headerBg: '#ffffff',
              logo: ''
            },
            organization: page.organization || { id: '', name: 'Unknown' },
            createdBy: page.createdBy || { id: '', name: 'Unknown' },
            lastUpdated: page.lastUpdated || new Date().toISOString(),
            createdAt: page.createdAt || new Date().toISOString()
          }));
          
          setStatusPages(formattedData);
          setFilteredPages(formattedData);
        } else {
          setError('Failed to load status pages');
        }
      } catch (err) {
        console.error('Error fetching status pages:', err);
        setError('Failed to load status pages');
      } finally {
        setLoading(false);
      }
    };

    fetchStatusPages();
  }, []);

  // Filter status pages based on search and filters
  useEffect(() => {
    if (!statusPages.length) return;

    let result = [...statusPages];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (page) =>
          page.name.toLowerCase().includes(term) ||
          (page.description && page.description.toLowerCase().includes(term)) ||
          page.subdomain.toLowerCase().includes(term) ||
          (page.customDomain && page.customDomain.toLowerCase().includes(term))
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter((page) => page.status === statusFilter);
    }

    // Apply visibility filter
    if (visibilityFilter !== 'all') {
      result = result.filter((page) => page.visibility === visibilityFilter);
    }

    setFilteredPages(result);
  }, [statusPages, searchTerm, statusFilter, visibilityFilter]);

  // Helper function to get status badge
  const getStatusBadge = (status: string) => {
    const statusLower = status?.toLowerCase() || 'unknown';
    switch (statusLower) {
      case 'operational':
        return <Badge variant="success"><CheckCircle2 className="h-3 w-3 mr-1" /> Operational</Badge>;
      case 'degraded':
        return <Badge variant="warning"><AlertTriangle className="h-3 w-3 mr-1" /> Degraded</Badge>;
      case 'outage':
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" /> Outage</Badge>;
      default:
        return <Badge variant="outline"><Wifi className="h-3 w-3 mr-1" /> Unknown</Badge>;
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Helper function to get total services count
  const getTotalServices = (page: StatusPageData) => {
    return page.services?.reduce((total: number, group) => total + (group.services?.length || 0), 0) || 0;
  };

  // Get domain URL
  const getDomainUrl = (page: StatusPageData) => {
    if (page.customDomain) {
      return `https://${page.customDomain}`;
    }
    return `https://${page.subdomain}.status.yourdomain.com`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Status Pages</h1>
          <p className="text-muted-foreground">Manage your public status pages</p>
        </div>
        <Button onClick={() => router.push('/dashboard/status-pages/new')}>
          <Plus className="mr-2 h-4 w-4" /> New Status Page
        </Button>
      </div>

      <div className="grid gap-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search status pages..."
              className="pl-10 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex h-10 w-[180px] items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="all">All Statuses</option>
              <option value="operational">Operational</option>
              <option value="maintenance">Maintenance</option>
              <option value="down">Down</option>
            </select>
            <select
              value={visibilityFilter}
              onChange={(e) => setVisibilityFilter(e.target.value)}
              className="flex h-10 w-[150px] items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="all">All Visibilities</option>
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>
        </div>
      </div>

      {error ? (
        <div className="rounded-md bg-destructive/15 p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-destructive mt-0.5 mr-2" />
            <div>
              <h3 className="text-sm font-medium text-destructive">Error loading status pages</h3>
              <div className="mt-2 text-sm text-destructive">
                <p>{error}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </div>
          </div>
        </div>
      ) : loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
                <div className="flex justify-between">
                  <div className="h-4 bg-muted rounded w-1/4"></div>
                  <div className="h-4 bg-muted rounded w-1/4"></div>
                  <div className="h-4 bg-muted rounded w-1/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredPages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-lg">
          <Globe className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-1">No status pages found</h3>
          <p className="text-muted-foreground text-sm mb-4">
            {searchTerm || statusFilter !== 'all' || visibilityFilter !== 'all'
              ? 'Try adjusting your search or filter criteria'
              : 'Get started by creating a new status page'}
          </p>
          <Button onClick={() => router.push('/dashboard/status-pages/new')}>
            <Plus className="mr-2 h-4 w-4" /> New Status Page
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredPages.map((page) => (
            <Card key={page.id} className="h-full flex flex-col hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      {page.name}
                      {!page.isPublished && (
                        <Badge variant="outline" className="text-xs">Draft</Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="mt-1 line-clamp-2">
                      {page.description || 'No description provided'}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => navigator.clipboard.writeText(getDomainUrl(page))}>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Copy URL
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => window.open(getDomainUrl(page), '_blank')}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Page
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleEditStatusPage(page.id)}>
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground">Services</span>
                    <span className="font-medium flex items-center gap-1">
                      <Wifi className="h-4 w-4 text-muted-foreground" />
                      {getTotalServices(page)}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground">Uptime</span>
                    <span className="font-medium">{page.uptime.toFixed(2)}%</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground">Incidents</span>
                    <span className="font-medium">{page.incidents}</span>
                  </div>
                </div>
                
                <div className="mt-auto pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      {getStatusBadge(page.status)}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatDate(page.lastUpdated)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}