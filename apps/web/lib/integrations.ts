// lib/integrations.ts
import { 
    Integration, 
    IntegrationCategory, 
    IntegrationConfig,
    CategoryInfo 
  } from '@/types/integrations'
  import { 
    MessageSquare, 
    Mail, 
    Phone, 
    Smartphone, 
    Shield, 
    Bell, 
    Webhook, 
    Zap, 
    Monitor, 
    Activity, 
    Database,
    Bot
  } from 'lucide-react'
  
  // Integration categories with metadata
  export const integrationCategories: CategoryInfo[] = [
    {
      value: 'communication',
      label: 'Communication',
      count: 0,
      description: 'Chat platforms, email, and messaging services'
    },
    {
      value: 'incident',
      label: 'Incident Management',
      count: 0,
      description: 'On-call management and incident response tools'
    },
    {
      value: 'webhook',
      label: 'Webhooks & API',
      count: 0,
      description: 'Custom webhooks and API integrations'
    },
    {
      value: 'monitoring',
      label: 'Monitoring Tools',
      count: 0,
      description: 'APM and infrastructure monitoring platforms'
    },
    {
      value: 'automation',
      label: 'Automation',
      count: 0,
      description: 'Workflow automation and IFTTT services'
    },
    {
      value: 'mobile',
      label: 'Mobile & Push',
      count: 0,
      description: 'Mobile apps and push notification services'
    }
  ]
  
  // Default integration templates
  export const integrationTemplates: Partial<Integration>[] = [
    // Communication
    {
      id: 'slack',
      name: 'Slack',
      description: 'Send notifications to Slack channels and direct messages',
      category: 'communication',
      isPopular: true,
      isPremium: false,
      documentation: 'https://api.slack.com/messaging/webhooks'
    },
    {
      id: 'discord',
      name: 'Discord',
      description: 'Get uptime alerts in your Discord server channels',
      category: 'communication',
      isPopular: true,
      isPremium: false,
      documentation: 'https://discord.com/developers/docs/resources/webhook'
    },
    {
      id: 'teams',
      name: 'Microsoft Teams',
      description: 'Integrate with Microsoft Teams for instant notifications',
      category: 'communication',
      isPopular: true,
      isPremium: false,
      documentation: 'https://docs.microsoft.com/en-us/microsoftteams/platform/webhooks-and-connectors/'
    },
    {
      id: 'email',
      name: 'Email',
      description: 'Send detailed email notifications to your team',
      category: 'communication',
      isPopular: true,
      isPremium: false
    },
    {
      id: 'sms',
      name: 'SMS',
      description: 'Receive critical alerts via text message',
      category: 'communication',
      isPopular: false,
      isPremium: true
    },
  
    // Incident Management
    {
      id: 'pagerduty',
      name: 'PagerDuty',
      description: 'Create incidents and manage on-call schedules',
      category: 'incident',
      isPopular: true,
      isPremium: false,
      documentation: 'https://developer.pagerduty.com/api-reference/'
    },
    {
      id: 'opsgenie',
      name: 'Opsgenie',
      description: 'Alert management and incident response platform',
      category: 'incident',
      isPopular: true,
      isPremium: false,
      documentation: 'https://docs.opsgenie.com/docs/api-overview'
    },
    {
      id: 'victorops',
      name: 'VictorOps',
      description: 'Incident management and on-call scheduling',
      category: 'incident',
      isPopular: false,
      isPremium: false
    },
  
    // Webhooks & API
    {
      id: 'webhook',
      name: 'Custom Webhook',
      description: 'Send HTTP requests to your custom endpoints',
      category: 'webhook',
      isPopular: true,
      isPremium: false
    },
    {
      id: 'zapier',
      name: 'Zapier',
      description: 'Connect to 5000+ apps with automated workflows',
      category: 'automation',
      isPopular: true,
      isPremium: false,
      documentation: 'https://zapier.com/apps/webhooks/help'
    },
  
    // Mobile
    {
      id: 'pushover',
      name: 'Pushover',
      description: 'Push notifications to your mobile device',
      category: 'mobile',
      isPopular: false,
      isPremium: true,
      documentation: 'https://pushover.net/api'
    },
  
    // Monitoring
    {
      id: 'datadog',
      name: 'Datadog',
      description: 'Send uptime metrics to your Datadog dashboard',
      category: 'monitoring',
      isPopular: true,
      isPremium: true,
      documentation: 'https://docs.datadoghq.com/api/'
    },
    {
      id: 'newrelic',
      name: 'New Relic',
      description: 'Monitor application performance and uptime',
      category: 'monitoring',
      isPopular: true,
      isPremium: true,
      documentation: 'https://docs.newrelic.com/docs/apis/'
    },
    {
      id: 'grafana',
      name: 'Grafana',
      description: 'Visualize uptime data in Grafana dashboards',
      category: 'monitoring',
      isPopular: false,
      isPremium: false,
      documentation: 'https://grafana.com/docs/grafana/latest/http_api/'
    }
  ]
  
  // Icon mapping for integrations
  export const integrationIcons: Record<string, any> = {
    slack: MessageSquare,
    discord: MessageSquare,
    teams: MessageSquare,
    email: Mail,
    sms: Phone,
    phone: Phone,
    pagerduty: Bell,
    opsgenie: Shield,
    victorops: Activity,
    webhook: Webhook,
    zapier: Zap,
    pushover: Smartphone,
    datadog: Monitor,
    newrelic: Activity,
    grafana: Database,
    default: Bell
  }
  
  // Category icon mapping
  export const categoryIcons: Record<IntegrationCategory, any> = {
    communication: MessageSquare,
    incident: Shield,
    webhook: Webhook,
    monitoring: Monitor,
    automation: Zap,
    mobile: Smartphone
  }
  
  // Utility functions
  export const getIntegrationIcon = (integrationId: string) => {
    return integrationIcons[integrationId] || integrationIcons.default
  }
  
  export const getCategoryIcon = (category: IntegrationCategory) => {
    return categoryIcons[category]
  }
  
  export const getCategoryLabel = (category: IntegrationCategory): string => {
    const categoryInfo = integrationCategories.find(c => c.value === category)
    return categoryInfo?.label || category
  }
  
  export const formatLastUsed = (dateString: string | undefined): string => {
    if (!dateString) return 'Never'
    
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffMinutes = Math.floor(diffTime / (1000 * 60))
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffMinutes < 60) {
      return `${diffMinutes}m ago`
    } else if (diffHours < 24) {
      return `${diffHours}h ago`
    } else if (diffDays < 7) {
      return `${diffDays}d ago`
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  }
  
  export const validateIntegrationConfig = (integrationId: string, config: IntegrationConfig): { isValid: boolean; errors: string[] } => {
    const errors: string[] = []
  
    switch (integrationId) {
      case 'slack':
      case 'discord':
        if (!config.webhookUrl) {
          errors.push('Webhook URL is required')
        } else if (!isValidUrl(config.webhookUrl)) {
          errors.push('Invalid webhook URL format')
        }
        break
  
      case 'webhook':
        if (!config.webhookUrl) {
          errors.push('Webhook URL is required')
        } else if (!isValidUrl(config.webhookUrl)) {
          errors.push('Invalid webhook URL format')
        }
        if (config.method && !['GET', 'POST', 'PUT', 'PATCH'].includes(config.method)) {
          errors.push('Invalid HTTP method')
        }
        break
  
      case 'pagerduty':
        if (!config.apiKey) {
          errors.push('API Key is required')
        }
        if (!config.serviceKey) {
          errors.push('Service Key is required')
        }
        break
  
      case 'email':
        // Email is always valid as it uses system defaults
        break
  
      default:
        // Generic validation
        if (Object.keys(config).length === 0) {
          errors.push('Configuration is required')
        }
    }
  
    return {
      isValid: errors.length === 0,
      errors
    }
  }
  
  export const isValidUrl = (string: string): boolean => {
    try {
      new URL(string)
      return true
    } catch (_) {
      return false
    }
  }
  
  export const sanitizeConfig = (config: IntegrationConfig): IntegrationConfig => {
    const sanitized = { ...config }
    
    // Remove empty strings and null values
    Object.keys(sanitized).forEach(key => {
      if (sanitized[key] === '' || sanitized[key] === null) {
        delete sanitized[key]
      }
    })
  
    return sanitized
  }
  
  export const generateWebhookPayload = (integration: Integration, event: any) => {
    const basePayload = {
      timestamp: new Date().toISOString(),
      source: 'UptimeMatrix',
      integration: integration.name,
      event
    }
  
    switch (integration.id) {
      case 'slack':
        return {
          text: `UptimeMatrix Alert: ${event.type}`,
          attachments: [{
            color: event.type === 'down' ? 'danger' : 'good',
            fields: [
              {
                title: 'Monitor',
                value: event.monitor?.name || 'Unknown',
                short: true
              },
              {
                title: 'Status',
                value: event.type,
                short: true
              },
              {
                title: 'URL',
                value: event.monitor?.url || 'N/A',
                short: false
              }
            ],
            ts: Math.floor(Date.now() / 1000)
          }]
        }
  
      case 'discord':
        return {
          embeds: [{
            title: 'UptimeMatrix Alert',
            description: `Monitor ${event.monitor?.name} is ${event.type}`,
            color: event.type === 'down' ? 15158332 : 3066993, // Red or Green
            fields: [
              {
                name: 'URL',
                value: event.monitor?.url || 'N/A',
                inline: false
              },
              {
                name: 'Time',
                value: new Date().toLocaleString(),
                inline: true
              }
            ]
          }]
        }
  
      default:
        return basePayload
    }
  }