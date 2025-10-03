"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, CheckCircle, Clock, Send, Users } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAppDispatch, useAppSelector } from "@/store";
import { setSelectedOrganization } from "@/store/organizationSlice";
import { fetchUserDetails } from "@/store/userSlice";

interface Invitation {
  id: string;
  email: string;
  status: 'pending' | 'accepted' | 'declined' | 'exists';
  invitedBy: string;
  invitedAt: Date;
  invitationLink?: string; // Add invitationLink property
  organizationName?: string; // Add organizationName for pending invites
  organizationDescription?: string; // Add organizationDescription for pending invites
  invitedById?: string; // Add invitedById property
}

interface AcceptedOrganization {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  joinedAt: Date;
  isVerified: boolean;
}

interface UserOrganization extends AcceptedOrganization {
  role: string;
  permissions: string[];
}

interface UserDetailsPayload {
  id: string;
  fullName: string;
  email: string;
  phone: number | undefined;
  jobTitle: string | undefined;
  location: string | undefined;
  bio: string | undefined;
  avatar: string | undefined;
  joinDate: string;
  lastLogin: string | undefined;
  isEmailVerified: boolean;
  selectedOrganizationId: string | null;
  selectedOrganizationRole: string | null;
  selectedOrganizationPermissions: string[];
  organizations: UserOrganization[];
}

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

