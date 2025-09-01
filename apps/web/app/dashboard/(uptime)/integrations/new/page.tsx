// app/dashboard/integrations/new/page.tsx
"use client"
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  ArrowLeft, 
  Plus, 
  Send, 
  MessageSquare, 
  Shield, 
  Webhook, 
  Monitor, 
  Zap, 
  Smartphone,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'

interface IntegrationRequestForm {
  name: string
  description: string
  url: string
  category: string
  priority: string
  useCase: string
  email: string
}

export default function RequestIntegrationPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<IntegrationRequestForm>({
    name: '',
    description: '',
    url: '',
    category: '',
    priority: 'medium',
    useCase: '',
    email: ''
  })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<Partial<IntegrationRequestForm>>({})

  const categories = [
    { value: 'communication', label: 'Communication', icon: MessageSquare },
    { value: 'incident', label: 'Incident Management', icon: Shield },
    { value: 'webhook', label: 'Webhooks & API', icon: Webhook },
    { value: 'monitoring', label: 'Monitoring Tools', icon: Monitor },
    { value: 'automation', label: 'Automation', icon: Zap },
    { value: 'mobile', label: 'Mobile & Push', icon: Smartphone }
  ]

  const priorities = [
    { value: 'low', label: 'Low - Nice to have', color: 'text-blue-600' },
    { value: 'medium', label: 'Medium - Would be helpful', color: 'text-yellow-600' },
    { value: 'high', label: 'High - Business critical', color: 'text-red-600' }
  ]

  const validateForm = () => {
    const newErrors: Partial<IntegrationRequestForm> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Integration name is required'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }

    if (!formData.category) {
      newErrors.category = 'Category is required'
    }

    if (!formData.useCase.trim()) {
      newErrors.useCase = 'Use case description is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format'
    }

    if (formData.url && !/^https?:\/\/.+/.test(formData.url)) {
      newErrors.url = 'Invalid URL format'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    
    try {
      const response = await fetch('/api/integrations/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setSubmitted(true)
      } else {
        throw new Error('Failed to submit request')
      }
    } catch (error) {
      console.error('Error submitting request:', error)
      alert('Failed to submit integration request. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof IntegrationRequestForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center py-12">
            <div className="bg-white/70 backdrop-blur-sm rounded-lg border border-gray-200/70 p-8 shadow-sm">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Request Submitted Successfully!
              </h1>
              <p className="text-gray-600 mb-6">
                Thank you for your integration request. We've received your submission and our team will review it. 
                You'll receive an email update at <strong>{formData.email}</strong> within 2-3 business days.
              </p>
              <div className="flex gap-4 justify-center">
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/dashboard/integrations')}
                >
                  Back to Integrations
                </Button>
                <Button onClick={() => {
                  setSubmitted(false)
                  setFormData({
                    name: '',
                    description: '',
                    url: '',
                    category: '',
                    priority: 'medium',
                    useCase: '',
                    email: formData.email // Keep email
                  })
                }}>
                  Submit Another Request
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0"
              onClick={() => router.push('/dashboard/integrations')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Plus className="h-8 w-8 text-blue-600" />
                Request Integration
              </h1>
              <p className="text-gray-600 mt-1">
                Don't see the integration you need? Let us know and we'll prioritize it.
              </p>
            </div>
          </div>

          <Alert className="bg-blue-50 border-blue-200">
            <AlertTriangle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              Popular integration requests are typically implemented within 2-4 weeks. We'll keep you updated via email.
            </AlertDescription>
          </Alert>
        </div>

        {/* Form */}
        <Card className="shadow-sm border-gray-200/70 bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Integration Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Integration Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Integration Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Notion, Linear, Figma"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">What does this service do? *</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of the service and its main purpose..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className={errors.description ? 'border-red-500' : ''}
                />
                {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
              </div>

              {/* Website URL */}
              <div className="space-y-2">
                <Label htmlFor="url">Website URL (optional)</Label>
                <Input
                  id="url"
                  placeholder="https://example.com"
                  value={formData.url}
                  onChange={(e) => handleInputChange('url', e.target.value)}
                  className={errors.url ? 'border-red-500' : ''}
                />
                {errors.url && <p className="text-sm text-red-600">{errors.url}</p>}
                <p className="text-xs text-gray-500">
                  Link to the service's website or API documentation
                </p>
              </div>

              {/* Category and Priority */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Category *</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => handleInputChange('category', value)}
                  >
                    <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          <div className="flex items-center gap-2">
                            <category.icon className="h-4 w-4" />
                            {category.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && <p className="text-sm text-red-600">{errors.category}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select 
                    value={formData.priority} 
                    onValueChange={(value) => handleInputChange('priority', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priorities.map((priority) => (
                        <SelectItem key={priority.value} value={priority.value}>
                          <span className={priority.color}>{priority.label}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Use Case */}
              <div className="space-y-2">
                <Label htmlFor="useCase">How would you use this integration? *</Label>
                <Textarea
                  id="useCase"
                  placeholder="Describe your specific use case. For example: 'We want to receive uptime alerts in our team's Slack channel and create tasks in Linear when incidents occur.'"
                  value={formData.useCase}
                  onChange={(e) => handleInputChange('useCase', e.target.value)}
                  rows={4}
                  className={errors.useCase ? 'border-red-500' : ''}
                />
                {errors.useCase && <p className="text-sm text-red-600">{errors.useCase}</p>}
                <p className="text-xs text-gray-500">
                  The more specific you are, the better we can prioritize and implement this integration.
                </p>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Your Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@company.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                <p className="text-xs text-gray-500">
                  We'll send updates about your request to this email
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/dashboard/integrations')}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Submit Request
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Have questions? Reach out to our team at{' '}
            <a href="mailto:integrations@uptimematrix.com" className="text-blue-600 hover:underline">
              integrations@uptimematrix.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}