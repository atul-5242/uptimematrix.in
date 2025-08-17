"use client"

import * as React from "react"
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
// import { NavProjects } from "@/components/sidebar_assets/nav-projects"
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

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
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
          title: "Heartbeats",
          url: "/dashboard/heartbeats",
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
      title: "Telemetry",
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
          url: "#",
        },
        {
          title: "Team",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
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
      title: "Support",
      url: "#",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "#",
      icon: Send,
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
                  <span className="truncate font-semibold">Acme Inc</span>
                  <span className="truncate text-xs">Enterprise</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavProjects projects={data.projects} /> */}
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
