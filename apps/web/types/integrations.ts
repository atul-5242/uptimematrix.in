// types/integrations.ts
export type IntegrationCategory = 'communication' | 'incident' | 'webhook' | 'monitoring' | 'automation' | 'mobile'

export type IntegrationStatus = 'active' | 'inactive' | 'error'

export interface Integration {
  id: string
  name: string
  description: string
  category: IntegrationCategory
  icon: string
  isConnected: boolean
  isPopular: boolean
  isPremium: boolean
  configuredAt?: string
  lastUsed?: string
  usageCount: number
  status: IntegrationStatus
  config?: IntegrationConfig
  documentation?: string
  supportUrl?: string
}

export interface IntegrationConfig {
  webhookUrl?: string
  apiKey?: string
  channel?: string
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH'
  headers?: Record<string, string>
  serviceKey?: string
  teamId?: string
  [key: string]: any
}

export interface IntegrationStats {
  total: number
  connected: number
  active: number
  popular: number
}

export interface CategoryInfo {
  value: IntegrationCategory
  label: string
  count: number
  description: string
}

export interface IntegrationRequest {
  name: string
  description: string
  url?: string
  category: IntegrationCategory
  priority: 'low' | 'medium' | 'high'
  useCase: string
  email: string
}

export interface IntegrationEvent {
  id: string
  integrationId: string
  type: 'connected' | 'disconnected' | 'error' | 'notification_sent'
  timestamp: string
  message: string
  data?: any
}

// API Response types
export interface IntegrationsResponse {
  integrations: Integration[]
  stats: IntegrationStats
  categories: CategoryInfo[]
}

export interface IntegrationResponse {
  integration: Integration
  events?: IntegrationEvent[]
}

export interface IntegrationRequestResponse {
  success: boolean
  message: string
  requestId?: string
}