"use client"

import Link from 'next/link'

interface LogoProps {
  className?: string
  showText?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function Logo({ className = "", showText = true, size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-3xl'
  }

  return (
    <Link href="/" className={`flex items-center select-none cursor-pointer ${className}`}>
      <img 
        src="https://pbs.twimg.com/profile_images/1971130228299718656/jODXiBTJ_400x400.jpg" 
        alt="UptimeMatrix Logo" 
        className={`${sizeClasses[size]} rounded-lg shadow-lg object-cover scale-125`}
      />
      {showText && (
        <span className={`ml-2 ${textSizeClasses[size]} font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent`}>
          UptimeMatrix
        </span>
      )}
    </Link>
  )
}