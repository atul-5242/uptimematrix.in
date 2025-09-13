'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { MoreHorizontal, Edit, Trash2, Crown, Shield, AlertCircle } from 'lucide-react';
import { updateTeamMember, removeMemberFromTeam } from '@/app/all-actions/team-section/team/actions';

interface Member {
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

interface MemberManagementCardProps {
  member: Member;
  teamId: string;
  canEdit: boolean;
  canRemove: boolean;
  onMemberUpdated: () => void;
  onMemberRemoved: () => void;
}

export default function MemberManagementCard({
  member,
  teamId,
  canEdit,
  canRemove,
  onMemberUpdated,
  onMemberRemoved
}: MemberManagementCardProps) {
  const [loading, setLoading] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const getStatusColor = (status: Member['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleIcon = (role: string, isTeamLead: boolean) => {
    if (isTeamLead) return <Crown className="h-3 w-3 text-yellow-600" />;
    if (role === 'Admin') return <Shield className="h-3 w-3 text-red-600" />;
    return null;
  };

  const handleToggleTeamLead = async () => {
    if (!canEdit) return;
    
    setLoading(true);
    try {
      const result = await updateTeamMember(teamId, member.id, {
        isTeamLead: !member.isTeamLead
      });

      if (result.success) {
        onMemberUpdated();
      } else {
        console.error('Failed to update team lead status:', result.error);
      }
    } catch (error) {
      console.error('Error updating team lead status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!canRemove) return;
    
    if (!confirm(`Are you sure you want to remove ${member.name} from this team?`)) {
      return;
    }

    setLoading(true);
    try {
      const result = await removeMemberFromTeam(teamId, member.id);

      if (result.success) {
        onMemberRemoved();
      } else {
        console.error('Failed to remove member:', result.error);
      }
    } catch (error) {
      console.error('Error removing member:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatJoinDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(date));
  };

  return (
    <TooltipProvider>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            {/* Member Info */}
            <div className="flex items-center space-x-3 flex-1">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-blue-500 text-white">
                  {getInitials(member.name)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-gray-900 truncate">{member.name}</h4>
                  {getRoleIcon(member.role, member.isTeamLead)}
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getStatusColor(member.status)}`}
                  >
                    {member.status}
                  </Badge>
                </div>
                
                <p className="text-sm text-gray-600 truncate">{member.email}</p>
                
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    {member.role}
                  </Badge>
                  {member.isTeamLead && (
                    <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
                      Team Lead
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Member Actions */}
            <div className="flex items-center space-x-2">
              {/* Status Indicator */}
              {member.status === 'pending' && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Invitation pending</p>
                  </TooltipContent>
                </Tooltip>
              )}

              {/* Actions Menu */}
              {(canEdit || canRemove) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      disabled={loading}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {canEdit && (
                      <>
                        <DropdownMenuItem onClick={handleToggleTeamLead}>
                          <Crown className="h-4 w-4 mr-2" />
                          {member.isTeamLead ? 'Remove Team Lead' : 'Make Team Lead'}
                        </DropdownMenuItem>
                      </>
                    )}
                    {canRemove && (
                      <DropdownMenuItem 
                        onClick={handleRemoveMember}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove from Team
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Joined {formatJoinDate(member.joinedAt)}</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="cursor-help">
                    {member.permissions.length} permissions
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="max-w-xs">
                    <p className="font-medium mb-1">Permissions:</p>
                    <div className="space-y-1">
                      {member.permissions.slice(0, 5).map(permission => (
                        <p key={permission} className="text-xs">• {permission}</p>
                      ))}
                      {member.permissions.length > 5 && (
                        <p className="text-xs">... and {member.permissions.length - 5} more</p>
                      )}
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
