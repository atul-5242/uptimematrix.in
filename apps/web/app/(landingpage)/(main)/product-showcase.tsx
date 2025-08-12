"use client"

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Play, ArrowRight } from 'lucide-react'

export function ProductShowcase() {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">Product Demo</Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            See BetterStack in action
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Watch how teams use BetterStack to monitor their infrastructure, manage incidents, and keep their services running smoothly.
          </p>
        </div>

        <Tabs defaultValue="monitoring" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-12">
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
            <TabsTrigger value="incidents">Incidents</TabsTrigger>
            <TabsTrigger value="status">Status Pages</TabsTrigger>
          </TabsList>

          <TabsContent value="monitoring" className="space-y-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-bold mb-4">Real-time monitoring dashboard</h3>
                <p className="text-muted-foreground mb-6">
                  Get a complete overview of your infrastructure health with our intuitive dashboard. Monitor websites, APIs, servers, and more from a single pane of glass.
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    Real-time status updates
                  </li>
                  <li className="flex items-center text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    Performance metrics and trends
                  </li>
                  <li className="flex items-center text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    Custom alerts and notifications
                  </li>
                </ul>
                <Button>
                  Try monitoring for free <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
              <Card className="relative overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative h-64 lg:h-80 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/50 dark:to-indigo-950/50 flex items-center justify-center">
                    <Button size="lg" className="z-10">
                      <Play className="mr-2 h-5 w-5" />
                      Watch Demo
                    </Button>
                    <div className="absolute inset-0 bg-black/20"></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="incidents" className="space-y-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-bold mb-4">Smart incident management</h3>
                <p className="text-muted-foreground mb-6">
                  Automatically detect issues, create incidents, and coordinate your team's response. Reduce MTTR and improve service reliability.
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center text-sm">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                    Automatic incident creation
                  </li>
                  <li className="flex items-center text-sm">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                    Team escalation policies
                  </li>
                  <li className="flex items-center text-sm">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                    Timeline and post-mortem tools
                  </li>
                </ul>
                <Button>
                  Explore incident management <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
              <Card className="relative overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative h-64 lg:h-80 bg-gradient-to-br from-orange-50 to-red-100 dark:from-orange-950/50 dark:to-red-950/50 flex items-center justify-center">
                    <Button size="lg" className="z-10">
                      <Play className="mr-2 h-5 w-5" />
                      Watch Demo
                    </Button>
                    <div className="absolute inset-0 bg-black/20"></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="status" className="space-y-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-bold mb-4">Beautiful status pages</h3>
                <p className="text-muted-foreground mb-6">
                  Keep your customers informed with professional status pages that automatically update when incidents occur. Build trust through transparency.
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center text-sm">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                    Automatic updates from monitoring
                  </li>
                  <li className="flex items-center text-sm">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                    Custom branding and domains
                  </li>
                  <li className="flex items-center text-sm">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                    Email and SMS notifications
                  </li>
                </ul>
                <Button>
                  Create status page <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
              <Card className="relative overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative h-64 lg:h-80 bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-950/50 dark:to-pink-950/50 flex items-center justify-center">
                    <Button size="lg" className="z-10">
                      <Play className="mr-2 h-5 w-5" />
                      Watch Demo
                    </Button>
                    <div className="absolute inset-0 bg-black/20"></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  )
}