export default function InvitesPage() {
  const [pendingInvitations, setPendingInvitations] = useState<Invitation[]>([]);
  const [acceptedOrganizations, setAcceptedOrganizations] = useState<AcceptedOrganization[]>([]);
  const [loading, setLoading] = useState(true);
  const [invitationEmails, setInvitationEmails] = useState<string[]>([]);
  const [currentEmailInput, setCurrentEmailInput] = useState<string>('');
  const { userId } = useAppSelector((state) => state.auth);
  const { fullName } = useAppSelector((state) => state.user);
  const [sendingInvitation, setSendingInvitation] = useState(false); // New loading state for send button
  const [acceptingInvitationId, setAcceptingInvitationId] = useState<string | null>(null); // New loading state for accept button
  const dispatch = useAppDispatch();

  const handleAddInvitationEmail = (email: string) => {
    if (email.trim() && !invitationEmails.includes(email.trim()) && /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email.trim())) {
      setInvitationEmails(prev => [...prev, email.trim()]);
    } else if (email.trim() && !/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email.trim())) {
      alert(`Invalid email format: ${email}`);
    }
  };

  const handleRemoveInvitationEmail = (emailToRemove: string) => {
    setInvitationEmails(prev => prev.filter(email => email !== emailToRemove));
  };

  const handleEmailInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      handleAddInvitationEmail(currentEmailInput);
      setCurrentEmailInput('');
    }
  };

  const handleEmailInputBlur = () => {
    handleAddInvitationEmail(currentEmailInput);
    setCurrentEmailInput('');
  };

  const fetchInitialData = React.useCallback(async () => {
    setLoading(true);
    try {
      // Fetch Accepted Organizations
      const orgResponse = await fetch('/api/userprofile/me');
      if (!orgResponse.ok) {
        throw new Error(`Error fetching accepted organizations: ${orgResponse.statusText}`);
      }
      const userData: UserDetailsPayload = await orgResponse.json();
      const verifiedOrganizations = userData.organizations.filter(org => org.isVerified);
      setAcceptedOrganizations(verifiedOrganizations);

      // Fetch Pending Invitations
      const inviteResponse = await fetch('/api/organizations/invitations/pending');
      if (!inviteResponse.ok) {
        throw new Error(`Error fetching pending invitations: ${inviteResponse.statusText}`);
      }
      const pendingData: Invitation[] = await inviteResponse.json();
      setPendingInvitations(pendingData);

    } catch (error) {
      console.error("Failed to fetch initial data:", error);
      setAcceptedOrganizations([]); 
      setPendingInvitations([]); // Ensure pending invitations is an array on error
      // Optionally, display an error message to the user
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array means this function is created once

  const handleAcceptInvitation = async (invitationLink: string) => {
    console.log("Accepting invitation:", invitationLink);
    console.log("Full name:", fullName);
    try {
      setAcceptingInvitationId(invitationLink); // Set loading for this specific invitation
      const response = await fetch('/api/organizations/invitations/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ invitationLink, name: fullName }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to accept invitation.");
      }

      alert(result.message);
      // If backend returns organizationId, set it as the selected organization automatically
      if (result.organizationId) {
        try {
          await dispatch(setSelectedOrganization({ organizationId: result.organizationId })).unwrap();
        } catch (e) {
          console.error('Failed to set selected organization:', e);
        }
        // Refresh user details so selectedOrganizationId and permissions propagate through the app
        await dispatch(fetchUserDetails());
      }
      // Refresh data after accepting
      fetchInitialData(); 
    } catch (error: any) {
      console.error("Error accepting invitation:", error);
      alert(error.message || "Failed to accept invitation. Please try again.");
    } finally {
      setAcceptingInvitationId(null); // Reset loading state
    }
  };

  React.useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const handleSendInvitation = async () => {
    if (invitationEmails.length === 0) {
      alert("Please add at least one email address to send invitations.");
      return;
    }

    try {
      setSendingInvitation(true); // Set loading true
      const response = await fetch('/api/organizations/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ invitationEmails }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to send invitations.");
      }

      const newPending: Invitation[] = [];
      const existingMessages: string[] = [];

      result.sentInvitations.forEach((inv: Invitation & { message?: string }) => {
        if (inv.status === 'pending') {
          newPending.push(inv);
        } else if (inv.status === 'exists') {
          existingMessages.push(inv.message || `Invitation for ${inv.email} already exists or user is a member.`);
        }
      });

      setPendingInvitations(prev => [...prev, ...newPending]);
      setInvitationEmails([]); // Clear the input after sending

      let successMessage = `Invitations sent successfully.`;
      if (newPending.length > 0) {
        successMessage = `Invitations sent to ${newPending.map(inv => inv.email).join(', ')}.`;
      }

      if (existingMessages.length > 0) {
        successMessage += `\n${existingMessages.join('\n')}`;
      }

      alert(successMessage);
      fetchInitialData();
    } catch (error: any) {
      console.error("Error sending invitations:", error);
      alert(error.message || "Failed to send invitations. Please try again.");
    } finally {
      setSendingInvitation(false); // Set loading false after completion or error
    }
  };

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    alert("Invitation link copied to clipboard!");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading invitations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4 sm:p-6 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Invitations</h1>
            <p className="text-gray-600 mt-1">Manage organization invitations and your accepted memberships</p>
          </div>
        </div>

        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="pending" className="text-xs sm:text-sm">Pending Invitations ({pendingInvitations.length})</TabsTrigger>
            <TabsTrigger value="accepted" className="text-xs sm:text-sm">Accepted Organizations ({acceptedOrganizations.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 className="text-lg font-semibold text-gray-900">Invite New Member</h3>
                <Send className="h-5 w-5 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <input
                        id="invitationEmailInput"
                        type="email"
                        className="w-full pr-4 py-3 border rounded-lg border-slate-300 bg-white hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-gray-500"
                        placeholder="Enter email and press Enter or Tab"
                        value={currentEmailInput}
                        onChange={(e) => setCurrentEmailInput(e.target.value)}
                        onKeyDown={handleEmailInputKeyDown}
                        onBlur={handleEmailInputBlur}
                      />
                    </div>
                    {invitationEmails.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {invitationEmails.map((email) => (
                          <span key={email} className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                            {email}
                            <button type="button" onClick={() => handleRemoveInvitationEmail(email)} className="text-blue-600 hover:text-blue-800">
                              &times;
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <Button onClick={handleSendInvitation} className="bg-gray-900 hover:bg-gray-800" disabled={sendingInvitation}>
                    {sendingInvitation ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </span>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Invitation
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <h3 className="text-lg font-semibold text-gray-900 mt-8 mb-4 flex items-center gap-2">
              Pending Invitations List
              <Badge variant="default" className="bg-yellow-500 text-white">Pending</Badge>
            </h3>
            {pendingInvitations.length === 0 ? (
              <Card className="text-center py-8">
                <CardContent>
                  <Clock className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No pending invitations.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {pendingInvitations.map((invite) => {
                  const isCurrentUserInviter = userId === invite.invitedById;
                  return (
                    <Card key={invite.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex flex-col sm:flex-row items-center space-x-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-blue-500 text-white text-sm">
                              {getInitials(invite.email.split('@')[0])}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-gray-900">{isCurrentUserInviter ? `You invited ${invite.email} to join ${invite.organizationName}` : `${invite.email} is invited to join ${invite.organizationName}`}</p>
                            <p className="text-sm text-gray-500">Invited by {invite.invitedBy} on {new Date(invite.invitedAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <Button 
                          onClick={() => handleAcceptInvitation(invite.invitationLink!)} 
                          className={`${isCurrentUserInviter ? "bg-green-500 hover:bg-green-600" : "bg-blue-600 hover:bg-blue-700"} text-white rounded-md px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200`}
                          disabled={isCurrentUserInviter || acceptingInvitationId === invite.id}
                        >
                          {isCurrentUserInviter ? (
                            'Invitation Sent'
                          ) : acceptingInvitationId === invite.id ? (
                            <span className="flex items-center">
                              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Accepting...
                            </span>
                          ) : (
                            'Accept'
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

          </TabsContent>

          <TabsContent value="accepted" className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Accepted Organizations</h3>
            {acceptedOrganizations.length === 0 ? (
              <Card className="text-center py-8">
                <CardContent>
                  <Users className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No accepted organization memberships.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {acceptedOrganizations.map((org) => (
                  <Card key={org.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-green-500 text-white text-sm">
                              {getInitials(org.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-gray-900">{org.name}</p>
                            <p className="text-sm text-gray-500">{org.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className="bg-green-100 text-green-800">
                            Accepted
                          </Badge>
                          <p className="text-sm text-gray-500 mt-1">Members: {org.memberCount}</p>
                          <p className="text-sm text-gray-500">Joined: {new Date(org.joinedAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
