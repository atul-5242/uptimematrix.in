"use client"

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, Star, Zap } from 'lucide-react'

const plans = [
  {
    name: "Starter",
    price: "$0",
    period: "forever",
    description: "Perfect for side projects and small websites",
    features: [
      "10 monitors",
      "1-minute check frequency",
      "30-day data retention",
      "Email notifications",
      "Basic status page",
      "Community support",
      "5 team members"
    ],
    cta: "Start for free",
    popular: false,
    color: "gray"
  },
  {
    name: "Professional",
    price: "$29",
    period: "per month",
    description: "Great for growing teams and businesses",
    features: [
      "100 monitors",
      "30-second check frequency",
      "1-year data retention",
      "SMS & email notifications",
      "Custom status pages",
      "Incident management",
      "API access",
      "Priority support",
      "20 team members",
      "Advanced analytics"
    ],
    cta: "Start free trial",
    popular: true,
    color: "blue"
  },
  {
    name: "Business",
    price: "$99",
    period: "per month",
    description: "For teams that need advanced features",
    features: [
      "500 monitors",
      "10-second check frequency",
      "3-year data retention",
      "All notification channels",
      "Advanced status pages",
      "Full incident management",
      "Team collaboration",
      "Custom integrations",
      "White-label options",
      "24/7 phone support",
      "Unlimited team members",
      "SLA monitoring"
    ],
    cta: "Start free trial",
    popular: false,
    color: "purple"
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "contact us",
    description: "For large organizations with complex needs",
    features: [
      "Unlimited monitors",
      "1-second check frequency",
      "Unlimited data retention",
      "All features included",
      "Custom integrations",
      "Dedicated account manager",
      "99.9% SLA guarantee",
      "On-premises deployment",
      "Advanced security features",
      "Custom training",
      "Priority feature requests",
      "Multi-region monitoring"
    ],
    cta: "Contact sales",
    popular: false,
    color: "gradient"
  }
]

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">Pricing</Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Start monitoring for free. Upgrade as you grow. No hidden fees, no surprises. All plans include a 14-day free trial.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-16">
          {plans.map((plan, index) => (
            <Card key={index} className={`relative ${plan.popular ? 'border-blue-500 shadow-xl scale-105 bg-gradient-to-b from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20' : 'hover:shadow-lg transition-shadow'}`}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-1">
                    <Star className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              <CardHeader className="text-center">
                <CardTitle className="text-xl mb-2">{plan.name}</CardTitle>
                <div className="mb-4">
                  <span className={`text-4xl font-bold ${plan.color === 'gradient' ? 'bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent' : ''}`}>
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-muted-foreground ml-2">/{plan.period}</span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {plan.description}
                </p>
              </CardHeader>
              <CardContent>
                <Button 
                  className={`w-full mb-6 ${
                    plan.popular 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700' 
                      : plan.color === 'gradient'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700'
                      : ''
                  }`}
                  variant={plan.popular || plan.color === 'gradient' ? 'default' : 'outline'}
                >
                  {plan.name === 'Enterprise' && <Zap className="w-4 h-4 mr-2" />}
                  {plan.cta}
                </Button>
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start text-sm">
                      <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Info */}
        <div className="text-center">
          <div className="bg-card rounded-2xl p-8 shadow-sm border">
            <h3 className="text-xl font-bold mb-4">All plans include:</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div className="flex items-center justify-center">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                99.9% SLA guarantee
              </div>
              <div className="flex items-center justify-center">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                Cancel anytime
              </div>
              <div className="flex items-center justify-center">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                24/7 support
              </div>
              <div className="flex items-center justify-center">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                Global monitoring network
              </div>
              <div className="flex items-center justify-center">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                SSL certificate monitoring
              </div>
              <div className="flex items-center justify-center">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                API access
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}