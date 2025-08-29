import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router';
import { 
  LayoutDashboard, 
  PackageCheck, 
  PackageSearch, 
  UserPen, 
  Menu,
  X,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

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

export default function AdminLayout() {
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
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Admin Panel</h2>
                <p className="text-sm text-gray-500">Alice - Owner</p>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.title}>
                <div>
                  {/* Main nav item */}
                  <div
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                      isActive(item.url) ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => item.items && toggleExpanded(item.title)}
                  >
                    <div className="flex items-center space-x-3">
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
                    <ul className="mt-2 ml-6 space-y-1">
                      {item.items.map((subItem) => (
                        <li key={subItem.title}>
                          <Link
                            to={subItem.url}
                            className={`block p-2 rounded-lg text-sm transition-colors ${
                              isActive(subItem.url) 
                                ? 'bg-blue-50 text-blue-700 font-medium' 
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            {subItem.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Welcome back, Alice</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
