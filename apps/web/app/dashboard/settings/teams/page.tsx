"use client";

import React, { useState, useMemo, useEffect } from "react";
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

// Import API actions
import { 
  getTeams, 
  createTeam, 
  updateTeam, 
  deleteTeam,
  getTeamMembers,
  addMemberToTeam,
  removeMemberFromTeam,
  updateTeamMember,
  getAvailableUsers
} from "@/app/all-actions/team-section/team/actions";
import { 
  inviteMember,
  getMembers,
  transferMember,
  deleteMemberFromOrganization
} from "@/app/all-actions/team-section/members/actions";
import { getRoles, createRoleAction, updateRoleAction, deleteRoleAction, assignRoleAction } from "@/app/all-actions/team-section/roles/actions";
import { useAppSelector } from "@/store";

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
  phone?: string;
  avatar?: string;
  teams: string[]; // Reverted to allow multiple teams
  role: string;
  twoFA: boolean;
  isVerified: boolean;
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
  "custom_scripts",
  // Organization Permissions
  "organization:create",
  "organization:select", // Though likely implicit for any user with organization access
  "organization:delete",
  "organization:manage_team",

  // Monitoring Permissions
  "monitor:create",
  "monitor:edit",
  "monitor:delete",

  // Escalation Policy Permissions
  "escalation_policy:create",
  "escalation_policy:edit",
  "escalation_policy:delete",

  // Integration Permissions
  "integration:create",
  "integration:edit",
  "integration:delete",

  // Status Page Permissions
  "status_page:create",
  "status_page:edit", // Assuming edit capability for existing status pages
  "status_page:delete", // Assuming delete capability for existing status pages

  // Team Management Permissions
  "team:create",
  "team:edit",
  "team:delete",
  "team:add_member",
  "team:remove_member",

  // Member Management Permissions
  "member:invite",
  "member:edit",

  // Role Management Permissions
  "role:create",
  "role:edit",
  "role:delete",
  "role:manage_permissions",
];

interface NotificationSettings {
  teamNotifications: boolean;
  autoAssignNewMembers: boolean;
  require2FA: boolean;
  maxTeamsPerOrg: number;
  maxMembersPerTeam: number;
}

const initialSettings: NotificationSettings = {
  teamNotifications: true,
  autoAssignNewMembers: false,
  require2FA: false,
  maxTeamsPerOrg: 10,
  maxMembersPerTeam: 50,
};

