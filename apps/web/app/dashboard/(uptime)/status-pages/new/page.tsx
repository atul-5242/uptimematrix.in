"use client"
import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Globe, 
  Settings, 
  Palette, 
  ArrowLeft, 
  CheckCircle2,
  Plus,
  X,
  Eye,
  Users,
  Lock,
  Shield,
  Upload,
  AlertTriangle,
  Trash2,
  Monitor
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface StatusPageFormData {
  name: string
  subdomain: string
  customDomain: string
  description: string
  visibility: 'public' | 'private' | 'password_protected'
  password: string
  theme: 'light' | 'dark' | 'auto'
  branding: {
    primaryColor: string
    headerBg: string
    logo: string
  }
  serviceGroups: ServiceGroupForm[]
  notifications: {
    email: boolean
    slack: boolean
    webhook: boolean
    sms: boolean
  }
  customizations: {
    showUptime: boolean
    showIncidents: boolean
    showMetrics: boolean
    allowSubscriptions: boolean
    customCSS: string
    customHTML: string
  }
}

interface ServiceGroupForm {
  id: string
  name: string
  services: ServiceForm[]
}

interface ServiceForm {
  id: string
  name: string
  monitorId: string
}

interface Monitor {
  id: string
  name: string
  url: string
  status: string
}

interface FormErrors {
  [key: string]: string
}

