"use client"

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, Star, Github, Heart, Code, Users, Cloud, Zap } from 'lucide-react'

const plans = [
  {
    name: "Use Our Service",
    price: "Free",
    period: "forever",
    description: "Use our hosted service - no setup required, just start monitoring",
    features: [
      "Unlimited monitors",
      "All monitoring features",
      "Email notifications",
      "Status pages",
      "No server setup needed",
      "Automatic updates",
      "24/7 uptime guarantee",
      "Professional support",
      "Instant deployment",
      "Managed infrastructure"
    ],
    cta: "Start Monitoring Now",
    popular: true,
    icon: Cloud,
    blueShade: "sky"
  },
  {
    name: "Self-Hosted",
    price: "Free",
    period: "forever",
    description: "Perfect for developers and teams who want full control",
    features: [
      "Unlimited monitors",
      "All monitoring features",
      "Email notifications",
      "Status pages",
      "Full source code access",
      "Self-hosted deployment",
      "Community support",
      "No usage limits",
      "Complete data ownership",
      "Customize as needed"
    ],
    cta: "Get Started Free",
    popular: false,
    icon: Code,
    blueShade: "blue"
  },
  {
    name: "Contribute",
    price: "Free",
    period: "open source",
    description: "Help make UptimeMatrix better for everyone",
    features: [
      "All self-hosted features",
      "Contribute to development",
      "Help with documentation",
      "Report bugs and issues",
      "Request new features",
      "Share your improvements",
      "Join our community",
      "Learn and grow",
      "Make an impact",
      "Build your portfolio"
    ],
    cta: "Star on GitHub",
    popular: false,
    icon: Github,
    blueShade: "indigo"
  },
  {
    name: "Support Us",
    price: "Free",
    period: "but appreciated",
    description: "Show your support for the project's development",
    features: [
      "All features included",
      "Help fund development",
      "Support new features",
      "Enable faster updates",
      "Sponsor documentation",
      "Fund infrastructure",
      "Priority issue responses",
      "Community recognition",
      "Early access to updates",
      "Direct developer contact"
    ],
    cta: "Sponsor Project",
    popular: false,
    icon: Heart,
    blueShade: "violet"
  }
]

