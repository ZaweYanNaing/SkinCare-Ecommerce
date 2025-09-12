import type { ReactNode } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Loader2 } from 'lucide-react';

interface ProtectedAdminRouteProps {
  children: ReactNode;
  requiredModule?: string;
  requiredAction?: string;
}

// Helper function to get required permissions based on route
const getRoutePermissions = (pathname: string) => {
  if (pathname.includes('/admin/customers')) {
    return { module: 'customer_management', action: 'read' };
  }
  if (pathname.includes('/admin/admins')) {
    return { module: 'admin_management', action: 'read' };
  }
  if (pathname.includes('/admin/productCreate')) {
    return { module: 'product_management', action: 'create' };
  }
  if (pathname.includes('/admin/products')) {
    return { module: 'product_management', action: 'read' };
  }
  return null;
};

const ProtectedAdminRoute = ({ 
  children, 
  requiredModule, 
  requiredAction 
}: ProtectedAdminRouteProps) => {
  const { isAuthenticated, hasPermission, isLoading, admin } = useAdminAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Checking Authentication
            </h3>
            <p className="text-gray-600 text-center">
              Please wait while we verify your admin credentials...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Get permissions for the current route
  const routePermissions = getRoutePermissions(location.pathname);
  const module = requiredModule || routePermissions?.module;
  const action = requiredAction || routePermissions?.action;

  // Check specific permissions if required
  if (module && action) {
    if (!hasPermission(module, action)) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardContent className="flex flex-col items-center justify-center p-8">
              <div className="bg-red-100 p-4 rounded-full mb-4">
                <Shield className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Access Denied
              </h3>
              <p className="text-gray-600 text-center mb-4">
                Your role ({admin?.role}) doesn't have permission to access this page.
              </p>
              <p className="text-sm text-gray-500 text-center">
                Required: {action} access to {module}
              </p>
              <button
                onClick={() => window.history.back()}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Go Back
              </button>
            </CardContent>
          </Card>
        </div>
      );
    }
  }

  // Render the protected content
  return <>{children}</>;
};

export default ProtectedAdminRoute;