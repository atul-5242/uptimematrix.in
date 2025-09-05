"use client";
import React, { useState } from 'react';
import { Calendar, Clock, TrendingUp, TrendingDown, Activity, AlertTriangle, CheckCircle, XCircle, BarChart3, PieChart, Download, Filter, Search, Eye, Globe, Server, Database, Wifi, Pie } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell } from 'recharts';

const ReportingPage = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [selectedService, setSelectedService] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Demo data
  const uptimeData = [
    { date: '2024-08-28', uptime: 99.95, downtime: 0.05 },
    { date: '2024-08-29', uptime: 100, downtime: 0 },
    { date: '2024-08-30', uptime: 99.87, downtime: 0.13 },
    { date: '2024-08-31', uptime: 99.99, downtime: 0.01 },
    { date: '2024-09-01', uptime: 98.45, downtime: 1.55 },
    { date: '2024-09-02', uptime: 100, downtime: 0 },
    { date: '2024-09-03', uptime: 99.96, downtime: 0.04 },
  ];

  const responseTimeData = [
    { time: '00:00', response: 245 },
    { time: '04:00', response: 189 },
    { time: '08:00', response: 312 },
    { time: '12:00', response: 578 },
    { time: '16:00', response: 423 },
    { time: '20:00', response: 298 },
    { time: '24:00', response: 234 },
  ];

  const incidentData = [
    { name: 'Resolved', value: 85, color: '#10b981' },
    { name: 'In Progress', value: 10, color: '#f59e0b' },
    { name: 'Open', value: 5, color: '#ef4444' },
  ];

  const services = [
    {
      id: 1,
      name: 'Main Website',
      url: 'https://uptimematrix.com',
      status: 'operational',
      uptime: 99.96,
      avgResponse: 245,
      incidents: 2,
      lastChecked: '2 minutes ago',
      icon: Globe
    },
    {
      id: 2,
      name: 'API Gateway',
      url: 'https://api.uptimematrix.com',
      status: 'operational',
      uptime: 99.87,
      avgResponse: 189,
      incidents: 1,
      lastChecked: '1 minute ago',
      icon: Server
    },
    {
      id: 3,
      name: 'Database Cluster',
      url: 'db.uptimematrix.com:5432',
      status: 'degraded',
      uptime: 98.45,
      avgResponse: 578,
      incidents: 5,
      lastChecked: '30 seconds ago',
      icon: Database
    },
    {
      id: 4,
      name: 'CDN Network',
      url: 'cdn.uptimematrix.com',
      status: 'operational',
      uptime: 100,
      avgResponse: 134,
      incidents: 0,
      lastChecked: '1 minute ago',
      icon: Wifi
    },
  ];

  const recentIncidents = [
    {
      id: 1,
      title: 'Database Connection Timeout',
      service: 'Database Cluster',
      status: 'resolved',
      severity: 'major',
      startTime: '2024-09-03 14:32',
      endTime: '2024-09-03 15:45',
      duration: '1h 13m',
      impact: 'High'
    },
    {
      id: 2,
      title: 'API Rate Limiting Issues',
      service: 'API Gateway',
      status: 'investigating',
      severity: 'minor',
      startTime: '2024-09-03 16:20',
      endTime: null,
      duration: 'Ongoing',
      impact: 'Low'
    },
    {
      id: 3,
      title: 'SSL Certificate Renewal',
      service: 'Main Website',
      status: 'resolved',
      severity: 'maintenance',
      startTime: '2024-09-02 02:00',
      endTime: '2024-09-02 02:15',
      duration: '15m',
      impact: 'None'
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'operational': return 'bg-green-100 text-green-800';
      case 'degraded': return 'bg-yellow-100 text-yellow-800';
      case 'down': return 'bg-red-100 text-red-800';
      case 'maintenance': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getIncidentStatusColor = (status) => {
    switch (status) {
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'investigating': return 'bg-yellow-100 text-yellow-800';
      case 'identified': return 'bg-orange-100 text-orange-800';
      case 'monitoring': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'major': return 'bg-orange-100 text-orange-800';
      case 'minor': return 'bg-yellow-100 text-yellow-800';
      case 'maintenance': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const overallStats = {
    totalUptime: 99.76,
    avgResponseTime: 312,
    totalIncidents: 8,
    resolvedIncidents: 7,
    totalServices: 4,
    operationalServices: 3
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">UptimeMatrix Reports</h1>
            <p className="text-gray-600 mt-1">Comprehensive monitoring and performance analytics</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <div className="flex gap-2">
              <select 
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
              </select>
              
              <select 
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Services</option>
                {services.map(service => (
                  <option key={service.id} value={service.id}>{service.name}</option>
                ))}
              </select>
            </div>
            
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export Report
            </button>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overall Uptime</p>
                <p className="text-3xl font-bold text-green-600">{overallStats.totalUptime}%</p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600">+0.2% from last week</span>
                </div>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                <p className="text-3xl font-bold text-blue-600">{overallStats.avgResponseTime}ms</p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingDown className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600">-15ms from last week</span>
                </div>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Incidents</p>
                <p className="text-3xl font-bold text-orange-600">{overallStats.totalIncidents}</p>
                <div className="flex items-center gap-1 mt-2">
                  <span className="text-sm text-gray-600">{overallStats.resolvedIncidents} resolved</span>
                </div>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Service Status</p>
                <p className="text-3xl font-bold text-purple-600">{overallStats.operationalServices}/{overallStats.totalServices}</p>
                <div className="flex items-center gap-1 mt-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600">Operational</span>
                </div>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Uptime Chart */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Uptime Trend</h3>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Uptime</span>
                <div className="w-3 h-3 bg-red-500 rounded-full ml-4"></div>
                <span>Downtime</span>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={uptimeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis tick={{ fontSize: 12 }} domain={[98, 100]} />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                    formatter={(value, name) => [`${value}%`, name === 'uptime' ? 'Uptime' : 'Downtime']}
                  />
                  <Area type="monotone" dataKey="uptime" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Response Time Chart */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Response Time</h3>
              <div className="text-sm text-gray-600">Average: 312ms</div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={responseTimeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value) => [`${value}ms`, 'Response Time']} />
                  <Line 
                    type="monotone" 
                    dataKey="response" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Services Overview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h3 className="text-lg font-semibold text-gray-900">Services Overview</h3>
              <div className="flex gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-initial">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search services..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Filter
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uptime</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Response</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Incidents</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Checked</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {services.map((service) => {
                  const IconComponent = service.icon;
                  return (
                    <tr key={service.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="p-2 bg-gray-100 rounded-lg mr-3">
                            <IconComponent className="w-5 h-5 text-gray-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{service.name}</div>
                            <div className="text-sm text-gray-500">{service.url}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(service.status)}`}>
                          {service.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{service.uptime}%</div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                          <div 
                            className="bg-green-500 h-1.5 rounded-full" 
                            style={{ width: `${service.uptime}%` }}
                          ></div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {service.avgResponse}ms
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {service.incidents}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {service.lastChecked}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900 flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom Row - Incidents and Chart */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Recent Incidents */}
          <div className="xl:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Incidents</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {recentIncidents.map((incident) => (
                <div key={incident.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-sm font-medium text-gray-900">{incident.title}</h4>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getIncidentStatusColor(incident.status)}`}>
                          {incident.status}
                        </span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getSeverityColor(incident.severity)}`}>
                          {incident.severity}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{incident.service}</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-gray-500">
                        <div>
                          <span className="font-medium">Started:</span><br />
                          {incident.startTime}
                        </div>
                        <div>
                          <span className="font-medium">Duration:</span><br />
                          {incident.duration}
                        </div>
                        <div>
                          <span className="font-medium">Impact:</span><br />
                          {incident.impact}
                        </div>
                        <div>
                          <span className="font-medium">Status:</span><br />
                          {incident.status}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Incident Distribution Chart */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Incident Status Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={incidentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {incidentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {incidentData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="text-gray-600">{item.name}</span>
                  </div>
                  <span className="font-medium text-gray-900">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportingPage;