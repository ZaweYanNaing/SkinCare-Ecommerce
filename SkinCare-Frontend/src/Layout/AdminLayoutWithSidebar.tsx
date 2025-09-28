import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router';
import { 
  LayoutDashboard, 
  PackageCheck, 
  PackageSearch, 
  UserPen, 
  ChevronDown, 
  ChevronRight, 
  Menu, 
  X, 
  LogOut,
  Bell,
  Search,
  Settings,
  Home
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { ToastContainer } from 'react-toastify';
import '../styles/admin-mobile-fix.css';

interface NavItem {
  title: string;
  url: string;
  icon: any;
  items?: { title: string; url: string }[];
  badge?: number;
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
      { title: 'Customers', url: '/admin/customers' },
      { title: 'Admins', url: '/admin/admins' },
      { title: 'Experts', url: '/admin/experts' },
    ],
  },
  {
    title: 'Product Management',
    url: '/admin/productCreate',
    icon: PackageSearch,
    items: [
      { title: 'All Products', url: '/admin/products' },
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
  const [sidebarOpen, setSidebarOpen] = useState(false); // Default closed on mobile
  const [expandedItems, setExpandedItems] = useState<string[]>(['Dashboard']);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { admin, logout } = useAdminAuth();

  // Check if mobile
  useEffect(() => {
    const checkIsMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobile && sidebarOpen) {
      document.body.classList.add('sidebar-open');
    } else {
      document.body.classList.remove('sidebar-open');
    }
    
    return () => {
      document.body.classList.remove('sidebar-open');
    };
  }, [isMobile, sidebarOpen]);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'Super Admin':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Manager':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Staff':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Expert':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) => (prev.includes(title) ? prev.filter((item) => item !== title) : [...prev, title]));
  };

  const isActive = (url: string) => {
    return location.pathname === url;
  };

  const isParentActive = (item: NavItem) => {
    if (isActive(item.url)) return true;
    return item.items?.some(subItem => isActive(subItem.url)) || false;
  };

  return (
    <div className="flex min-h-screen bg-gray-50 admin-layout">
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Only render on mobile when open, always render on desktop */}
      {(!isMobile || sidebarOpen) && (
        <div className={`
          ${isMobile ? 'fixed top-0 left-0 h-full admin-sidebar-mobile' : 'relative'} 
          ${sidebarOpen ? 'w-64' : 'w-16'} 
          transition-all duration-300 bg-white border-r border-gray-200 flex flex-col
          ${isMobile ? 'z-50' : 'z-10'}
        `}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            {/* Logo/Brand */}
            <div className={`flex items-center gap-3 ${!sidebarOpen && !isMobile ? 'justify-center w-full' : ''}`}>
              {sidebarOpen && (
                <div className="min-w-0">
                  <h1 className="font-bold text-gray-900 text-lg truncate">SkinCare</h1>
                  <p className="text-sm text-gray-500">Admin Panel</p>
                </div>
              )}
              {!sidebarOpen && !isMobile && (
                <div className="bg-blue-600 p-2 rounded-lg flex-shrink-0">
                  <LayoutDashboard className="h-5 w-5 text-white" />
                </div>
              )}
            </div>

            {/* Toggle Button - Only show on desktop when sidebar is open */}
            {!isMobile && sidebarOpen && (
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)} 
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* User Profile - Only show when sidebar is open */}
        {sidebarOpen && admin && (
          <div className="p-4 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
              <Avatar className="h-8 w-8 rounded-lg flex-shrink-0">
                <AvatarFallback className="rounded-lg bg-blue-500 text-white font-medium text-xs">
                  {getInitials(admin.email)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate text-xs">{admin.email}</p>
                <Badge className={`text-xs ${getRoleBadgeColor(admin.role)} mt-1`}>
                  {admin.role}
                </Badge>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout} 
                className="p-1.5 h-auto hover:bg-red-50 hover:text-red-600 flex-shrink-0" 
                title="Logout"
              >
                <LogOut className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex-1 p-4 overflow-y-auto">
          <nav className="space-y-1">
            {navItems.map((item) => (
              <div key={item.title}>
                <div
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200 group ${
                    isParentActive(item) 
                      ? 'bg-blue-50 text-blue-700 shadow-sm' 
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  onClick={() => {
                    if (item.items && sidebarOpen) {
                      toggleExpanded(item.title);
                    } else {
                      navigate(item.url);
                      if (isMobile) setSidebarOpen(false);
                    }
                  }}
                  title={!sidebarOpen ? item.title : ''}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <item.icon 
                      size={18} 
                      className={`flex-shrink-0 ${isParentActive(item) ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'}`}
                    />
                    {sidebarOpen && (
                      <span className="font-medium truncate text-sm">{item.title}</span>
                    )}
                  </div>
                  {sidebarOpen && item.items && (
                    <div className="flex-shrink-0">
                      {expandedItems.includes(item.title) ? 
                        <ChevronDown size={14} className="text-gray-400" /> : 
                        <ChevronRight size={14} className="text-gray-400" />
                      }
                    </div>
                  )}
                </div>

                {/* Sub items */}
                {sidebarOpen && item.items && expandedItems.includes(item.title) && (
                  <div className="mt-1 ml-6 space-y-1">
                    {item.items.map((subItem) => (
                      <Link
                        key={subItem.title}
                        to={subItem.url}
                        onClick={() => isMobile && setSidebarOpen(false)}
                        className={`block p-2 pl-4 rounded-lg text-sm transition-colors border-l-2 ${
                          isActive(subItem.url) 
                            ? 'bg-blue-50 text-blue-700 font-medium border-blue-300' 
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-transparent'
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

        {/* Footer */}
        {sidebarOpen && (
          <div className="p-4 border-t border-gray-200 flex-shrink-0">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>v1.0.0</span>
              <Button variant="ghost" size="sm" className="p-1 h-auto">
                <Settings className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}
        </div>
      )}

      {/* Main Content */}
      <div className={`flex-1 flex flex-col min-w-0 ${isMobile ? 'w-full' : ''}`}>
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex-shrink-0">
          <div className="flex items-center justify-between max-w-full">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {/* Mobile Menu Button - Only show on mobile when sidebar is closed */}
              {isMobile && !sidebarOpen && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 flex-shrink-0"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              )}

              {/* Page Title */}
              <div className="min-w-0 flex-1">
                <h1 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                  Overview
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              {/* Search - Hidden on small mobile */}
              <div className="hidden sm:block">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search..."
                    className="pl-10 w-32 sm:w-48 lg:w-64 bg-gray-50 border-0 focus:bg-white text-sm"
                  />
                </div>
              </div>

              {/* Notifications */}
              <Button variant="ghost" size="sm" className="relative p-2">
                <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="absolute -top-1 -right-1 h-3 w-3 sm:h-4 sm:w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  3
                </span>
              </Button>

              {/* Mobile User Avatar */}
              {admin && (
                <Avatar className="h-7 w-7 sm:h-8 sm:w-8 lg:hidden">
                  <AvatarFallback className="bg-blue-500 text-white text-xs">
                    {getInitials(admin.email)}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto bg-gray-50">
          <div className="min-h-full">
            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
            />
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
