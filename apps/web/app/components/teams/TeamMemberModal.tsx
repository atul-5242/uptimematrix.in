'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Search, X, UserPlus, Loader2 } from 'lucide-react';
import { Command, CommandInput, CommandItem, CommandList, CommandEmpty } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { addMemberToTeam, getAvailableUsers, getRoles } from '@/app/all-actions/team-section/team/actions';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  organizationRole: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

interface TeamMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: string;
  teamName: string;
  onMemberAdded: () => void;
}

export default function TeamMemberModal({ 
  isOpen, 
  onClose, 
  teamId, 
  teamName, 
  onMemberAdded 
}: TeamMemberModalProps) {
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [userSearchOpen, setUserSearchOpen] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load available users and roles when modal opens
  useEffect(() => {
    if (isOpen && teamId) {
      loadData();
    }
  }, [isOpen, teamId]);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [usersResult, rolesResult] = await Promise.all([
        getAvailableUsers(teamId),
        getRoles()
      ]);

      if (usersResult.success) {
        setAvailableUsers(usersResult.data);
      } else {
        setError(usersResult.error || 'Failed to load available users');
      }

      if (rolesResult.success) {
        setRoles(rolesResult.data);
      } else {
        setError(rolesResult.error || 'Failed to load roles');
      }
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const filteredUsers = availableUsers.filter(user => 
    !selectedUsers.find(su => su.id === user.id) &&
    (userSearch === '' || 
     user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
     user.email.toLowerCase().includes(userSearch.toLowerCase()))
  );

  const handleSelectUser = (user: User) => {
    setSelectedUsers(prev => [...prev, user]);
    setUserSearch('');
    setUserSearchOpen(false);
  };

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers(prev => prev.filter(u => u.id !== userId));
  };

  const handleAddMembers = async () => {
    if (selectedUsers.length === 0 || !selectedRole) {
      setError('Please select users and a role');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const results = [];
      const errors: { user: string; error: string }[] = [];

      for (const user of selectedUsers) {
        const result = await addMemberToTeam(teamId, {
          userId: user.id,
          roleId: selectedRole,
          isTeamLead: false
        });

        if (result.success) {
          results.push(result.data);
        } else {
          errors.push({ user: user.name, error: result.error });
        }
      }

      if (results.length > 0) {
        onMemberAdded();
        
        if (errors.length === 0) {
          // All successful
          handleClose();
        } else {
          // Partial success
          setError(`Added ${results.length} members successfully, ${errors.length} failed`);
          setSelectedUsers(prev => prev.filter(u => 
            errors.some(e => e.user === u.name)
          ));
        }
      } else {
        setError('Failed to add any members');
      }
    } catch (err) {
      setError('Failed to add members');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedUsers([]);
    setSelectedRole('');
    setUserSearch('');
    setError(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Members to {teamName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          {/* User Selection */}
          <div className="space-y-3">
            <Label>Select Users</Label>
            
            {/* Selected Users */}
            {selectedUsers.length > 0 && (
              <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-md">
                {selectedUsers.map(user => (
                  <Badge key={user.id} variant="secondary" className="flex items-center gap-2 px-3 py-1">
                    <Avatar className="h-5 w-5">
                      <AvatarFallback className="text-xs bg-blue-500 text-white">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{user.name}</span>
                    <button
                      onClick={() => handleRemoveUser(user.id)}
                      className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            {/* User Search */}
            <Popover open={userSearchOpen} onOpenChange={setUserSearchOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <Search className="h-4 w-4 mr-2" />
                  Search users to add...
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput
                    placeholder="Search users..."
                    value={userSearch}
                    onValueChange={setUserSearch}
                  />
                  <CommandList>
                    <CommandEmpty>No users found.</CommandEmpty>
                    {filteredUsers.map(user => (
                      <CommandItem
                        key={user.id}
                        onSelect={() => handleSelectUser(user)}
                        className="flex items-center gap-3 p-3"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-blue-500 text-white text-sm">
                            {getInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-gray-600">{user.email}</div>
                          <div className="text-xs text-gray-500">{user.organizationRole}</div>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Role Selection */}
          <div className="space-y-2">
            <Label htmlFor="role">Team Role</Label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role for the members" />
              </SelectTrigger>
              <SelectContent>
                {roles.map(role => (
                  <SelectItem key={role.id} value={role.id}>
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{role.name}</span>
                      <span className="text-sm text-gray-600">{role.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Summary */}
          {selectedUsers.length > 0 && selectedRole && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="text-sm text-blue-800">
                Ready to add {selectedUsers.length} member{selectedUsers.length !== 1 ? 's' : ''} to {teamName}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleAddMembers} 
            disabled={selectedUsers.length === 0 || !selectedRole || loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4 mr-2" />
                Add {selectedUsers.length} Member{selectedUsers.length !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
