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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Users, 
  User, 
  Clock, 
  Phone, 
  Mail, 
  Shield, 
  Settings, 
  Calendar, 
  Bell, 
  CheckCircle,
  AlertTriangle,
  Info,
  UserCheck,
  // Team,
  Save,
  X,
  Plus,
  Eye,
  PersonStanding
} from 'lucide-react'

type OnCallPerson = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  avatar?: string;
  isActive: boolean;
}

type OnCallTeam = {
  id: string;
  name: string;
  description: string;
  members: OnCallPerson[];
  schedule: string;
  isActive: boolean;
}

type OnCallConfig = {
  selectedPersons: string[];
  selectedTeams: string[];
  notes: string;
  fallbackToAdmin: boolean;
}

// Modal Component for Person Details
function PersonDetailsModal({ person, isOpen, onClose }: { person: OnCallPerson, isOpen: boolean, onClose: () => void }) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Engineer Details</h3>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-lg font-bold">
              {person.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h4 className="font-medium text-gray-900">{person.name}</h4>
              <p className="text-sm text-gray-600">{person.role}</p>
              <div className="flex items-center gap-1 mt-1">
                <div className={`w-2 h-2 rounded-full ${person.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <span className={`text-xs font-medium ${person.isActive ? 'text-green-600' : 'text-gray-500'}`}>
                  {person.isActive ? 'Available' : 'Unavailable'}
                </span>
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-gray-600">{person.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm font-medium">Phone</p>
                <p className="text-sm text-gray-600">{person.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm font-medium">Role Type</p>
                <Badge variant={person.role.toLowerCase().includes('admin') ? 'default' : 'secondary'} className="text-xs">
                  {person.role.toLowerCase().includes('admin') ? 'Admin' : 'Responder'}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Modal Component for Team Details
function TeamDetailsModal({ team, isOpen, onClose }: { team: OnCallTeam, isOpen: boolean, onClose: () => void }) {
  const [selectedMember, setSelectedMember] = useState<OnCallPerson | null>(null);
  
  if (!isOpen) return null;
  
  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Team Details</h3>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-purple-500 flex items-center justify-center text-white">
                {/* <Team className="h-8 w-8" /> */}
              </div>
              <div>
                <h4 className="font-medium text-gray-900">{team.name}</h4>
                <p className="text-sm text-gray-600">{team.description}</p>
                <Badge variant="outline" className="text-xs mt-1">
                  <Clock className="h-3 w-3 mr-1" />
                  {team.schedule}
                </Badge>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h5 className="font-medium mb-3 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Team Members ({team.members.length})
              </h5>
              <div className="space-y-2">
                {team.members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{member.name}</p>
                        <p className="text-xs text-gray-500">{member.role}</p>
                      </div>
                      <Badge variant={member.role.toLowerCase().includes('admin') ? 'default' : 'secondary'} className="text-xs">
                        {member.role.toLowerCase().includes('admin') ? 'Admin' : 'Responder'}
                      </Badge>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setSelectedMember(member)}
                      className="h-8 w-8 p-0"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Nested Person Details Modal */}
      {selectedMember && (
        <PersonDetailsModal 
          person={selectedMember} 
          isOpen={!!selectedMember} 
          onClose={() => setSelectedMember(null)} 
        />
      )}
    </>
  );
}

// Tabs Component for On-Call Status
function OnCallStatusTabs({ persons, teams, notes }: { persons: OnCallPerson[], teams: OnCallTeam[], notes: string }) {
  const [activeTab, setActiveTab] = useState<'engineers' | 'teams'>('engineers');
  const [selectedPerson, setSelectedPerson] = useState<OnCallPerson | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<OnCallTeam | null>(null);
  
  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200">
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'engineers'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('engineers')}
        >
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            On-Call Engineers ({persons.length})
          </div>
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'teams'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('teams')}
        >
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            On-Call Teams ({teams.length})
          </div>
        </button>
      </div>

      {/* Tab Content */}
      <div className="min-h-[300px]">
        {activeTab === 'engineers' && (
          <div className="space-y-4">
            {persons.length > 0 ? (
              <div className="max-h-[400px] overflow-y-auto space-y-3 pr-2">
                {persons.map((person) => (
                  <div key={person.id} className="flex items-center justify-between p-4 border border-gray-200/70 rounded-lg bg-blue-50/50 hover:bg-blue-100/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                        {person.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{person.name}</h4>
                        <p className="text-sm text-gray-600">{person.role}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={person.role.toLowerCase().includes('admin') ? 'default' : 'secondary'} className="text-xs">
                            {person.role.toLowerCase().includes('admin') ? 'Admin' : 'Responder'}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <div className={`w-2 h-2 rounded-full ${person.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                            <span className={`text-xs font-medium ${person.isActive ? 'text-green-600' : 'text-gray-500'}`}>
                              {person.isActive ? 'Available' : 'Unavailable'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setSelectedPerson(person)}
                      className="h-8 w-8 p-0 hover:bg-blue-200"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <PersonStanding className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">No Engineers On-Call</h4>
                <p className="text-gray-600">No individual engineers are currently assigned</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'teams' && (
          <div className="space-y-4">
            {teams.length > 0 ? (
              <div className="max-h-[400px] overflow-y-auto space-y-3 pr-2">
                {teams.map((team) => (
                  <div key={team.id} className="flex items-center justify-between p-4 border border-gray-200/70 rounded-lg bg-purple-50/50 hover:bg-purple-100/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white">
                        {/* <Team className="h-5 w-5" /> */}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{team.name}</h4>
                        <p className="text-sm text-gray-600">{team.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            {team.schedule}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {team.members.length} members
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setSelectedTeam(team)}
                      className="h-8 w-8 p-0 hover:bg-purple-200"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                {/* <Team className="h-12 w-12 text-gray-400 mx-auto mb-4" /> */}
                <h4 className="text-lg font-medium text-gray-900 mb-2">No Teams On-Call</h4>
                <p className="text-gray-600">No teams are currently assigned for on-call duties</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Special Instructions */}
      {notes && (
        <div className="space-y-2 mt-6 pt-4 border-t border-gray-200">
          <Label className="text-base font-medium flex items-center gap-2">
            <Bell className="h-4 w-4 text-orange-600" />
            Special Instructions
          </Label>
          <div className="p-3 bg-orange-50/50 border border-orange-200 rounded-lg">
            <p className="text-sm text-gray-700">{notes}</p>
          </div>
        </div>
      )}

      {/* No one on-call fallback message */}
      {persons.length === 0 && teams.length === 0 && (
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No On-Call Engineers Assigned</h3>
          <p className="text-gray-600 mb-4">All alerts will automatically fallback to System Administrator</p>
          <Badge variant="outline" className="text-orange-600 border-orange-300">
            <Shield className="h-3 w-3 mr-1" />
            Fallback Active: admin@company.com
          </Badge>
        </div>
      )}

      {/* Modals */}
      {selectedPerson && (
        <PersonDetailsModal 
          person={selectedPerson} 
          isOpen={!!selectedPerson} 
          onClose={() => setSelectedPerson(null)} 
        />
      )}
      
      {selectedTeam && (
        <TeamDetailsModal 
          team={selectedTeam} 
          isOpen={!!selectedTeam} 
          onClose={() => setSelectedTeam(null)} 
        />
      )}
    </div>
  );
}

export default function OnCallPage() {
  const router = useRouter()
  const [currentOnCall, setCurrentOnCall] = useState<{
    persons: OnCallPerson[];
    teams: OnCallTeam[];
    notes: string;
    lastUpdated: string;
  }>({
    persons: [],
    teams: [],
    notes: '',
    lastUpdated: ''
  })

  const [config, setConfig] = useState<OnCallConfig>({
    selectedPersons: [],
    selectedTeams: [],
    notes: '',
    fallbackToAdmin: true
  })

  const [availablePersons, setAvailablePersons] = useState<OnCallPerson[]>([])
  const [availableTeams, setAvailableTeams] = useState<OnCallTeam[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  // Demo data - replace with actual API calls
  useEffect(() => {
    // Set current on-call data
    setCurrentOnCall({
      persons: [
        {
          id: 'john-doe',
          name: 'John Doe',
          email: 'john@company.com',
          phone: '+1 (555) 123-4567',
          role: 'Lead Developer',
          isActive: true
        },
        {
          id: 'jane-smith',
          name: 'Jane Smith',
          email: 'jane@company.com',
          phone: '+1 (555) 234-5678',
          role: 'DevOps Engineer',
          isActive: true
        },
        {
          id: 'mike-wilson',
          name: 'Mike Wilson',
          email: 'mike@company.com',
          phone: '+1 (555) 987-6543',
          role: 'System Admin',
          isActive: true
        },
        {
          id: 'sarah-johnson',
          name: 'Sarah Johnson',
          email: 'sarah@company.com',
          phone: '+1 (555) 345-6789',
          role: 'Senior Engineer',
          isActive: false
        },
        {
          id: 'admin',
          name: 'System Admin',
          email: 'admin@company.com',
          phone: '+1 (555) 000-0000',
          role: 'Administrator',
          isActive: true
        },  
      ],
      teams: [
        {
          id: 'night-shift',
          name: 'Night Shift Team',
          description: 'Handles overnight incidents',
          members: [
            {
              id: 'mike-wilson',
              name: 'Mike Wilson',
              email: 'mike@company.com',
              phone: '+1 (555) 987-6543',
              role: 'System Admin',
              isActive: true
            },
            {
              id: 'jane-smith',
              name: 'Jane Smith',
              email: 'jane@company.com',
              phone: '+1 (555) 234-5678',
              role: 'DevOps Engineer',
              isActive: true
            },
            {
              id: 'jane-smith',
              name: 'Jane Smith',
              email: 'jane@company.com',
              phone: '+1 (555) 234-5678',
              role: 'DevOps Engineer',
              isActive: true
            },
            {
              id: 'jane-smith',
              name: 'Jane Smith',
              email: 'jane@company.com',
              phone: '+1 (555) 234-5678',
              role: 'DevOps Engineer',
              isActive: true
            },
            {
              id: 'jane-smith',
              name: 'Jane Smith',
              email: 'jane@company.com',
              phone: '+1 (555) 234-5678',
              role: 'DevOps Engineer',
              isActive: true
            },
          ],
          schedule: '10:00 PM - 6:00 AM',
          isActive: true
        },
        {
          id: 'office-hours',
          name: 'Office Hours Team',
          description: 'Handles incidents during business hours (9 AM - 5 PM)',
          members: [
            {
              id: 'john-doe', 
              name: 'John Doe',
              email: 'john@company.com',
              phone: '+1 (555) 123-4567',
              role: 'Lead Developer',
              isActive: true
            },
            {
              id: 'jane-smith',
              name: 'Jane Smith',
              email: 'jane@company.com',
              phone: '+1 (555) 234-5678',
              role: 'DevOps Engineer',
              isActive: true
            }
          ],
          schedule: '9:00 AM - 5:00 PM',
          isActive: true
        },
        {
          id: 'night-shift',
          name: 'Night Shift Team',
          description: 'Handles overnight incidents and monitoring',
          members: [
            {
              id: 'mike-wilson',
              name: 'Mike Wilson',
              email: 'mike@company.com',
              phone: '+1 (555) 987-6543',
              role: 'System Admin',
              isActive: true
            }
          ],
          schedule: '10:00 PM - 6:00 AM',
          isActive: true
        },
        {
          id: 'weekend-team',
          name: 'Weekend Team',
          description: 'Coverage for weekends and holidays',
          members: [
            {
              id: 'sarah-johnson',
              name: 'Sarah Johnson',
              email: 'sarah@company.com',
              phone: '+1 (555) 345-6789',
              role: 'Senior Engineer',
              isActive: false
            }
          ],
          schedule: 'Saturday - Sunday',
          isActive: true
        },
        {
          id: 'escalation-team', 
          name: 'Escalation Team',
          description: 'Secondary escalation for critical issues',
          members: [
            {
              id: 'john-doe',
              name: 'John Doe',
              email: 'john@company.com',
              phone: '+1 (555) 123-4567',
              role: 'Lead Developer',
              isActive: true
            }
          ],
          schedule: 'Always Available',
          isActive: false
        } 
        
      ],
      notes: 'Currently handling deployment issues. Contact immediately for any critical alerts.',
      lastUpdated: '2 hours ago'
    })

    // Set available persons
    setAvailablePersons([
      {
        id: 'john-doe',
        name: 'John Doe',
        email: 'john@company.com',
        phone: '+1 (555) 123-4567',
        role: 'Lead Developer',
        isActive: true
      },
      {
        id: 'jane-smith',
        name: 'Jane Smith',
        email: 'jane@company.com',
        phone: '+1 (555) 234-5678',
        role: 'DevOps Engineer',
        isActive: true
      },
      {
        id: 'mike-wilson',
        name: 'Mike Wilson',
        email: 'mike@company.com',
        phone: '+1 (555) 987-6543',
        role: 'System Admin',
        isActive: true
      },
      {
        id: 'sarah-johnson',
        name: 'Sarah Johnson',
        email: 'sarah@company.com',
        phone: '+1 (555) 345-6789',
        role: 'Senior Engineer',
        isActive: false
      },
      {
        id: 'admin',
        name: 'System Admin',
        email: 'admin@company.com',
        phone: '+1 (555) 000-0000',
        role: 'Administrator',
        isActive: true
      }
    ])

    // Set available teams
    setAvailableTeams([
      {
        id: 'office-hours',
        name: 'Office Hours Team',
        description: 'Handles incidents during business hours (9 AM - 5 PM)',
        schedule: '9:00 AM - 5:00 PM',
        isActive: true,
        members: [
          {
            id: 'john-doe',
            name: 'John Doe',
            email: 'john@company.com',
            phone: '+1 (555) 123-4567',
            role: 'Lead Developer',
            isActive: true
          },
          {
            id: 'jane-smith',
            name: 'Jane Smith',
            email: 'jane@company.com',
            phone: '+1 (555) 234-5678',
            role: 'DevOps Engineer',
            isActive: true
          }
        ]
      },
      {
        id: 'night-shift',
        name: 'Night Shift Team',
        description: 'Handles overnight incidents and monitoring',
        schedule: '10:00 PM - 6:00 AM',
        isActive: true,
        members: [
          {
            id: 'mike-wilson',
            name: 'Mike Wilson',
            email: 'mike@company.com',
            phone: '+1 (555) 987-6543',
            role: 'System Admin',
            isActive: true
          }
        ]
      },
      {
        id: 'weekend-team',
        name: 'Weekend Team',
        description: 'Coverage for weekends and holidays',
        schedule: 'Saturday - Sunday',
        isActive: true,
        members: [
          {
            id: 'sarah-johnson',
            name: 'Sarah Johnson',
            email: 'sarah@company.com',
            phone: '+1 (555) 345-6789',
            role: 'Senior Engineer',
            isActive: false
          }
        ]
      },
      {
        id: 'escalation-team',
        name: 'Escalation Team',
        description: 'Secondary escalation for critical issues',
        schedule: 'Always Available',
        isActive: false,
        members: [
          {
            id: 'john-doe',
            name: 'John Doe',
            email: 'john@company.com',
            phone: '+1 (555) 123-4567',
            role: 'Lead Developer',
            isActive: true
          }
        ]
      }
    ])
  }, [])

  const addPerson = (personId: string) => {
    if (!config.selectedPersons.includes(personId)) {
      setConfig(prev => ({
        ...prev,
        selectedPersons: [...prev.selectedPersons, personId]
      }))
    }
  }

  const removePerson = (personId: string) => {
    setConfig(prev => ({
      ...prev,
      selectedPersons: prev.selectedPersons.filter(id => id !== personId)
    }))
  }

  const addTeam = (teamId: string) => {
    if (!config.selectedTeams.includes(teamId)) {
      setConfig(prev => ({
        ...prev,
        selectedTeams: [...prev.selectedTeams, teamId]
      }))
    }
  }

  const removeTeam = (teamId: string) => {
    setConfig(prev => ({
      ...prev,
      selectedTeams: prev.selectedTeams.filter(id => id !== teamId)
    }))
  }

  const getPersonById = (id: string) => {
    return availablePersons.find(person => person.id === id)
  }

  const getTeamById = (id: string) => {
    return availableTeams.find(team => team.id === id)
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Update current on-call with new configuration
      const selectedPersonsData = config.selectedPersons.map(id => getPersonById(id)).filter(Boolean) as OnCallPerson[]
      const selectedTeamsData = config.selectedTeams.map(id => getTeamById(id)).filter(Boolean) as OnCallTeam[]
      
      setCurrentOnCall({
        persons: selectedPersonsData,
        teams: selectedTeamsData,
        notes: config.notes,
        lastUpdated: 'Just now'
      })
      
      alert('On-call configuration updated successfully!')
    } catch (error) {
      console.error('Error updating on-call config:', error)
      alert('Failed to update on-call configuration. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <UserCheck className="h-8 w-8 text-blue-600" />
            On-Call Management
          </h1>
          <p className="text-gray-600 mt-1">Manage who's currently on-call for incident response and monitoring alerts</p>
        </div>

        {/* Fallback Admin Notice */}
        <Alert className="mb-8 border-blue-200 bg-blue-50/50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Default Fallback:</strong> If no on-call engineer is selected, all alerts will automatically fallback to the System Administrator (admin@company.com) to ensure 24/7 coverage.
          </AlertDescription>
        </Alert>

        {/* Section 1: Current On-Call Status */}
        <Card className="shadow-sm border-gray-200/70 bg-white/70 backdrop-blur-sm mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              Current On-Call Status
              <Badge variant="secondary" className="ml-2">
                <Clock className="h-3 w-3 mr-1" />
                Updated {currentOnCall.lastUpdated}
              </Badge>
            </CardTitle>
            <p className="text-sm text-gray-600">Who's currently handling alerts and incidents</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Tabbed Interface */}
            <OnCallStatusTabs 
              persons={currentOnCall.persons} 
              teams={currentOnCall.teams} 
              notes={currentOnCall.notes}
            />
          </CardContent>
        </Card>

        {/* Section 2: Configure On-Call */}
        <form onSubmit={handleSubmit}>
          <Card className="shadow-sm border-gray-200/70 bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-blue-600" />
                Configure On-Call Assignment
              </CardTitle>
              <p className="text-sm text-gray-600">Select teams or individual engineers for on-call duties</p>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Team Selection */}
              <div className="space-y-4">
                <Label className="text-base font-medium flex items-center gap-2">
                  <Users className="h-4 w-4 text-purple-600" />
                  Select Teams
                </Label>
                <Select onValueChange={(value) => addTeam(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose teams for on-call duty" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTeams.map((team) => (
                      <SelectItem key={team.id} value={team.id} disabled={config.selectedTeams.includes(team.id)}>
                        <div className="flex items-center gap-2">
                          {/* <Team className="h-4 w-4" /> */}
                          <div className="flex flex-col">
                            <span className="font-medium">{team.name}</span>
                            <span className="text-xs text-gray-500">{team.schedule} • {team.members.length} members</span>
                          </div>
                          {team.isActive ? (
                            <Badge variant="outline" className="text-green-600 border-green-300">Active</Badge>
                          ) : (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Selected Teams Display */}
                {config.selectedTeams.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Selected Teams</Label>
                    <div className="flex flex-wrap gap-2 p-3 border border-gray-200 rounded-lg bg-purple-50/50">
                      {config.selectedTeams.map((teamId) => {
                        const team = getTeamById(teamId)
                        return team ? (
                          <Badge key={teamId} variant="default" className="flex items-center gap-1 bg-purple-600">
                            {/* <Team className="h-3 w-3" /> */}
                            {team.name}
                            <X 
                              className="h-3 w-3 cursor-pointer hover:text-red-200" 
                              onClick={() => removeTeam(teamId)}
                            />
                          </Badge>
                        ) : null
                      })}
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Individual Person Selection */}
              <div className="space-y-4">
                <Label className="text-base font-medium flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-600" />
                  Select Individual Engineers
                </Label>
                <Select onValueChange={(value) => addPerson(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose individual engineers for on-call" />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePersons.map((person) => (
                      <SelectItem key={person.id} value={person.id} disabled={config.selectedPersons.includes(person.id)}>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
                            {person.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-medium">{person.name}</span>
                            <span className="text-xs text-gray-500">{person.role} • {person.email}</span>
                          </div>
                          {person.isActive ? (
                            <Badge variant="outline" className="text-green-600 border-green-300">Available</Badge>
                          ) : (
                            <Badge variant="secondary">Unavailable</Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Selected Persons Display */}
                {config.selectedPersons.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Selected Engineers</Label>
                    <div className="flex flex-wrap gap-2 p-3 border border-gray-200 rounded-lg bg-blue-50/50">
                      {config.selectedPersons.map((personId) => {
                        const person = getPersonById(personId)
                        return person ? (
                          <Badge key={personId} variant="default" className="flex items-center gap-1 bg-blue-600">
                            {/* <User className="h-3 w-3" /> */}
                            {person.name}
                            <X 
                              className="h-3 w-3 cursor-pointer hover:text-red-200" 
                              onClick={() => removePerson(personId)}
                            />
                          </Badge>
                        ) : null
                      })}
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Special Instructions */}
              <div className="space-y-4">
                <Label htmlFor="notes" className="text-base font-medium flex items-center gap-2">
                  <Bell className="h-4 w-4 text-orange-600" />
                  Special Instructions for On-Call Engineers
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Add any special instructions, contact preferences, or important notes for the on-call engineers..."
                  value={config.notes}
                  onChange={(e) => setConfig(prev => ({ ...prev, notes: e.target.value }))}
                  rows={4}
                  className="min-h-[100px]"
                />
                <p className="text-xs text-gray-500">These notes will be included in all alert notifications to provide context</p>
              </div>

              {/* Fallback Admin Setting */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 p-4 border border-gray-200/70 rounded-lg bg-gray-50/50">
                  <Checkbox
                    id="fallback"
                    checked={config.fallbackToAdmin}
                    onCheckedChange={(checked: boolean) => setConfig(prev => ({ 
                      ...prev, 
                      fallbackToAdmin: checked 
                    }))}
                  />
                  <div className="flex-1">
                    <Label htmlFor="fallback" className="font-medium flex items-center gap-2">
                      <Shield className="h-4 w-4 text-blue-600" />
                      Enable Admin Fallback
                    </Label>
                    <p className="text-sm text-gray-600 mt-1">
                      If no on-call engineers are available or selected, automatically fallback to System Administrator
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-end space-x-4 pt-4">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    setConfig({
                      selectedPersons: [],
                      selectedTeams: [],
                      notes: '',
                      fallbackToAdmin: true
                    })
                  }}
                >
                  Clear Selection
                </Button>
                <Button type="submit" disabled={saving} className="min-w-[200px]">
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Updating On-Call...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Update On-Call Assignment
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  )
}