export default function CreateStatusPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<StatusPageFormData>({
    name: '',
    subdomain: '',
    customDomain: '',
    description: '',
    visibility: 'public',
    password: '',
    theme: 'light',
    branding: {
      primaryColor: '#2563eb',
      headerBg: '#ffffff',
      logo: ''
    },
    serviceGroups: [
      {
        id: '1',
        name: 'Web Services',
        services: []
      }
    ],
    notifications: {
      email: true,
      slack: false,
      webhook: false,
      sms: false
    },
    customizations: {
      showUptime: true,
      showIncidents: true,
      showMetrics: true,
      allowSubscriptions: true,
      customCSS: '',
      customHTML: ''
    }
  })

  const [loading, setLoading] = useState<boolean>(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [availableMonitors, setAvailableMonitors] = useState<Monitor[]>([])
  const [currentStep, setCurrentStep] = useState<number>(1)
  const [previewMode, setPreviewMode] = useState<boolean>(false)

  // Fetch available monitors
  useEffect(() => {
    const fetchMonitors = async (): Promise<void> => {
      try {
        // Replace with actual API call
        const mockMonitors: Monitor[] = [
          { id: '1', name: 'Main Website', url: 'https://example.com', status: 'online' },
          { id: '2', name: 'API Gateway', url: 'https://api.example.com', status: 'online' },
          { id: '3', name: 'CDN', url: 'https://cdn.example.com', status: 'online' },
          { id: '4', name: 'Database', url: 'db.example.com:5432', status: 'online' },
        ]
        setAvailableMonitors(mockMonitors)
      } catch (error) {
        console.error('Error fetching monitors:', error)
      }
    }
    fetchMonitors()
  }, [])

  const generateSubdomain = (name: string): string => {
    return name.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
      .substring(0, 50)
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Status page name is required'
    }
    
    if (!formData.subdomain.trim()) {
      newErrors.subdomain = 'Subdomain is required'
    } else if (!/^[a-z0-9-]+$/.test(formData.subdomain)) {
      newErrors.subdomain = 'Subdomain can only contain lowercase letters, numbers, and hyphens'
    }

    if (formData.customDomain && !/^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/.test(formData.customDomain)) {
      newErrors.customDomain = 'Please enter a valid domain name'
    }

    if (formData.visibility === 'password_protected' && !formData.password.trim()) {
      newErrors.password = 'Password is required for password-protected pages'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }

    if (formData.serviceGroups.length === 0) {
      newErrors.serviceGroups = 'At least one service group is required'
    }

    formData.serviceGroups.forEach((group, groupIndex) => {
      if (!group.name.trim()) {
        newErrors[`serviceGroup_${groupIndex}_name`] = 'Service group name is required'
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (): Promise<void> => {
    if (!validateForm()) return

    setLoading(true)
    try {
      // Replace with actual API call
      const response = await fetch('/api/status-pages', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.message || 'Failed to create status page')
      }

      const result = await response.json()
      alert('Status page created successfully!')
      router.push(`/dashboard/status-pages/${result.id}`)
    } catch (error) {
      console.error('Error creating status page:', error)
      alert('Failed to create status page. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const addServiceGroup = (): void => {
    setFormData(prev => ({
      ...prev,
      serviceGroups: [
        ...prev.serviceGroups,
        {
          id: Date.now().toString(),
          name: '',
          services: []
        }
      ]
    }))
  }

  const removeServiceGroup = (groupId: string): void => {
    setFormData(prev => ({
      ...prev,
      serviceGroups: prev.serviceGroups.filter(group => group.id !== groupId)
    }))
  }

  const updateServiceGroup = (groupId: string, name: string): void => {
    setFormData(prev => ({
      ...prev,
      serviceGroups: prev.serviceGroups.map(group =>
        group.id === groupId ? { ...group, name } : group
      )
    }))
  }

  const addService = (groupId: string): void => {
    setFormData(prev => ({
      ...prev,
      serviceGroups: prev.serviceGroups.map(group =>
        group.id === groupId 
          ? {
              ...group,
              services: [
                ...group.services,
                {
                  id: Date.now().toString(),
                  name: '',
                  monitorId: ''
                }
              ]
            }
          : group
      )
    }))
  }

  const removeService = (groupId: string, serviceId: string): void => {
    setFormData(prev => ({
      ...prev,
      serviceGroups: prev.serviceGroups.map(group =>
        group.id === groupId 
          ? {
              ...group,
              services: group.services.filter(service => service.id !== serviceId)
            }
          : group
      )
    }))
  }

  const updateService = (groupId: string, serviceId: string, field: keyof ServiceForm, value: string): void => {
    setFormData(prev => ({
      ...prev,
      serviceGroups: prev.serviceGroups.map(group =>
        group.id === groupId 
          ? {
              ...group,
              services: group.services.map(service =>
                service.id === serviceId ? { ...service, [field]: value } : service
              )
            }
          : group
      )
    }))
  }

  const steps = [
    { id: 1, name: 'Basic Info', icon: Globe },
    { id: 2, name: 'Services', icon: Monitor },
    { id: 3, name: 'Design', icon: Palette },
    { id: 4, name: 'Settings', icon: Settings }
  ]

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-6 w-6 text-blue-600" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Status Page Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g., My Company Status"
                      value={formData.name}
                      onChange={(e) => {
                        const name = e.target.value
                        setFormData(prev => ({ 
                          ...prev, 
                          name,
                          subdomain: generateSubdomain(name)
                        }))
                      }}
                      className={errors.name ? 'border-red-500' : ''}
                    />
                    {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subdomain">Subdomain *</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="subdomain"
                        placeholder="my-company"
                        value={formData.subdomain}
                        onChange={(e) => setFormData(prev => ({ ...prev, subdomain: e.target.value }))}
                        className={errors.subdomain ? 'border-red-500' : ''}
                      />
                      <span className="text-sm text-gray-500">.yourdomain.com</span>
                    </div>
                    {errors.subdomain && <p className="text-sm text-red-600">{errors.subdomain}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customDomain">Custom Domain (Optional)</Label>
                  <Input
                    id="customDomain"
                    placeholder="status.mycompany.com"
                    value={formData.customDomain}
                    onChange={(e) => setFormData(prev => ({ ...prev, customDomain: e.target.value }))}
                    className={errors.customDomain ? 'border-red-500' : ''}
                  />
                  {errors.customDomain && <p className="text-sm text-red-600">{errors.customDomain}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Brief description of what this status page covers..."
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className={errors.description ? 'border-red-500' : ''}
                    rows={3}
                  />
                  {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
                </div>

                <div className="space-y-4">
                  <Label>Visibility</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div 
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        formData.visibility === 'public' ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-300'
                      }`}
                      onClick={() => setFormData(prev => ({ ...prev, visibility: 'public' }))}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Globe className="h-5 w-5 text-green-500" />
                        <span className="font-medium">Public</span>
                      </div>
                      <p className="text-sm text-gray-600">Anyone can view this status page</p>
                    </div>

                    <div 
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        formData.visibility === 'private' ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-300'
                      }`}
                      onClick={() => setFormData(prev => ({ ...prev, visibility: 'private' }))}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Lock className="h-5 w-5 text-gray-500" />
                        <span className="font-medium">Private</span>
                      </div>
                      <p className="text-sm text-gray-600">Only you can view this status page</p>
                    </div>

                    <div 
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        formData.visibility === 'password_protected' ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-300'
                      }`}
                      onClick={() => setFormData(prev => ({ ...prev, visibility: 'password_protected' }))}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="h-5 w-5 text-yellow-500" />
                        <span className="font-medium">Protected</span>
                      </div>
                      <p className="text-sm text-gray-600">Requires password to view</p>
                    </div>
                  </div>

                  {formData.visibility === 'password_protected' && (
                    <div className="space-y-2">
                      <Label htmlFor="password">Password *</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter a secure password"
                        value={formData.password}
                        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                        className={errors.password ? 'border-red-500' : ''}
                      />
                      {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-6 w-6 text-green-600" />
                  Service Groups & Monitors
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Organize your monitors into logical service groups
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {formData.serviceGroups.map((group, groupIndex) => (
                  <div key={group.id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 mr-4">
                        <Input
                          placeholder="Service Group Name"
                          value={group.name}
                          onChange={(e) => updateServiceGroup(group.id, e.target.value)}
                          className={errors[`serviceGroup_${groupIndex}_name`] ? 'border-red-500' : ''}
                        />
                        {errors[`serviceGroup_${groupIndex}_name`] && (
                          <p className="text-sm text-red-600 mt-1">{errors[`serviceGroup_${groupIndex}_name`]}</p>
                        )}
                      </div>
                      {formData.serviceGroups.length > 1 && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => removeServiceGroup(group.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="space-y-3">
                      {group.services.map((service) => (
                        <div key={service.id} className="flex items-center gap-3">
                          <Input
                            placeholder="Service Name"
                            value={service.name}
                            onChange={(e) => updateService(group.id, service.id, 'name', e.target.value)}
                            className="flex-1"
                          />
                          <Select
                            value={service.monitorId}
                            onValueChange={(value) => updateService(group.id, service.id, 'monitorId', value)}
                          >
                            <SelectTrigger className="w-64">
                              <SelectValue placeholder="Select Monitor" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableMonitors.map(monitor => (
                                <SelectItem key={monitor.id} value={monitor.id}>
                                  {monitor.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => removeService(group.id, service.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addService(group.id)}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Service
                      </Button>
                    </div>
                  </div>
                ))}

                <Button
                  variant="outline"
                  onClick={addServiceGroup}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Service Group
                </Button>

                {errors.serviceGroups && <p className="text-sm text-red-600">{errors.serviceGroups}</p>}
              </CardContent>
            </Card>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-6 w-6 text-purple-600" />
                  Design & Branding
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Theme</Label>
                    <Select
                      value={formData.theme}
                      onValueChange={(value) => setFormData(prev => ({ 
                        ...prev, 
                        theme: value as 'light' | 'dark' | 'auto' 
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="auto">Auto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="primaryColor">Primary Color</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="primaryColor"
                        type="color"
                        value={formData.branding.primaryColor}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          branding: { ...prev.branding, primaryColor: e.target.value }
                        }))}
                        className="w-16 h-10 p-1 border rounded"
                      />
                      <Input
                        value={formData.branding.primaryColor}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          branding: { ...prev.branding, primaryColor: e.target.value }
                        }))}
                        placeholder="#2563eb"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="headerBg">Header Background</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="headerBg"
                      type="color"
                      value={formData.branding.headerBg}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        branding: { ...prev.branding, headerBg: e.target.value }
                      }))}
                      className="w-16 h-10 p-1 border rounded"
                    />
                    <Input
                      value={formData.branding.headerBg}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        branding: { ...prev.branding, headerBg: e.target.value }
                      }))}
                      placeholder="#ffffff"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logo">Logo URL</Label>
                  <Input
                    id="logo"
                    placeholder="https://example.com/logo.png"
                    value={formData.branding.logo}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      branding: { ...prev.branding, logo: e.target.value }
                    }))}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-6 w-6 text-gray-600" />
                  Page Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label>Display Options</Label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="showUptime"
                        checked={formData.customizations.showUptime}
                        onCheckedChange={(checked) => 
                          setFormData(prev => ({
                            ...prev,
                            customizations: { ...prev.customizations, showUptime: checked as boolean }
                          }))
                        }
                      />
                      <Label htmlFor="showUptime">Show uptime statistics</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="showIncidents"
                        checked={formData.customizations.showIncidents}
                        onCheckedChange={(checked) => 
                          setFormData(prev => ({
                            ...prev,
                            customizations: { ...prev.customizations, showIncidents: checked as boolean }
                          }))
                        }
                      />
                      <Label htmlFor="showIncidents">Show incident history</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="showMetrics"
                        checked={formData.customizations.showMetrics}
                        onCheckedChange={(checked) => 
                          setFormData(prev => ({
                            ...prev,
                            customizations: { ...prev.customizations, showMetrics: checked as boolean }
                          }))
                        }
                      />
                      <Label htmlFor="showMetrics">Show performance metrics</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="allowSubscriptions"
                        checked={formData.customizations.allowSubscriptions}
                        onCheckedChange={(checked) => 
                          setFormData(prev => ({
                            ...prev,
                            customizations: { ...prev.customizations, allowSubscriptions: checked as boolean }
                          }))
                        }
                      />
                      <Label htmlFor="allowSubscriptions">Allow email subscriptions</Label>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <Label>Notification Settings</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="emailNotifications"
                        checked={formData.notifications.email}
                        onCheckedChange={(checked) => 
                          setFormData(prev => ({
                            ...prev,
                            notifications: { ...prev.notifications, email: checked as boolean }
                          }))
                        }
                      />
                      <Label htmlFor="emailNotifications">Email notifications</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="slackNotifications"
                        checked={formData.notifications.slack}
                        onCheckedChange={(checked) => 
                          setFormData(prev => ({
                            ...prev,
                            notifications: { ...prev.notifications, slack: checked as boolean }
                          }))
                        }
                      />
                      <Label htmlFor="slackNotifications">Slack notifications</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="webhookNotifications"
                        checked={formData.notifications.webhook}
                        onCheckedChange={(checked) => 
                          setFormData(prev => ({
                            ...prev,
                            notifications: { ...prev.notifications, webhook: checked as boolean }
                          }))
                        }
                      />
                      <Label htmlFor="webhookNotifications">Webhook notifications</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="smsNotifications"
                        checked={formData.notifications.sms}
                        onCheckedChange={(checked) => 
                          setFormData(prev => ({
                            ...prev,
                            notifications: { ...prev.notifications, sms: checked as boolean }
                          }))
                        }
                      />
                      <Label htmlFor="smsNotifications">SMS notifications</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create Status Page</h1>
              <p className="text-gray-600 mt-1">Set up a public status page for your services</p>
            </div>
          </div>

          {/* Steps */}
          <div className="flex items-center justify-between mb-6">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div 
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    currentStep >= step.id 
                      ? 'bg-blue-600 border-blue-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-500'
                  }`}
                >
                  <step.icon className="h-5 w-5" />
                </div>
                <div className="ml-3 hidden md:block">
                  <p className={`text-sm font-medium ${
                    currentStep >= step.id ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {step.name}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`hidden md:block w-16 h-0.5 ml-6 ${
                    currentStep > step.id ? 'bg-blue-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        {renderStepContent()}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <Button 
            variant="outline" 
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
          >
            Previous
          </Button>
          
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => setPreviewMode(true)}>
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            
            {currentStep < steps.length ? (
              <Button onClick={() => setCurrentStep(Math.min(steps.length, currentStep + 1))}>
                Next
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={loading} className="min-w-[140px]">
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Create Status Page
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}