"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Monitor, 
  Bell, 
  BarChart3, 
  Shield, 
  Zap, 
  Globe, 
  Clock, 
  Users,
  ArrowRight,
  Activity,
  Server,
  Smartphone,
  Database
} from 'lucide-react'

const features = [
  {
    icon: Monitor,
    title: "Website & API Monitoring",
    description: "Monitor your websites, APIs, and services from 300+ locations worldwide with real-time alerts and detailed performance metrics.",
    badge: "Core",
    color: "blue"
  },
  {
    icon: Bell,
    title: "Smart Incident Management",
    description: "Automatically create incidents, assign to teams, and track resolution with intelligent escalation and notification routing.",
    badge: "Popular",
    color: "purple"
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description: "Get detailed insights into your system performance with custom dashboards, reports, and predictive analytics.",
    badge: "New",
    color: "green"
  },
  {
    icon: Shield,
    title: "Security Monitoring",
    description: "Monitor SSL certificates, domain expiry, security vulnerabilities, and compliance across your entire infrastructure.",
    badge: "Pro",
    color: "red"
  },
  {
    icon: Zap,
    title: "Status Pages",
    description: "Keep your customers informed with beautiful, customizable status pages that update automatically during incidents.",
    badge: "Core",
    color: "yellow"
  },
  {
    icon: Globe,
    title: "Global Monitoring Network",
    description: "Monitor from 300+ locations across 7 continents for accurate global performance data and regional insights.",
    badge: "Enterprise",
    color: "indigo"
  },
  {
    icon: Clock,
    title: "Response Time Tracking",
    description: "Track response times, uptime, and performance metrics with detailed historical data and trend analysis.",
    badge: "Core",
    color: "pink"
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Collaborate with your team using shared dashboards, comments, notification channels, and role-based access.",
    badge: "Popular",
    color: "teal"
  },
  {
    icon: Server,
    title: "Infrastructure Monitoring",
    description: "Monitor servers, containers, databases, and cloud services with comprehensive metrics and alerting.",
    badge: "Pro",
    color: "orange"
  },
  {
    icon: Smartphone,
    title: "Mobile App Monitoring",
    description: "Track mobile app performance, crashes, and user experience across iOS and Android platforms.",
    badge: "New",
    color: "cyan"
  },
  {
    icon: Database,
    title: "Database Performance",
    description: "Monitor database queries, connections, and performance with detailed insights and optimization recommendations.",
    badge: "Enterprise",
    color: "violet"
  },
  {
    icon: Activity,
    title: "Real-time Metrics",
    description: "Get real-time visibility into your system health with live metrics, alerts, and automated remediation.",
    badge: "Core",
    color: "emerald"
  }
]

const colorClasses = {
  blue: "from-blue-500 to-blue-600",
  purple: "from-purple-500 to-purple-600",
  green: "from-green-500 to-green-600",
  red: "from-red-500 to-red-600",
  yellow: "from-yellow-500 to-yellow-600",
  indigo: "from-indigo-500 to-indigo-600",
  pink: "from-pink-500 to-pink-600",
  teal: "from-teal-500 to-teal-600",
  orange: "from-orange-500 to-orange-600",
  cyan: "from-cyan-500 to-cyan-600",
  violet: "from-violet-500 to-violet-600",
  emerald: "from-emerald-500 to-emerald-600"
} as const

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">Features</Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Everything you need to monitor your infrastructure
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            From uptime monitoring to incident management, we've got all the tools you need to keep your services running smoothly and your customers happy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 shadow-md">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClasses[feature.color as keyof typeof colorClasses]} shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <Badge variant="outline" className="text-xs font-medium">
                      {feature.badge}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg leading-tight">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                    {feature.description}
                  </p>
                  <div className="flex items-center text-primary text-sm font-medium group-hover:text-primary/80 transition-colors cursor-pointer">
                    Learn more <ArrowRight className="ml-1 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Stats Section */}
        <div className="mt-20">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">99.99%</div>
              <div className="text-sm text-muted-foreground">Platform Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent mb-2">300+</div>
              <div className="text-sm text-muted-foreground">Global Locations</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">100M+</div>
              <div className="text-sm text-muted-foreground">Checks Per Month</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">5000+</div>
              <div className="text-sm text-muted-foreground">Happy Customers</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}