export default function TeamsPage() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("teams");
  const [teams, setTeams] = useState<Team[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>(initialSettings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
  const [newMember, setNewMember] = useState<{ name: string; email: string; phone?: string; role: string; team: string[] }>({ name: "", email: "", phone: "", role: "", team: [] });
  const [newRole, setNewRole] = useState({ name: "", description: "", permissions: [] as string[] });

  // Team expansion and member selection
  const [expandedTeams, setExpandedTeams] = useState<string[]>([]);
  const [selectedTeamForMembers, setSelectedTeamForMembers] = useState<Team | null>(null);
  const [selectedMembersForTeam, setSelectedMembersForTeam] = useState<Member[]>([]);
  const [memberSearchOpen, setMemberSearchOpen] = useState(false);
  const [memberSearch, setMemberSearch] = useState("");
  const [rolePermissionOpen, setRolePermissionOpen] = useState(false);
  const [rolePermissionSearch, setRolePermissionSearch] = useState("");
  const { currentOrganizationId } = useAppSelector(state => state.organization);

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

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load initial data
  useEffect(() => {
    if (!mounted) return;
    
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [teamsResult, membersResult, rolesResult] = await Promise.all([
          getTeams(),
          getMembers(currentOrganizationId!),
          getRoles()
        ]);
        
        if (teamsResult.success && teamsResult.data) {
          setTeams(teamsResult.data);
        } else {
          console.error('Failed to load teams:', teamsResult.error);
        }
        
        if (membersResult.success && membersResult.data) {
          console.log("All members fetched from backend (after initial load):", membersResult.data.members);
          setMembers(membersResult.data.members);
        } else {
          console.error('Failed to load members:', membersResult.error);
        }
        
        if (rolesResult.success && rolesResult.data) {
          setRoles(rolesResult.data);
        } else {
          console.error('Failed to load roles:', rolesResult.error);
        }
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load data. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [mounted]);

  // Available members for team assignment (not already in the selected team)
  const availableMembersForTeam = useMemo(() => {
    if (!selectedTeamForMembers) return [];
    return members.filter(member => 
      member.isVerified === true && // Ensure member is verified
      !member.teams.includes(selectedTeamForMembers.name) && // Check if member.team is null or undefined
      (memberSearch === "" || 
       member.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
       member.email.toLowerCase().includes(memberSearch.toLowerCase()))
    );
  }, [members, selectedTeamForMembers, memberSearch]);

  // console.log("Available members for team selection:", availableMembersForTeam);

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

  const handleSaveTeam = async () => {
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

    try {
    if (editingTeamId) {
        const result = await updateTeam(editingTeamId, {
          name: newTeam.name,
          description: newTeam.description
        });
        
        if (result.success && result.data) {
      setTeams(prev => prev.map(t => 
            t.id === editingTeamId ? result.data : t
          ));
      showToast("Team updated successfully!");
    } else {
          showToast(result.error || "Failed to update team", 'error');
          return;
        }
      } else {
        const result = await createTeam({
        name: newTeam.name,
          description: newTeam.description
        });
        
        if (result.success && result.data) {
          setTeams(prev => [...prev, result.data]);
      showToast("Team created successfully!");
        } else {
          showToast(result.error || "Failed to create team", 'error');
          return;
        }
    }

    setNewTeam({ name: "", description: "" });
    setEditingTeamId(null);
    setIsTeamModalOpen(false);
    } catch (error) {
      console.error('Error saving team:', error);
      showToast("An error occurred while saving the team", 'error');
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    if (!team) return;

    try {
      const result = await deleteTeam(teamId);
      
      if (result.success) {
    setTeams(prev => prev.filter(t => t.id !== teamId));
        // Refresh members to update their team associations
        const membersResult = await getMembers(currentOrganizationId!);
        console.log("Raw members data before setMembers (handleDeleteTeam):", membersResult.data);
        console.log("membersResult",membersResult);
        if (membersResult.success && membersResult.data) {
          setMembers(membersResult.data.members);
        }
    showToast("Team deleted successfully!");
      } else {
        showToast(result.error || "Failed to delete team", 'error');
        return;
      }
    } catch (error) {
      console.error('Error deleting team:', error);
      showToast("An error occurred while deleting the team", 'error');
      return;
    }

    if (editingTeamId === teamId) {
      setEditingTeamId(null);
      setIsTeamModalOpen(false);
      setNewTeam({ name: "", description: "" });
    }
  };

  // Member management functions
  const openCreateMember = () => {
    setEditingMemberId(null);
    setNewMember({ name: "", email: "", phone: "", role: "", team: [] });
    setIsMemberModalOpen(true);
  };

  const openEditMember = (member: Member) => {
    setEditingMemberId(member.id);
    setNewMember({
      name: member.name,
      email: member.email,
      phone: member.phone || "", // Use || "" to ensure a string
      role: member.role,
      team: member.teams 
    });
    setIsMemberModalOpen(true);
  };

  const handleSaveMember = async () => {
    // Validation
    if (editingMemberId) {
      // Edit mode: only validate role and teams
      if (!newMember.role) {
        showToast('Please select a role', 'error');
        return;
      }
      if (newMember.team.length === 0) {
        showToast('Please select at least one team', 'error');
        return;
      }
    } else {
      // Invite mode: full validations
      if (!newMember.name.trim()) {
        showToast('Full name is required', 'error');
        return;
      }
      if (!newMember.email.trim()) {
        showToast('Email address is required', 'error');
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newMember.email.trim())) {
        showToast('Please enter a valid email address', 'error');
        return;
      }
      if (!newMember.role) {
        showToast('Please select a role', 'error');
        return;
      }
      if (newMember.team.length === 0) {
        showToast('Please select at least one team', 'error');
        return;
      }
      if (newMember.phone && newMember.phone.trim() !== '' && !/^[\+]?[- 0-9()]{10,}$/.test(newMember.phone as string)) {
        showToast('Please enter a valid phone number', 'error');
        return;
      }
    }

    try {
      if (editingMemberId) {
        // Edit member: update teams and role only
        const memberBefore = members.find(m => m.id === editingMemberId);
        const beforeTeams = new Set(memberBefore?.teams || []);
        const afterTeams = new Set(newMember.team);

        const teamsToAdd = Array.from(afterTeams).filter(t => !beforeTeams.has(t));
        const teamsToRemove = Array.from(beforeTeams).filter(t => !afterTeams.has(t));

        // Map role name to roleId for team add and org role assignment
        const selectedRole = roles.find(r => r.name === newMember.role);
        if (!selectedRole) {
          showToast('Selected role not found', 'error');
          return;
        }

        // Perform team additions
        for (const teamName of teamsToAdd) {
          const teamObj = teams.find(t => t.name === teamName);
          if (teamObj) {
            const addRes = await addMemberToTeam(teamObj.id, { userId: editingMemberId, roleId: selectedRole.id });
            if (!addRes.success) {
              showToast(addRes.error || `Failed to add member to ${teamName}`, 'error');
              return;
            }
          }
        }

        // Perform team removals
        for (const teamName of teamsToRemove) {
          const teamObj = teams.find(t => t.name === teamName);
          if (teamObj) {
            const remRes = await removeMemberFromTeam(teamObj.id, editingMemberId);
            if (!remRes.success) {
              showToast(remRes.error || `Failed to remove member from ${teamName}`, 'error');
              return;
            }
          }
        }

        // Assign organization role
        const assignRes = await assignRoleAction(selectedRole.id, editingMemberId);
        if (!assignRes.success) {
          showToast(assignRes.error || 'Failed to assign role', 'error');
          return;
        }

        // Refresh members data
        const membersResult = await getMembers(currentOrganizationId!);
        if (membersResult.success && membersResult.data) {
          setMembers(membersResult.data.members);
        }
        showToast('Member updated successfully!');
      } else {
        // For new members, use invite member API
        const result = await inviteMember({
        email: newMember.email,
          name: newMember.name,
          phone: newMember.phone || undefined,
        role: newMember.role,
          teamIds: newMember.team.map(t => teams.find(team => team.name === t)?.id).filter((id): id is string => id !== undefined) 
        });
        
        if (result.success) {
          // Refresh members data
          const membersResult = await getMembers( currentOrganizationId!);
          console.log("Raw members data before setMembers (handleSaveMember - invite):", membersResult.data);
          if (membersResult.success && membersResult.data) {
            setMembers(membersResult.data.members);
          }
      showToast("Member invited successfully!");
        } else {
          showToast(result.error || "Failed to invite member", 'error');
          return;
        }
      }

    setNewMember({ name: "", email: "", phone: "", role: "", team: [] });
    setEditingMemberId(null);
    setIsMemberModalOpen(false);
    } catch (error) {
      console.error('Error saving member:', error);
      showToast("An error occurred while saving the member", 'error');
    }
  };

  const handleDeleteMember = async (memberId: string) => {
    try {
      const res = await deleteMemberFromOrganization(memberId);
      if (!res.success) {
        showToast(res.error || 'Failed to remove member from organization', 'error');
        return;
      }
      // Refresh members
      const membersResult = await getMembers(currentOrganizationId!);
      if (membersResult.success && membersResult.data) {
        setMembers(membersResult.data.members);
      }
      showToast('Member removed from organization');
    } catch (error) {
      console.error('Error removing member from organization:', error);
      showToast('An error occurred while removing the member', 'error');
      return;
    }

    if (editingMemberId === memberId) {
      setEditingMemberId(null);
      setIsMemberModalOpen(false);
      setNewMember({ name: '', email: '', phone: '', role: '', team: [] });
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

  const handleSaveRole = async () => {
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
    
    

    try {
      if (editingRoleId) {
        const res = await updateRoleAction(editingRoleId, {
          name: newRole.name,
          description: newRole.description,
          permissions: newRole.permissions,
        });
        if (!res.success) {
          showToast(res.error || "Failed to update role", 'error');
          return;
        }
        const refreshed = await getRoles();
        if (refreshed.success) setRoles(refreshed.data);
        showToast("Role updated successfully!");
      } else {
        const res = await createRoleAction({
          name: newRole.name,
          description: newRole.description,
          permissions: newRole.permissions,
        });
        if (!res.success) {
          showToast(res.error || "Failed to create role", 'error');
          return;
        }
        const refreshed = await getRoles();
        if (refreshed.success) setRoles(refreshed.data);
        showToast("Role created successfully!");
      }
    } catch (e) {
      console.error('Role save error:', e);
      showToast("An error occurred while saving the role", 'error');
      return;
    }

    setNewRole({ name: "", description: "", permissions: [] });
    setEditingRoleId(null);
    setIsRoleModalOpen(false);
  };

  const handleDeleteRole = async (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    if (!role) return;

    try {
      const res = await deleteRoleAction(roleId);
      if (!res.success) {
        showToast(res.error || "Failed to delete role", 'error');
        return;
      }
      const refreshed = await getRoles();
      if (refreshed.success) setRoles(refreshed.data);
      showToast("Role deleted successfully!");
    } catch (e) {
      console.error('Role delete error:', e);
      showToast("An error occurred while deleting the role", 'error');
      return;
    }

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

  const handleAddMembersToTeam = async () => {
    if (!selectedTeamForMembers || selectedMembersForTeam.length === 0) return;

    try {
      const promises = selectedMembersForTeam.map(member => {
        const role = roles.find(r => r.name === member.role);
        if (!role) {
          showToast(`Role '${member.role}' not found for member '${member.name}'`, 'error');
          return { success: false, error: 'Role not found' };
        }
          return addMemberToTeam(selectedTeamForMembers.id, {
            userId: member.id,
            roleId: role.id
          });
      });

      const results = await Promise.all(promises);
      const failedCount = results.filter(r => !r.success).length;
      
      if (failedCount === 0) {
    showToast(`Added ${selectedMembersForTeam.length} member(s) to ${selectedTeamForMembers.name}`);
      } else {
        showToast(`Added ${selectedMembersForTeam.length - failedCount} member(s), ${failedCount} failed`, 'error');
      }

      // Refresh members and teams data
      const [membersResult, teamsResult] = await Promise.all([
        getMembers(currentOrganizationId!),
        getTeams()
      ]);
      console.log("Raw members data before setMembers (handleAddMembersToTeam):", membersResult.data);
      
      if (membersResult.success && membersResult.data) {
        setMembers(membersResult.data.members);
      }
      
      if (teamsResult.success && teamsResult.data) {
        setTeams(teamsResult.data);
      }
    } catch (error) {
      console.error('Error adding members to team:', error);
      showToast("An error occurred while adding members to team", 'error');
    }
    
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

  const getStatusColor = (status: Member['isVerified']) => {
    switch (status) {
      case true: return 'bg-green-100 text-green-800';
      case false: return 'bg-yellow-100 text-yellow-800';
    }
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading teams data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Data</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Refresh Page</Button>
        </div>
      </div>
    );
  }

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
                                          <Badge variant="secondary" className={getStatusColor(member.isVerified)}>
                                            {member.isVerified ? 'Verified' : 'Unverified'}
                                          </Badge>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          {member.isVerified ? 'Member has accepted invitation and is active' : 
                                           'Member has not accepted invitation yet'}
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
                              <Badge className={getStatusColor(member.isVerified)}>
                                {member.isVerified ? 'Verified' : 'Unverified'}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              {member.isVerified ? 'Member has accepted invitation and is active' : 
                               'Member has not accepted invitation yet'}
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {member.teams.map((team) => (
                            <Badge key={team} variant="secondary" className="bg-gray-100 text-xs">
                              <Users className="h-3 w-3 mr-1" />
                              {team}
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
                    <div key={`desktop-${member.id}`} className="hidden sm:grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr_0.5fr] gap-4 p-4 border-b last:border-b-0 hover:bg-gray-50">
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
                          {member.teams.map((team) => (
                            <Badge key={team} variant="secondary" className="bg-gray-100">
                              <Users className="h-3 w-3 mr-1" />
                              {team}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center text-gray-700">{member.role}</div>
                      <div className="flex items-center">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge className={getStatusColor(member.isVerified)}>
                              {member.isVerified ? 'Verified' : 'Unverified'}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            {member.isVerified ? 'Member has accepted invitation and is active' : 
                             'Member has not accepted invitation yet'}
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
                        {availableMembersForTeam.length === 0 ? 'No verified members available' : 'Search and select members...'}
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
            setNewMember({ name: "", email: "", phone: "", role: "", team: [] });
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
                <Label htmlFor="memberTeam">Teams *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between"
                    >
                      {newMember.team.length > 0
                        ? newMember.team.map(teamName => (
                            <Badge key={teamName} variant="secondary" className="mr-1">
                              {teamName}
                            </Badge>
                          ))
                        : "Select teams..."}
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0">
                    <Command>
                      <CommandInput placeholder="Search teams..." />
                      <CommandList>
                        <CommandEmpty>No team found.</CommandEmpty>
                    {teams.map((team) => (
                          <CommandItem
                            key={team.id}
                            onSelect={() => {
                              setNewMember(prev => ({
                                ...prev,
                                team: prev.team.includes(team.name)
                                  ? prev.team.filter(t => t !== team.name)
                                  : [...prev.team, team.name]
                              }));
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={newMember.team.includes(team.name)}
                              readOnly
                              className="mr-2"
                            />
                        {team.name}
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
                  setIsMemberModalOpen(false);
                  setEditingMemberId(null);
                  setNewMember({ name: "", email: "", phone: "", role: "", team: [] });
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
                                   permission === 'custom_scripts' ? 'Run custom scripts' :
                                   // Organization Permissions
                                   permission === 'organization:create' ? 'Create new organizations' :
                                   permission === 'organization:select' ? 'Select and switch between organizations' :
                                   permission === 'organization:delete' ? 'Delete organizations' :
                                   permission === 'organization:manage_team' ? 'Manage organization team members' :
                                   // Monitoring Permissions
                                   permission === 'monitor:create' ? 'Create new monitors' :
                                   permission === 'monitor:edit' ? 'Edit existing monitors' :
                                   permission === 'monitor:delete' ? 'Delete monitors' :
                                   // Escalation Policy Permissions
                                   permission === 'escalation_policy:create' ? 'Create new escalation policies' :
                                   permission === 'escalation_policy:edit' ? 'Edit existing escalation policies' :
                                   permission === 'escalation_policy:delete' ? 'Delete escalation policies' :
                                   // Integration Permissions
                                   permission === 'integration:create' ? 'Create new integrations' :
                                   permission === 'integration:edit' ? 'Edit existing integrations' :
                                   permission === 'integration:delete' ? 'Delete integrations' :
                                   // Status Page Permissions
                                   permission === 'status_page:create' ? 'Create new status pages' :
                                   permission === 'status_page:edit' ? 'Edit existing status pages' :
                                   permission === 'status_page:delete' ? 'Delete status pages' :
                                   // Team Management Permissions
                                   permission === 'team:create' ? 'Create new teams' :
                                   permission === 'team:edit' ? 'Edit existing teams' :
                                   permission === 'team:delete' ? 'Delete teams' :
                                   permission === 'team:add_member' ? 'Add members to teams' :
                                   permission === 'team:remove_member' ? 'Remove members from teams' :
                                   // Member Management Permissions
                                   permission === 'member:invite' ? 'Invite new members' :
                                   permission === 'member:edit' ? 'Edit member profiles' :
                                   // Role Management Permissions
                                   permission === 'role:create' ? 'Create new roles' :
                                   permission === 'role:edit' ? 'Edit existing roles' :
                                   permission === 'role:delete' ? 'Delete roles' :
                                   permission === 'role:manage_permissions' ? 'Manage role permissions' : 'Custom permission'}
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