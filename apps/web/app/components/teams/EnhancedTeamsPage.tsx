'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
  Plus, 
  Users, 
  UserPlus, 
  Edit, 
  Trash2, 
  MoreVertical, 
  ChevronDown, 
  ChevronUp,
  Loader2,
  Crown,
  Shield
} from 'lucide-react';
import TeamMemberModal from './TeamMemberModal';
import InviteMemberModal from './InviteMemberModal';
import MemberManagementCard from './MemberManagementCard';
import { 
  getTeams, 
  createTeam, 
  updateTeam, 
  deleteTeam,
  getTeamMembers 
} from '@/app/all-actions/team-section/team/actions';

interface Team {
  id: string;
  name: string;
  description?: string;
  memberCount: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  members: TeamMember[];
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: string;
  roleId: string;
  isTeamLead: boolean;
  permissions: string[];
  status: 'active' | 'pending' | 'inactive';
  joinedAt: Date;
  userId: string;
}

export default function EnhancedTeamsPage() {
  const [activeTab, setActiveTab] = useState('teams');
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isInviteMemberModalOpen, setIsInviteMemberModalOpen] = useState(false);

  // Form and editing states
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [newTeam, setNewTeam] = useState({ name: '', description: '' });

  // UI states
  const [expandedTeams, setExpandedTeams] = useState<string[]>([]);

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getTeams();
      if (result.success) {
        setTeams(result.data);
      } else {
        setError(result.error || 'Failed to load teams');
      }
    } catch (err) {
      setError('Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  const loadTeamMembers = async (teamId: string) => {
    try {
      const result = await getTeamMembers(teamId);
      if (result.success) {
        setTeams(prev => prev.map(team => 
          team.id === teamId 
            ? { ...team, members: result.data }
            : team
        ));
      }
    } catch (err) {
      console.error('Failed to load team members:', err);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const toggleTeamExpand = (teamId: string) => {
    setExpandedTeams(prev => {
      const isExpanded = prev.includes(teamId);
      if (isExpanded) {
        return prev.filter(id => id !== teamId);
      } else {
        // Load members when expanding
        loadTeamMembers(teamId);
        return [...prev, teamId];
      }
    });
  };

  const openCreateTeam = () => {
    setEditingTeam(null);
    setNewTeam({ name: '', description: '' });
    setIsTeamModalOpen(true);
  };

  const openEditTeam = (team: Team) => {
    setEditingTeam(team);
    setNewTeam({ name: team.name, description: team.description || '' });
    setIsTeamModalOpen(true);
  };

  const handleSaveTeam = async () => {
    if (!newTeam.name.trim()) {
      setError('Team name is required');
      return;
    }

    setLoading(true);
    try {
      let result;
      if (editingTeam) {
        result = await updateTeam(editingTeam.id, newTeam);
      } else {
        result = await createTeam(newTeam);
      }

      if (result.success) {
        await loadTeams();
        setIsTeamModalOpen(false);
        setNewTeam({ name: '', description: '' });
        setEditingTeam(null);
      } else {
        setError(result.error || 'Failed to save team');
      }
    } catch (err) {
      setError('Failed to save team');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (!confirm('Are you sure you want to delete this team? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    try {
      const result = await deleteTeam(teamId);
      if (result.success) {
        await loadTeams();
      } else {
        setError(result.error || 'Failed to delete team');
      }
    } catch (err) {
      setError('Failed to delete team');
    } finally {
      setLoading(false);
    }
  };

  const openAddMemberToTeam = (team: Team) => {
    setSelectedTeam(team);
    setIsAddMemberModalOpen(true);
  };

  const openInviteMember = (team?: Team) => {
    setSelectedTeam(team || null);
    setIsInviteMemberModalOpen(true);
  };

  const handleMemberAdded = () => {
    loadTeams();
    if (selectedTeam) {
      loadTeamMembers(selectedTeam.id);
    }
  };

  const handleMemberUpdated = () => {
    loadTeams();
  };

  const handleMemberRemoved = () => {
    loadTeams();
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(date));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4 sm:p-6 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Teams</h1>
            <p className="text-gray-600 mt-1">Manage your organization's teams and members</p>
          </div>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            {activeTab === 'teams' && (
              <Button onClick={openCreateTeam} className="bg-gray-900 hover:bg-gray-800 w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Create Team
              </Button>
            )}
            <Button 
              onClick={() => openInviteMember()} 
              variant="outline" 
              className="w-full sm:w-auto"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Invite Member
            </Button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 text-red-600 bg-red-50 border border-red-200 rounded-md">
            {error}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setError(null)}
              className="ml-2 text-red-600 hover:text-red-700"
            >
              Dismiss
            </Button>
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 mb-8">
            <TabsTrigger value="teams" className="text-xs sm:text-sm">
              Teams ({teams.length})
            </TabsTrigger>
            <TabsTrigger value="members" className="text-xs sm:text-sm">
              All Members ({teams.reduce((sum, team) => sum + team.memberCount, 0)})
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-xs sm:text-sm">
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Teams Tab */}
          <TabsContent value="teams" className="space-y-4">
            {loading && teams.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : teams.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No teams yet</h3>
                  <p className="text-gray-600 mb-4">Create your first team to get started</p>
                  <Button onClick={openCreateTeam}>Create Team</Button>
                </CardContent>
              </Card>
            ) : (
              teams.map((team) => (
                <div key={team.id}>
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div 
                          className="flex items-center space-x-4 flex-1 cursor-pointer"
                          onClick={() => toggleTeamExpand(team.id)}
                        >
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-blue-500 text-white">
                              <Users className="h-6 w-6" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-semibold text-gray-900">{team.name}</h3>
                              {expandedTeams.includes(team.id) ? (
                                <ChevronUp className="h-4 w-4 text-gray-500" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-gray-500" />
                              )}
                            </div>
                            <p className="text-gray-600">{team.memberCount} members</p>
                            {team.description && (
                              <p className="text-sm text-gray-500 mt-1">{team.description}</p>
                            )}
                            <p className="text-xs text-gray-400 mt-1">
                              Created {formatDate(team.createdAt)} by {team.createdBy}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openAddMemberToTeam(team)}
                            className="w-full sm:w-auto"
                          >
                            <UserPlus className="h-4 w-4 mr-1" />
                            Add Member
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openInviteMember(team)}
                            className="w-full sm:w-auto"
                          >
                            <UserPlus className="h-4 w-4 mr-1" />
                            Invite
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="w-full sm:w-auto">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEditTeam(team)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Team
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteTeam(team.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Team
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Expanded Team Members */}
                  {expandedTeams.includes(team.id) && (
                    <div className="ml-4 mt-4 space-y-3 border-l-2 border-gray-200 pl-6">
                      <h4 className="font-medium text-gray-900 mb-3">Team Members</h4>
                      {team.members && team.members.length > 0 ? (
                        <div className="grid gap-3">
                          {team.members.map((member) => (
                            <MemberManagementCard
                              key={member.id}
                              member={member}
                              teamId={team.id}
                              canEdit={true} // TODO: Check permissions
                              canRemove={true} // TODO: Check permissions
                              onMemberUpdated={handleMemberUpdated}
                              onMemberRemoved={handleMemberRemoved}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6 text-gray-500">
                          <Users className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                          <p>No members in this team yet</p>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => openAddMemberToTeam(team)}
                            className="mt-2"
                          >
                            Add First Member
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </TabsContent>

          {/* Members Tab */}
          <TabsContent value="members" className="space-y-4">
            <div className="grid gap-4">
              {teams.flatMap(team => 
                team.members?.map(member => (
                  <MemberManagementCard
                    key={`${team.id}-${member.id}`}
                    member={member}
                    teamId={team.id}
                    canEdit={true}
                    canRemove={true}
                    onMemberUpdated={handleMemberUpdated}
                    onMemberRemoved={handleMemberRemoved}
                  />
                )) || []
              )}
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Team Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Team settings will be implemented here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Team Create/Edit Modal */}
        <Dialog open={isTeamModalOpen} onOpenChange={setIsTeamModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingTeam ? 'Edit Team' : 'Create New Team'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="team-name">Team Name</Label>
                <Input
                  id="team-name"
                  placeholder="Enter team name"
                  value={newTeam.name}
                  onChange={(e) => setNewTeam(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="team-description">Description</Label>
                <Textarea
                  id="team-description"
                  placeholder="Enter team description"
                  value={newTeam.description}
                  onChange={(e) => setNewTeam(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsTeamModalOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveTeam} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {editingTeam ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  editingTeam ? 'Update Team' : 'Create Team'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Member Modal */}
        <TeamMemberModal
          isOpen={isAddMemberModalOpen}
          onClose={() => setIsAddMemberModalOpen(false)}
          teamId={selectedTeam?.id || ''}
          teamName={selectedTeam?.name || ''}
          onMemberAdded={handleMemberAdded}
        />

        {/* Invite Member Modal */}
        <InviteMemberModal
          isOpen={isInviteMemberModalOpen}
          onClose={() => setIsInviteMemberModalOpen(false)}
          teamId={selectedTeam?.id}
          teamName={selectedTeam?.name}
          onMemberInvited={handleMemberAdded}
        />
      </div>
    </div>
  );
}
