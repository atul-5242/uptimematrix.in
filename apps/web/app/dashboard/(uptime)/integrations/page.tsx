"use client"
import React, { useState } from 'react';
import { Search, Plus, Settings, Check, ExternalLink } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

// TypeScript interfaces
interface Integration {
  id: number;
  name: string;
  description: string;
  category: string;
  status: 'connected' | 'available';
  icon: string;
  setupTime: string;
}

const IntegrationsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Simplified integrations for MVP
  const integrations: Integration[] = [
    {
      id: 1,
      name: 'Slack',
      description: 'Send notifications to Slack channels',
      category: 'communication',
      status: 'connected',
      icon: '💬',
      setupTime: '2 min'
    },
    {
      id: 2,
      name: 'Email',
      description: 'Send email notifications',
      category: 'communication',
      status: 'connected',
      icon: '📧',
      setupTime: '1 min'
    },
    {
      id: 3,
      name: 'Webhook',
      description: 'Send HTTP POST requests',
      category: 'custom',
      status: 'connected',
      icon: '🔗',
      setupTime: '3 min'
    },
    {
      id: 4,
      name: 'Discord',
      description: 'Send alerts to Discord',
      category: 'communication',
      status: 'available',
      icon: '🎮',
      setupTime: '2 min'
    },
    {
      id: 5,
      name: 'Teams',
      description: 'Microsoft Teams integration',
      category: 'communication',
      status: 'available',
      icon: '👥',
      setupTime: '3 min'
    },
    {
      id: 6,
      name: 'PagerDuty',
      description: 'Incident management',
      category: 'incident',
      status: 'available',
      icon: '🚨',
      setupTime: '5 min'
    }
  ];

  const categories = [
    { id: 'all', name: 'All', count: integrations.length },
    { id: 'communication', name: 'Communication', count: integrations.filter(i => i.category === 'communication').length },
    { id: 'incident', name: 'Incident', count: integrations.filter(i => i.category === 'incident').length },
    { id: 'custom', name: 'Custom', count: integrations.filter(i => i.category === 'custom').length }
  ];

  const filteredIntegrations = integrations.filter((integration) => {
    const matchesSearch = integration.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || integration.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const connectedCount = integrations.filter(i => i.status === 'connected').length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Integrations</h1>
              <p className="mt-2 text-gray-600">Connect your monitoring with external services</p>
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Integration
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Connected</p>
                <p className="text-2xl font-bold text-gray-900">{connectedCount}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Available</p>
                <p className="text-2xl font-bold text-gray-900">{integrations.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Settings className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Categories</p>
                <p className="text-2xl font-bold text-gray-900">{categories.length - 1}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <ExternalLink className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg border p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search integrations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {category.name} ({category.count})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Connected Integrations Alert */}
        {connectedCount > 0 && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <Check className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              You have {connectedCount} integrations connected and working properly.
            </AlertDescription>
          </Alert>
        )}

        {/* Integrations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIntegrations.map((integration) => (
            <div key={integration.id} className="bg-white rounded-lg border hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-xl">
                      {integration.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{integration.name}</h3>
                      <p className="text-sm text-gray-600 capitalize">{integration.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {integration.status === 'connected' ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <Check className="w-3 h-3 mr-1" />
                        Connected
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        <Plus className="w-3 h-3 mr-1" />
                        Available
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-4">{integration.description}</p>

                <div className="flex items-center justify-between text-sm mb-4">
                  <span className="text-gray-500">Setup time: {integration.setupTime}</span>
                </div>

                <div className="flex gap-2">
                  {integration.status === 'connected' ? (
                    <>
                      <button className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-md text-sm hover:bg-gray-200 flex items-center justify-center gap-1">
                        <Settings className="w-4 h-4" />
                        Configure
                      </button>
                      <button className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50">
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <button className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md text-sm hover:bg-blue-700 flex items-center justify-center gap-1">
                      <Plus className="w-4 h-4" />
                      Connect
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredIntegrations.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No integrations found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        )}

        {/* Popular Integrations Section */}
        <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-8">
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Popular Integrations</h3>
            <p className="text-gray-600">Most commonly used integrations</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {integrations.filter(i => ['Slack', 'Email', 'Webhook'].includes(i.name)).map((integration) => (
              <div key={integration.id} className="bg-white rounded-lg border p-4 text-center">
                <div className="text-2xl mb-2">{integration.icon}</div>
                <h4 className="font-medium text-gray-900">{integration.name}</h4>
                <p className="text-sm text-gray-600 mb-3">{integration.setupTime} setup</p>
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  {integration.status === 'connected' ? 'Configure' : 'Connect'} →
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegrationsPage;