"use client"
import React, { useState, useEffect, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Plus, Trash2, Clock, Users, AlertTriangle, ArrowLeft, Globe, Zap, Webhook, Bell, Phone, Mail, MessageSquare, X, Info, Settings } from 'lucide-react'
import { Alert, AlertDescription } from "@/components/ui/alert"

type EscalationStep = {
  id: number;
  repeatCount: number; // Added repeatCount
  alertMethod: {
    primary: string[];
    additional: string[];
  };
  recipients: string[];
  delayMinutes: number;
  escalateAfter: number;
  customMessage?: string;
}

type EscalationPolicyFormData = {
  name: string;
  description: string;
  triggerConditions: {
    monitorsDown: boolean;
    responseTimeThreshold: boolean;
    responseTimeValue: number;
    sslExpiry: boolean;
    sslExpiryDays: number;
    domainExpiry: boolean;
    domainExpiryDays: number;
    statusCodeErrors: boolean;
    statusCodes: string[];
    heartbeatMissed: boolean;
    heartbeatMissedCount: number;
  };
  severity: 'critical' | 'high' | 'medium' | 'low' | '';
  isActive: boolean;
  steps: EscalationStep[];
  tags: string[];
  terminationCondition: 'stop_after_last_step' | 'repeat_last_step' | ''; // New field
  repeatLastStepIntervalMinutes?: number; // New field for configurable interval
}

type ErrorState = {
  name?: string;
  steps?: string;
  triggerConditions?: string;
  tags?: string;
  [key: string]: string | undefined;
}

