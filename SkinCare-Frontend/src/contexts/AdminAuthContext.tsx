import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AdminData {
  id: number;
  email: string;
  role: string;
  roleDescription: string;
  permissions: Record<string, string[]>;
  sessionToken: string;
}

interface AdminAuthContextType {
  admin: AdminData | null;
  isAuthenticated: boolean;
  login: (adminData: AdminData) => void;
  logout: () => void;
  hasPermission: (module: string, action: string) => boolean;
  isLoading: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

interface AdminAuthProviderProps {
  children: ReactNode;
}

export const AdminAuthProvider = ({ children }: AdminAuthProviderProps) => {
  const [admin, setAdmin] = useState<AdminData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if admin is logged in on app start
    const checkAuthStatus = () => {
      try {
        const adminData = localStorage.getItem('adminData');
        const isLoggedIn = localStorage.getItem('isAdminLoggedIn');
        
        if (adminData && isLoggedIn === 'true') {
          const parsedAdminData = JSON.parse(adminData);
          setAdmin(parsedAdminData);
        }
      } catch (error) {
        console.error('Error checking admin auth status:', error);
        // Clear invalid data
        localStorage.removeItem('adminData');
        localStorage.removeItem('isAdminLoggedIn');
        localStorage.removeItem('adminRole');
        localStorage.removeItem('adminToken');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = (adminData: AdminData) => {
    setAdmin(adminData);
    localStorage.setItem('adminData', JSON.stringify(adminData));
    localStorage.setItem('adminRole', adminData.role);
    localStorage.setItem('adminToken', adminData.sessionToken);
    localStorage.setItem('isAdminLoggedIn', 'true');
  };

  const logout = () => {
    setAdmin(null);
    localStorage.removeItem('adminData');
    localStorage.removeItem('isAdminLoggedIn');
    localStorage.removeItem('adminRole');
    localStorage.removeItem('adminToken');
  };

  const hasPermission = (module: string, action: string): boolean => {
    if (!admin || !admin.permissions) return false;
    
    const modulePermissions = admin.permissions[module];
    if (!modulePermissions) return false;
    
    return modulePermissions.includes(action);
  };

  const isAuthenticated = admin !== null;

  const value: AdminAuthContextType = {
    admin,
    isAuthenticated,
    login,
    logout,
    hasPermission,
    isLoading
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export default AdminAuthContext;