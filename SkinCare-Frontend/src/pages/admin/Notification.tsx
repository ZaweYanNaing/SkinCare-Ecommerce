
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, Mail, AlertCircle } from 'lucide-react';

function Notification() {
  const notifications = [
    {
      id: 1,
      title: 'New Order Received',
      message: 'Order #12345 has been placed by John Doe',
      type: 'order',
      time: '2 minutes ago',
      read: false
    },
    {
      id: 2,
      title: 'Low Stock Alert',
      message: 'Hydrating Toner is running low (5 items left)',
      type: 'alert',
      time: '1 hour ago',
      read: false
    },
    {
      id: 3,
      title: 'Customer Review',
      message: 'New 5-star review for Anti-Aging Scrub',
      type: 'review',
      time: '3 hours ago',
      read: true
    }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <div className="mb-12 flex items-center justify-between">
        <div className="flex items-center">
          <Separator orientation="vertical" className="mr-4 data-[orientation=vertical]:h-4" />
          <Breadcrumb>
            <BreadcrumbList className="text-[1rem]">
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="#">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Notifications</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
          <CardDescription>Stay updated with your store activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`p-4 border rounded-lg ${!notification.read ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {notification.type === 'order' && <Mail className="h-5 w-5 text-blue-500 mt-0.5" />}
                    {notification.type === 'alert' && <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5" />}
                    {notification.type === 'review' && <Bell className="h-5 w-5 text-green-500 mt-0.5" />}
                    <div>
                      <h4 className="font-medium">{notification.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-2">{notification.time}</p>
                    </div>
                  </div>
                  {!notification.read && (
                    <Badge variant="default" className="text-xs">New</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Notification;