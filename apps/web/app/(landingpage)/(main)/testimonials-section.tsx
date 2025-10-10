"use client"

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Mail, Twitter, Github, MessageCircle, Star, ArrowRight, Users, Code, Heart, Sparkles, Rocket, Zap } from 'lucide-react'

const feedbackChannels = [
  {
    icon: Mail,
    title: "Email Feedback",
    description: "Share your thoughts, suggestions, or report issues directly with the founder.",
    contact: "atul.fzdlko2002@gmail.com",
    action: "Send Email",
    color: "blue",
    gradient: "from-blue-500 via-blue-600 to-indigo-600"
  },
  {
    icon: Twitter,
    title: "Follow the Project",
    description: "Stay updated with development progress and share your thoughts on Twitter.",
    contact: "@uptimematrix",
    action: "Follow on Twitter",
    color: "cyan",
    gradient: "from-cyan-500 via-sky-500 to-blue-500",
    link: "https://x.com/uptimematrix"
  },
  {
    icon: Twitter,
    title: "Connect with Founder",
    description: "Get in touch with Atul directly for collaborations or feedback.",
    contact: "@AtulMaurya5242", 
    action: "Follow Atul",
    color: "purple",
    gradient: "from-purple-500 via-violet-500 to-purple-600",
    link: "https://x.com/AtulMaurya5242"
  }
]

