'use client';

import React, { useState } from 'react';
import { Plus, Building2, Eye, Check, Users, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store';
import { setCurrentOrganizationId } from '@/store/organizationSlice';
import { fetchUserDetails } from '@/store/userSlice';

// Demo data - replace with actual API calls
interface Organization {
  id: string;
  name: string;
  description: string;
  status: string;
  totalMembers: number;
  createdOn: string;
  industry?: string;
  location?: string;
  memberSince?: string;
  foundedYear?: number;
  about?: string;
  role: string;
  isSelected: boolean;
}

export default function OrganizationsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { organizations: userOrganizations, id: userId } = useAppSelector(state => state.user);
  const { currentOrganizationId } = useAppSelector(state => state.organization);
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgDescription, setNewOrgDescription] = useState('');

  // Convert userOrganizations to match the local Organization interface and add isSelected
  const organizations: Organization[] = React.useMemo(() => {
    if (!userOrganizations) return [];
    return userOrganizations.map(org => ({
      ...org,
      isSelected: org.id === currentOrganizationId,
      // Add default values for optional fields if they are undefined
      description: org.description || '',
      status: org.status || 'Active',
      totalMembers: org.totalMembers || 0,
      createdOn: org.createdOn || new Date().toISOString(),
      // Explicitly set optional fields to undefined if they are null or not present
      industry: org.industry || undefined,
      location: org.location || undefined,
      memberSince: org.memberSince || undefined,
      foundedYear: org.foundedYear || undefined,
      about: org.about || undefined,
    }));
  }, [userOrganizations, currentOrganizationId]);

  // Set initial selected organization if none is selected and there are organizations
  React.useEffect(() => {
    if (!currentOrganizationId && userOrganizations.length > 0) {
      // Select the first organization by default
      dispatch(setCurrentOrganizationId(userOrganizations[0].id));
    }
  }, [currentOrganizationId, userOrganizations, dispatch]);

  const handleSelectOrganization = (id: string) => {
    // No need to set local state, Redux will handle it
    dispatch(setCurrentOrganizationId(id));
  };

  const handleViewDetails = (id: string) => {
    router.push(`/dashboard/organizations/${id}`);
  };

  const handleCreateOrganization = () => {
    if (!newOrgName.trim() || !newOrgDescription.trim()) {
      alert('Please fill in all fields');
      return;
    }

    // TODO: Implement actual API call to create organization and fetch updated user details
    alert('Organization creation is not yet implemented fully with backend.');
    
    setNewOrgName('');
    setNewOrgDescription('');
    setIsCreateDialogOpen(false);
    // After creating, ideally re-fetch user details to get updated organizations list
    // dispatch(fetchUserDetails());
  };

  const getStatusBadgeVariant = (status: string) => {
    return status === 'Active' ? 'default' : 'secondary';
  };

  const selectedOrg = organizations.find(org => org.isSelected);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-gray-900">Organizations</h1>
            <p className="text-gray-600">Manage and view your organizations</p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create Organization
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Organization</DialogTitle>
                <DialogDescription>
                  Add a new organization to your workspace.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="org-name">Organization Name</Label>
                  <Input
                    id="org-name"
                    placeholder="Enter organization name"
                    value={newOrgName}
                    onChange={(e) => setNewOrgName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="org-description">Description</Label>
                  <Textarea
                    id="org-description"
                    placeholder="Enter organization description"
                    value={newOrgDescription}
                    onChange={(e) => setNewOrgDescription(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateOrganization}>
                  Create Organization
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Currently Active Organization Banner */}
        {selectedOrg && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                  <Building2 className="h-6 w-6 text-green-600" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-green-900">Currently Active Organization</h3>
                    <Badge className="bg-green-600 hover:bg-green-600">
                      <Check className="mr-1 h-3 w-3" />
                      Active
                    </Badge>
                  </div>
                  <h4 className="font-medium text-green-800">{selectedOrg.name}</h4>
                  <p className="text-sm text-green-700">{selectedOrg.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Organizations Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {organizations.map((org) => (
            <Card 
              key={org.id} 
              className={`transition-all duration-200 hover:shadow-lg ${
                org.isSelected 
                  ? 'border-green-500 ring-2 ring-green-200 shadow-md' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                      org.isSelected ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      <Building2 className={`h-5 w-5 ${
                        org.isSelected ? 'text-green-600' : 'text-gray-600'
                      }`} />
                    </div>
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{org.name}</CardTitle>
                      <Badge variant={getStatusBadgeVariant(org.status)}>
                        {org.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600 line-clamp-2">{org.description}</p>
                
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {org.totalMembers} members
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {org.createdOn}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDetails(org.id)}
                    className="flex-1"
                  >
                    <Eye className="mr-2 h-3 w-3" />
                    View Details
                  </Button>
                  
                  <Button
                    variant={org.isSelected ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleSelectOrganization(org.id)}
                    className={`flex-1 ${
                      org.isSelected 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : 'hover:bg-green-50 hover:border-green-300 hover:text-green-700'
                    }`}
                    disabled={org.isSelected}
                  >
                    {org.isSelected ? (
                      <>
                        <Check className="mr-2 h-3 w-3" />
                        Selected
                      </>
                    ) : (
                      'Select'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {organizations.length === 0 && (
          <Card className="py-12">
            <CardContent className="text-center space-y-4">
              <div className="flex justify-center">
                <Building2 className="h-12 w-12 text-gray-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">No organizations found</h3>
                <p className="text-gray-600">Get started by creating your first organization.</p>
              </div>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Organization
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Stats Footer */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-t pt-6">
          <div className="text-sm text-gray-600">
            Showing {organizations.length} organization{organizations.length !== 1 ? 's' : ''}
          </div>
          <div className="flex gap-4 text-sm text-gray-600">
            <span>{organizations.filter(org => org.status === 'Active').length} Active</span>
            <span>{organizations.filter(org => org.status === 'Inactive').length} Inactive</span>
          </div>
        </div>
      </div>
    </div>
  );
}