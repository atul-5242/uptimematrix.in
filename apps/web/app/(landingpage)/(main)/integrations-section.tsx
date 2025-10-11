"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowRight, ExternalLink } from 'lucide-react'

const integrations = [
  {
    name: "Email",
    description: "Get instant email notifications when your services go down or come back online.",
    logo: "https://www.svgrepo.com/show/349378/mail.svg",
    category: "Communication",
    available: true,
    popular: true
  },
  {
    name: "Slack",
    description: "Get instant notifications and manage incidents directly from your Slack channels.",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/slack/slack-original.svg",
    category: "Communication",
    available: false,
    popular: true
  },
  {
    name: "Discord",
    description: "Receive alerts and status updates in your Discord servers with custom webhooks.",
    logo: "https://assets-global.website-files.com/6257adef93867e50d84d30e2/636e0a6a49cf127bf92de1e2_icon_clyde_blurple_RGB.png",
    category: "Communication",
    available: false,
    popular: true
  },
  {
    name: "Webhook",
    description: "Send custom HTTP requests to any endpoint with detailed incident information.",
    logo: "https://www.svgrepo.com/show/354553/webhooks.svg",
    category: "Custom",
    available: false,
    popular: true
  },
  {
    name: "Microsoft Teams",
    description: "Collaborate on incidents and receive notifications in your Teams channels.",
    logo: "https://upload.wikimedia.org/wikipedia/commons/c/c9/Microsoft_Office_Teams_%282018%E2%80%93present%29.svg",
    category: "Communication",
    available: false,
    popular: false
  },
  {
    name: "SMS",
    description: "Critical alerts via SMS to ensure your team never misses important incidents.",
    logo: "https://www.svgrepo.com/show/349464/sms.svg",
    category: "Communication",
    available: false,
    popular: false
  }
]

const categories = ["All", "Communication", "Custom"]

export function IntegrationsSection() {
  const [selectedCategory, setSelectedCategory] = useState("All")
  
  const filteredIntegrations = selectedCategory === "All" 
    ? integrations 
    : integrations.filter(integration => integration.category === selectedCategory)

  return (
    <section id="integrations" className="py-24">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">Integrations</Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Connect with your favorite tools
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Currently supporting email notifications with more integrations coming soon. Help us prioritize by starring our GitHub repo!
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((category) => (
            <Button
              key={category}
              variant={category === selectedCategory ? "default" : "outline"}
              size="sm"
              className="rounded-full"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Integrations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
          {filteredIntegrations.map((integration, index) => (
            <Card key={index} className={`group hover:shadow-lg transition-all duration-200 hover:-translate-y-1 relative ${!integration.available ? 'opacity-75' : ''}`}>
              {integration.available ? (
                <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-green-500 to-green-600 text-white">
                  Available
                </Badge>
              ) : (
                <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                  Coming Soon
                </Badge>
              )}
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 mx-auto mb-4 p-3 rounded-xl bg-muted/50 group-hover:bg-muted transition-colors">
                  <img 
                    src={integration.logo} 
                    alt={`${integration.name} logo`}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                      const nextSibling = e.currentTarget.nextElementSibling as HTMLElement
                      if (nextSibling) {
                        nextSibling.style.display = 'flex'
                      }
                    }}
                  />
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg items-center justify-center text-white font-bold text-lg hidden">
                    {integration.name.charAt(0)}
                  </div>
                </div>
                <CardTitle className="text-lg">{integration.name}</CardTitle>
                <Badge variant="outline" className="text-xs">
                  {integration.category}
                </Badge>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground text-sm mb-4">
                  {integration.description}
                </p>
                <Button 
                  variant={integration.available ? "default" : "outline"} 
                  size="sm" 
                  disabled={!integration.available}
                  className={integration.available ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700" : ""}
                >
                  {integration.available ? 'Configure' : 'Coming Soon'} 
                  {integration.available && <ExternalLink className="ml-2 h-3 w-3" />}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-2xl p-8">
          <h3 className="text-2xl font-bold mb-4">
            Help us prioritize integrations!
          </h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            UptimeMatrix is an open-source project. Star us on GitHub and let us know which integrations you'd like to see first. Your feedback drives our development roadmap!
          </p>
          <div className="flex justify-center">
            <Button 
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              onClick={() => window.open('https://github.com/atul-5242/uptimematrix.in', '_blank')}
            >
              ⭐ Star on GitHub <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}