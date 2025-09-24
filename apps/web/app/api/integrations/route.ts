// app/api/integrations/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { Integration, IntegrationConfig } from '@/types/integrations'
import { validateIntegrationConfig, sanitizeConfig } from '@/lib/integrations'

// GET /api/integrations - Fetch all integrations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const status = searchParams.get('status')
    
    // Mock data - replace with actual database query
    const integrations: Integration[] = [
      // Your integration data here
    ]

    // Filter based on query parameters
    let filtered = integrations
    if (category && category !== 'all') {
      filtered = filtered.filter(i => i.category === category)
    }
    if (status === 'connected') {
      filtered = filtered.filter(i => i.isConnected)
    } else if (status === 'available') {
      filtered = filtered.filter(i => !i.isConnected)
    }

    const stats = {
      total: integrations.length,
      connected: integrations.filter(i => i.isConnected).length,
      active: integrations.filter(i => i.status === 'active').length,
      popular: integrations.filter(i => i.isPopular).length
    }

    return NextResponse.json({
      success: true,
      integrations: filtered,
      stats
    })
  } catch (error) {
    console.error('Error fetching integrations:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch integrations' },
      { status: 500 }
    )
  }
}

// POST /api/integrations - Connect/configure an integration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { integrationId, config } = body

    if (!integrationId) {
      return NextResponse.json(
        { success: false, message: 'Integration ID is required' },
        { status: 400 }
      )
    }

    // Validate configuration
    const validation = validateIntegrationConfig(integrationId, config)
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid configuration', errors: validation.errors },
        { status: 400 }
      )
    }

    // Sanitize and save configuration
    const sanitizedConfig = sanitizeConfig(config)
    
    // TODO: Save to database
    // const updatedIntegration = await db.integration.upsert({
    //   where: { id: integrationId },
    //   update: {
    //     isConnected: true,
    //     status: 'active',
    //     config: sanitizedConfig,
    //     configuredAt: new Date().toISOString()
    //   },
    //   create: {
    //     id: integrationId,
    //     isConnected: true,
    //     status: 'active',
    //     config: sanitizedConfig,
    //     configuredAt: new Date().toISOString()
    //   }
    // })

    // Test the integration connection
    const testResult = await testIntegrationConnection(integrationId, sanitizedConfig)
    if (!testResult.success) {
      return NextResponse.json(
        { success: false, message: 'Connection test failed', error: testResult.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Integration connected successfully',
      integration: {
        id: integrationId,
        isConnected: true,
        status: 'active',
        config: sanitizedConfig,
        configuredAt: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Error connecting integration:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to connect integration' },
      { status: 500 }
    )
  }
}

// PATCH /api/integrations - Update integration status
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { integrationId, status, config } = body

    if (!integrationId) {
      return NextResponse.json(
        { success: false, message: 'Integration ID is required' },
        { status: 400 }
      )
    }

    // TODO: Update in database
    // const updatedIntegration = await db.integration.update({
    //   where: { id: integrationId },
    //   data: {
    //     status,
    //     ...(config && { config }),
    //     updatedAt: new Date().toISOString()
    //   }
    // })

    return NextResponse.json({
      success: true,
      message: 'Integration updated successfully',
      integration: {
        id: integrationId,
        status,
        ...(config && { config }),
        updatedAt: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Error updating integration:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update integration' },
      { status: 500 }
    )
  }
}

// DELETE /api/integrations - Disconnect an integration
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const integrationId = searchParams.get('id')

    if (!integrationId) {
      return NextResponse.json(
        { success: false, message: 'Integration ID is required' },
        { status: 400 }
      )
    }

    // TODO: Update in database
    // await db.integration.update({
    //   where: { id: integrationId },
    //   data: {
    //     isConnected: false,
    //     status: 'inactive',
    //     config: null,
    //     disconnectedAt: new Date().toISOString()
    //   }
    // })

    return NextResponse.json({
      success: true,
      message: 'Integration disconnected successfully'
    })
  } catch (error) {
    console.error('Error disconnecting integration:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to disconnect integration' },
      { status: 500 }
    )
  }
}

