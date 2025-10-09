"use client"

import { AppSidebar } from "@/components/sidebar_assets/app-sidebar"
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"

// Helper function to generate breadcrumb from pathname
const generateBreadcrumbs = (pathname: string) => {
  const segments = pathname.split('/').filter(Boolean)
  
  // Remove 'dashboard' from segments since it's always the first level
  const pathSegments = segments.slice(1)
  
  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard', isLast: pathSegments.length === 0 }
  ]
  
  // Map path segments to readable names
  const pathNameMap: { [key: string]: string } = {
    'incidents': 'Incidents',
    'oncalls': "Who's on Call",
    'escalations-policies': 'Escalation Policies',
    'monitoring': 'Monitors',
    'status-pages': 'Status Pages',
    'integrations': 'Integrations',
    'reporting': 'Reporting',
    'settings': 'Settings',
    'organizations': 'Organizations',
    'account_settings': 'Account Settings',
    'teams': 'Teams',
    'billings': 'Billing',
    'invites': 'Invites',
    'new': 'New',
    'analytics': 'Analytics'
  }
  
  let currentPath = '/dashboard'
  
  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`
    const isLast = index === pathSegments.length - 1
    
    // Handle dynamic segments (like organization IDs)
    if (segment.length > 20 && segment.includes('c')) {
      // This looks like an ID, use the previous segment's context
      const prevSegment = pathSegments[index - 1]
      if (prevSegment === 'organizations') {
        breadcrumbs.push({
          label: 'Organization Details',
          href: currentPath,
          isLast
        })
      } else {
        breadcrumbs.push({
          label: 'Details',
          href: currentPath,
          isLast
        })
      }
    } else {
      const label = pathNameMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)
      breadcrumbs.push({
        label,
        href: currentPath,
        isLast
      })
    }
  })
  
  return breadcrumbs
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [breadcrumbs, setBreadcrumbs] = useState([
    { label: 'Dashboard', href: '/dashboard', isLast: true }
  ])
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    setBreadcrumbs(generateBreadcrumbs(pathname))
  }, [pathname])
  
  return (
    <html lang="en">
      <body>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            {/* Header stays fixed */}
            <header className="flex h-16 shrink-0 items-center gap-2">
              <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator
                  orientation="vertical"
                  className="mr-2 data-[orientation=vertical]:h-4"
                />
                <Breadcrumb>
                  <BreadcrumbList>
                    {isClient ? (
                      breadcrumbs.map((breadcrumb, index) => (
                        <div key={breadcrumb.href} className="flex items-center">
                          {index > 0 && <BreadcrumbSeparator className="mx-2" />}
                          <BreadcrumbItem>
                            {breadcrumb.isLast && breadcrumb.label !== 'Dashboard' ? (
                              <BreadcrumbPage className="font-medium">
                                {breadcrumb.label}
                              </BreadcrumbPage>
                            ) : (
                              <BreadcrumbLink 
                                asChild
                                className={breadcrumb.isLast && breadcrumb.label === 'Dashboard' ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground transition-colors"}
                              >
                                <Link href={breadcrumb.href}>
                                  {breadcrumb.label}
                                </Link>
                              </BreadcrumbLink>
                            )}
                          </BreadcrumbItem>
                        </div>
                      ))
                    ) : (
                      // Fallback for server-side rendering
                      <BreadcrumbItem>
                        <BreadcrumbPage className="font-medium">Dashboard</BreadcrumbPage>
                      </BreadcrumbItem>
                    )}
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
            </header>

            {/* 👇 This is where each page's content will be injected */}
            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
              {children}
            </div>
          </SidebarInset>
        </SidebarProvider>
      </body>
    </html>
  )
}