const getBlueShadeClasses = (shade: string, popular: boolean) => {
  const shades = {
    sky: {
      bg: popular ? 'from-sky-100 via-sky-50 to-cyan-50 dark:from-sky-900/50 dark:via-sky-950/50 dark:to-cyan-950/30' : 'from-sky-50/50 to-sky-100/30 dark:from-sky-950/30 dark:to-sky-900/20',
      border: popular ? 'border-sky-300 dark:border-sky-600' : 'border-sky-200 dark:border-sky-800',
      badge: 'from-sky-500 to-cyan-500',
      button: popular ? 'from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600' : 'from-sky-600 to-sky-700 hover:from-sky-700 hover:to-sky-800',
      icon: 'from-sky-100 to-cyan-100 dark:from-sky-900/50 dark:to-cyan-900/50',
      iconColor: 'text-sky-600 dark:text-sky-400',
      check: 'text-sky-600 dark:text-sky-400',
      price: 'from-sky-600 to-cyan-600'
    },
    blue: {
      bg: popular ? 'from-blue-100 via-blue-50 to-blue-50 dark:from-blue-900/50 dark:via-blue-950/50 dark:to-blue-950/30' : 'from-blue-50/50 to-blue-100/30 dark:from-blue-950/30 dark:to-blue-900/20',
      border: popular ? 'border-blue-300 dark:border-blue-600' : 'border-blue-200 dark:border-blue-800',
      badge: 'from-blue-500 to-blue-600',
      button: popular ? 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700' : 'from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800',
      icon: 'from-blue-100 to-blue-100 dark:from-blue-900/50 dark:to-blue-900/50',
      iconColor: 'text-blue-600 dark:text-blue-400',
      check: 'text-blue-600 dark:text-blue-400',
      price: 'from-blue-600 to-blue-600'
    },
    indigo: {
      bg: popular ? 'from-indigo-100 via-indigo-50 to-indigo-50 dark:from-indigo-900/50 dark:via-indigo-950/50 dark:to-indigo-950/30' : 'from-indigo-50/50 to-indigo-100/30 dark:from-indigo-950/30 dark:to-indigo-900/20',
      border: popular ? 'border-indigo-300 dark:border-indigo-600' : 'border-indigo-200 dark:border-indigo-800',
      badge: 'from-indigo-500 to-indigo-600',
      button: popular ? 'from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700' : 'from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800',
      icon: 'from-indigo-100 to-indigo-100 dark:from-indigo-900/50 dark:to-indigo-900/50',
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      check: 'text-indigo-600 dark:text-indigo-400',
      price: 'from-indigo-600 to-indigo-600'
    },
    violet: {
      bg: popular ? 'from-violet-100 via-violet-50 to-violet-50 dark:from-violet-900/50 dark:via-violet-950/50 dark:to-violet-950/30' : 'from-violet-50/50 to-violet-100/30 dark:from-violet-950/30 dark:to-violet-900/20',
      border: popular ? 'border-violet-300 dark:border-violet-600' : 'border-violet-200 dark:border-violet-800',
      badge: 'from-violet-500 to-violet-600',
      button: popular ? 'from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700' : 'from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800',
      icon: 'from-violet-100 to-violet-100 dark:from-violet-900/50 dark:to-violet-900/50',
      iconColor: 'text-violet-600 dark:text-violet-400',
      check: 'text-violet-600 dark:text-violet-400',
      price: 'from-violet-600 to-violet-600'
    }
  }
  return shades[shade as keyof typeof shades]
}

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:from-slate-900 dark:via-blue-950/30 dark:to-indigo-950/40">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 border-0">
            Pricing
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4 bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 dark:from-slate-100 dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent">
            100% Free & Open Source
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            UptimeMatrix is completely free to use, modify, and distribute. No hidden costs, no usage limits, no vendor lock-in. 
            Just download, deploy, and start monitoring!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6 mb-16">
          {plans.map((plan, index) => {
            const IconComponent = plan.icon
            const colors = getBlueShadeClasses(plan.blueShade, plan.popular)
            
            return (
              <Card key={index} className={`relative ${plan.popular ? 'overflow-visible' : 'overflow-hidden'} ${plan.popular ? `border-2 ${colors.border} shadow-2xl scale-105 bg-gradient-to-br ${colors.bg}` : `hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border ${colors.border} bg-gradient-to-br ${colors.bg}`}`}>
                {plan.popular && (
                  <>
                    <div className={`absolute inset-0 bg-gradient-to-r ${colors.badge}/5 animate-pulse`}></div>
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-20">
                      <Badge className={`bg-gradient-to-r ${colors.badge} text-white px-4 py-1.5 shadow-lg font-semibold`}>
                        <Star className="w-3 h-3 mr-1" />
                        Recommended
                      </Badge>
                    </div>
                  </>
                )}
                <CardHeader className="text-center relative pt-8">
                  <div className={`mx-auto mb-4 p-3 rounded-full bg-gradient-to-br ${colors.icon} shadow-md`}>
                    <IconComponent className={`h-6 w-6 ${colors.iconColor}`} />
                  </div>
                  <CardTitle className="text-xl mb-2 text-slate-900 dark:text-slate-100">{plan.name}</CardTitle>
                  <div className="mb-4">
                    <span className={`text-4xl font-bold ${plan.popular ? `bg-gradient-to-r ${colors.price} bg-clip-text text-transparent` : 'text-slate-900 dark:text-slate-100'}`}>
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className="text-muted-foreground ml-2">/{plan.period}</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {plan.description}
                  </p>
                </CardHeader>
                <CardContent className="relative">
                  <Button 
                    className={`w-full mb-6 transition-all duration-300 hover:scale-105 hover:shadow-lg bg-gradient-to-r ${colors.button} text-white shadow-md`}
                    onClick={() => {
                      if (plan.name === 'Use Our Service') {
                        // TODO: Link to signup/service page
                        window.open('/signup', '_self')
                      } else if (plan.name === 'Contribute' || plan.cta === 'Star on GitHub') {
                        window.open('https://github.com/atul-5242/uptimematrix.in', '_blank')
                      } else if (plan.name === 'Support Us') {
                        window.open('https://github.com/sponsors/atul-5242', '_blank')
                      } else {
                        window.open('https://github.com/atul-5242/uptimematrix.in#installation', '_blank')
                      }
                    }}
                  >
                    <IconComponent className="w-4 h-4 mr-2" />
                    {plan.cta}
                  </Button>
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start text-sm">
                        <Check className={`h-4 w-4 mr-3 flex-shrink-0 mt-0.5 ${colors.check}`} />
                        <span className="text-slate-700 dark:text-slate-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Open Source Benefits */}
        <div className="text-center">
          <div className="bg-gradient-to-br from-white via-slate-50/80 to-blue-50/60 dark:from-slate-900 dark:via-slate-800/80 dark:to-blue-950/60 rounded-2xl p-8 shadow-xl border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm">
            <h3 className="text-xl font-bold mb-4 flex items-center justify-center bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 dark:from-slate-200 dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent">
              <Github className="h-5 w-5 mr-2 text-slate-700 dark:text-slate-300" />
              Why Open Source?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
              <div className="flex flex-col items-center text-center group">
                <div className="p-3 rounded-full bg-gradient-to-br from-sky-100 to-cyan-100 dark:from-sky-900/50 dark:to-cyan-900/50 mb-3 shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-110">
                  <Check className="h-5 w-5 text-sky-600 dark:text-sky-400" />
                </div>
                <div className="font-semibold text-slate-900 dark:text-slate-100 mb-1">No Vendor Lock-in</div>
                <div className="text-muted-foreground">Own your data and infrastructure</div>
              </div>
              <div className="flex flex-col items-center text-center group">
                <div className="p-3 rounded-full bg-gradient-to-br from-blue-100 to-blue-100 dark:from-blue-900/50 dark:to-blue-900/50 mb-3 shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-110">
                  <Code className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="font-semibold text-slate-900 dark:text-slate-100 mb-1">Full Transparency</div>
                <div className="text-muted-foreground">Inspect and modify all code</div>
              </div>
              <div className="flex flex-col items-center text-center group">
                <div className="p-3 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-100 dark:from-indigo-900/50 dark:to-indigo-900/50 mb-3 shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-110">
                  <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="font-semibold text-slate-900 dark:text-slate-100 mb-1">Community Driven</div>
                <div className="text-muted-foreground">Built by developers, for developers</div>
              </div>
              <div className="flex flex-col items-center text-center group">
                <div className="p-3 rounded-full bg-gradient-to-br from-violet-100 to-violet-100 dark:from-violet-900/50 dark:to-violet-900/50 mb-3 shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-110">
                  <Heart className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                </div>
                <div className="font-semibold text-slate-900 dark:text-slate-100 mb-1">Always Free</div>
                <div className="text-muted-foreground">No hidden costs or limits</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}