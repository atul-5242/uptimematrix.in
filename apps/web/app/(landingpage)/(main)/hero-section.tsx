"use client"

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Play, ArrowRight, CheckCircle, Shield, Zap, BarChart3, Globe, Clock, AlertTriangle, TrendingUp } from 'lucide-react'

export function HeroSection() {
  return (
    <section className="relative py-12 lg:py-16 bg-white dark:bg-slate-950 overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-indigo-50/30 dark:from-blue-950/20 dark:via-transparent dark:to-indigo-950/10"></div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative w-full">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            {/* Status Badge */}
            <div className="inline-flex items-center gap-2">
              <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 px-3 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-800/50">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">All Systems Operational</span>
              </div>
            </div>

            {/* Main Heading */}
            <div className="space-y-6">
              <h1 className="text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
                <span className="text-slate-900 dark:text-white">Monitor everything.</span>
                <br />
                <span className="text-slate-900 dark:text-white">Break </span>
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">nothing.</span>
                <br />
                <span className="text-slate-900 dark:text-white">Fix instantly.</span>
              </h1>
              
              <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-lg">
                Keep your services running 24/7 with real-time monitoring, instant alerts, and automated incident response. Catch issues before your users do.
              </p>
              
              {/* Key Features */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium">Monitor websites, APIs, servers, and databases in real-time</span>
                </div>
                <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium">Get instant alerts via email, SMS, Slack, and 20+ integrations</span>
                </div>
                <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium">Beautiful status pages and detailed analytics & reporting</span>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="h-11 px-6 text-base bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Start monitoring free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="h-11 px-6 text-base border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300"
              >
                <Play className="mr-2 h-4 w-4" />
                See how it works
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                <span>Free forever</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                <span>Open source</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                <span>Setup in 2 minutes</span>
              </div>
            </div>
          </div>

          {/* Right Content - Dashboard Preview */}
          <div className="relative">
            {/* Main Dashboard */}
            <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-0 shadow-2xl">
              <CardContent className="p-5">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Infrastructure Overview</h3>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">Real-time monitoring dashboard</p>
                  </div>
                  <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-2 rounded-lg">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">All Systems Operational</span>
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Uptime</span>
                    </div>
                    <div className="text-xl font-bold text-slate-900 dark:text-white">99.98%</div>
                    <div className="text-xs text-emerald-600 dark:text-emerald-400">+0.02% from last month</div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-indigo-500" />
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Response Time</span>
                    </div>
                    <div className="text-xl font-bold text-slate-900 dark:text-white">127ms</div>
                    <div className="text-xs text-emerald-600 dark:text-emerald-400">-23ms from last month</div>
                  </div>
                </div>

                {/* Service Status */}
                <div className="space-y-4">
                  <h4 className="text-base font-semibold text-slate-900 dark:text-white">Service Status</h4>
                  
                  <div className="space-y-2">
                    {[
                      { name: 'Web Application', status: 'operational', uptime: '100%' },
                      { name: 'API Gateway', status: 'operational', uptime: '99.9%' },
                      { name: 'Database Cluster', status: 'operational', uptime: '99.8%' },
                      { name: 'CDN Network', status: 'degraded', uptime: '98.5%' }
                    ].map((service, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-slate-50/50 dark:bg-slate-800/50 rounded-lg border border-slate-200/50 dark:border-slate-700/50">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            service.status === 'operational' 
                              ? 'bg-emerald-500' 
                              : 'bg-amber-500 animate-pulse'
                          }`}></div>
                          <span className="font-medium text-slate-900 dark:text-white">{service.name}</span>
                        </div>
                        <div className="text-right">
                          <div className={`text-sm font-semibold ${
                            service.status === 'operational'
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-amber-600 dark:text-amber-400'
                          }`}>
                            {service.uptime}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 capitalize">{service.status}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Floating Alert */}
            <Card className="absolute -top-4 -right-4 bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 shadow-lg max-w-[240px]">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-amber-100 dark:bg-amber-950/50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BarChart3 className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Performance Alert</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">CDN response time increased by 15%</p>
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">3 minutes ago</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Floating Success Metric */}
            <Card className="absolute -bottom-4 -left-4 bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 shadow-lg max-w-[220px]">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-950/50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Incident Resolved</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Database latency back to normal</p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2">Auto-resolved in 2m</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}