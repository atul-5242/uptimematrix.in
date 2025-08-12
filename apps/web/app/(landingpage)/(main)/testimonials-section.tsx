"use client"

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Star, ArrowRight } from 'lucide-react'

const testimonials = [
  {
    name: "Sarah Chen",
    role: "CTO",
    company: "TechFlow",
    image: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150&h=150",
    content: "UptimeMatrix has transformed how we handle monitoring and incidents. The alerting system is incredibly smart and has reduced our false positives by 90%. The team loves the intuitive interface.",
    rating: 5,
    featured: true
  },
  {
    name: "Michael Rodriguez",
    role: "DevOps Engineer", 
    company: "CloudScale",
    image: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150",
    content: "The incident management features are outstanding. We've cut our MTTR in half since switching to UptimeMatrix. The team collaboration tools and automated escalation are game-changers.",
    rating: 5,
    featured: false
  },
  {
    name: "Emily Watson",
    role: "Engineering Manager",
    company: "DataStream",
    image: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150",
    content: "The status pages are beautiful and our customers love the transparency. The automatic updates from monitoring save us hours every week. Best investment we've made.",
    rating: 5,
    featured: true
  },
  {
    name: "David Kim",
    role: "Site Reliability Engineer",
    company: "FinanceApp",
    image: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150",
    content: "Global monitoring from 300+ locations gives us confidence in our performance data. The insights have helped us optimize our infrastructure and reduce costs by 30%.",
    rating: 5,
    featured: false
  },
  {
    name: "Lisa Thompson",
    role: "VP of Engineering",
    company: "E-commerce Plus",
    image: "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150&h=150",
    content: "UptimeMatrix's reliability and ease of use impressed our entire team. The onboarding was smooth and we were monitoring our entire stack within minutes.",
    rating: 5,
    featured: true
  },
  {
    name: "James Parker",
    role: "Lead Developer",
    company: "StartupCore",
    image: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150",
    content: "The free tier is perfect for our startup, and knowing we can scale seamlessly as we grow gives us peace of mind. Great product, great pricing, great support.",
    rating: 5,
    featured: false
  }
]

const companies = [
  { name: "TechFlow", logo: "TF", color: "blue" },
  { name: "CloudScale", logo: "CS", color: "green" },
  { name: "DataStream", logo: "DS", color: "purple" },
  { name: "FinanceApp", logo: "FA", color: "orange" },
  { name: "E-commerce Plus", logo: "E+", color: "pink" },
  { name: "StartupCore", logo: "SC", color: "teal" },
  { name: "DevTools", logo: "DT", color: "indigo" },
  { name: "WebSolutions", logo: "WS", color: "red" }
]

const colorClasses = {
  blue: "from-blue-500 to-blue-600",
  green: "from-green-500 to-green-600",
  purple: "from-purple-500 to-purple-600",
  orange: "from-orange-500 to-orange-600",
  pink: "from-pink-500 to-pink-600",
  teal: "from-teal-500 to-teal-600",
  indigo: "from-indigo-500 to-indigo-600",
  red: "from-red-500 to-red-600"
}

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">Testimonials</Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Loved by developers and teams worldwide
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join 5000+ companies that trust UptimeMatrix to monitor their infrastructure and manage incidents effectively.
          </p>
        </div>

        {/* Company Logos */}
        <div className="mb-16">
          <p className="text-center text-sm text-muted-foreground mb-8">
            Trusted by teams at leading companies
          </p>
          <div className="grid grid-cols-4 lg:grid-cols-8 gap-8 items-center">
            {companies.map((company, index) => (
              <div key={index} className="flex items-center justify-center">
                <div className={`w-12 h-12 bg-gradient-to-br ${colorClasses[company.color]} rounded-lg flex items-center justify-center text-sm font-bold text-white shadow-lg`}>
                  {company.logo}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Featured Testimonials */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-center mb-8">Featured Reviews</h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {testimonials.filter(t => t.featured).map((testimonial, index) => (
              <Card key={index} className="hover:shadow-xl transition-all duration-300 border-2 border-blue-100 dark:border-blue-900/30">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                    <Badge variant="secondary" className="ml-2 text-xs">Featured</Badge>
                  </div>
                  <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full mr-4 border-2 border-blue-200 dark:border-blue-800"
                    />
                    <div>
                      <div className="font-medium text-sm">{testimonial.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {testimonial.role} at {testimonial.company}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* All Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {testimonials.filter(t => !t.featured).map((testimonial, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6 text-sm">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-10 h-10 rounded-full mr-4"
                  />
                  <div>
                    <div className="font-medium text-sm">{testimonial.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {testimonial.role} at {testimonial.company}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-2xl p-8">
          <h3 className="text-2xl font-bold mb-4">
            Ready to join these happy customers?
          </h3>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Start monitoring your infrastructure today with our 14-day free trial. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
              Start free trial <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline">
              Contact sales
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}