"use client"

import { Separator } from '@/components/ui/separator'
import { Logo } from '@/app/(landingpage)/(main)/logo'
import { 
  Twitter, 
  Github, 
  Mail,
  Heart
} from 'lucide-react'

const social = [
  {
    name: 'Twitter Project',
    href: 'https://x.com/uptimematrix',
    icon: Twitter,
  },
  {
    name: 'Twitter Founder',
    href: 'https://x.com/AtulMaurya5242',
    icon: Twitter,
  },
  {
    name: 'GitHub',
    href: 'https://github.com/atul-5242/uptimematrix.in',
    icon: Github,
  },
  {
    name: 'Email',
    href: 'mailto:atul.fzdlko2002@gmail.com',
    icon: Mail,
  },
]

const quickLinks = [
  { name: 'GitHub Repository', href: 'https://github.com/atul-5242/uptimematrix.in' },
  { name: 'Documentation', href: 'https://github.com/atul-5242/uptimematrix.in#readme' },
  { name: 'Issues & Bugs', href: 'https://github.com/atul-5242/uptimematrix.in/issues' },
  { name: 'Feature Requests', href: 'https://github.com/atul-5242/uptimematrix.in/issues' },
]

export function Footer() {
  return (
    <footer className="bg-muted/30 border-t">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Logo and Description */}
          <div className="lg:col-span-1">
            <Logo className="mb-4" />
            <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
              Free, open-source monitoring tool for your infrastructure. Self-hosted, no limits, complete control.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-2 mb-6">
              <div className="flex items-center text-sm text-muted-foreground">
                <Mail className="h-4 w-4 mr-2" />
                atul.fzdlko2002@gmail.com
              </div>
            </div>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              {social.map((item, index) => {
                const Icon = item.icon
                return (
                  <a
                    key={index}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-muted"
                    title={item.name}
                  >
                    <span className="sr-only">{item.name}</span>
                    <Icon className="h-5 w-5" />
                  </a>
                )
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((item) => (
                <li key={item.name}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Open Source Info */}
          <div>
            <h3 className="text-sm font-semibold mb-4">Open Source</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>✅ MIT License</li>
              <li>✅ Self-hosted</li>
              <li>✅ No usage limits</li>
              <li>✅ Full source code</li>
              <li>✅ Community driven</li>
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            © 2025 UptimeMatrix. Open source under MIT License.
          </p>
          <div className="flex items-center space-x-2 mt-4 sm:mt-0">
            <span className="text-xs text-muted-foreground flex items-center">
              Built with <Heart className="h-3 w-3 mx-1 text-red-500" /> by Atul Maurya
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}