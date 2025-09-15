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
// import axios from 'axios'; // Removed axios import

type UserData = {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role?: string; // This will come from OrganizationMember or TeamMember
  avatar?: string;
  isActive?: boolean; // Based on user activity or presence, not directly from DB
}

type TeamData = {
  id: string;
  name: string;
  description: string;
  members: UserData[]; // Assuming members are fetched separately or via a nested query
  // schedule: string; // Removed as per new schema
  // isActive: boolean; // Removed as per new schema
}

type OnCallScheduleData = {
  id: string;
  name: string;
  description?: string;
  userAssignments: { id: string; userId: string; user: UserData }[];
  teamAssignments: { id: string; teamId: string; team: TeamData }[];
  createdAt: string;
  updatedAt: string;
}

type OnCallConfig = {
  scheduleName: string; // Add scheduleName to config
  selectedPersons: string[];
  selectedTeams: string[];
  notes: string;
  fallbackToAdmin: boolean;
}

// Modal Component for Person Details
function PersonDetailsModal({ person, isOpen, onClose }: { person: UserData, isOpen: boolean, onClose: () => void }) {
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
              {person.fullName.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h4 className="font-medium text-gray-900">{person.fullName}</h4>
              <p className="text-sm text-gray-600">{person.role || 'N/A'}</p>
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
                <p className="text-sm text-gray-600">{person.phone || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm font-medium">Role Type</p>
                <Badge variant={person.role?.toLowerCase().includes('admin') ? 'default' : 'secondary'} className="text-xs">
                  {person.role?.toLowerCase().includes('admin') ? 'Admin' : 'Responder'}
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
function TeamDetailsModal({ team, isOpen, onClose }: { team: TeamData, isOpen: boolean, onClose: () => void }) {
  const [selectedMember, setSelectedMember] = useState<UserData | null>(null);
  const [fetchedMembers, setFetchedMembers] = useState<UserData[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  
  useEffect(() => {
    const fetchTeamMembers = async () => {
      if (isOpen && team.id && team.members.length === 0) {
        setLoadingMembers(true);
        try {
          const token = localStorage.getItem('token'); // Assuming token is stored in localStorage
          if (!token) {
            throw new Error('No authentication token found.');
          }
          const res = await fetch(`/api/teams/${team.id}/members`, {
            headers: { 'Authorization': `Bearer ${token}` },
          });
          if (!res.ok) {
            throw new Error('Failed to fetch team members');
          }
          const { data } = await res.json();
          setFetchedMembers(data.data.map((member: any) => ({
            id: member.userId,
            fullName: member.name,
            email: member.email,
            phone: member.phone,
            role: member.role,
            isActive: member.status === 'active',
          })));
        } catch (error) {
          console.error('Error fetching team members:', error);
        } finally {
          setLoadingMembers(false);
        }
      }
    };
    fetchTeamMembers();
  }, [isOpen, team.id, team.members.length]);
  
  if (!isOpen) return null;

  const membersToDisplay = team.members.length > 0 ? team.members : fetchedMembers;
  
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
                {/* Removed schedule display */}
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h5 className="font-medium mb-3 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Team Members ({membersToDisplay.length})
              </h5>
              {loadingMembers ? (
                <div className="flex justify-center items-center h-24">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                </div>
              ) : membersToDisplay.length > 0 ? (
              <div className="space-y-2">
                  {membersToDisplay.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium">
                          {member.fullName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                          <p className="text-sm font-medium">{member.fullName}</p>
                          <p className="text-xs text-gray-500">{member.role || 'N/A'}</p>
                      </div>
                        <Badge variant={member.role?.toLowerCase().includes('admin') ? 'default' : 'secondary'} className="text-xs">
                          {member.role?.toLowerCase().includes('admin') ? 'Admin' : 'Responder'}
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
              ) : (
                <div className="text-center py-6 text-gray-500">
                  No members found for this team.
                </div>
              )}
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
function OnCallStatusTabs({ persons, teams, notes }: { persons: UserData[], teams: TeamData[], notes: string }) {
  const [activeTab, setActiveTab] = useState<'engineers' | 'teams'>('engineers');
  const [selectedPerson, setSelectedPerson] = useState<UserData | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<TeamData | null>(null);
  
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
                        {person.fullName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{person.fullName}</h4>
                        <p className="text-sm text-gray-600">{person.role || 'N/A'}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={person.role?.toLowerCase().includes('admin') ? 'default' : 'secondary'} className="text-xs">
                            {person.role?.toLowerCase().includes('admin') ? 'Admin' : 'Responder'}
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
                          {/* Removed schedule display */}
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
    persons: UserData[];
    teams: TeamData[];
    notes: string;
    lastUpdated: string;
  }>({
    persons: [],
    teams: [],
    notes: '',
    lastUpdated: ''
  })

  const [config, setConfig] = useState<OnCallConfig>({
    scheduleName: '', // Initialize scheduleName
    selectedPersons: [],
    selectedTeams: [],
    notes: '',
    fallbackToAdmin: true
  })

  const [availablePersons, setAvailablePersons] = useState<UserData[]>([])
  const [availableTeams, setAvailableTeams] = useState<TeamData[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [onCallSchedule, setOnCallSchedule] = useState<OnCallScheduleData | null>(null);

  const fetchOnCallData = async () => {
    setLoading(true);
    const token = localStorage.getItem('token'); // Assuming token is stored in localStorage
    if (!token) {
      console.error('No authentication token found.');
      setLoading(false);
      return;
    }

    try {
      // Fetch on-call schedules (expecting one for now)
      const schedulesRes = await fetch('/api/oncall/schedules', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!schedulesRes.ok) throw new Error('Failed to fetch schedules');
      const schedules: OnCallScheduleData[] = await schedulesRes.json();
      console.log('Fetched on-call schedules:', schedules);
      
      if (schedules.length > 0) {
        const activeSchedule = schedules[0]; // Assuming only one active schedule
        setOnCallSchedule(activeSchedule);
        
        // Fetch members for each team in the active schedule
        const teamsWithMembers = await Promise.all(activeSchedule.teamAssignments.map(async (assignment) => {
          const membersRes = await fetch(`/api/teams/${assignment.teamId}/members`, {
            headers: { 'Authorization': `Bearer ${token}` },
          });
          if (!membersRes.ok) throw new Error(`Failed to fetch members for team ${assignment.teamId}`);
          const { data: membersData } = await membersRes.json();
          const members: UserData[] = membersData.data.map((member: any) => ({
            id: member.userId,
            fullName: member.name,
            email: member.email,
            phone: member.phone,
            role: member.role,
            isActive: member.status === 'active',
          }));
          return { ...assignment.team, members: members, description: assignment.team.description || '' };
        }));

        setCurrentOnCall({
          persons: activeSchedule.userAssignments.map(assignment => ({ ...assignment.user, role: assignment.user.role || 'Responder', isActive: true })),
          teams: teamsWithMembers,
          notes: activeSchedule.description || '',
          lastUpdated: new Date(activeSchedule.updatedAt).toLocaleString(),
        });
        setConfig({
          scheduleName: activeSchedule.name, // Set scheduleName from fetched data
          selectedPersons: activeSchedule.userAssignments.map(assignment => assignment.userId),
          selectedTeams: activeSchedule.teamAssignments.map(assignment => assignment.teamId),
          notes: activeSchedule.description || '',
          fallbackToAdmin: true, // Assuming default true for now
        });
      } else {
        // No schedule exists, prompt to create one or display empty state
        setCurrentOnCall({
          persons: [],
          teams: [],
          notes: '',
          lastUpdated: 'Never',
        });
        setConfig(prev => ({ ...prev, scheduleName: '', selectedPersons: [], selectedTeams: [], notes: '' }));
      }

      // Fetch available users (from user management API)
      const usersRes = await fetch('/api/users/organization-members', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!usersRes.ok) throw new Error('Failed to fetch available users');
      const usersData = await usersRes.json();
      console.log('Fetched available users:', usersData.data);
      setAvailablePersons(usersData.data.map((user: any) => ({
        id: user.id,
        fullName: user.name,
        email: user.email,
        phone: user.phone,
        role: user.organizationRole || 'Member', // Default role
        isActive: true, // Assuming all fetched users are active
      })));

      // Fetch available teams (from team management API)
      const teamsRes = await fetch('/api/teams', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!teamsRes.ok) throw new Error('Failed to fetch available teams');
      const teamsData = await teamsRes.json();
      console.log('Fetched available teams:', teamsData.data);
      setAvailableTeams(teamsData.data.map((team: any) => ({
        id: team.id,
        name: team.name,
        description: team.description,
        members: [], // Members will be fetched on demand for modal if needed
      })));

    } catch (error) {
      console.error('Error fetching on-call data:', error);
      // Handle error display to user
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOnCallData();
  }, []);

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
    // Check currentOnCall.teams first
    const foundInCurrent = currentOnCall.teams.find(team => team.id === id);
    if (foundInCurrent) return foundInCurrent;
    // Then check availableTeams
    return availableTeams.find(team => team.id === id)
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    
    const token = localStorage.getItem('token'); // Assuming token is stored in localStorage
    if (!token) {
      console.error('No authentication token found for submission.');
      setSaving(false);
      return;
    }

    try {
      let currentScheduleId = onCallSchedule?.id;

      if (!currentScheduleId) {
        // Create a new schedule if none exists
        const createScheduleRes = await fetch('/api/oncall/schedules', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({
            name: config.scheduleName || 'Default On-Call Schedule', // Use new scheduleName from config
            description: config.notes,
          }),
        });
        if (!createScheduleRes.ok) throw new Error('Failed to create schedule');
        const newSchedule = await createScheduleRes.json();
        currentScheduleId = newSchedule.id;
        setOnCallSchedule(newSchedule);
      }

      // Update schedule name and description if an existing schedule is present
      if (onCallSchedule) {
        await fetch(`/api/oncall/schedules/${currentScheduleId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({
            name: config.scheduleName, // Use new scheduleName from config
            description: config.notes,
          }),
        });
      }

      // Update user assignments
      const existingUserAssignments = onCallSchedule?.userAssignments.map(ua => ua.userId) || [];
      const usersToAdd = config.selectedPersons.filter(userId => !existingUserAssignments.includes(userId));
      // const usersToRemove = existingUserAssignments.filter(userId => !config.selectedPersons.includes(userId)); // Deletion not requested

      for (const userId of usersToAdd) {
        await fetch(`/api/oncall/schedules/${currentScheduleId}/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ userId }),
        });
      }

      // Update team assignments
      const existingTeamAssignments = onCallSchedule?.teamAssignments.map(ta => ta.teamId) || [];
      const teamsToAdd = config.selectedTeams.filter(teamId => !existingTeamAssignments.includes(teamId));
      // const teamsToRemove = existingTeamAssignments.filter(teamId => !config.selectedTeams.includes(teamId)); // Deletion not requested

      for (const teamId of teamsToAdd) {
        await fetch(`/api/oncall/schedules/${currentScheduleId}/teams`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ teamId }),
        });
      }
      
      // Refetch data to update UI
      await fetchOnCallData();
      
      alert('On-call configuration updated successfully!');
    } catch (error) {
      console.error('Error updating on-call config:', error);
      alert('Failed to update on-call configuration. Please try again.');
    } finally {
      setSaving(false);
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
              {onCallSchedule && (
              <Badge variant="secondary" className="ml-2">
                <Clock className="h-3 w-3 mr-1" />
                Updated {currentOnCall.lastUpdated}
              </Badge>
              )}
            </CardTitle>
            <p className="text-sm text-gray-600">Who's currently handling alerts and incidents</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {loading ? (
              <div className="flex justify-center items-center h-48">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : (
              onCallSchedule ? (
            <OnCallStatusTabs 
              persons={currentOnCall.persons} 
              teams={currentOnCall.teams} 
              notes={currentOnCall.notes}
            />
              ) : (
                <div className="text-center py-12">
                  <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No On-Call Schedule Found</h4>
                  <p className="text-gray-600 mb-4">Please configure an on-call schedule below.</p>
                  {/* Removed Create Default Schedule button */}
                </div>
              )
            )}
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
              {/* Schedule Name Input */}
              <div className="space-y-4">
                <Label htmlFor="scheduleName" className="text-base font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-600" />
                  On-Call Schedule Name
                </Label>
                <Input
                  id="scheduleName"
                  placeholder="e.g., Primary On-Call, Weekend Support"
                  value={config.scheduleName}
                  onChange={(e) => setConfig(prev => ({ ...prev, scheduleName: e.target.value }))}
                  disabled={loading || saving}
                />
                <p className="text-xs text-gray-500">A descriptive name for this on-call schedule</p>
              </div>

              {/* Team Selection */}
              <div className="space-y-4">
                <Label className="text-base font-medium flex items-center gap-2">
                  <Users className="h-4 w-4 text-purple-600" />
                  Select Teams
                </Label>
                <Select onValueChange={(value) => addTeam(value)} disabled={loading || saving}>
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
                            <span className="text-xs text-gray-500">{team.description}</span>
                          </div>
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
                <Select onValueChange={(value) => addPerson(value)} disabled={loading || saving}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose individual engineers for on-call" />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePersons.map((person) => (
                      <SelectItem key={person.id} value={person.id} disabled={config.selectedPersons.includes(person.id)}>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
                            {person.fullName.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-medium">{person.fullName}</span>
                            <span className="text-xs text-gray-500">{person.role || 'Member'} • {person.email}</span>
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
                            {person.fullName}
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
                  disabled={loading || saving}
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
                    disabled={loading || saving}
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
                      scheduleName: '',
                      selectedPersons: [],
                      selectedTeams: [],
                      notes: '',
                      fallbackToAdmin: true
                    })
                  }}
                  disabled={loading || saving}
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
                      {onCallSchedule ? "Update On-Call Assignment" : "Create On-Call Assignment"}
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