'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Loader2, Mail, UserPlus } from 'lucide-react';
import { inviteMemberToOrganization } from '@/app/all-actions/team-section/members/actions';
import { getRoles } from '@/app/all-actions/team-section/roles/actions';

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamId?: string;
  teamName?: string;
  onMemberInvited: () => void;
}

export default function InviteMemberModal({ 
  isOpen, 
  onClose, 
  teamId, 
  teamName, 
  onMemberInvited 
}: InviteMemberModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    roleId: '',
    addToTeam: !!teamId,
    customMessage: ''
  });
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadRoles();
      setFormData(prev => ({ ...prev, addToTeam: !!teamId }));
    }
  }, [isOpen, teamId]);

  const loadRoles = async () => {
    try {
      const result = await getRoles();
      if (result.success) {
        setRoles(result.data);
      } else {
        setError(result.error || 'Failed to load roles');
      }
    } catch (err) {
      setError('Failed to load roles');
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Full name is required');
      return false;
    }
    
    if (!formData.email.trim()) {
      setError('Email address is required');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setError('Please enter a valid email address');
      return false;
    }
    
    if (!formData.roleId) {
      setError('Please select a role');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    setError(null);
    setSuccess(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const result = await inviteMemberToOrganization({
        name: formData.name.trim(),
        email: formData.email.trim(),
        roleId: formData.roleId,
        teamId: formData.addToTeam ? teamId : undefined
      });

      if (result.success) {
        setSuccess(
          formData.addToTeam && teamName
            ? `Invitation sent to ${formData.name} and added to ${teamName}`
            : `Invitation sent to ${formData.name}`
        );
        onMemberInvited();
        
        // Reset form
        setFormData({
          name: '',
          email: '',
          roleId: '',
          addToTeam: !!teamId,
          customMessage: ''
        });

        // Close modal after 2 seconds
        setTimeout(() => {
          handleClose();
        }, 2000);
      } else {
        setError(result.error || 'Failed to send invitation');
      }
    } catch (err) {
      setError('Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      email: '',
      roleId: '',
      addToTeam: !!teamId,
      customMessage: ''
    });
    setError(null);
    setSuccess(null);
    onClose();
  };

  const selectedRole = roles.find(role => role.id === formData.roleId);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {teamId ? `Invite Member to ${teamName}` : 'Invite New Member'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">
              {success}
            </div>
          )}

          {/* Name Input */}
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="Enter full name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              disabled={loading}
            />
          </div>

          {/* Email Input */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter email address"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              disabled={loading}
            />
          </div>

          {/* Role Selection */}
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select 
              value={formData.roleId} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, roleId: value }))}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map(role => (
                  <SelectItem key={role.id} value={role.id}>
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{role.name}</span>
                      <span className="text-sm text-gray-600 truncate max-w-xs">
                        {role.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {selectedRole && (
              <div className="text-xs text-gray-600 mt-1">
                Permissions: {selectedRole.permissions.join(', ')}
              </div>
            )}
          </div>

          {/* Add to Team Toggle */}
          {teamId && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Add to Team</Label>
                <div className="text-xs text-gray-600">
                  Automatically add to {teamName} after accepting invitation
                </div>
              </div>
              <Switch
                checked={formData.addToTeam}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, addToTeam: checked }))}
                disabled={loading}
              />
            </div>
          )}

          {/* Custom Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Custom Message (Optional)</Label>
            <Textarea
              id="message"
              placeholder="Add a personal message to the invitation..."
              value={formData.customMessage}
              onChange={(e) => setFormData(prev => ({ ...prev, customMessage: e.target.value }))}
              rows={3}
              disabled={loading}
            />
          </div>

          {/* Preview */}
          {formData.name && formData.email && formData.roleId && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="text-sm text-blue-800">
                <div className="font-medium">Invitation Preview:</div>
                <div className="mt-1">
                  {formData.name} ({formData.email}) will be invited as{' '}
                  <span className="font-medium">{selectedRole?.name}</span>
                  {formData.addToTeam && teamName && (
                    <span> and added to <span className="font-medium">{teamName}</span></span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading || success !== null}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="h-4 w-4 mr-2" />
                Send Invitation
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
