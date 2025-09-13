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

interface Invitation {
  id: string;
  email: string;
  status: 'pending' | 'accepted' | 'declined';
  invitedBy: string;
  invitedAt: Date;
  invitationLink?: string; // Add invitationLink property
}

interface AcceptedOrganization {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  joinedAt: Date;
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

  const handleAcceptInvitation = (invitationLink: string) => {
    // In a real app, you would make an API call to accept the invitation
    console.log("Accepting invitation with link:", invitationLink);
    // For demo, just remove from pending and add to accepted organizations
    const acceptedInvite = pendingInvitations.find(inv => inv.invitationLink === invitationLink);
    if (acceptedInvite) {
      setPendingInvitations(prev => prev.filter(inv => inv.invitationLink !== invitationLink));
      setAcceptedOrganizations(prev => [
        ...prev,
        {
          id: `org-accepted-${acceptedInvite.id}`,
          name: `New Org for ${acceptedInvite.email}`,
          description: `Joined via invitation from ${acceptedInvite.invitedBy}`,
          memberCount: 1,
          joinedAt: new Date(),
        },
      ]);
      alert(`Invitation from ${acceptedInvite.invitedBy} for ${acceptedInvite.email} accepted!`);
    }
  };

  // Simulate data loading
  React.useEffect(() => {
    setLoading(true);
    // Simulate API call
    const timer = setTimeout(() => {
      setPendingInvitations([
        {
          id: "inv1",
          email: "org1",
          status: "pending",
          invitedBy: "Admin User",
          invitedAt: new Date(Date.now() - 86400000 * 2), // 2 days ago
          invitationLink: "http://localhost:3000/accept-invitation?token=demotoken1",
        },
        {
          id: "inv2",
          email: "org2",
          status: "pending",
          invitedBy: "Admin User",
          invitedAt: new Date(Date.now() - 86400000), // 1 day ago
          invitationLink: "http://localhost:3000/accept-invitation?token=demotoken2",
        },
      ]);
      setAcceptedOrganizations([
        {
          id: "org1",
          name: "Acme Corp",
          description: "Leading in widgets production.",
          memberCount: 15,
          joinedAt: new Date(Date.now() - 86400000 * 30),
        },
        {
          id: "org2",
          name: "Globex Inc.",
          description: "Innovating in global solutions.",
          memberCount: 22,
          joinedAt: new Date(Date.now() - 86400000 * 60),
        },
      ]);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleSendInvitation = async () => {
    if (invitationEmails.length === 0) {
      alert("Please add at least one email address to send invitations.");
      return;
    }

    try {
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

      // Assuming the backend returns the newly created invitations
      setPendingInvitations(prev => [...prev, ...result.sentInvitations]);
      setInvitationEmails([]); // Clear the input after sending
      alert(`Invitations sent to ${invitationEmails.join(', ')}.`);

    } catch (error: any) {
      console.error("Error sending invitations:", error);
      alert(error.message || "Failed to send invitations. Please try again.");
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
                  <Button onClick={handleSendInvitation} className="bg-gray-900 hover:bg-gray-800">
                    <Send className="h-4 w-4 mr-2" />
                    Send Invitation
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
                {pendingInvitations.map((invite) => (
                  <Card key={invite.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex flex-col sm:flex-row items-center space-x-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-blue-500 text-white text-sm">
                            {getInitials(invite.email.split('@')[0])}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-gray-900">{invite.email}</p>
                          <p className="text-sm text-gray-500">Invited by {invite.invitedBy} on {new Date(invite.invitedAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <Button 
                        onClick={() => handleAcceptInvitation(invite.invitationLink!)} 
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
                      >
                        Accept
                      </Button>
                    </CardContent>
                  </Card>
                ))}
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
