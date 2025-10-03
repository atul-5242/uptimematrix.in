"use client"
import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
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
  HelpCircle,
  Delete
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
      console.log(`Toggling publish for status page ${id} to ${!isPublished}`)
    } catch (error) {
      console.error('Error toggling publish status:', error)
    }
  }

  const handleDeleteStatusPage = async (id: string) => {
    if (confirm('Are you sure you want to delete this status page? This action cannot be undone.')) {
      try {
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

    if (statusFilter !== 'all') {
      result = result.filter((page) => page.status === statusFilter);
    }

    if (visibilityFilter !== 'all') {
      result = result.filter((page) => page.visibility === visibilityFilter);
    }

    setFilteredPages(result);
  }, [statusPages, searchTerm, statusFilter, visibilityFilter]);

  // Helper function to get status badge
  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: string; icon: any; label: string }> = {
      operational: { variant: "success", icon: CheckCircle2, label: "Operational" },
      degraded: { variant: "warning", icon: AlertTriangle, label: "Degraded" },
      outage: { variant: "destructive", icon: AlertCircle, label: "Outage" },
      maintenance: { variant: "secondary", icon: Clock, label: "Maintenance" },
      down: { variant: "destructive", icon: WifiOff, label: "Down" }
    };
    
    const statusLower = status?.toLowerCase() || 'unknown';
    const config = statusConfig[statusLower] || { variant: "outline", icon: Wifi, label: "Unknown" };
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant as any} className="flex items-center gap-1 text-xs whitespace-nowrap">
        <Icon className="h-3 w-3 flex-shrink-0" />
        <span>{config.label}</span>
      </Badge>
    );
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
    return `https://${page.subdomain}.status.uptimematrix.atulmaurya.in`;
  };

  return (
    <div className="w-full min-h-screen">
      <div className="container mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 max-w-7xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-3 sm:gap-4">
          <div className="w-full sm:w-auto">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Status Pages</h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">Manage your public status pages</p>
          </div>
          <Button 
            onClick={() => router.push('/dashboard/status-pages/new')}
            className="w-full sm:w-auto whitespace-nowrap"
            size="default"
          >
            <Plus className="mr-2 h-4 w-4" /> New Status Page
          </Button>
        </div>

        <div className="grid gap-3 sm:gap-4 mb-4 sm:mb-6">
  <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
    <div className="w-full lg:flex-1 relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search status pages..."
                className="pl-10 w-full h-10 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-col xs:flex-row lg:flex-row gap-2 sm:gap-3 lg:flex-shrink-0">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex h-10 w-full xs:w-[180px] items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="all">All Statuses</option>
                <option value="operational">Operational</option>
                <option value="maintenance">Maintenance</option>
                <option value="down">Down</option>
              </select>
              <select
                value={visibilityFilter}
                onChange={(e) => setVisibilityFilter(e.target.value)}
                className="flex h-10 w-full xs:w-[150px] items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="all">All Visibilities</option>
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div>
          </div>
        </div>

        {error ? (
          <div className="rounded-md bg-destructive/15 p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5 mb-2 sm:mb-0 sm:mr-2 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-destructive">Error loading status pages</h3>
                <div className="mt-2 text-sm text-destructive">
                  <p>{error}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 w-full sm:w-auto"
                  onClick={() => window.location.reload()}
                >
                  Retry
                </Button>
              </div>
            </div>
          </div>
        ) : loading ? (
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-3">
                  <div className="h-5 sm:h-6 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 sm:h-4 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-3 sm:h-4 bg-muted rounded w-3/4 mb-4"></div>
                  <div className="flex justify-between gap-2">
                    <div className="h-3 sm:h-4 bg-muted rounded w-1/4"></div>
                    <div className="h-3 sm:h-4 bg-muted rounded w-1/4"></div>
                    <div className="h-3 sm:h-4 bg-muted rounded w-1/4"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredPages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 sm:py-12 border-2 border-dashed rounded-lg px-4">
            <Globe className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-medium mb-1 text-center">No status pages found</h3>
            <p className="text-muted-foreground text-xs sm:text-sm mb-3 sm:mb-4 text-center max-w-md">
              {searchTerm || statusFilter !== 'all' || visibilityFilter !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'Get started by creating a new status page'}
            </p>
            <Button 
              onClick={() => router.push('/dashboard/status-pages/new')}
              className="w-full sm:w-auto"
            >
              <Plus className="mr-2 h-4 w-4" /> New Status Page
            </Button>
          </div>
        ) : (
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPages.map((page) => (
              <Card key={page.id} className="h-full flex flex-col hover:shadow-md transition-shadow">
                <CardHeader className="pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2 flex-wrap">
                        <span className="truncate">{page.name}</span>
                        {!page.isPublished && (
                          <Badge variant="outline" className="text-xs flex-shrink-0">Draft</Badge>
                        )}
                      </CardTitle>
                      <CardDescription 
                        className="mt-1 line-clamp-2 text-xs sm:text-sm"
                        title={page.description || ''}
                      >
                        {page.description || 'No description provided'}
                      </CardDescription>
                    </div>
                    <div className="flex-shrink-0">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent 
                          align="end" 
                          className="w-48 z-[100]"
                          sideOffset={4}
                          collisionPadding={16}
                        >
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.preventDefault();
                              navigator.clipboard.writeText(getDomainUrl(page));
                            }}
                            className="cursor-pointer"
                          >
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Copy URL
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.preventDefault();
                              window.open(getDomainUrl(page), '_blank');
                            }}
                            className="cursor-pointer"
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Page
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.preventDefault();
                              handleEditStatusPage(page.id);
                            }}
                            className="cursor-pointer"
                          >
                            <Delete className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col px-4 sm:px-6 pb-4 sm:pb-6">
                  <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4">
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs text-muted-foreground mb-1">Services</span>
                      <span className="font-medium text-sm sm:text-base flex items-center gap-1">
                        <Wifi className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                        <span className="truncate">{getTotalServices(page)}</span>
                      </span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs text-muted-foreground mb-1">Uptime</span>
                      <span className="font-medium text-sm sm:text-base truncate">{page.uptime.toFixed(2)}%</span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs text-muted-foreground mb-1">Incidents</span>
                      <span className="font-medium text-sm sm:text-base truncate">{page.incidents}</span>
                    </div>
                  </div>
                  
                  <div className="mt-auto pt-3 sm:pt-4 border-t">
                    <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-2">
                      <div className="flex items-center">
                        {getStatusBadge(page.status)}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center whitespace-nowrap">
                        <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
                        <span className="truncate">{formatDate(page.lastUpdated)}</span>
                      </div>
                    </div>
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