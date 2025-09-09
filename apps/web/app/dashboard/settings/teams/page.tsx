"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { MoreHorizontal, Users, Shield, Plus, UserPlus, Edit, Trash2, Info, MoreVertical, X, Search, ChevronDown, ChevronUp } from "lucide-react";
import { Command, CommandInput, CommandItem, CommandList, CommandEmpty } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// Types
interface Team {
  id: string;
  name: string;
  memberCount: number;
  description?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  teams: string[];
  role: string;
  twoFA: boolean;
  status: 'active' | 'pending' | 'inactive';
  joinedAt: Date;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isCustom: boolean;
}

// Available permissions for roles
const availablePermissions = [
  "full_access",
  "billing",
  "reporting", 
  "team_management",
  "monitoring",
  "incident_management",
  "api_access",
  "user_management",
  "security_settings",
  "integrations",
  "notifications",
  "analytics",
  "backup_restore",
  "audit_logs",
  "custom_scripts"
];

interface NotificationSettings {
  teamNotifications: boolean;
  autoAssignNewMembers: boolean;
  require2FA: boolean;
  maxTeamsPerOrg: number;
  maxMembersPerTeam: number;
}

// Demo Data
const initialTeams: Team[] = [
  {
    id: "1",
    name: "Engineering Team",
    memberCount: 8,
    description: "Core development and engineering team",
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-02-20'),
  },
  {
    id: "2", 
    name: "Design Team",
    memberCount: 4,
    description: "UI/UX and product design team",
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-15'),
  },
  {
    id: "3",
    name: "Marketing Team", 
    memberCount: 6,
    description: "Marketing and growth team",
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-02-18'),
  }
];

const initialMembers: Member[] = [
  {
    id: "1",
    name: "Atul Graphic",
    email: "atul.fzdlko2001@gmail.com",
    phone: "+91 63061 28371",
    teams: ["Engineering Team"],
    role: "Responder",
    twoFA: true,
    status: 'active',
    joinedAt: new Date('2024-01-16'),
  },
  {
    id: "2", 
    name: "Atul2002 Maurya",
    email: "atul.fzdlko2002@gmail.com",
    phone: "+91 98765 43210",
    teams: ["Engineering Team", "Design Team"],
    role: "Team Lead",
    twoFA: false,
    status: 'active',
    joinedAt: new Date('2024-01-18'),
  },
  {
    id: "3",
    name: "Taylor Bell", 
    email: "atul.ddd1002@gmail.com",
    phone: "+91 87654 32109",
    teams: ["Engineering Team"],
    role: "Admin",
    twoFA: true,
    status: 'active',
    joinedAt: new Date('2024-01-20'),
  },
  {
    id: "4",
    name: "Sarah Johnson",
    email: "sarah.johnson@example.com", 
    phone: "+91 76543 21098",
    teams: ["Design Team"],
    role: "Responder",
    twoFA: false,
    status: 'active',
    joinedAt: new Date('2024-02-02'),
  },
  {
    id: "5",
    name: "Mike Chen",
    email: "mike.chen@example.com",
    phone: "+91 65432 10987", 
    teams: ["Marketing Team"],
    role: "Member",
    twoFA: true,
    status: 'pending',
    joinedAt: new Date('2024-02-10'),
  },
  {
    id: "6",
    name: "Lisa Wang",
    email: "lisa.wang@example.com",
    phone: "+91 54321 09876",
    teams: ["Marketing Team", "Design Team"],
    role: "Team Lead", 
    twoFA: true,
    status: 'active',
    joinedAt: new Date('2024-01-25'),
  },
];

const initialRoles: Role[] = [
  {
    id: "1",
    name: "Admin",
    description: "Can access reporting. Can change billing, dashboards, global API tokens, heartbeats, incidents, integrations, live tail, monitors, on-call calendars, policies, severities, sources, status pages, team members, teams, and the organization.",
    permissions: ["full_access", "billing", "reporting", "team_management"],
    isCustom: false,
  },
  {
    id: "2", 
    name: "Billing Admin",
    description: "Can access reporting and the organization. Can change billing.",
    permissions: ["reporting", "billing"],
    isCustom: false,
  },
  {
    id: "3",
    name: "Team Lead",
    description: "Can access billing, global API tokens, reporting, teams, and the organization. Can change dashboards, heartbeats, incidents, integrations, live tail, monitors, on-call calendars, policies, severities, sources, and status pages.",
    permissions: ["billing", "reporting", "team_management", "monitoring"],
    isCustom: false,
  },
  {
    id: "4",
    name: "Responder", 
    description: "Can access billing, reporting, team members, teams, and the organization. Can change dashboards, heartbeats, incidents, integrations, live tail, monitors, on-call calendars, policies, severities, sources, and status pages.",
    permissions: ["billing", "reporting", "monitoring"],
    isCustom: false,
  },
  {
    id: "5",
    name: "Member",
    description: "Can access billing, reporting, team members, teams, and the organization. Can change dashboards, live tail, and sources.",
    permissions: ["billing", "reporting", "basic_access"],
    isCustom: false,
  },
];

