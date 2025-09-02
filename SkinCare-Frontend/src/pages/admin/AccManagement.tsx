
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { Users, Shield, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router';

function AccManagement() {
  const navigate = useNavigate();

  const accountTypes = [
    {
      title: 'Customer Accounts',
      description: 'Manage customer accounts, view their orders, and handle customer data',
      icon: Users,
      path: '/admin/customers',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      features: [
        'View customer profiles',
        'Track order history',
        'Manage customer data',
        'Delete customer accounts'
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
      features: [
        'Create admin accounts',
        'Manage permissions',
        'Update admin details',
        'Delete admin accounts'
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Account Management</h1>
          <p className="text-gray-600">Choose the type of accounts you want to manage</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {accountTypes.map((accountType) => {
            const IconComponent = accountType.icon;
            return (
              <Card 
                key={accountType.title}
                className={`${accountType.borderColor} ${accountType.bgColor} hover:shadow-lg transition-all duration-300 cursor-pointer`}
                onClick={() => navigate(accountType.path)}
              >
                <CardHeader className="text-center pb-4">
                  <div className={`mx-auto w-16 h-16 ${accountType.bgColor} rounded-full flex items-center justify-center mb-4`}>
                    <IconComponent className={`h-8 w-8 ${accountType.color}`} />
                  </div>
                  <CardTitle className="text-xl font-semibold text-gray-900">
                    {accountType.title}
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    {accountType.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3 mb-6">
                    {accountType.features.map((feature, index) => (
                      <div key={index} className="flex items-center text-sm text-gray-700">
                        <div className={`w-2 h-2 ${accountType.color.replace('text-', 'bg-')} rounded-full mr-3`}></div>
                        {feature}
                      </div>
                    ))}
                  </div>
                  <Button 
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(accountType.path);
                    }}
                  >
                    Manage {accountType.title}
                    <ArrowRight className="ml-2 h-4 w-4" />
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