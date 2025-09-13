"use client"

import * as React from "react"
import { useEffect } from "react"
import {
  BookOpen,
  Bot,
  Command,
  Frame,
  LifeBuoy,
  Bell,
  Map,
  PieChart,
  Send,
  Settings2,
  SquareTerminal,
} from "lucide-react"

import { NavMain } from "@/components/sidebar_assets/nav-main"
import { NavSecondary } from "@/components/sidebar_assets/nav-secondary"
import { NavUser } from "@/components/sidebar_assets/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useAppSelector, useAppDispatch } from "@/store"
import { fetchUserDetails } from "@/store/userSlice"

const data = {
  navMain: [
    {
      title: "Uptime",
      url: "/dashboard/incidents",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Incidents",
          url: "/dashboard/incidents",
        },
        {
          title: "Who's on call",
          url: "/dashboard/oncalls",
        },
        {
          title: "Esclations policies",
          url: "/dashboard/escalations-policies",
        },
        {
          title: "Monitors",
          url: "/dashboard/monitoring",
        },
        {
          title: "Status pages",
          url: "/dashboard/status-pages",
        },
        {
          title: "Integrations",
          url: "/dashboard/integrations",
        },
        {
          title: "Reporting",
          url: "/dashboard/reporting",
        },
      ],
    },
    {
      title: "Telemetry (upcoming)",
      url: "#",
      icon: Bot,
      items: [
        {
          title: "Alerts(upcoming)",
          url: "#",
        },
        {
          title: "Source(upcoming)",
          url: "#",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "Account Settings",
          url: "/dashboard/settings/account_settings",
        },
        {
          title: "Team",
          url: "/dashboard/settings/teams",
        },
        {
          title: "Billing",
          url: "/dashboard/settings/billings",
        },
        {
          title: "Invites",
          url: "/dashboard/settings/invites",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Notifications",
      url: "#",
      icon: Bell,
    },
    {
      title: "Organizations",
      url: "/dashboard/organizations",
      icon: LifeBuoy,
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.user);
  const { isAuthenticated, userId } = useAppSelector(state => state.auth);
  const { currentOrganizationId } = useAppSelector(state => state.organization);

  // Find the selected organization from the user's organizations list
  const selectedOrganization = user.organizations.find(
    (org) => org.id === user.selectedOrganizationId
  );

  useEffect(() => {
    if (isAuthenticated && userId) {
      // Only fetch if user.id is not set OR if currentOrganizationId changed and the user data for that org is not loaded
      if (!user.id || (currentOrganizationId && user.organizations.every(org => org.id !== currentOrganizationId))) {
        dispatch(fetchUserDetails());
      }
    }
  }, [dispatch, isAuthenticated, userId, user.id, currentOrganizationId, user.organizations]);

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{selectedOrganization?.name || "Uptime Matrix"}</span>
                  <span className="truncate text-xs">{user.selectedOrganizationRole || "Enterprise"}</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser 
          user={{
            name: user.fullName || 'User',
            email: user.email || '',
            avatar: user.avatar || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSIjwR4e4hMXd_lKAYUEKOaIxoy0mNe1ahJIw&s'
          }} 
        />
      </SidebarFooter>
    </Sidebar>
  )
}