const initialSettings: NotificationSettings = {
  teamNotifications: true,
  autoAssignNewMembers: false,
  require2FA: false,
  maxTeamsPerOrg: 10,
  maxMembersPerTeam: 50,
};

export default function TeamsPage() {
  const [activeTab, setActiveTab] = useState("teams");
  const [teams, setTeams] = useState<Team[]>(initialTeams);
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const [settings, setSettings] = useState<NotificationSettings>(initialSettings);

  // Modal states
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isAddMemberToTeamOpen, setIsAddMemberToTeamOpen] = useState(false);

  // Editing states
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);

  // Form states
  const [newTeam, setNewTeam] = useState({ name: "", description: "" });
  const [newMember, setNewMember] = useState({ name: "", email: "", phone: "", role: "", team: "" });
  const [newRole, setNewRole] = useState({ name: "", description: "", permissions: [] as string[] });

  // Team expansion and member selection
  const [expandedTeams, setExpandedTeams] = useState<string[]>([]);
  const [selectedTeamForMembers, setSelectedTeamForMembers] = useState<Team | null>(null);
  const [selectedMembersForTeam, setSelectedMembersForTeam] = useState<Member[]>([]);
  const [memberSearchOpen, setMemberSearchOpen] = useState(false);
  const [memberSearch, setMemberSearch] = useState("");
  const [rolePermissionOpen, setRolePermissionOpen] = useState(false);
  const [rolePermissionSearch, setRolePermissionSearch] = useState("");

  // Utility functions
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const generateId = () => Math.random().toString(36).slice(2, 11);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    // In a real app, you'd use a proper toast library
    console.log(`${type.toUpperCase()}: ${message}`);
  };

  // Available members for team assignment (not already in the selected team)
  const availableMembersForTeam = useMemo(() => {
    if (!selectedTeamForMembers) return [];
    return members.filter(member => 
      !member.teams.includes(selectedTeamForMembers.name) &&
      (memberSearch === "" || 
       member.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
       member.email.toLowerCase().includes(memberSearch.toLowerCase()))
    );
  }, [members, selectedTeamForMembers, memberSearch]);

  // Team management functions
  const toggleTeamExpand = (teamName: string) => {
    setExpandedTeams(prev =>
      prev.includes(teamName) 
        ? prev.filter(t => t !== teamName)
        : [...prev, teamName]
    );
  };

  const openCreateTeam = () => {
    setEditingTeamId(null);
    setNewTeam({ name: "", description: "" });
    setIsTeamModalOpen(true);
  };

  const openEditTeam = (team: Team) => {
    setEditingTeamId(team.id);
    setNewTeam({ name: team.name, description: team.description || "" });
    setIsTeamModalOpen(true);
  };

  const handleSaveTeam = () => {
    // Form validation
    if (!newTeam.name.trim()) {
      showToast("Team name is required", 'error');
      return;
    }
    
    // Check if team name already exists
    const existingTeam = teams.find(t => 
      t.name.toLowerCase() === newTeam.name.trim().toLowerCase() && 
      t.id !== editingTeamId
    );
    
    if (existingTeam) {
      showToast("A team with this name already exists", 'error');
      return;
    }
    
    // Validate team name length
    if (newTeam.name.trim().length < 2) {
      showToast("Team name must be at least 2 characters long", 'error');
      return;
    }
    
    if (newTeam.name.trim().length > 50) {
      showToast("Team name must be less than 50 characters", 'error');
      return;
    }

    if (editingTeamId) {
      const oldTeam = teams.find(t => t.id === editingTeamId);
      setTeams(prev => prev.map(t => 
        t.id === editingTeamId 
          ? { ...t, name: newTeam.name, description: newTeam.description, updatedAt: new Date() }
          : t
      ));

      if (oldTeam && oldTeam.name !== newTeam.name) {
        setMembers(prev => prev.map(m => ({
          ...m,
          teams: m.teams.map(tn => tn === oldTeam.name ? newTeam.name : tn)
        })));
      }

      showToast("Team updated successfully!");
    } else {
      const team: Team = {
        id: generateId(),
        name: newTeam.name,
        description: newTeam.description,
        memberCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setTeams(prev => [...prev, team]);
      showToast("Team created successfully!");
    }

    setNewTeam({ name: "", description: "" });
    setEditingTeamId(null);
    setIsTeamModalOpen(false);
  };

  const handleDeleteTeam = (teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    if (!team) return;

    setTeams(prev => prev.filter(t => t.id !== teamId));
    setMembers(prev => prev.map(m => ({
      ...m,
      teams: m.teams.filter(tn => tn !== team.name)
    })));
    showToast("Team deleted successfully!");

    if (editingTeamId === teamId) {
      setEditingTeamId(null);
      setIsTeamModalOpen(false);
      setNewTeam({ name: "", description: "" });
    }
  };

  // Member management functions
  const openCreateMember = () => {
    setEditingMemberId(null);
    setNewMember({ name: "", email: "", phone: "", role: "", team: "" });
    setIsMemberModalOpen(true);
  };

  const openEditMember = (member: Member) => {
    setEditingMemberId(member.id);
    setNewMember({
      name: member.name,
      email: member.email,
      phone: member.phone === "Not provided" ? "" : member.phone,
      role: member.role,
      team: member.teams[0] || ""
    });
    setIsMemberModalOpen(true);
  };

  const handleSaveMember = () => {
    // Form validation
    if (!newMember.name.trim()) {
      showToast("Full name is required", 'error');
      return;
    }
    
    if (!newMember.email.trim()) {
      showToast("Email address is required", 'error');
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newMember.email.trim())) {
      showToast("Please enter a valid email address", 'error');
      return;
    }
    
    if (!newMember.role) {
      showToast("Please select a role", 'error');
      return;
    }
    
    if (!newMember.team) {
      showToast("Please select a team", 'error');
      return;
    }
    
    // Phone validation (optional but if provided, should be valid)
    if (newMember.phone.trim() && !/^[\+]?[0-9\s\-\(\)]{10,}$/.test(newMember.phone.trim())) {
      showToast("Please enter a valid phone number", 'error');
      return;
    }

    if (editingMemberId) {
      const oldMember = members.find(m => m.id === editingMemberId);
      setMembers(prev => prev.map(m => 
        m.id === editingMemberId 
          ? {
              ...m,
              name: newMember.name,
              email: newMember.email,
              phone: newMember.phone || "Not provided",
              teams: [newMember.team],
              role: newMember.role,
            }
          : m
      ));

      // Update team counts if team changed
      if (oldMember && oldMember.teams[0] !== newMember.team) {
        updateTeamCounts();
      }

      showToast("Member updated successfully!");
    } else {
      const member: Member = {
        id: generateId(),
        name: newMember.name,
        email: newMember.email,
        phone: newMember.phone || "Not provided",
        teams: [newMember.team],
        role: newMember.role,
        twoFA: false,
        status: 'pending',
        joinedAt: new Date(),
      };

      setMembers(prev => [...prev, member]);
      updateTeamCounts();
      showToast("Member invited successfully!");
    }

    setNewMember({ name: "", email: "", phone: "", role: "", team: "" });
    setEditingMemberId(null);
    setIsMemberModalOpen(false);
  };

  const handleDeleteMember = (memberId: string) => {
    setMembers(prev => prev.filter(m => m.id !== memberId));
    updateTeamCounts();
    showToast("Member removed successfully!");

    if (editingMemberId === memberId) {
      setEditingMemberId(null);
      setIsMemberModalOpen(false);
      setNewMember({ name: "", email: "", phone: "", role: "", team: "" });
    }
  };

  // Role management functions
  const openCreateRole = () => {
    setEditingRoleId(null);
    setNewRole({ name: "", description: "", permissions: [] });
    setIsRoleModalOpen(true);
  };

  const openEditRole = (role: Role) => {
    setEditingRoleId(role.id);
    setNewRole({ name: role.name, description: role.description, permissions: role.permissions });
    setIsRoleModalOpen(true);
  };

  const handleSaveRole = () => {
    // Form validation
    if (!newRole.name.trim()) {
      showToast("Role name is required", 'error');
      return;
    }
    
    if (!newRole.description.trim()) {
      showToast("Role description is required", 'error');
      return;
    }

    if (newRole.permissions.length === 0) {
      showToast("Please select at least one permission", 'error');
      return;
    }
    
    // Check if role name already exists
    const existingRole = roles.find(r => 
      r.id !== editingRoleId && 
      r.name.toLowerCase() === newRole.name.trim().toLowerCase()
    );
    
    if (existingRole) {
      showToast("A role with this name already exists", 'error');
      return;
    }
    
    // Validate role name length
    if (newRole.name.trim().length < 2) {
      showToast("Role name must be at least 2 characters long", 'error');
      return;
    }
    
    if (newRole.name.trim().length > 30) {
      showToast("Role name must be less than 30 characters", 'error');
      return;
    }
    
    

    if (editingRoleId) {
      const oldRole = roles.find(r => r.id === editingRoleId);
      setRoles(prev => prev.map(r => 
        r.id === editingRoleId 
          ? { ...r, name: newRole.name, description: newRole.description, permissions: newRole.permissions }
          : r
      ));

      if (oldRole && oldRole.name !== newRole.name) {
        setMembers(prev => prev.map(m => 
          m.role === oldRole.name ? { ...m, role: newRole.name } : m
        ));
      }

      showToast("Role updated successfully!");
    } else {
      const role: Role = {
        id: generateId(),
        name: newRole.name,
        description: newRole.description,
        permissions: newRole.permissions,
        isCustom: true,
      };
      setRoles(prev => [...prev, role]);
      showToast("Role created successfully!");
    }

    setNewRole({ name: "", description: "", permissions: [] });
    setEditingRoleId(null);
    setIsRoleModalOpen(false);
  };

  const handleDeleteRole = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    if (!role) return;

    setRoles(prev => prev.filter(r => r.id !== roleId));
    setMembers(prev => prev.map(m => 
      m.role === role.name ? { ...m, role: "Member" } : m
    ));
    showToast("Role deleted successfully!");

    if (editingRoleId === roleId) {
      setEditingRoleId(null);
      setIsRoleModalOpen(false);
      setNewRole({ name: "", description: "", permissions: [] });
    }
  };

  // Team member assignment functions
  const openAddMemberToTeam = (team: Team) => {
    setSelectedTeamForMembers(team);
    setSelectedMembersForTeam([]);
    setMemberSearch("");
    setIsAddMemberToTeamOpen(true);
  };

  const handleSelectMemberForTeam = (member: Member) => {
    if (!selectedMembersForTeam.find(m => m.id === member.id)) {
      setSelectedMembersForTeam(prev => [...prev, member]);
    }
    setMemberSearch("");
    setMemberSearchOpen(false);
  };

  const handleRemoveSelectedMember = (memberId: string) => {
    setSelectedMembersForTeam(prev => prev.filter(m => m.id !== memberId));
  };

  // Role permission management functions
  const handleAddPermission = (permission: string) => {
    if (!newRole.permissions.includes(permission)) {
      setNewRole(prev => ({ ...prev, permissions: [...prev.permissions, permission] }));
    }
    setRolePermissionOpen(false);
    setRolePermissionSearch("");
  };

  const handleRemovePermission = (permission: string) => {
    setNewRole(prev => ({ ...prev, permissions: prev.permissions.filter(p => p !== permission) }));
  };

  const handleAddMembersToTeam = () => {
    if (!selectedTeamForMembers || selectedMembersForTeam.length === 0) return;

    setMembers(prev => prev.map(m => 
      selectedMembersForTeam.find(sm => sm.id === m.id)
        ? { ...m, teams: Array.from(new Set([...m.teams, selectedTeamForMembers.name])) }
        : m
    ));

    updateTeamCounts();
    showToast(`Added ${selectedMembersForTeam.length} member(s) to ${selectedTeamForMembers.name}`);
    
    setSelectedMembersForTeam([]);
    setSelectedTeamForMembers(null);
    setIsAddMemberToTeamOpen(false);
  };

  const updateTeamCounts = () => {
    setTeams(prev => prev.map(team => ({
      ...team,
      memberCount: members.filter(m => m.teams.includes(team.name)).length
    })));
  };

  // Update team counts when members change
  React.useEffect(() => {
    updateTeamCounts();
  }, [members]);

  const getStatusColor = (status: Member['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4 sm:p-6 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Teams</h1>
            <p className="text-gray-600 mt-1">Manage your organization's teams, members, and roles</p>
          </div>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            {activeTab === "teams" && (
              <Button onClick={openCreateTeam} className="bg-gray-900 hover:bg-gray-800 w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Create Team
              </Button>
            )}
            {activeTab === "members" && (
              <Button onClick={openCreateMember} className="bg-gray-900 hover:bg-gray-800 w-full sm:w-auto">
                <UserPlus className="h-4 w-4 mr-2" />
                Invite Member
              </Button>
            )}
            {activeTab === "roles" && (
              <Button onClick={openCreateRole} className="bg-gray-900 hover:bg-gray-800 w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Create Role
              </Button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 mb-8">
            <TabsTrigger value="teams" className="text-xs sm:text-sm">Teams ({teams.length})</TabsTrigger>
            <TabsTrigger value="members" className="text-xs sm:text-sm">Members ({members.length})</TabsTrigger>
            <TabsTrigger value="roles" className="text-xs sm:text-sm">Roles ({roles.length})</TabsTrigger>
            <TabsTrigger value="settings" className="text-xs sm:text-sm">Settings</TabsTrigger>
          </TabsList>

          {/* Teams Tab */}
          <TabsContent value="teams" className="space-y-4">
            {teams.length === 0 ? (
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
                          onClick={() => toggleTeamExpand(team.name)}
                        >
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-blue-500 text-white">
                              <Users className="h-6 w-6" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-semibold text-gray-900">{team.name}</h3>
                              {expandedTeams.includes(team.name) ? (
                                <ChevronUp className="h-4 w-4 text-gray-500" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-gray-500" />
                              )}
                            </div>
                            <p className="text-gray-600">{team.memberCount} members</p>
                            {team.description && (
                              <p className="text-sm text-gray-500 mt-1">{team.description}</p>
                            )}
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
                  {expandedTeams.includes(team.name) && (
                    <div className="ml-16 mt-4 space-y-2 border-l-2 border-gray-200 pl-6">
                      {members
                        .filter(m => m.teams.includes(team.name))
                        .map((member) => (
                          <Card key={member.id} className="bg-white border-l-4 border-l-blue-500">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <Avatar className="h-8 w-8">
                                    <AvatarFallback className="bg-orange-500 text-white text-sm">
                                      {getInitials(member.name)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium text-gray-900">{member.name}</span>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Badge variant="secondary" className={getStatusColor(member.status)}>
                                            {member.status}
                                          </Badge>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          {member.status === 'active' ? 'Member has accepted invitation and is active' : 
                                           member.status === 'pending' ? 'Member has not accepted invitation yet' : 
                                           'Member is inactive'}
                                        </TooltipContent>
                                      </Tooltip>
                                    </div>
                                    <div className="text-sm text-gray-600">{member.email}</div>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-4 text-sm text-gray-600">
                                  <span>{member.role}</span>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => openEditMember(member)}>
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit Member
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => handleDeleteMember(member.id)}
                                        className="text-red-600"
                                      >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Remove Member
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      {members.filter(m => m.teams.includes(team.name)).length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>No members in this team yet</p>
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
            <Card>
              <div className="hidden sm:grid grid-cols-6 gap-4 p-4 border-b text-sm font-medium text-gray-500 bg-gray-50">
                <div>Member</div>
                <div>Phone</div>
                <div>Teams</div>
                <div>Role</div>
                <div>Status</div>
                <div></div>
              </div>
              {members.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No members yet</h3>
                  <p className="text-gray-600 mb-4">Invite your first member to get started</p>
                  <Button onClick={openCreateMember}>Invite Member</Button>
                </div>
              ) : (
                members.map((member) => (
                  <div key={member.id} className="block sm:hidden p-4 border-b last:border-b-0 hover:bg-gray-50">
                    {/* Mobile Layout */}
                    <div className="flex items-start space-x-3 mb-3">
                      <Avatar className="h-10 w-10 flex-shrink-0">
                        <AvatarFallback className="bg-orange-500 text-white text-sm">
                          {getInitials(member.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 mb-1">{member.name}</div>
                        <div className="text-sm text-gray-500 mb-2">{member.email}</div>
                        <div className="text-sm text-gray-700 mb-2">{member.phone}</div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm text-gray-600">Role:</span>
                          <span className="text-sm font-medium text-gray-900">{member.role}</span>
                        </div>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-sm text-gray-600">Status:</span>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge className={getStatusColor(member.status)}>
                                {member.status}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              {member.status === 'active' ? 'Member has accepted invitation and is active' : 
                               member.status === 'pending' ? 'Member has not accepted invitation yet' : 
                               'Member is inactive'}
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {member.teams.map((teamName, idx) => (
                            <Badge key={idx} variant="secondary" className="bg-gray-100 text-xs">
                              <Users className="h-3 w-3 mr-1" />
                              {teamName}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditMember(member)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Member
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteMember(member.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove Member
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                )).concat(
                  // Desktop Layout
                  members.map((member) => (
                    <div key={`desktop-${member.id}`} className="hidden sm:grid grid-cols-6 gap-4 p-4 border-b last:border-b-0 hover:bg-gray-50">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-orange-500 text-white text-sm">
                            {getInitials(member.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-gray-900">{member.name}</div>
                          <div className="text-sm text-gray-500">{member.email}</div>
                        </div>
                      </div>
                      <div className="flex items-center text-gray-700">{member.phone}</div>
                      <div className="flex items-center">
                        <div className="flex flex-wrap gap-1">
                          {member.teams.map((teamName, idx) => (
                            <Badge key={idx} variant="secondary" className="bg-gray-100">
                              <Users className="h-3 w-3 mr-1" />
                              {teamName}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center text-gray-700">{member.role}</div>
                      <div className="flex items-center">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge className={getStatusColor(member.status)}>
                              {member.status}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            {member.status === 'active' ? 'Member has accepted invitation and is active' : 
                             member.status === 'pending' ? 'Member has not accepted invitation yet' : 
                             'Member is inactive'}
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <div className="flex items-center justify-end">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditMember(member)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Member
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteMember(member.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove Member
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))
                )
              )}
            </Card>
          </TabsContent>

          {/* Roles & Permissions Tab */}
          <TabsContent value="roles" className="space-y-4">
            {roles.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No custom roles yet</h3>
                  <p className="text-gray-600 mb-4">Create custom roles to manage permissions</p>
                  <Button onClick={openCreateRole}>Create Role</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Roles</h3>
                {roles.map((role) => (
                  <Card key={role.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full flex-shrink-0">
                            <Shield className="h-5 w-5 text-gray-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <h4 className="text-lg font-semibold text-gray-900">{role.name}</h4>
                              {role.isCustom && (
                                <Badge variant="outline" className="text-xs">Custom</Badge>
                              )}
                            </div>
                            <p className="text-gray-600 text-sm leading-relaxed mb-3">{role.description}</p>
                            <div className="flex flex-wrap gap-1">
                              {role.permissions.map((permission) => (
                                <Badge key={permission} variant="secondary" className="text-xs">
                                  {permission.replace('_', ' ')}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-end sm:justify-start">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="w-full sm:w-auto">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEditRole(role)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Role
                              </DropdownMenuItem>
                              {role.isCustom && (
                                <DropdownMenuItem
                                  onClick={() => handleDeleteRole(role.id)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete Role
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="opacity-60">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-gray-900">General Settings</h3>
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                    Upcoming
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">Configure team management settings (Coming Soon)</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-gray-500 cursor-not-allowed">Enable team notifications</Label>
                    <p className="text-sm text-gray-400">Receive notifications about team activities</p>
                  </div>
                  <Switch disabled className="opacity-50" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-gray-500 cursor-not-allowed">Auto-assign new members</Label>
                    <p className="text-sm text-gray-400">Automatically assign new members to default team</p>
                  </div>
                  <Switch disabled className="opacity-50" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-gray-500 cursor-not-allowed">Require 2FA for all members</Label>
                    <p className="text-sm text-gray-400">Enforce two-factor authentication for team security</p>
                  </div>
                  <Switch disabled className="opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card className="opacity-60">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-gray-900">Team Limits</h3>
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                    Upcoming
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">Set organizational limits (Coming Soon)</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="maxTeams" className="text-gray-500 cursor-not-allowed">Maximum teams per organization</Label>
                  <Input
                    id="maxTeams"
                    type="number"
                    disabled
                    className="mt-2 opacity-50 cursor-not-allowed"
                  />
                </div>
                <div>
                  <Label htmlFor="maxMembers" className="text-gray-500 cursor-not-allowed">Maximum members per team</Label>
                  <Input
                    id="maxMembers"
                    type="number"
                    disabled
                    className="mt-2 opacity-50 cursor-not-allowed"
                  />
                </div>
                <Button disabled className="w-full mt-4 opacity-50 cursor-not-allowed">Save Settings</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Add Members to Team Modal */}
        <Dialog open={isAddMemberToTeamOpen} onOpenChange={setIsAddMemberToTeamOpen}>
          <DialogContent className="w-[95vw] max-w-[500px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Members to {selectedTeamForMembers?.name}</DialogTitle>
              <p className="text-sm text-gray-600">Select members to add to this team</p>
            </DialogHeader>

            <div className="space-y-4">
              {/* Selected Members Display */}
              {selectedMembersForTeam.length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Selected Members ({selectedMembersForTeam.length})
                  </Label>
                  <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg">
                    {selectedMembersForTeam.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border shadow-sm"
                      >
                        <Avatar className="h-5 w-5">
                          <AvatarFallback className="bg-orange-500 text-white text-xs">
                            {getInitials(member.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{member.name}</span>
                        <button
                          onClick={() => handleRemoveSelectedMember(member.id)}
                          className="text-gray-500 hover:text-red-500 ml-1"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Member Selection */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Available Members
                </Label>
                <Popover open={memberSearchOpen} onOpenChange={setMemberSearchOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                      disabled={availableMembersForTeam.length === 0}
                    >
                      <span className="flex items-center gap-2">
                        <Search className="h-4 w-4" />
                        {availableMembersForTeam.length === 0 ? 'All members are already in this team' : 'Search and select members...'}
                      </span>
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[460px] p-0" align="start">
                    <Command>
                      <CommandInput
                        placeholder="Search members..."
                        value={memberSearch}
                        onValueChange={setMemberSearch}
                      />
                      <CommandList>
                        {availableMembersForTeam.length === 0 && (
                          <CommandEmpty>No available members found.</CommandEmpty>
                        )}
                        {availableMembersForTeam.map((member) => (
                          <CommandItem
                            key={member.id}
                            onSelect={() => handleSelectMemberForTeam(member)}
                            className="flex items-center gap-3 p-3"
                          >
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="bg-orange-500 text-white text-xs">
                                {getInitials(member.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="font-medium text-sm">{member.name}</div>
                              <div className="text-xs text-gray-500">{member.email}</div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Badge variant="outline" className="text-xs">
                                {member.role}
                              </Badge>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedMembersForTeam([]);
                  setSelectedTeamForMembers(null);
                  setIsAddMemberToTeamOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddMembersToTeam}
                disabled={selectedMembersForTeam.length === 0}
              >
                Add {selectedMembersForTeam.length} Member{selectedMembersForTeam.length !== 1 ? 's' : ''}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Team Modal (Create / Edit) */}
                <Dialog open={isTeamModalOpen} onOpenChange={(open) => {
          setIsTeamModalOpen(open);
                  if (!open) {
          setEditingTeamId(null);
          setNewTeam({ name: "", description: "" });
        }
        }}>
          <DialogContent className="w-[95vw] max-w-[425px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingTeamId ? "Edit Team" : "Create New Team"}</DialogTitle>
              <p className="text-sm text-gray-600">
                {editingTeamId ? "Update team information" : "Create a new team for your organization"}
              </p>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="teamName">Team Name *</Label>
                <Input
                  id="teamName"
                  value={newTeam.name}
                  onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                  placeholder="e.g., Engineering Team"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="teamDescription">Description</Label>
                <Textarea
                  id="teamDescription"
                  value={newTeam.description}
                  onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
                  placeholder="Brief description of the team's purpose"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsTeamModalOpen(false);
                  setEditingTeamId(null);
                  setNewTeam({ name: "", description: "" });
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveTeam}>
                {editingTeamId ? "Update Team" : "Create Team"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Member Modal (Create / Edit) */}
        <Dialog open={isMemberModalOpen} onOpenChange={(open) => {
          setIsMemberModalOpen(open);
          if (!open) {
            setEditingMemberId(null);
            setNewMember({ name: "", email: "", phone: "", role: "", team: "" });
          }
        }}>
          <DialogContent className="w-[95vw] max-w-[425px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingMemberId ? "Edit Member" : "Invite New Member"}</DialogTitle>
              <p className="text-sm text-gray-600">
                {editingMemberId ? "Update member information" : "Invite a new member to join your team"}
              </p>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="memberName">Full Name *</Label>
                <Input
                  id="memberName"
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="memberEmail">Email Address *</Label>
                <Input
                  id="memberEmail"
                  type="email"
                  value={newMember.email}
                  onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                  placeholder="john@company.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="memberPhone">Phone Number</Label>
                <Input
                  id="memberPhone"
                  value={newMember.phone}
                  onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="memberRole">Role *</Label>
                <Select value={newMember.role} onValueChange={(value) => setNewMember({ ...newMember, role: value || "" })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.name}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="memberTeam">Team *</Label>
                <Select value={newMember.team} onValueChange={(value) => setNewMember({ ...newMember, team: value || "" })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a team" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.name}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsMemberModalOpen(false);
                  setEditingMemberId(null);
                  setNewMember({ name: "", email: "", phone: "", role: "", team: "" });
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveMember}>
                {editingMemberId ? "Update Member" : "Send Invitation"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Role Modal (Create / Edit) */}
        <Dialog open={isRoleModalOpen} onOpenChange={(open) => {
          setIsRoleModalOpen(open);
                  if (!open) {
          setEditingRoleId(null);
          setNewRole({ name: "", description: "", permissions: [] });
        }
        }}>
          <DialogContent className="w-[95vw] max-w-[500px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingRoleId ? "Edit Role" : "Create New Role"}</DialogTitle>
              <p className="text-sm text-gray-600">
                {editingRoleId ? "Update role information" : "Define a new role with specific permissions"}
              </p>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="roleName">Role Name *</Label>
                <Input
                  id="roleName"
                  value={newRole.name}
                  onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                  placeholder="e.g., Developer"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="roleDescription">Description *</Label>
                <Textarea
                  id="roleDescription"
                  value={newRole.description}
                  onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                  placeholder="Describe what this role can do..."
                  rows={4}
                />
              </div>
              
              {/* Permissions Selection */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Permissions *</Label>
                
                {/* Selected Permissions Display */}
                {newRole.permissions.length > 0 ? (
                  <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg">
                    {newRole.permissions.map((permission) => (
                      <div
                        key={permission}
                        className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border shadow-sm"
                      >
                        <span className="text-sm font-medium">{permission.replace('_', ' ')}</span>
                        <button
                          onClick={() => handleRemovePermission(permission)}
                          className="text-gray-500 hover:text-red-500 ml-1"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      ⚠️ Please select at least one permission before creating the role
                    </p>
                  </div>
                )}

                {/* Permission Selection Dropdown */}
                <Popover open={rolePermissionOpen} onOpenChange={setRolePermissionOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                    >
                      <span className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        {newRole.permissions.length > 0 ? `${newRole.permissions.length} permission(s) selected` : 'Select permissions...'}
                      </span>
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0" align="start">
                    <Command>
                      <CommandInput
                        placeholder="Search permissions..."
                        value={rolePermissionSearch}
                        onValueChange={setRolePermissionSearch}
                      />
                      <CommandList>
                        {availablePermissions
                          .filter(permission => !newRole.permissions.includes(permission))
                          .filter(permission => 
                            permission.toLowerCase().includes(rolePermissionSearch.toLowerCase())
                          )
                          .map((permission) => (
                            <CommandItem
                              key={permission}
                              onSelect={() => handleAddPermission(permission)}
                              className="flex items-center gap-3 p-3"
                            >
                              <div className="flex-1">
                                <div className="font-medium text-sm">{permission.replace('_', ' ')}</div>
                                <div className="text-xs text-gray-500">
                                  {permission === 'full_access' ? 'Complete system access' :
                                   permission === 'billing' ? 'Manage billing and subscriptions' :
                                   permission === 'reporting' ? 'Access to reports and analytics' :
                                   permission === 'team_management' ? 'Manage teams and members' :
                                   permission === 'monitoring' ? 'Access to monitoring tools' :
                                   permission === 'incident_management' ? 'Manage incidents and alerts' :
                                   permission === 'api_access' ? 'Access to API endpoints' :
                                   permission === 'user_management' ? 'Manage user accounts' :
                                   permission === 'security_settings' ? 'Configure security settings' :
                                   permission === 'integrations' ? 'Manage integrations' :
                                   permission === 'notifications' ? 'Configure notifications' :
                                   permission === 'analytics' ? 'Access to analytics dashboard' :
                                   permission === 'backup_restore' ? 'Backup and restore data' :
                                   permission === 'audit_logs' ? 'View audit logs' :
                                   permission === 'custom_scripts' ? 'Run custom scripts' : 'Custom permission'}
                                </div>
                              </div>
                            </CommandItem>
                          ))}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsRoleModalOpen(false);
                  setEditingRoleId(null);
                  setNewRole({ name: "", description: "", permissions: [] });
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSaveRole}
                disabled={newRole.permissions.length === 0}
                className={newRole.permissions.length === 0 ? "opacity-50 cursor-not-allowed" : ""}
              >
                {editingRoleId ? "Update Role" : "Create Role"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Footer */}
        <div className="mt-12 flex items-center justify-center text-gray-500 text-sm">
          <Info className="h-4 w-4 mr-2" />
          Need help? Contact us at{" "}
          <a href="mailto:hello@uptimematrix..com" className="text-blue-600 ml-1 hover:underline">
            atul.fzdlko2002@gmail.com
          </a>
        </div>
      </div>
    </div>
    </TooltipProvider>
  );
}