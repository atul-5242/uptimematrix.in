"use client"
import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  Mail, 
  Clock, 
  Users, 
  AlertTriangle, 
  Settings, 
  Plus, 
  Edit3, 
  Trash2, 
  RotateCcw,
  Calendar,
  Bell,
  Shield,
  User,
  ChevronDown,
  ChevronRight,
  Activity,
  Timer,
  CheckCircle,
  XCircle
} from 'lucide-react';

const WhosOnCallPage = () => {
  const [activeTab, setActiveTab] = useState('current');
  const [showCreateSchedule, setShowCreateSchedule] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [expandedSchedules, setExpandedSchedules] = useState({});

  // Mock data for demonstration
  const [currentOnCall] = useState([
    {
      id: 1,
      team: 'Frontend',
      primary: { name: 'John Doe', phone: '+1-555-0101', email: 'john@company.com', avatar: 'JD' },
      secondary: { name: 'Sarah Wilson', phone: '+1-555-0102', email: 'sarah@company.com', avatar: 'SW' },
      schedule: 'Frontend Rotation',
      shiftStart: '2024-08-26T08:00:00',
      shiftEnd: '2024-08-27T08:00:00',
      status: 'active',
      lastResponse: '2 minutes ago'
    },
    {
      id: 2,
      team: 'Backend',
      primary: { name: 'Mike Johnson', phone: '+1-555-0201', email: 'mike@company.com', avatar: 'MJ' },
      secondary: { name: 'Lisa Chen', phone: '+1-555-0202', email: 'lisa@company.com', avatar: 'LC' },
      schedule: 'Backend 24/7',
      shiftStart: '2024-08-26T00:00:00',
      shiftEnd: '2024-08-27T00:00:00',
      status: 'active',
      lastResponse: '5 minutes ago'
    },
    {
      id: 3,
      team: 'DevOps',
      primary: { name: 'Alex Turner', phone: '+1-555-0301', email: 'alex@company.com', avatar: 'AT' },
      secondary: { name: 'Emma Davis', phone: '+1-555-0302', email: 'emma@company.com', avatar: 'ED' },
      schedule: 'Infrastructure Watch',
      shiftStart: '2024-08-26T06:00:00',
      shiftEnd: '2024-08-27T06:00:00',
      status: 'active',
      lastResponse: '1 minute ago'
    }
  ]);

  const [schedules] = useState([
    {
      id: 1,
      name: 'Frontend Rotation',
      team: 'Frontend',
      type: 'Weekly',
      timezone: 'UTC-8',
      members: 4,
      nextRotation: '2024-08-27T08:00:00',
      status: 'active'
    },
    {
      id: 2,
      name: 'Backend 24/7',
      team: 'Backend',
      type: 'Daily',
      timezone: 'UTC-8',
      members: 6,
      nextRotation: '2024-08-27T00:00:00',
      status: 'active'
    },
    {
      id: 3,
      name: 'Infrastructure Watch',
      team: 'DevOps',
      type: 'Custom',
      timezone: 'UTC-8',
      members: 3,
      nextRotation: '2024-08-27T06:00:00',
      status: 'active'
    }
  ]);

  const [recentIncidents] = useState([
    {
      id: 1,
      title: 'API Gateway Timeout',
      severity: 'high',
      assignedTo: 'Mike Johnson',
      team: 'Backend',
      createdAt: '2024-08-26T10:30:00',
      responseTime: '2 minutes',
      status: 'resolved'
    },
    {
      id: 2,
      title: 'Frontend Build Failed',
      severity: 'medium',
      assignedTo: 'John Doe',
      team: 'Frontend',
      createdAt: '2024-08-26T09:15:00',
      responseTime: '5 minutes',
      status: 'investigating'
    }
  ]);

  const teams = ['all', 'Frontend', 'Backend', 'DevOps', 'QA', 'Security'];

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getTimeUntilRotation = (rotationTime) => {
    const now = new Date();
    const rotation = new Date(rotationTime);
    const diff = rotation - now;
    
    if (diff < 0) return 'Overdue';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved': return 'text-green-600 bg-green-50';
      case 'investigating': return 'text-yellow-600 bg-yellow-50';
      case 'escalated': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const filteredOnCall = selectedTeam === 'all' 
    ? currentOnCall 
    : currentOnCall.filter(item => item.team === selectedTeam);

  const filteredSchedules = selectedTeam === 'all' 
    ? schedules 
    : schedules.filter(schedule => schedule.team === selectedTeam);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Who's on Call</h1>
              <p className="mt-2 text-gray-600">Manage on-call schedules and escalation policies</p>
            </div>
            <div className="flex space-x-3">
              <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>
              <button 
                onClick={() => setShowCreateSchedule(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create Schedule</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active On-Call</p>
                <p className="text-2xl font-bold text-gray-900">{currentOnCall.length}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Open Incidents</p>
                <p className="text-2xl font-bold text-gray-900">2</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                <p className="text-2xl font-bold text-gray-900">3.2m</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Timer className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Next Rotation</p>
                <p className="text-2xl font-bold text-gray-900">5h 32m</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <RotateCcw className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs and Filters */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {['current', 'schedules', 'history'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-colors ${
                  activeTab === tab
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab === 'current' ? 'Currently On-Call' : tab}
              </button>
            ))}
          </div>
          
          <select 
            value={selectedTeam} 
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
          >
            {teams.map(team => (
              <option key={team} value={team}>
                {team === 'all' ? 'All Teams' : team}
              </option>
            ))}
          </select>
        </div>

        {/* Tab Content */}
        {activeTab === 'current' && (
          <div className="space-y-6">
            {filteredOnCall.map((onCall) => (
              <div key={onCall.id} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4">
                  <div className="flex items-center space-x-4 mb-4 lg:mb-0">
                    <div className="p-3 bg-blue-100 rounded-full">
                      <Shield className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{onCall.team} Team</h3>
                      <p className="text-sm text-gray-600">{onCall.schedule}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <Activity className="w-3 h-3 mr-1" />
                      Active
                    </span>
                    <span className="text-sm text-gray-500">
                      Ends {formatTime(onCall.shiftEnd)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Primary On-Call */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">Primary On-Call</h4>
                      <span className="text-xs text-gray-500">Last response: {onCall.lastResponse}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                        {onCall.primary.avatar}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{onCall.primary.name}</p>
                        <div className="flex flex-col sm:flex-row sm:space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Phone className="w-4 h-4" />
                            <span>{onCall.primary.phone}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Mail className="w-4 h-4" />
                            <span>{onCall.primary.email}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex space-x-2">
                      <button className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md text-sm hover:bg-blue-700 flex items-center justify-center space-x-1">
                        <Phone className="w-4 h-4" />
                        <span>Call</span>
                      </button>
                      <button className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-md text-sm hover:bg-gray-200 flex items-center justify-center space-x-1">
                        <Mail className="w-4 h-4" />
                        <span>Message</span>
                      </button>
                    </div>
                  </div>

                  {/* Secondary On-Call */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">Secondary On-Call</h4>
                      <span className="text-xs text-gray-500">Backup</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center text-white font-medium">
                        {onCall.secondary.avatar}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{onCall.secondary.name}</p>
                        <div className="flex flex-col sm:flex-row sm:space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Phone className="w-4 h-4" />
                            <span>{onCall.secondary.phone}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Mail className="w-4 h-4" />
                            <span>{onCall.secondary.email}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex space-x-2">
                      <button className="flex-1 bg-gray-600 text-white px-3 py-2 rounded-md text-sm hover:bg-gray-700 flex items-center justify-center space-x-1">
                        <Phone className="w-4 h-4" />
                        <span>Call</span>
                      </button>
                      <button className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-md text-sm hover:bg-gray-200 flex items-center justify-center space-x-1">
                        <Mail className="w-4 h-4" />
                        <span>Message</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>Shift: {formatTime(onCall.shiftStart)} - {formatTime(onCall.shiftEnd)}</span>
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                      <button className="text-blue-600 hover:text-blue-800 flex items-center space-x-1">
                        <Edit3 className="w-4 h-4" />
                        <span>Override</span>
                      </button>
                      <button className="text-gray-600 hover:text-gray-800 flex items-center space-x-1">
                        <RotateCcw className="w-4 h-4" />
                        <span>Escalate</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'schedules' && (
          <div className="space-y-6">
            {filteredSchedules.map((schedule) => (
              <div key={schedule.id} className="bg-white rounded-lg border border-gray-200">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => setExpandedSchedules(prev => ({
                          ...prev,
                          [schedule.id]: !prev[schedule.id]
                        }))}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                      >
                        {expandedSchedules[schedule.id] ? 
                          <ChevronDown className="w-5 h-5" /> : 
                          <ChevronRight className="w-5 h-5" />
                        }
                      </button>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{schedule.name}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                          <span>{schedule.team}</span>
                          <span>•</span>
                          <span>{schedule.type} rotation</span>
                          <span>•</span>
                          <span>{schedule.members} members</span>
                          <span>•</span>
                          <span>{schedule.timezone}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">Next rotation</p>
                        <p className="text-sm text-gray-600">{getTimeUntilRotation(schedule.nextRotation)}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          schedule.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {schedule.status}
                        </span>
                        <button className="p-2 text-gray-400 hover:text-gray-600">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {expandedSchedules[schedule.id] && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Schedule Details</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Rotation Type:</span>
                              <span className="text-gray-900">{schedule.type}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Timezone:</span>
                              <span className="text-gray-900">{schedule.timezone}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Next Rotation:</span>
                              <span className="text-gray-900">{formatDate(schedule.nextRotation)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Members:</span>
                              <span className="text-gray-900">{schedule.members} people</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Escalation Policy</h4>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2 text-sm">
                              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium">1</div>
                              <span>Primary on-call (0 min delay)</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm">
                              <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 font-medium">2</div>
                              <span>Secondary on-call (5 min delay)</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm">
                              <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-medium">3</div>
                              <span>Team lead (10 min delay)</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Incident Response</h3>
              <p className="text-sm text-gray-600 mt-1">Track on-call performance and response times</p>
            </div>
            <div className="divide-y divide-gray-200">
              {recentIncidents.map((incident) => (
                <div key={incident.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-full ${getSeverityColor(incident.severity)}`}>
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{incident.title}</h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                          <span>Assigned to {incident.assignedTo}</span>
                          <span>•</span>
                          <span>{incident.team} Team</span>
                          <span>•</span>
                          <span>{formatDate(incident.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">Response Time</p>
                        <p className="text-sm text-green-600">{incident.responseTime}</p>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(incident.status)}`}>
                        {incident.status === 'resolved' ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                        {incident.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Create Schedule Modal */}
      {showCreateSchedule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-90vh overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Create New Schedule</h3>
                <button 
                  onClick={() => setShowCreateSchedule(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Schedule Name</label>
                    <input 
                      type="text" 
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Frontend Weekend Rotation"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Team</label>
                    <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <option value="">Select a team</option>
                      {teams.filter(team => team !== 'all').map(team => (
                        <option key={team} value={team}>{team}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rotation Type</label>
                    <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                    <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <option value="UTC-8">UTC-8 (PST)</option>
                      <option value="UTC-5">UTC-5 (EST)</option>
                      <option value="UTC+0">UTC+0 (GMT)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Team Members</label>
                  <div className="border border-gray-300 rounded-lg p-4">
                    <div className="space-y-2">
                      {['John Doe', 'Sarah Wilson', 'Mike Johnson', 'Lisa Chen'].map((member, index) => (
                        <label key={index} className="flex items-center space-x-3">
                          <input type="checkbox" className="rounded border-gray-300" />
                          <span className="text-sm text-gray-900">{member}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Escalation Policy</label>
                  <div className="border border-gray-300 rounded-lg p-4">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-4">
                        <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium text-sm">1</span>
                        <div className="flex-1">
                          <select className="w-full border border-gray-300 rounded px-3 py-1 text-sm">
                            <option>Primary on-call</option>
                            <option>Secondary on-call</option>
                          </select>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="number" defaultValue="0" className="w-16 border border-gray-300 rounded px-2 py-1 text-sm" />
                          <span className="text-sm text-gray-600">min delay</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 font-medium text-sm">2</span>
                        <div className="flex-1">
                          <select className="w-full border border-gray-300 rounded px-3 py-1 text-sm">
                            <option>Secondary on-call</option>
                            <option>Team lead</option>
                          </select>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="number" defaultValue="5" className="w-16 border border-gray-300 rounded px-2 py-1 text-sm" />
                          <span className="text-sm text-gray-600">min delay</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button 
                onClick={() => setShowCreateSchedule(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                onClick={() => setShowCreateSchedule(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WhosOnCallPage;