// Helper function to test integration connections
async function testIntegrationConnection(integrationId: string, config: IntegrationConfig) {
  try {
    switch (integrationId) {
      case 'slack':
      case 'discord':
        if (!config.webhookUrl) {
          return { success: false, error: 'Webhook URL is required' }
        }
        
        // Test webhook connection
        const webhookResponse = await fetch(config.webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: 'UptimeMatrix integration test - connection successful!',
            content: 'UptimeMatrix integration test - connection successful!' // For Discord
          })
        })
        
        if (!webhookResponse.ok) {
          return { success: false, error: 'Webhook test failed' }
        }
        break

      case 'teams':
        if (!config.webhookUrl) {
          return { success: false, error: 'Webhook URL is required' }
        }
        
        // Test Teams webhook
        const teamsResponse = await fetch(config.webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            "@type": "MessageCard",
            "@context": "http://schema.org/extensions",
            "summary": "UptimeMatrix Test",
            "themeColor": "0076D7",
            "title": "Integration Test",
            "text": "UptimeMatrix integration test - connection successful!"
          })
        })
        
        if (!teamsResponse.ok) {
          return { success: false, error: 'Teams webhook test failed' }
        }
        break

      case 'pagerduty':
        if (!config.apiKey || !config.serviceKey) {
          return { success: false, error: 'API Key and Service Key are required' }
        }
        
        // Test PagerDuty API connection
        const pdResponse = await fetch('https://api.pagerduty.com/incidents', {
          method: 'GET',
          headers: {
            'Authorization': `Token token=${config.apiKey}`,
            'Content-Type': 'application/json',
            'Accept': 'application/vnd.pagerduty+json;version=2'
          }
        })
        
        if (!pdResponse.ok) {
          return { success: false, error: 'PagerDuty API test failed - check your API key' }
        }
        break

      case 'webhook':
        if (!config.webhookUrl) {
          return { success: false, error: 'Webhook URL is required' }
        }
        
        // Test custom webhook
        try {
          const customResponse = await fetch(config.webhookUrl, {
            method: config.method || 'POST',
            headers: {
              'Content-Type': 'application/json',
              'User-Agent': 'UptimeMatrix/1.0',
              ...(config.headers && typeof config.headers === 'string' 
                ? parseHeaderString(config.headers) 
                : config.headers || {})
            },
            body: JSON.stringify({
              test: true,
              message: 'UptimeMatrix integration test',
              timestamp: new Date().toISOString()
            }),
            // Set timeout for webhook test
            signal: AbortSignal.timeout(10000)
          })
          
          // Consider 2xx responses as successful, ignore others for testing
          if (customResponse.status >= 200 && customResponse.status < 300) {
            return { success: true }
          }
          
          // Don't fail on 4xx/5xx as some webhooks expect specific payloads
          return { success: true, warning: `Webhook returned ${customResponse.status} but connection is working` }
        } catch (error) {
          const err = error as Error
          if (err.name === 'AbortError') {
            return { success: false, error: 'Webhook test timed out - check URL accessibility' }
          }
          return { success: false, error: `Webhook test failed: ${err.message}` }
        }

      case 'email':
        // Email integration doesn't need testing as it uses system SMTP
        return { success: true }

      case 'sms':
        // SMS integration would require phone number validation
        if (!config.phoneNumber) {
          return { success: false, error: 'Phone number is required for SMS notifications' }
        }
        // In production, you'd validate the phone number format
        return { success: true }

      case 'opsgenie':
        if (!config.apiKey) {
          return { success: false, error: 'API Key is required' }
        }
        
        // Test Opsgenie API
        const opsgenieResponse = await fetch('https://api.opsgenie.com/v2/account', {
          method: 'GET',
          headers: {
            'Authorization': `GenieKey ${config.apiKey}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (!opsgenieResponse.ok) {
          return { success: false, error: 'Opsgenie API test failed - check your API key' }
        }
        break

      case 'zapier':
        if (!config.webhookUrl) {
          return { success: false, error: 'Zapier webhook URL is required' }
        }
        
        // Test Zapier webhook
        const zapierResponse = await fetch(config.webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            test: true,
            source: 'UptimeMatrix',
            message: 'Integration test successful'
          })
        })
        
        if (!zapierResponse.ok) {
          return { success: false, error: 'Zapier webhook test failed' }
        }
        break

      default:
        // For other integrations, assume connection is valid
        return { success: true }
    }

    return { success: true }
  } catch (error) {
    const err = error as Error
    console.error(`Integration test error for ${integrationId}:`, error)
    return { success: false, error: err.message || 'Connection test failed' }
  }
}

// // Helper function to test integration connections
// async function testIntegrationConnection(integrationId: string, config: IntegrationConfig) {
//   try {
//     switch (integrationId) {
//       case 'slack':
//       case 'discord':
//         if (!config.webhookUrl) {
//           return { success: false, error: 'Webhook URL is required' }
//         }
        
//         // Test webhook connection
//         const webhookResponse = await fetch(config.webhookUrl, {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({
//             text: 'UptimeMatrix integration test - connection successful!'
//           })
//         })
        
//         if (!webhookResponse.ok) {
//           return { success: false, error: 'Webhook test failed' }
//         }
//         break

//       case 'pagerduty':
//         if (!config.apiKey || !config.serviceKey) {
//           return { success: false, error: 'API Key and Service Key are required' }
//         }
        
//         // Test PagerDuty API connection
//         const pdResponse = await fetch('https://api.pagerduty.com/incidents', {
//           headers: {
//             'Authorization': `Token token=${config.apiKey}`,
//             'Content-Type': 'application/json'
//           }
//         })
        
//         if (!pdResponse.ok) {
//           return { success: false, error: 'PagerDuty API test failed' }
//         }
//         break

//       case 'webhook':
//         if (!config.webhookUrl) {
//           return { success: false, error: 'Webhook URL is required' }
//         }
        
//         // Test custom webhook
//         const customResponse = await fetch(config.webhookUrl, {
//           method: config.method || 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//             ...config.headers
//           },
//           body: JSON.stringify({
//             test: true,
//             message: 'UptimeMatrix integration test'
//           })
//         })
        
//         // Don't fail on 4xx/5xx as some webhooks expect specific payloads
//         break

//       default:
//         // For other integrations, assume connection is valid
//         return { success: true }
//     }

//     return { success: true }
//   } catch (error) {
//     return { success: false, error: error.message }
//   }
// }

// Helper function to parse header string into object
function parseHeaderString(headerString: string): Record<string, string> {
  const headers: Record<string, string> = {}
  
  if (!headerString) return headers
  
  // Split by comma or newline, then by colon
  const headerLines = headerString.split(/[,\n]/).filter(line => line.trim())
  
  for (const line of headerLines) {
    const [key, ...valueParts] = line.split(':')
    if (key && valueParts.length > 0) {
      headers[key.trim()] = valueParts.join(':').trim()
    }
  }
  
  return headers
}

