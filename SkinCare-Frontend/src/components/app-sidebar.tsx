import { LayoutDashboard, PackageCheck, PackageSearch, UserPen } from 'lucide-react';
import * as React from 'react';

import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from '@/components/ui/sidebar';

// This is sample data.
const data = {
  user: {
    name: 'Alice',
    role: 'Owner',
    avatar: '/avatars/shadcn.jpg',
  },

  navMain: [
    {
      title: 'Dashboard',
      url: '/admin',
      icon: LayoutDashboard,
      isActive: true,
      items: [
        {
          title: 'Overview',
          url: '/admin',
        },
        {
          title: 'Reports',
          url: '/admin/report',
        },
        {
          title: 'Notifications',
          url: '/admin/notification',
        },
      ],
    },
    {
      title: 'Account Management',
      url: '/admin/accManange',
      icon: UserPen,
      items: [
        {
          title: 'All Acc',
          url: '/admin/accManange',
        },
      ],
    },
    {
      title: 'Product Management',
      url: '/admin/productCreate',
      icon: PackageSearch,
      items: [
        {
          title: 'Edit Products',
          url: '/admin/productEdit',
        },
        {
          title: 'Create Product',
          url: '/admin/productCreate',
        },
      ],
    },

    {
      title: 'Transactions',
      url: '/admin/transaction',
      icon: PackageCheck,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <NavUser user={data.user} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter></SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
