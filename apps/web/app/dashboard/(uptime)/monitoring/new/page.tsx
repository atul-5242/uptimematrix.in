
"use client"
import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { 
  Globe, 
  MapPin, 
  Bell, 
  ArrowLeft, 
  CheckCircle2,
  Monitor,
  Plus,
  Info
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface MonitorFormData {
  name: string
  url: string
  monitorType: 'http'
  checkInterval: number
  timeout: number
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD'
  regions: string[]
  escalationPolicyId: string
  tags: string[]
}

interface FormErrors {
  [key: string]: string
}

export default function MonitorCreatePage() {
  const router = useRouter()
  const [formData, setFormData] = useState<MonitorFormData>({
    name: '',
    url: '',
    monitorType: 'http',
    checkInterval: 60,
    timeout: 30,
    method: 'GET',
    regions: ['India'], // India selected by default
    escalationPolicyId: 'default',
    tags: []
  })

  const [loading, setLoading] = useState<boolean>(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [escalationPolicies, setEscalationPolicies] = useState<{id: string, name: string}[]>([])
  const [availableRegions, setAvailableRegions] = useState<{ name: string; id: string }[]>([]);
  const [regionsLoading, setRegionsLoading] = useState<boolean>(true);

  // Fetch available regions
  useEffect(() => {
    const fetchRegions = async () => {
      setRegionsLoading(true);
      try {
        const token = localStorage.getItem('auth_token') || '';
        const res = await fetch('/api/regions', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          }
        });
        if (res.ok) {
          const data = await res.json();
          setAvailableRegions(data.data || []);
                  // Always set India as the only selected region
          const indiaRegion = data.data.find((r: any) => r.name === 'India');
          if (indiaRegion) {
            setFormData(prev => ({ ...prev, regions: [indiaRegion.name] }));
          }
        }
      } catch (e) {
        console.error("Error fetching regions:", e);
      } finally {
        setRegionsLoading(false);
      }
    };
    fetchRegions();
  }, []); // Run only once on mount

  // Dummy fetch for Escalation Policies
  useEffect(() => {
    const loadPolicies = async () => {
      try {
        const token = localStorage.getItem('auth_token') || ''
        const res = await fetch('/api/escalation-policies', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          }
        })
        if (res.ok) {
          const data = await res.json()
          const list = (data.policies || []).map((p: any) => ({ id: p.id, name: p.name }))
          setEscalationPolicies(list)
          if (list.length && !formData.escalationPolicyId) {
            setFormData(prev => ({ ...prev, escalationPolicyId: list[0].id }))
          }
        }
      } catch (e) {
        // ignore, keep empty list
      }
    }
    loadPolicies()
  }, [])

  const monitoringRegions = availableRegions.map(region => ({
    value: region.name,
    label: region.name === 'India' ? 'India (Mumbai)' : region.name,
    flag: region.name === 'India' ? '🇮🇳' : '',
    available: region.name === 'India' // Only India is selectable
  }));

  const checkIntervals = [
    { value: 30, label: '30 seconds' },
    { value: 60, label: '1 minute' },
    { value: 300, label: '5 minutes' },
    { value: 600, label: '10 minutes' },
    { value: 1800, label: '30 minutes' },
    { value: 3600, label: '1 hour' }
  ]

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Monitor name is required'
    }
    
    if (!formData.url.trim()) {
      newErrors.url = 'URL is required'
    } else {
      try {
        new URL(formData.url)
      } catch {
        newErrors.url = 'Please enter a valid URL'
      }
    }

    if (formData.regions.length === 0) {
      newErrors.regions = 'At least one monitoring region is required'
    }

    if (formData.timeout >= formData.checkInterval) {
      newErrors.timeout = 'Timeout must be less than check interval'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (): Promise<void> => {
    if (!validateForm()) return

    setLoading(true)
    try {
      // Combine checkInterval and timeout (both in seconds) to ms
      const totalIntervalMs = (formData.checkInterval + formData.timeout) * 1000;
      // Prepare data to send (only fields that exist in backend schema)
      const dataToSend = {
        name: formData.name,
        url: formData.url,
        monitorType: formData.monitorType,
        checkInterval: totalIntervalMs,
        method: formData.method,
        regions: formData.regions,
        escalationPolicyId: formData.escalationPolicyId || null,
        tags: formData.tags,
      };
      const token = localStorage.getItem('auth_token') || ''
      const response = await fetch('/api/uptime/monitor', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(dataToSend)
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.message || 'Failed to create monitor')
      }
      router.push('/dashboard/monitoring')  
      alert('Monitor created successfully!')
    } catch (error) {
      console.error('Error creating monitor:', error)
      alert('Failed to create monitor. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const toggleRegion = (region: string, available: boolean): void => {
    // Only allow toggling India, other regions are disabled
    if (region !== 'India') return;
    
    setFormData(prev => ({
      ...prev,
      regions: prev.regions.includes(region)
        ? prev.regions.filter(r => r !== region)
        : [...prev.regions, region]
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <Monitor className="h-8 w-8 text-green-600" />
                <h1 className="text-3xl font-bold text-gray-900">Create Monitor</h1>
              </div>
              <p className="text-gray-600 mt-1">Set up monitoring for your website or service</p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Basic Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-6 w-6 text-blue-600" />
                Basic Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Monitor Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Monitor Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., My Website Homepage"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                </div>
                
                {/* Monitor Type */}
                <div className="space-y-2">
                  <Label htmlFor="monitorType">Monitor Type</Label>
                  <Select 
                    value={formData.monitorType}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, monitorType: value as 'http' }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="http">HTTP/HTTPS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* URL */}
              <div className="space-y-2">
                <Label htmlFor="url">URL/Target *</Label>
                <Input
                  id="url"
                  placeholder="https://example.com"
                  value={formData.url}
                  onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                  className={errors.url ? 'border-red-500' : ''}
                />
                {errors.url && <p className="text-sm text-red-600">{errors.url}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Check Interval */}
                <div className="space-y-2">
                  <Label htmlFor="checkInterval">Check Interval</Label>
                  <Select 
                    value={formData.checkInterval.toString()} 
                    onValueChange={(value) => 
                      setFormData(prev => ({ ...prev, checkInterval: parseInt(value) }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {checkIntervals.map((interval) => (
                        <SelectItem key={interval.value} value={interval.value.toString()}>
                          {interval.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Timeout */}
                <div className="space-y-2">
                  <Label htmlFor="timeout">Timeout (seconds)</Label>
                  <Input
                    id="timeout"
                    type="number"
                    min="5"
                    max="60"
                    value={formData.timeout}
                    onChange={(e) => 
                      setFormData(prev => ({ ...prev, timeout: parseInt(e.target.value) || 30 }))
                    }
                    className={errors.timeout ? 'border-red-500' : ''}
                  />
                  {errors.timeout && <p className="text-sm text-red-600">{errors.timeout}</p>}
                </div>

                {/* HTTP Method */}
                <div className="space-y-2">
                  <Label htmlFor="method">HTTP Method</Label>
                  <Select
                    value={formData.method}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, method: value as MonitorFormData['method'] }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GET">GET</SelectItem>
                      <SelectItem value="POST">POST</SelectItem>
                      <SelectItem value="PUT">PUT</SelectItem>
                      <SelectItem value="DELETE">DELETE</SelectItem>
                      <SelectItem value="HEAD">HEAD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Monitoring Regions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-6 w-6 text-green-600" />
                Monitoring Regions
              </CardTitle>
              {/* <p className="text-sm text-gray-600 flex items-center gap-2">
                <Info className="h-4 w-4 text-blue-500" />
                For now, only <strong>India (Mumbai)</strong> region is available
              </p> */}
            </CardHeader>
            <CardContent>
              {regionsLoading ? (
                <div className="flex items-center justify-center p-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
                  <p className="ml-2 text-gray-600">Loading regions...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {monitoringRegions.map((region) => (
                    <div 
                      key={region.value} 
                      className={`flex items-center space-x-3 p-2 rounded-md ${!region.available ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <Checkbox
                        id={region.value}
                        checked={formData.regions.includes(region.value)}
                        onCheckedChange={() => toggleRegion(region.value, region.available)}
                        disabled={!region.available}
                      />
                      <Label htmlFor={region.value} className="flex items-center gap-2 cursor-pointer">
                        <span className="text-lg">{region.flag}</span>
                        <span>{region.label}</span>
                      </Label>
                    </div>
                  ))}
                </div>
              )}
              {errors.regions && <p className="text-sm text-red-600 mt-2">{errors.regions}</p>}
            </CardContent>
          </Card>

          {/* Escalation Policies */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-6 w-6 text-red-600" />
                Escalation Policies
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                <div className="space-y-2">
                  <Label>Select Escalation Policy</Label>
                  <Select
                    value={formData.escalationPolicyId}
                    onValueChange={(value) =>
                      setFormData(prev => ({ ...prev, escalationPolicyId: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {escalationPolicies.map(policy => (
                        <SelectItem key={policy.id} value={policy.id}>
                          {policy.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Button variant="outline" className="w-full md:w-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Escalation Policy
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="downtime">Alert after (minutes)</Label>
                <Select 
                  value="1"
                  onValueChange={() => {}}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 minute</SelectItem>
                    <SelectItem value="3">3 minutes</SelectItem>
                    <SelectItem value="5">5 minutes</SelectItem>
                    <SelectItem value="10">10 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex items-center justify-end space-x-4">
            <Button variant="outline">Cancel</Button>
            <Button onClick={handleSubmit} disabled={loading} className="min-w-[140px]">
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Create Monitor
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
