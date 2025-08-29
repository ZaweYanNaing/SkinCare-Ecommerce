import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router';
import { 
  LayoutDashboard, 
  PackageCheck, 
  PackageSearch, 
  UserPen, 
  ChevronDown,
  ChevronRight,
  Settings,
  Menu,
  X
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface NavItem {
  title: string;
  url: string;
  icon: any;
  items?: { title: string; url: string }[];
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    url: '/admin',
    icon: LayoutDashboard,
    items: [
      { title: 'Overview', url: '/admin' },
      { title: 'Reports', url: '/admin/report' },
      { title: 'Notifications', url: '/admin/notification' },
    ],
  },
  {
    title: 'Account Management',
    url: '/admin/accManange',
    icon: UserPen,
    items: [
      { title: 'All Accounts', url: '/admin/accManange' },
    ],
  },
  {
    title: 'Product Management',
    url: '/admin/productCreate',
    icon: PackageSearch,
    items: [
      { title: 'Edit Products', url: '/admin/productEdit' },
      { title: 'Create Product', url: '/admin/productCreate' },
    ],
  },
  {
    title: 'Transactions',
    url: '/admin/transaction',
    icon: PackageCheck,
  },
];

export default function AdminLayoutWithSidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedItems, setExpandedItems] = useState<string[]>(['Dashboard']);
  const location = useLocation();

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  const isActive = (url: string) => {
    return location.pathname === url;
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 bg-white border-r border-gray-200 flex flex-col`}>
        {/* User Profile Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div className="flex items-center gap-3 p-3 rounded-2xl border border-gray-200 bg-white">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src="/avatars/alice.jpg" alt="Alice" />
                  <AvatarFallback className="rounded-lg bg-blue-500 text-white">AL</AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left text-sm leading-tight">
                  <span className="block font-medium text-gray-900">Alice</span>
                  <span className="block text-xs text-blue-600">Owner</span>
                </div>
                <Settings className="h-4 w-4 text-gray-400" />
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors ml-auto"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 p-4">
          {sidebarOpen && (
            <div className="mb-2">
              <span className="text-sm font-medium text-gray-500">Admin Panel</span>
            </div>
          )}
          <nav className="space-y-1">
            {navItems.map((item) => (
              <div key={item.title}>
                <div
                  className={`flex items-center ${sidebarOpen ? 'justify-between' : 'justify-center'} p-3 rounded-lg cursor-pointer transition-colors ${
                    isActive(item.url) ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => item.items && sidebarOpen && toggleExpanded(item.title)}
                  title={!sidebarOpen ? item.title : ''}
                >
                  <div className={`flex items-center ${sidebarOpen ? 'space-x-3' : ''}`}>
                    <item.icon size={20} />
                    {sidebarOpen && <span className="font-medium">{item.title}</span>}
                  </div>
                  {sidebarOpen && item.items && (
                    expandedItems.includes(item.title) ? 
                      <ChevronDown size={16} /> : 
                      <ChevronRight size={16} />
                  )}
                </div>

                {/* Sub items */}
                {sidebarOpen && item.items && expandedItems.includes(item.title) && (
                  <div className="mt-1 ml-6 space-y-1">
                    {item.items.map((subItem) => (
                      <Link
                        key={subItem.title}
                        to={subItem.url}
                        className={`block p-2 rounded-lg text-sm transition-colors ${
                          isActive(subItem.url) 
                            ? 'bg-blue-50 text-blue-700 font-medium' 
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {subItem.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}