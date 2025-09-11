'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Building2, Users, Calendar, MapPin, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchSelectedOrganizationDetails, clearSelectedOrganization, deleteOrganization } from '@/store/selectedOrganizationSlice';
import { deleteOrganizationAction } from '@/app/all-actions/organizations/actions';
import { fetchUserDetails } from '@/store/userSlice';

// Demo data - replace with actual API calls

// const organizationData = {
//   id: 1,
//   name: 'Acme Inc.',
//   description: 'Leading provider of innovative solutions for modern businesses.',
//   status: 'Active',
//   totalMembers: 12,
//   createdOn: 'Jan 15, 2023',
//   industry: 'Technology',
//   location: 'San Francisco, CA',
//   memberSince: 'Jan 15, 2023',
//   foundedYear: 2010,
//   about: 'Acme Inc. was founded in 2010 with a mission to deliver innovative business solutions. We specialize in enterprise software and consulting services, helping companies transform their digital presence.'
// };

// const membersData = [
//   {
//     id: 1,
//     name: 'John Doe',
//     email: 'john@example.com',
//     role: 'Owner',
//     initials: 'JD'
//   },
//   {
//     id: 2,
//     name: 'Jane Smith',
//     email: 'jane@example.com',
//     role: 'Admin',
//     initials: 'JS'
//   },
//   {
//     id: 3,
//     name: 'Bob Johnson',
//     email: 'bob@example.com',
//     role: 'Member',
//     initials: 'BJ'
//   },
// ];

export default function OrganizationPage({ params }: { params: { id: string } }) {
  const { id: organizationId } = params;
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { organization: selectedOrganization, loading, error } = useAppSelector(state => state.selectedOrganization);
  const [activeTab, setActiveTab] = useState('about');
  const [clientCreatedOn, setClientCreatedOn] = useState<string | null>(null);

  useEffect(() => {
    if (organizationId) {
      dispatch(fetchSelectedOrganizationDetails(organizationId));
    }
    return () => {
      dispatch(clearSelectedOrganization());
    };
  }, [dispatch, organizationId]);

  useEffect(() => {
    if (selectedOrganization?.createdOn) {
      setClientCreatedOn(selectedOrganization.createdOn);
    }
  }, [selectedOrganization?.createdOn]);

  const handleDeleteOrganization = async () => {
    try {
      await dispatch(deleteOrganization(organizationId)).unwrap();
      alert('Organization deleted successfully!');
      dispatch(fetchUserDetails()); // Re-fetch user organizations after deletion
      router.push('/dashboard/organizations');
    } catch (err: unknown) {
      alert(`Failed to delete organization: ${(err instanceof Error ? err.message : 'Unknown error')}`);
    }
  };

  const handleBackToOrganizations = () => {
    router.push('/dashboard/organizations');
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role.toLowerCase()) {
      case 'owner':
        return 'default';
      case 'admin':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 p-8 text-center">Loading organization details...</div>;
  }

  if (error) {
    return <div className="min-h-screen bg-gray-50 p-8 text-center text-red-600">Error: {error}</div>;
  }

  if (!selectedOrganization) {
    return <div className="min-h-screen bg-gray-50 p-8 text-center">Organization not found.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToOrganizations}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Organizations
          </Button>
        </div>

        {/* Organization Header */}
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gray-200">
              <Building2 className="h-8 w-8 text-gray-600" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-gray-900">{selectedOrganization.name}</h1>
              <p className="text-gray-600">{selectedOrganization.description}</p>
            </div>
          </div>
          <Button className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Manage Team
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Organization Status</p>
                <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
                  {selectedOrganization.status}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Total Members</p>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-gray-400" />
                  <span className="text-2xl font-bold text-gray-900">{selectedOrganization.totalMembers} Members</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Created On</p>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <span className="text-2xl font-bold text-gray-900">
                    {clientCreatedOn ? new Date(clientCreatedOn).toLocaleDateString('en-US') : "N/A"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 gap-2 sm:grid-cols-3 md:grid-cols-3 lg:flex lg:w-auto lg:space-x-4">
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>


          {/* About Tab */}
          <TabsContent value="about" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>About {selectedOrganization.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-gray-700">{selectedOrganization.about}</p>
                
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">Industry</h4>
                      <p className="text-gray-700">{selectedOrganization.industry}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">Member Since</h4>
                      <p className="text-gray-700">{selectedOrganization.memberSince}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">Location</h4>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-700">{selectedOrganization.location}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

        {/* Members Tab */}
        <TabsContent value="members" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <p className="text-sm text-gray-600">
                Current members of {selectedOrganization.name}
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {selectedOrganization.members.map((member) => (
                  <div
                    key={member.id}
                    className="flex flex-col gap-3 rounded-lg border p-4 hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between"
                  >
                    {/* Left section (Avatar + Info) */}
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-gray-200 text-gray-700">
                          {member.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <h4 className="font-semibold text-gray-900">{member.name}</h4>
                        <div className="flex items-center gap-1 text-sm text-gray-600 break-all">
                          <Mail className="h-3 w-3 shrink-0" />
                          {member.email}
                        </div>
                      </div>
                    </div>

                    {/* Role Badge */}
                    <Badge
                      variant={getRoleBadgeVariant(member.role)}
                      className="self-start sm:self-auto"
                    >
                      {member.role}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Organization Settings</CardTitle>
                <p className="text-sm text-gray-600">Manage your organization settings</p>
              </CardHeader>
            </Card>

            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-600">Organization Deletion</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-900">Delete this organization</h4>
                    <p className="text-sm text-gray-600">
                      Once you delete an organization, there is no going back. All data will be permanently removed.
                    </p>
                  </div>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="whitespace-nowrap">
                        Delete Organization
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the organization
                          and remove all data associated with it.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteOrganization}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete Organization
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}