export default function EscalationPolicyCreatePage() {
  const router = useRouter()
  const [formData, setFormData] = useState<EscalationPolicyFormData>({
    name: '',
    description: '',
    triggerConditions: {
      monitorsDown: true,
      responseTimeThreshold: false,
      responseTimeValue: 5000,
      sslExpiry: false,
      sslExpiryDays: 30,
      domainExpiry: false,
      domainExpiryDays: 30,
      statusCodeErrors: false,
      statusCodes: ['500', '502', '503', '504'],
      heartbeatMissed: false,
      heartbeatMissedCount: 3
    },
    severity: '',
    isActive: true,
    steps: [
      {
        id: 1,
        alertMethod: {
          primary: [],
          additional: []
        },
        recipients: [],
        delayMinutes: 0,
        repeatCount: 1,
        escalateAfter: 5,
        customMessage: ''
      }
    ],
    tags: [],
    terminationCondition: '',
    repeatLastStepIntervalMinutes: 30 // Default to 30 minutes
  })

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<ErrorState>({})
  const [availableIntegrations, setAvailableIntegrations] = useState<any[]>([])
  const [teamMembers, setTeamMembers] = useState<any[]>([])

  const primaryAlertMethods = [
    { value: 'email', label: 'Email Notification', icon: Mail },
    { value: 'sms', label: 'SMS Alert', icon: MessageSquare },
    { value: 'phone', label: 'Phone Call', icon: Phone }
  ]

  // Fetch available integrations and team members
  useEffect(() => {
    // Demo data for integrations - replace with actual API call
    setAvailableIntegrations([
      { value: 'slack', label: 'Slack Channel', icon: MessageSquare, integrated: true },
      { value: 'discord', label: 'Discord Webhook', icon: MessageSquare, integrated: true },
      { value: 'teams', label: 'Microsoft Teams', icon: MessageSquare, integrated: false },
      { value: 'webhook', label: 'Custom Webhook', icon: Webhook, integrated: true },
      { value: 'push', label: 'Push Notification', icon: Bell, integrated: false },
      { value: 'pagerduty', label: 'PagerDuty', icon: Bell, integrated: true },
      { value: 'opsgenie', label: 'Opsgenie', icon: Bell, integrated: false }
    ])

    // Demo data for team members - replace with actual API call
    setTeamMembers([
      { value: 'john-doe', label: 'John Doe - Lead Developer', role: 'Lead Developer', email: 'john@company.com' },
      { value: 'jane-smith', label: 'Jane Smith - DevOps Engineer', role: 'DevOps Engineer', email: 'jane@company.com' },
      { value: 'mike-wilson', label: 'Mike Wilson - System Admin', role: 'System Admin', email: 'mike@company.com' },
      { value: 'oncall', label: 'Current On-Call Engineer', role: 'On-Call', email: 'oncall@company.com' },
      { value: 'team-lead', label: 'Team Lead', role: 'Team Lead', email: 'teamlead@company.com' },
      { value: 'dev-team', label: 'Development Team', role: 'Team', email: 'dev-team@company.com' },
      { value: 'ops-team', label: 'Operations Team', role: 'Team', email: 'ops-team@company.com' }
    ])
  }, [])

  const addStep = () => {
    setFormData(prev => ({
      ...prev,
      steps: [
        ...prev.steps,
        {
          id: prev.steps.length + 1,
          alertMethod: {
            primary: [],
            additional: []
          },
          recipients: [],
          delayMinutes: prev.steps.length * 5,
          repeatCount: 1,
          escalateAfter: 5,
          customMessage: ''
        }
      ]
    }))
  }

  const removeStep = (stepId: number) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.filter(step => step.id !== stepId)
    }))
  }

  const updateStep = (stepId: number, field: keyof EscalationStep, value: any) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.map(step =>
        step.id === stepId ? { ...step, [field]: value } : step
      )
    }))
  }

  const updatePrimaryAlertMethod = (stepId: number, method: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.map(step => {
        if (step.id === stepId) {
          const newPrimary = checked 
            ? [...step.alertMethod.primary, method]
            : step.alertMethod.primary.filter(m => m !== method)
          return {
            ...step,
            alertMethod: {
              ...step.alertMethod,
              primary: newPrimary
            }
          }
        }
        return step
      })
    }))
  }

  const addAdditionalAlertMethod = (stepId: number, method: string) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.map(step => {
        if (step.id === stepId) {
          const isAlreadySelected = step.alertMethod.additional.includes(method) || step.alertMethod.primary.includes(method)
          if (!isAlreadySelected) {
            return {
              ...step,
              alertMethod: {
                ...step.alertMethod,
                additional: [...step.alertMethod.additional, method]
              }
            }
          }
        }
        return step
      })
    }))
  }

  const removeAlertMethod = (stepId: number, method: string, type: 'primary' | 'additional') => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.map(step => {
        if (step.id === stepId) {
          return {
            ...step,
            alertMethod: {
              ...step.alertMethod,
              [type]: step.alertMethod[type].filter(m => m !== method)
            }
          }
        }
        return step
      })
    }))
  }

  const updateTriggerCondition = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      triggerConditions: {
        ...prev.triggerConditions,
        [field]: value
      }
    }))
  }

  const addTag = (tag: string) => {
    if (tag.trim() && !formData.tags.includes(tag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag.trim()]
      }))
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const validateForm = () => {
    const newErrors: ErrorState = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Policy name is required'
    }
    
    if (formData.steps.length === 0) {
      newErrors.steps = 'At least one escalation step is required'
    }

    // Check if at least one trigger condition is enabled
    const conditions = formData.triggerConditions
    const hasEnabledCondition = conditions.monitorsDown
    
    if (!hasEnabledCondition) {
      newErrors.triggerConditions = 'At least one trigger condition must be enabled'
    }

    formData.steps.forEach((step, index) => {
      const totalMethods = step.alertMethod.primary.length + step.alertMethod.additional.length
      if (totalMethods === 0) {
        newErrors[`step-${step.id}-method`] = `Step ${index + 1}: At least one notification method is required`
      }
      if (step.recipients.length === 0) {
        newErrors[`step-${step.id}-recipients`] = `Step ${index + 1}: At least one recipient is required`
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
  
    setLoading(true)
    
    try {
      // flatten triggerConditions into root
      const { triggerConditions, steps, ...rest } = formData
  
      const payload = {
        ...rest,
        monitorsDown: triggerConditions.monitorsDown, // Flatten monitorsDown
        steps: steps.map((s, index) => ({
          stepOrder: index + 1, // Prisma requires stepOrder
          primaryMethods: s.alertMethod.primary,
          additionalMethods: s.alertMethod.additional,
          recipients: s.recipients,
          delayMinutes: s.delayMinutes,
          repeatCount: s.repeatCount,
          escalateAfter: s.escalateAfter,
          customMessage: s.customMessage
        })),
        // Include repeatLastStepIntervalMinutes if terminationCondition is repeat_last_step
        ...(formData.terminationCondition === 'repeat_last_step' && {
          repeatLastStepIntervalMinutes: formData.repeatLastStepIntervalMinutes
        })
      }
  
      const res = await fetch('/api/escalation-policies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify(payload), // 👈 send flattened payload
      })
      
      if (res.ok) {
        alert('Escalation policy created successfully! Your monitoring system will now use this policy to alert your team.')
        router.push('/dashboard/escalations-policies')
      } else {
        const err = await res.json()
        alert(err.message || 'Failed to create escalation policy. Please try again.')
      }
    } catch (error) {
      console.error('Error creating policy:', error)
      alert('Failed to create escalation policy. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  
  const handleCancel = () => {
    router.push('/dashboard/escalations-policies')
  }

  const getMethodIcon = (methodValue: string) => {
    const allMethods = [...primaryAlertMethods, ...availableIntegrations]
    const method = allMethods.find(m => m.value === methodValue)
    return method?.icon || Bell
  }

  const getMethodLabel = (methodValue: string) => {
    const allMethods = [...primaryAlertMethods, ...availableIntegrations]
    const method = allMethods.find(m => m.value === methodValue)
    return method?.label || methodValue
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0"
              onClick={() => router.push('/dashboard/escalations-policies')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Globe className="h-8 w-8 text-blue-600" />
                Create Escalation Policy
              </h1>
              <p className="text-gray-600 mt-1">Configure how your team gets notified when monitors fail or performance degrades</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card className="shadow-sm border-gray-200/70 bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-blue-600" />
                Policy Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Policy Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Production Website Downtime"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="severity">Priority Level</Label>
                  <Select value={formData.severity} onValueChange={(value: any) => setFormData(prev => ({ ...prev, severity: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="critical">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-red-500" />
                          Critical - Immediate Response
                        </div>
                      </SelectItem>
                      <SelectItem value="high">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-orange-500" />
                          High - Quick Response
                        </div>
                      </SelectItem>
                      <SelectItem value="medium">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-yellow-500" />
                          Medium - Standard Response
                        </div>
                      </SelectItem>
                      <SelectItem value="low">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-blue-500" />
                          Low - When Convenient
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe when this escalation policy should trigger. e.g., 'For critical production services that require immediate attention'"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              {/* Tags Section */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    placeholder="Add tags like: production, critical, api, website"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        const target = e.target as HTMLInputElement
                        addTag(target.value)
                        target.value = ''
                      }
                    }}
                    className={errors.tags ? 'border-red-500' : ''}
                  />
                  <p className="text-xs text-gray-500">Press Enter to add a tag</p>
                  {errors.tags && <p className="text-sm text-red-600">{errors.tags}</p>}
                </div>

                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <X 
                          className="h-3 w-3 cursor-pointer hover:text-red-600" 
                          onClick={() => removeTag(tag)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* New: Escalation Termination Condition */}
              <div className="space-y-2">
                <Label htmlFor="terminationCondition">Escalation Termination Condition</Label>
                <Select
                  value={formData.terminationCondition}
                  onValueChange={(value: any) => setFormData(prev => ({ ...prev, terminationCondition: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select how escalation stops" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stop_after_last_step">
                      Stop escalating after the last step
                    </SelectItem>
                    <SelectItem value="repeat_last_step">
                      Keep repeating the last step
                    </SelectItem>
                  </SelectContent>
                </Select>
                {formData.terminationCondition === 'repeat_last_step' && (
                  <div className="flex items-center gap-2 mt-2">
                    <Label htmlFor="repeatInterval" className="sr-only">Repeat Interval</Label>
                    <Input
                      id="repeatInterval"
                      type="number"
                      min="1"
                      value={formData.repeatLastStepIntervalMinutes}
                      onChange={(e) => setFormData(prev => ({ ...prev, repeatLastStepIntervalMinutes: parseInt(e.target.value) || 1 }))}
                      className="w-24"
                    />
                    <span className="text-sm text-gray-600">minutes</span>
                  </div>
                )}
                <p className="text-xs text-gray-500">Define what happens when all escalation steps have been exhausted if no one acknowledges the escalation.</p>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="active"
                  checked={formData.isActive}
                  onCheckedChange={(checked: boolean) => setFormData(prev => ({ 
                    ...prev, 
                    isActive: checked 
                  }))}
                />
                <Label htmlFor="active" className="text-sm font-medium">
                  Activate this policy immediately
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Trigger Conditions */}
          <Card className="shadow-sm border-gray-200/70 bg-white/70 backdrop-blur-sm mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-orange-600" />
                Trigger Conditions
              </CardTitle>
              <p className="text-sm text-gray-600">Define what events should trigger this escalation policy</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Monitor Down - Only this one enabled */}
                <div className="space-y-3 p-4 border border-gray-200/70 rounded-lg bg-gray-50/50">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="monitors-down"
                      checked={formData.triggerConditions.monitorsDown}
                      onCheckedChange={(checked: boolean) => updateTriggerCondition('monitorsDown', checked)}
                    />
                    <Label htmlFor="monitors-down" className="font-medium">
                      Monitor is Down
                    </Label>
                  </div>
                  <p className="text-sm text-gray-600 ml-6">Trigger when a monitor fails to respond or returns an error</p>
                </div>

                {/* All other conditions disabled by default */}
                <div className="space-y-3 p-4 border border-gray-200/70 rounded-lg bg-gray-50/30 opacity-60">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="response-time"
                      checked={formData.triggerConditions.responseTimeThreshold}
                      disabled
                    />
                    <Label htmlFor="response-time" className="font-medium text-gray-500">
                      Slow Response Time
                    </Label>
                  </div>
                  <p className="text-sm text-gray-500 ml-6">Feature coming soon</p>
                </div>

                <div className="space-y-3 p-4 border border-gray-200/70 rounded-lg bg-gray-50/30 opacity-60">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="ssl-expiry"
                      checked={formData.triggerConditions.sslExpiry}
                      disabled
                    />
                    <Label htmlFor="ssl-expiry" className="font-medium text-gray-500">
                      SSL Certificate Expiring
                    </Label>
                  </div>
                  <p className="text-sm text-gray-500 ml-6">Feature coming soon</p>
                </div>

                <div className="space-y-3 p-4 border border-gray-200/70 rounded-lg bg-gray-50/30 opacity-60">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="domain-expiry"
                      checked={formData.triggerConditions.domainExpiry}
                      disabled
                    />
                    <Label htmlFor="domain-expiry" className="font-medium text-gray-500">
                      Domain Expiring
                    </Label>
                  </div>
                  <p className="text-sm text-gray-500 ml-6">Feature coming soon</p>
                </div>

                <div className="space-y-3 p-4 border border-gray-200/70 rounded-lg bg-gray-50/30 opacity-60">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="status-codes"
                      checked={formData.triggerConditions.statusCodeErrors}
                      disabled
                    />
                    <Label htmlFor="status-codes" className="font-medium text-gray-500">
                      HTTP Error Codes
                    </Label>
                  </div>
                  <p className="text-sm text-gray-500 ml-6">Feature coming soon</p>
                </div>

                <div className="space-y-3 p-4 border border-gray-200/70 rounded-lg bg-gray-50/30 opacity-60">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="heartbeat"
                      checked={formData.triggerConditions.heartbeatMissed}
                      disabled
                    />
                    <Label htmlFor="heartbeat" className="font-medium text-gray-500">
                      Missed Heartbeats
                    </Label>
                  </div>
                  <p className="text-sm text-gray-500 ml-6">Feature coming soon</p>
                </div>
              </div>

              {errors.triggerConditions && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{errors.triggerConditions}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Escalation Steps */}
          <Card className="shadow-sm border-gray-200/70 bg-white/70 backdrop-blur-sm mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-green-600" />
                Notification Steps
              </CardTitle>
              <p className="text-sm text-gray-600">Define how and when your team gets notified</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {formData.steps.map((step, index) => (
                <div 
                  key={step.id} 
                  className="border border-gray-200/70 rounded-lg p-6 space-y-4 bg-white/50 mb-4"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">
                        {index + 1}
                      </div>
                      Step {index + 1}
                      {index === 0 && <Badge variant="secondary">Immediate</Badge>}
                    </h3>
                    {formData.steps.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeStep(step.id)}
                        className="text-red-600 hover:text-red-800 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {/* Notification Methods */}
                  <div className="space-y-4">
                    <Label className="text-base font-medium">Notification Methods *</Label>
                    
                    {/* Primary Methods (Checkboxes) */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Primary Methods</Label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {primaryAlertMethods.map((method) => (
                          <div key={method.value} className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg bg-white/80">
                            <Checkbox
                              id={`${step.id}-${method.value}`}
                              checked={step.alertMethod.primary.includes(method.value)}
                              onCheckedChange={(checked: boolean) => updatePrimaryAlertMethod(step.id, method.value, checked)}
                            />
                            <method.icon className="h-4 w-4 text-gray-600" />
                            <Label htmlFor={`${step.id}-${method.value}`} className="text-sm font-medium cursor-pointer">
                              {method.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Additional Methods (Dropdown) */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Additional Integrated Methods</Label>
                      <Select
                        onValueChange={(value) => addAdditionalAlertMethod(step.id, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Add more notification methods" />
                        </SelectTrigger>
                        <SelectContent>
                          <div className="p-2 border-b border-gray-100">
                            <div className="flex items-center gap-2 text-sm text-blue-600">
                              <Info className="h-4 w-4" />
                              <span>Can't see your integration?</span>
                            </div>
                            <Button
                              variant="link"
                              size="sm"
                              className="h-auto p-0 text-blue-600 hover:text-blue-800"
                              onClick={() => window.open('http://localhost:3000/dashboard/integrations', '_blank')}
                            >
                              Click here to integrate new notification methods
                            </Button>
                          </div>
                          {availableIntegrations.filter(method => method.integrated).map((method) => (
                            <SelectItem key={method.value} value={method.value}>
                              <div className="flex items-center gap-2">
                                <method.icon className="h-4 w-4" />
                                {method.label}
                                <Badge variant="outline" className="text-xs">Integrated</Badge>
                              </div>
                            </SelectItem>
                          ))}
                          {availableIntegrations.filter(method => !method.integrated).map((method) => (
                            <SelectItem key={method.value} value={method.value} disabled>
                              <div className="flex items-center gap-2 opacity-50">
                                <method.icon className="h-4 w-4" />
                                {method.label}
                                <Badge variant="secondary" className="text-xs">Not Integrated</Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Selected Methods Display */}
                    {(step.alertMethod.primary.length > 0 || step.alertMethod.additional.length > 0) && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Selected Methods</Label>
                        <div className="flex flex-wrap gap-2 p-3 border border-gray-200 rounded-lg bg-gray-50/50">
                          {step.alertMethod.primary.map((method) => {
                            const MethodIcon = getMethodIcon(method)
                            return (
                              <Badge key={method} variant="default" className="flex items-center gap-1">
                                <MethodIcon className="h-3 w-3" />
                                {getMethodLabel(method)}
                                <X 
                                  className="h-3 w-3 cursor-pointer hover:text-red-600" 
                                  onClick={() => removeAlertMethod(step.id, method, 'primary')}
                                />
                              </Badge>
                            )
                          })}
                          {step.alertMethod.additional.map((method) => {
                            const MethodIcon = getMethodIcon(method)
                            return (
                              <Badge key={method} variant="secondary" className="flex items-center gap-1">
                                <MethodIcon className="h-3 w-3" />
                                {getMethodLabel(method)}
                                <X 
                                  className="h-3 w-3 cursor-pointer hover:text-red-600" 
                                  onClick={() => removeAlertMethod(step.id, method, 'additional')}
                                />
                              </Badge>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {errors[`step-${step.id}-method`] && (
                      <p className="text-sm text-red-600">{errors[`step-${step.id}-method`]}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Notify Who *</Label>
                      <Select
                        value={step.recipients[0] || ''}
                        onValueChange={(value) => updateStep(step.id, 'recipients', [value])}
                      >
                        <SelectTrigger className={errors[`step-${step.id}-recipients`] ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Select recipients" />
                        </SelectTrigger>
                        <SelectContent>
                          {teamMembers.map((member) => (
                            <SelectItem key={member.value} value={member.value}>
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                <div className="flex flex-col">
                                  <span className="font-medium">{member.label}</span>
                                  <span className="text-xs text-gray-500">{member.email}</span>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors[`step-${step.id}-recipients`] && (
                        <p className="text-sm text-red-600">{errors[`step-${step.id}-recipients`]}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Delay Before This Step</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="0"
                          max="1440"
                          value={step.delayMinutes}
                          onChange={(e) => updateStep(step.id, 'delayMinutes', parseInt(e.target.value) || 0)}
                          className="w-24"
                        />
                        <span className="text-sm text-gray-600">minutes</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Escalate After</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="1"
                          max="60"
                          value={step.escalateAfter}
                          onChange={(e) => updateStep(step.id, 'escalateAfter', parseInt(e.target.value) || 5)}
                          className="w-24"
                        />
                        <span className="text-sm text-gray-600">minutes without acknowledgment</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Repeat This Step</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="1"
                          max="10"
                          value={step.repeatCount}
                          onChange={(e) => updateStep(step.id, 'repeatCount', parseInt(e.target.value) || 1)}
                          className="w-24"
                        />
                        <span className="text-sm text-gray-600">times</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Custom Message (Optional)</Label>
                    <Textarea
                      placeholder="Add a custom message for this notification step..."
                      value={step.customMessage || ''}
                      onChange={(e) => updateStep(step.id, 'customMessage', e.target.value)}
                      rows={2}
                    />
                  </div>

                  {index < formData.steps.length - 1 && (
                    <div className="pt-4">
                      <Separator />
                      <div className="text-center py-2">
                        <Badge variant="outline" className="text-xs">
                          ⏱️ If not acknowledged, escalate to next step
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={addStep}
                className="w-full border-dashed hover:border-solid"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Another Notification Step
              </Button>

              {errors.steps && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{errors.steps}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex items-center justify-end space-x-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="min-w-[200px]">
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating Policy...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Create Escalation Policy
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}