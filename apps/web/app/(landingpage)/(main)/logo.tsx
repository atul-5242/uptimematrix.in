"use client"

import { Activity } from 'lucide-react'

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
    <div className={`flex items-center ${className}`}>
      <div className={`${sizeClasses[size]} bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg`}>
        <Activity className={`${size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-5 w-5' : 'h-7 w-7'} text-white`} />
      </div>
      {showText && (
        <span className={`ml-2 ${textSizeClasses[size]} font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent`}>
          UptimeMatrix
        </span>
      )}
    </div>
  )
}