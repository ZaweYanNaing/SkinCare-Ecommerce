
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { Users, Shield, ArrowRight, Lock } from 'lucide-react';
import { useNavigate } from 'react-router';

interface AdminPermissions {
  admin_management: string[];
  account_management: string[];
  product_management: string[];
  customer_management: string[];
}

function AccManagement() {
  const navigate = useNavigate();
  const [currentAdminRole, setCurrentAdminRole] = useState<string>('Staff'); // Default to most restrictive
  const [permissions, setPermissions] = useState<AdminPermissions>({
    admin_management: [],
    account_management: [],
    product_management: [],
    customer_management: []
  });

  useEffect(() => {
    // In a real app, this would come from authentication context/JWT token
    // For demo, we'll simulate getting admin role from localStorage or API
    const adminRole = localStorage.getItem('adminRole') || 'Staff';
    setCurrentAdminRole(adminRole);
    
    // Set permissions based on role
    const rolePermissions = getRolePermissions(adminRole);
    setPermissions(rolePermissions);
  }, []);

  const getRolePermissions = (role: string): AdminPermissions => {
    const permissionMap: Record<string, AdminPermissions> = {
      'Super Admin': {
        admin_management: ['create', 'read', 'update', 'delete'],
        account_management: ['create', 'read', 'update', 'delete'],
        product_management: ['create', 'read', 'update', 'delete'],
        customer_management: ['create', 'read', 'update', 'delete']
      },
      'Manager': {
        admin_management: [], // Cannot create new admins
        account_management: ['read', 'update'],
        product_management: ['create', 'read', 'update', 'delete'],
        customer_management: ['read', 'update']
      },
      'Staff': {
        admin_management: [],
        account_management: [],
        product_management: [],
        customer_management: ['read']
      },
      'Expert': {
        admin_management: [],
        account_management: ['read'],
        product_management: ['read', 'update'],
        customer_management: ['read', 'update']
      }
    };
    
    return permissionMap[role] || permissionMap['Staff'];
  };

  const hasPermission = (module: keyof AdminPermissions, action: string): boolean => {
    return permissions[module]?.includes(action) || false;
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'Super Admin': return 'bg-red-100 text-red-800';
      case 'Manager': return 'bg-blue-100 text-blue-800';
      case 'Staff': return 'bg-green-100 text-green-800';
      case 'Expert': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const accountTypes = [
    {
      title: 'Customer Accounts',
      description: 'Manage customer accounts, view their orders, and handle customer data',
      icon: Users,
      path: '/admin/customers',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      module: 'customer_management' as keyof AdminPermissions,
      features: [
        { text: 'View customer profiles', action: 'read' },
        { text: 'Track order history', action: 'read' },
        { text: 'Manage customer data', action: 'update' },
        { text: 'Delete customer accounts', action: 'delete' }
      ]
    },
    {
      title: 'Admin Accounts',
      description: 'Manage administrator accounts, permissions, and system access',
      icon: Shield,
      path: '/admin/admins',
      color: 'text-red-500',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      module: 'admin_management' as keyof AdminPermissions,
      features: [
        { text: 'Create admin accounts', action: 'create' },
        { text: 'Manage permissions', action: 'update' },
        { text: 'Update admin details', action: 'update' },
        { text: 'Delete admin accounts', action: 'delete' }
      ]
    }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center">
          <Separator orientation="vertical" className="mr-4 h-6" />
          <Breadcrumb>
            <BreadcrumbList className="text-[1rem]">
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/admin">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Account Management</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <div className="space-y-6">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Account Management</h1>
            <Badge className={getRoleBadgeColor(currentAdminRole)}>
              {currentAdminRole}
            </Badge>
          </div>
          <p className="text-gray-600">Choose the type of accounts you want to manage</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {accountTypes.map((accountType) => {
            const IconComponent = accountType.icon;
            const hasAnyPermission = accountType.features.some(feature => 
              hasPermission(accountType.module, feature.action)
            );
            const isAccessible = hasAnyPermission;
            
            return (
              <Card 
                key={accountType.title}
                className={`${accountType.borderColor} ${accountType.bgColor} ${
                  isAccessible 
                    ? 'hover:shadow-lg cursor-pointer' 
                    : 'opacity-60 cursor-not-allowed'
                } transition-all duration-300`}
                onClick={() => isAccessible && navigate(accountType.path)}
              >
                <CardHeader className="text-center pb-4">
                  <div className={`mx-auto w-16 h-16 ${accountType.bgColor} rounded-full flex items-center justify-center mb-4 relative`}>
                    <IconComponent className={`h-8 w-8 ${accountType.color}`} />
                    {!isAccessible && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-75 rounded-full">
                        <Lock className="h-6 w-6 text-gray-500" />
                      </div>
                    )}
                  </div>
                  <CardTitle className="text-xl font-semibold text-gray-900 flex items-center justify-center gap-2">
                    {accountType.title}
                    {!isAccessible && (
                      <Badge variant="secondary" className="text-xs">
                        No Access
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    {accountType.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3 mb-6">
                    {accountType.features.map((feature, index) => {
                      const hasFeaturePermission = hasPermission(accountType.module, feature.action);
                      return (
                        <div key={index} className={`flex items-center text-sm ${
                          hasFeaturePermission ? 'text-gray-700' : 'text-gray-400'
                        }`}>
                          <div className={`w-2 h-2 ${
                            hasFeaturePermission 
                              ? accountType.color.replace('text-', 'bg-')
                              : 'bg-gray-300'
                          } rounded-full mr-3`}></div>
                          {feature.text}
                          {!hasFeaturePermission && (
                            <Lock className="h-3 w-3 ml-2 text-gray-400" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <Button 
                    className="w-full"
                    disabled={!isAccessible}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isAccessible) navigate(accountType.path);
                    }}
                  >
                    {isAccessible ? (
                      <>
                        Manage {accountType.title}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    ) : (
                      <>
                        Access Restricted
                        <Lock className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Stats */}
        <div className="mt-12">
          <Card>
            <CardHeader>
              <CardTitle>Quick Overview</CardTitle>
              <CardDescription>System account statistics at a glance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">-</div>
                  <div className="text-sm text-gray-600">Total Customers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">-</div>
                  <div className="text-sm text-gray-600">Active Customers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">-</div>
                  <div className="text-sm text-gray-600">Total Admins</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">-</div>
                  <div className="text-sm text-gray-600">System Users</div>
                </div>
              </div>
              <div className="text-center mt-4">
                <p className="text-sm text-gray-500">
                  Click on the cards above to view detailed account management
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default AccManagement;