"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowRight, ExternalLink } from 'lucide-react'

const integrations = [
  {
    name: "Slack",
    description: "Get instant notifications and manage incidents directly from your Slack channels.",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/slack/slack-original.svg",
    category: "Communication",
    popular: true
  },
  {
    name: "Discord",
    description: "Receive alerts and status updates in your Discord servers with custom webhooks.",
    logo: "https://assets-global.website-files.com/6257adef93867e50d84d30e2/636e0a6a49cf127bf92de1e2_icon_clyde_blurple_RGB.png",
    category: "Communication",
    popular: true
  },
  {
    name: "GitHub",
    description: "Automatically create issues and track incidents alongside your development workflow.",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg",
    category: "Development",
    popular: true
  },
  {
    name: "Microsoft Teams",
    description: "Collaborate on incidents and receive notifications in your Teams channels.",
    logo: "https://upload.wikimedia.org/wikipedia/commons/c/c9/Microsoft_Office_Teams_%282018%E2%80%93present%29.svg",
    category: "Communication",
    popular: false
  },
  {
    name: "PagerDuty",
    description: "Integrate with PagerDuty for advanced incident escalation and on-call management.",
    logo: "https://www.vectorlogo.zone/logos/pagerduty/pagerduty-icon.svg",
    category: "Incident Management",
    popular: true
  },
  {
    name: "Jira",
    description: "Create and track tickets automatically when incidents occur in your systems.",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/jira/jira-original.svg",
    category: "Project Management",
    popular: false
  },
  {
    name: "Webhook",
    description: "Send custom HTTP requests to any endpoint with detailed incident information.",
    logo: "https://www.svgrepo.com/show/354553/webhooks.svg",
    category: "Custom",
    popular: true
  },
  {
    name: "Email",
    description: "Traditional email notifications with customizable templates and recipient lists.",
    logo: "https://www.svgrepo.com/show/349378/mail.svg",
    category: "Communication",
    popular: true
  },
  {
    name: "SMS",
    description: "Critical alerts via SMS to ensure your team never misses important incidents.",
    logo: "https://www.svgrepo.com/show/349464/sms.svg",
    category: "Communication",
    popular: false
  },
  {
    name: "Datadog",
    description: "Correlate monitoring data with your existing Datadog metrics and dashboards.",
    logo: "https://www.vectorlogo.zone/logos/datadoghq/datadoghq-icon.svg",
    category: "Monitoring",
    popular: false
  },
  {
    name: "Grafana",
    description: "Visualize UptimeMatrix data alongside your existing Grafana dashboards.",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/grafana/grafana-original.svg",
    category: "Monitoring",
    popular: false
  },
  {
    name: "Zapier",
    description: "Connect UptimeMatrix to 5000+ apps with automated workflows and triggers.",
    logo: "https://www.vectorlogo.zone/logos/zapier/zapier-icon.svg",
    category: "Automation",
    popular: true
  }
]

const categories = ["All", "Communication", "Development", "Incident Management", "Monitoring", "Automation"]

export function IntegrationsSection() {
  return (
    <section id="integrations" className="py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">Integrations</Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Connect with your favorite tools
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            UptimeMatrix integrates seamlessly with the tools you already use. Get notifications where you work and automate your incident response workflow.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((category) => (
            <Button
              key={category}
              variant={category === "All" ? "default" : "outline"}
              size="sm"
              className="rounded-full"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Integrations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
          {integrations.map((integration, index) => (
            <Card key={index} className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1 relative">
              {integration.popular && (
                <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                  Popular
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
                      e.currentTarget.nextElementSibling.style.display = 'flex'
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
                <Button variant="outline" size="sm" className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  Connect <ExternalLink className="ml-2 h-3 w-3" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-2xl p-8">
          <h3 className="text-2xl font-bold mb-4">
            Don't see your tool?
          </h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            We're constantly adding new integrations. Use our flexible webhook system to connect with any service, or let us know what integration you'd like to see next.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
              Request Integration <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline">
              View Webhook Docs
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}