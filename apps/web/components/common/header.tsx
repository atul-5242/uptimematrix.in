"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Menu, X, Moon, Sun, Monitor, Star, Github } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Logo } from '@/app/(landingpage)/(main)/logo'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { useAppSelector, RootState, useAppDispatch } from '@/store'
import { useRouter } from 'next/navigation'
import { signOut } from '@/store/authSlice'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { setTheme } = useTheme()
  const token = useAppSelector((state: RootState) => state.auth.token)
  const router = useRouter()
  const dispatch = useAppDispatch()

  const navigation = [
    { name: 'Features', href: '#features' },
    { name: 'Integrations', href: '#integrations' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'Testimonials', href: '#testimonials' },
    { name: 'GitHub', href: 'https://github.com/atul-5242/uptimematrix.in' },
  ]

  const goCta = () => {
    if (!token) router.push('/signin')
    else router.push('/dashboard')
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div onClick={() => token ? router.push('/dashboard') : router.push('/')} className="cursor-pointer">
            <Logo />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {!token && (
              // Show regular navigation for non-authenticated users only
              navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  target={item.href.startsWith('http') ? '_blank' : '_self'}
                  rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item.name}
                </a>
              ))
            )}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  <Sun className="mr-2 h-4 w-4" />
                  <span>Light</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  <Moon className="mr-2 h-4 w-4" />
                  <span>Dark</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  <Monitor className="mr-2 h-4 w-4" />
                  <span>System</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" onClick={goCta}>{token ? 'Dashboard' : 'Sign in'}</Button>
            {
              token &&
              <Button variant="ghost" onClick={async ()=>{
                try {
                  await fetch('/api/auth/signout', { method: 'POST' });
                } catch {}
                localStorage.removeItem('auth_token');
                dispatch(signOut())
                router.push('/');
              }}>Logout</Button>
            }
            
            {/* GitHub Star Button */}
            <Button 
              variant="outline" 
              className="group relative overflow-hidden border-2 border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 transition-all duration-300 hover:scale-105 hover:shadow-lg"
              onClick={() => window.open('https://github.com/atul-5242/uptimematrix.in', '_blank')}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-200/20 to-orange-200/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <Github className="mr-2 h-4 w-4 text-slate-600 group-hover:text-slate-800 transition-colors" />
              <Star className="mr-1 h-3 w-3 text-yellow-500 group-hover:text-yellow-600 transition-all duration-300 group-hover:scale-110" />
              <span className="text-slate-700 group-hover:text-slate-900 font-medium transition-colors">Star us</span>
            </Button>
            
            {/* Start Free Trial Button */}
            <Button 
              className="group relative overflow-hidden bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-indigo-300/40 transform"
              onClick={goCta}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/15 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-indigo-500 opacity-0 group-hover:opacity-25 blur transition-all duration-300"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out"></div>
              <span className="relative font-semibold group-hover:text-indigo-50 transition-colors">✨ Start free trial</span>
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  <Sun className="mr-2 h-4 w-4" />
                  <span>Light</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  <Moon className="mr-2 h-4 w-4" />
                  <span>Dark</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  <Monitor className="mr-2 h-4 w-4" />
                  <span>System</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 border-t">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  target={item.href.startsWith('http') ? '_blank' : '_self'}
                  rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="block px-3 py-2 text-base font-medium text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </a>
              ))}
              <div className="px-3 py-2 space-y-2">
                <Button variant="ghost" className="w-full justify-start" onClick={() => { setIsMenuOpen(false); goCta(); }}>
                  {token ? 'Dashboard' : 'Sign in'}
                </Button>
                {/* Mobile GitHub Button */}
                <Button 
                  variant="outline" 
                  className="w-full justify-start group border-2 border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50" 
                  onClick={() => { setIsMenuOpen(false); window.open('https://github.com/atul-5242/uptimematrix.in', '_blank'); }}
                >
                  <Github className="mr-2 h-4 w-4 text-slate-600" />
                  <Star className="mr-1 h-3 w-3 text-yellow-500" />
                  <span className="text-slate-700">Star us on GitHub</span>
                </Button>
                
                {/* Mobile Start Free Trial Button */}
                <Button 
                  className="w-full group relative overflow-hidden bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold transition-all duration-300" 
                  onClick={() => { setIsMenuOpen(false); goCta(); }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/15 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative">✨ Start free trial</span>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}