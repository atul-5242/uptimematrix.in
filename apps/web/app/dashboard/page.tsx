"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { 
  Plus, 
  Globe, 
  Server, 
  Database, 
  Bell,
  BarChart3,
  Shield,
  Zap,
  Users,
  BookOpen,
  Github,
  ArrowRight
} from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Welcome to UptimeMatrix</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Start monitoring your infrastructure in minutes. Set up your first monitor and get instant alerts when things go wrong.
        </p>
      </div>

      {/* Getting Started Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-500" />
            Quick Start Guide
          </CardTitle>
          <CardDescription>Follow these simple steps to get your monitoring up and running</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            <div className="flex flex-col items-center text-center space-y-3 p-4 rounded-lg border-2 border-dashed border-muted-foreground/25">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                <span className="text-blue-600 dark:text-blue-400 font-bold">1</span>
              </div>
              <h3 className="font-semibold">Create Escalation Policy</h3>
              <p className="text-sm text-muted-foreground">Set up escalation rules for incident management</p>
              <Button className="mt-2" onClick={() => router.push('/dashboard/escalations-policies')}>
                <Shield className="mr-2 h-4 w-4" />
                Create Policy
              </Button>
            </div>

            <div className="flex flex-col items-center text-center space-y-3 p-4 rounded-lg border-2 border-dashed border-muted-foreground/25">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                <span className="text-purple-600 dark:text-purple-400 font-bold">2</span>
              </div>
              <h3 className="font-semibold">Set Who's On Call</h3>
              <p className="text-sm text-muted-foreground">Configure on-call schedules and team assignments</p>
              <Button variant="outline" className="mt-2" onClick={() => router.push('/dashboard/oncalls')}>
                <Users className="mr-2 h-4 w-4" />
                Setup Schedule
              </Button>
            </div>

            <div className="flex flex-col items-center text-center space-y-3 p-4 rounded-lg border-2 border-dashed border-muted-foreground/25">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">3</span>
              </div>
              <h3 className="font-semibold">Set Monitor to Check</h3>
              <p className="text-sm text-muted-foreground">Add monitors for websites, APIs, and services</p>
              <Button variant="outline" className="mt-2" onClick={() => router.push('/dashboard/monitoring')}>
                <Plus className="mr-2 h-4 w-4" />
                Add Monitor
              </Button>
            </div>

            <div className="flex flex-col items-center text-center space-y-3 p-4 rounded-lg border-2 border-dashed border-muted-foreground/25">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
                <span className="text-orange-600 dark:text-orange-400 font-bold">4</span>
              </div>
              <h3 className="font-semibold">Create Status Page</h3>
              <p className="text-sm text-muted-foreground">Build a public status page to keep users informed</p>
              <Button variant="outline" className="mt-2" onClick={() => router.push('/dashboard/status-pages')}>
                <Globe className="mr-2 h-4 w-4" />
                Build Page
              </Button>
            </div>

            <div className="flex flex-col items-center text-center space-y-3 p-4 rounded-lg border-2 border-dashed border-muted-foreground/25">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <span className="text-red-600 dark:text-red-400 font-bold">5</span>
              </div>
              <h3 className="font-semibold">Check Any Incident</h3>
              <p className="text-sm text-muted-foreground">Monitor and manage incidents if they occur</p>
              <Button variant="outline" className="mt-2" onClick={() => router.push('/dashboard/incidents')}>
                <Bell className="mr-2 h-4 w-4" />
                View Incidents
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monitor Types */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-green-500" />
              What You Can Monitor
            </CardTitle>
            <CardDescription>UptimeMatrix supports comprehensive monitoring for all your services</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Globe className="h-5 w-5 text-blue-500" />
              <div>
                <p className="font-medium">Websites & Web Apps</p>
                <p className="text-sm text-muted-foreground">HTTP/HTTPS monitoring with SSL checks</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Server className="h-5 w-5 text-purple-500" />
              <div>
                <p className="font-medium">API Endpoints</p>
                <p className="text-sm text-muted-foreground">REST API monitoring with response validation</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Database className="h-5 w-5 text-orange-500" />
              <div>
                <p className="font-medium">Database Servers</p>
                <p className="text-sm text-muted-foreground">MySQL, PostgreSQL, MongoDB health checks</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Shield className="h-5 w-5 text-red-500" />
              <div>
                <p className="font-medium">SSL Certificates</p>
                <p className="text-sm text-muted-foreground">Certificate expiry and security monitoring</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-indigo-500" />
              Key Features
            </CardTitle>
            <CardDescription>Everything you need for comprehensive monitoring</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Bell className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="font-medium">Instant Alerts</p>
                <p className="text-sm text-muted-foreground">Email notifications available now, SMS, Slack & more coming soon</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <BarChart3 className="h-5 w-5 text-blue-500" />
              <div>
                <p className="font-medium">Detailed Analytics</p>
                <p className="text-sm text-muted-foreground">Response times, uptime stats, and performance trends</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Globe className="h-5 w-5 text-green-500" />
              <div>
                <p className="font-medium">Status Pages</p>
                <p className="text-sm text-muted-foreground">Beautiful public status pages for your users</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Users className="h-5 w-5 text-purple-500" />
              <div>
                <p className="font-medium">Team Collaboration</p>
                <p className="text-sm text-muted-foreground">Invite team members and manage permissions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resources */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-emerald-500" />
            Resources & Support
          </CardTitle>
          <CardDescription>Get help and learn more about UptimeMatrix</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button variant="outline" className="h-16 flex-col gap-2" onClick={() => window.open('https://github.com/atul-5242/uptimematrix.in', '_blank')}>
              <Github className="h-5 w-5" />
              <span>View on GitHub</span>
            </Button>
            
            <Button variant="outline" className="h-16 flex-col gap-2" onClick={() => window.open('https://github.com/atul-5242/uptimematrix.in', '_blank')}>
              <BookOpen className="h-5 w-5" />
              <span>Documentation</span>
            </Button>
            
            <Button variant="outline" className="h-16 flex-col gap-2" onClick={() => window.open('https://github.com/atul-5242/uptimematrix.in', '_blank')}>
              <Users className="h-5 w-5" />
              <span>Community Support</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <div className="text-center space-y-4 py-8">
        <h2 className="text-2xl font-bold">Ready to start monitoring?</h2>
        <p className="text-muted-foreground">Create your first monitor and experience the power of UptimeMatrix</p>
        <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-5 w-5" />
          Create Your First Monitor
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}