const contributionWays = [
  {
    icon: Github,
    title: "Star the Repository",
    description: "Show your support by starring our GitHub repository and help us grow",
    action: "Star on GitHub",
    gradient: "from-slate-600 to-slate-800",
    hoverGradient: "from-yellow-400 to-orange-500"
  },
  {
    icon: Code,
    title: "Contribute Code",
    description: "Help improve UptimeMatrix by contributing code or documentation",
    action: "View Issues",
    gradient: "from-green-500 to-emerald-600",
    hoverGradient: "from-green-400 to-emerald-500"
  },
  {
    icon: MessageCircle,
    title: "Share Feedback",
    description: "Tell us what features you'd like to see or how we can improve",
    action: "Give Feedback",
    gradient: "from-pink-500 to-rose-600",
    hoverGradient: "from-pink-400 to-rose-500"
  },
  {
    icon: Users,
    title: "Spread the Word",
    description: "Help others discover UptimeMatrix by sharing it with your network",
    action: "Share Project",
    gradient: "from-indigo-500 to-purple-600",
    hoverGradient: "from-indigo-400 to-purple-500"
  }
]

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-24 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-purple-50/20 to-emerald-50/30 dark:from-blue-950/10 dark:via-purple-950/10 dark:to-emerald-950/10"></div>
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-gradient-to-r from-emerald-400/10 to-cyan-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 px-4 py-2 text-sm font-semibold bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 border-0">
            <Sparkles className="w-3 h-3 mr-1" />
            Community
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 dark:from-slate-100 dark:via-blue-100 dark:to-slate-100 bg-clip-text text-transparent">
            Help Shape UptimeMatrix
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            UptimeMatrix is a <span className="font-semibold text-blue-600 dark:text-blue-400">new open-source project</span>. Your feedback and contributions will help make it better for everyone. 
            <span className="block mt-2 text-lg">✨ Be part of building something amazing!</span>
          </p>
        </div>

        {/* Early Stage Notice */}
        <div className="mb-20">
          <Card className="border-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2">
            <CardContent className="p-10 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 animate-pulse"></div>
              <div className="relative">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-6 shadow-lg animate-bounce">
                  <Rocket className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  🚀 Early Stage Project
                </h3>
                <p className="text-muted-foreground mb-6 max-w-lg mx-auto text-lg leading-relaxed">
                  UptimeMatrix is in <span className="font-semibold text-blue-600 dark:text-blue-400">active development</span>. We're looking for early adopters, contributors, and feedback to help shape the future of this monitoring tool.
                </p>
                <div className="flex items-center justify-center gap-2">
                  <Badge variant="outline" className="border-blue-300 text-blue-700 dark:border-blue-700 dark:text-blue-300 px-4 py-2 font-semibold">
                    <Heart className="w-3 h-3 mr-1 animate-pulse" />
                    Your input matters!
                  </Badge>
                  <Badge variant="outline" className="border-purple-300 text-purple-700 dark:border-purple-700 dark:text-purple-300 px-4 py-2 font-semibold">
                    <Zap className="w-3 h-3 mr-1" />
                    Shape the future
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Feedback Channels */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
              Get in Touch
            </h3>
            <p className="text-muted-foreground text-lg">Multiple ways to connect and share your thoughts</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {feedbackChannels.map((channel, index) => {
              const IconComponent = channel.icon
              return (
                <Card key={index} className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 overflow-hidden relative">
                  <div className={`absolute inset-0 bg-gradient-to-br ${channel.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
                  <CardContent className="p-8 text-center relative">
                    <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${channel.gradient} rounded-2xl mb-6 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300`}>
                      <IconComponent className="h-8 w-8 text-white" />
                    </div>
                    <h4 className="font-bold text-lg mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{channel.title}</h4>
                    <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{channel.description}</p>
                    <div className="text-sm font-mono bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 px-4 py-3 rounded-lg mb-6 border">
                      {channel.contact}
                    </div>
                    <Button 
                      size="sm" 
                      className={`bg-gradient-to-r ${channel.gradient} hover:shadow-lg hover:scale-105 transition-all duration-300 text-white border-0`}
                      onClick={() => {
                        if (channel.link) {
                          window.open(channel.link, '_blank')
                        } else if (channel.contact.includes('@') && !channel.contact.startsWith('@')) {
                          window.location.href = `mailto:${channel.contact}?subject=UptimeMatrix Feedback`
                        }
                      }}
                    >
                      {channel.action}
                      <ArrowRight className="ml-2 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Ways to Contribute */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
              Ways to Contribute
            </h3>
            <p className="text-muted-foreground text-lg">Every contribution makes a difference</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contributionWays.map((way, index) => {
              const IconComponent = way.icon
              return (
                <Card key={index} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 text-center border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 overflow-hidden relative">
                  <div className={`absolute inset-0 bg-gradient-to-br ${way.hoverGradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                  <CardContent className="p-6 relative">
                    <div className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br ${way.gradient} rounded-xl mb-4 shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300`}>
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <h4 className="font-semibold text-sm mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{way.title}</h4>
                    <p className="text-xs text-muted-foreground mb-4 leading-relaxed">{way.description}</p>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="text-xs h-8 hover:bg-blue-50 dark:hover:bg-blue-950/30 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-all duration-300"
                      onClick={() => {
                        if (way.title.includes('Star')) {
                          window.open('https://github.com/atul-5242/uptimematrix.in', '_blank')
                        } else if (way.title.includes('Contribute')) {
                          window.open('https://github.com/atul-5242/uptimematrix.in/issues', '_blank')
                        } else if (way.title.includes('Feedback')) {
                          window.location.href = 'mailto:atul.fzdlko2002@gmail.com?subject=UptimeMatrix Feedback'
                        } else {
                          window.open('https://x.com/uptimematrix', '_blank')
                        }
                      }}
                    >
                      {way.action}
                      <ArrowRight className="ml-1 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center relative">
          <Card className="border-0 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-950/20 dark:via-emerald-950/20 dark:to-teal-950/20 shadow-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-emerald-500/5 to-teal-500/5 animate-pulse"></div>
            <CardContent className="p-12 relative">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 rounded-full mb-6 shadow-xl animate-pulse">
                <Star className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Ready to Try UptimeMatrix?
              </h3>
              <p className="text-muted-foreground mb-8 max-w-lg mx-auto text-lg leading-relaxed">
                Download, deploy, and start monitoring your services today. It's <span className="font-semibold text-green-600 dark:text-green-400">completely free</span> and <span className="font-semibold text-emerald-600 dark:text-emerald-400">open source</span>!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 text-white border-0 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 px-8 py-3 text-lg"
                  onClick={() => window.open('https://github.com/atul-5242/uptimematrix.in', '_blank')}
                >
                  <Github className="mr-2 h-5 w-5" />
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  variant="outline"
                  className="border-2 border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-950/30 hover:border-green-300 dark:hover:border-green-700 hover:scale-105 transition-all duration-300 px-8 py-3 text-lg"
                  onClick={() => window.location.href = 'mailto:atul.fzdlko2002@gmail.com?subject=UptimeMatrix Feedback'}
                >
                  <Mail className="mr-2 h-5 w-5" />
                  Send Feedback
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}