"use client"

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Play, ArrowRight, CheckCircle, AlertTriangle, TrendingUp, Activity } from 'lucide-react'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-blue-50/30 to-purple-50/30 dark:from-background dark:via-blue-950/10 dark:to-purple-950/10 pt-20 pb-16 lg:pt-28 lg:pb-24">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Content */}
          <div className="lg:col-span-6">
            <Badge variant="secondary" className="mb-4 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 border-blue-200 dark:border-blue-800">
              <Activity className="w-3 h-3 mr-1" />
              New: Advanced Incident Response 3.0
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl xl:text-6xl">
              Monitor everything.
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Break nothing.</span>
              <br />
              Fix instantly.
            </h1>
            <p className="mt-6 text-xl text-muted-foreground leading-relaxed">
              UptimeMatrix provides comprehensive monitoring for your entire infrastructure. Get instant alerts, detailed analytics, and automated incident response to keep your services running 24/7.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="text-lg px-8 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg">
                Start monitoring free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 border-2">
                <Play className="mr-2 h-5 w-5" />
                Watch 2-min demo
              </Button>
            </div>
            <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-6 text-sm text-muted-foreground">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                14-day free trial
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                No credit card required
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Setup in 2 minutes
              </div>
            </div>
          </div>

          {/* System Status Dashboard */}
          <div className="mt-12 lg:mt-0 lg:col-span-6">
            <div className="relative">
              {/* Main Dashboard Card */}
              <Card className="p-6 bg-card/80 backdrop-blur-sm border shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-lg">System Status Dashboard</h3>
                  <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                    All systems operational
                  </Badge>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="font-medium">Website</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-green-600 dark:text-green-400">99.9% uptime</div>
                      <div className="text-xs text-muted-foreground">Last 30 days</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="font-medium">API</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-green-600 dark:text-green-400">100% uptime</div>
                      <div className="text-xs text-muted-foreground">Last 30 days</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                      <span className="font-medium">Database</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Degraded performance</div>
                      <div className="text-xs text-muted-foreground">Response time: 450ms</div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Average response time</span>
                    <span className="font-medium">127ms</span>
                  </div>
                </div>
              </Card>

              {/* Floating Alert - Fixed positioning */}
              <Card className="absolute -top-2 -right-2 p-3 bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800 shadow-lg max-w-[200px]">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-red-700 dark:text-red-400 truncate">High Response Time</p>
                    <p className="text-xs text-red-600 dark:text-red-500">2 minutes ago</p>
                  </div>
                </div>
              </Card>

              {/* Floating Metric - Fixed positioning */}
              <Card className="absolute -bottom-2 -left-2 p-3 bg-green-50 dark:bg-green-950/50 border-green-200 dark:border-green-800 shadow-lg max-w-[180px]">
                <div className="flex items-start space-x-2">
                  <TrendingUp className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-green-700 dark:text-green-400 truncate">Performance +15%</p>
                    <p className="text-xs text-green-600 dark:text-green-500">vs last week</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}