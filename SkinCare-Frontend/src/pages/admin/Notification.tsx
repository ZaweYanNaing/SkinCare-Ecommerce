import { useState, useEffect } from 'react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, Mail, AlertCircle, Trash2, Eye, EyeOff, RefreshCw, Package, ShoppingCart } from 'lucide-react';

interface Notification {
  NotiID: number;
  CustomerID: number | null;
  Title: string;
  Message: string;
  Type: string;
  DateSent: string;
  isRead: number;
  CustomerName?: string;
  CustomerEmail?: string;
}

interface NotificationStats {
  total: number;
  unread: number;
  recent: number;
  by_type: Array<{ type: string; count: number }>;
}

function Notification() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats>({ total: 0, unread: 0, recent: 0, by_type: [] });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchNotifications();
    fetchStats();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('http://localhost/admin/notifications.php');
      const data = await response.json();
      if (data.success) {
        setNotifications(data.data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost/admin/notification-stats.php');
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkForNewNotifications = async () => {
    setRefreshing(true);
    try {
      // Trigger auto-notification check
      await fetch('http://localhost/admin/auto-notifications.php');
      
      // Refresh the notifications list
      await fetchNotifications();
      await fetchStats();
    } catch (error) {
      console.error('Error checking for new notifications:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const toggleReadStatus = async (notificationId: number, currentStatus: number) => {
    try {
      const response = await fetch('http://localhost/admin/notifications.php', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: notificationId,
          isRead: currentStatus === 0 ? 1 : 0
        })
      });
      
      const data = await response.json();
      if (data.success) {
        fetchNotifications();
        fetchStats();
      }
    } catch (error) {
      console.error('Error updating notification:', error);
    }
  };

  const deleteNotification = async (notificationId: number) => {
    if (!confirm('Are you sure you want to delete this notification?')) return;
    
    try {
      const response = await fetch('http://localhost/admin/notifications.php', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: notificationId })
      });
      
      const data = await response.json();
      if (data.success) {
        fetchNotifications();
        fetchStats();
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter(n => n.isRead === 0);
    
    for (const notification of unreadNotifications) {
      await toggleReadStatus(notification.NotiID, 0);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order': return <ShoppingCart className="h-5 w-5 text-blue-500" />;
      case 'alert': return <AlertCircle className="h-5 w-5 text-orange-500" />;
      case 'stock': return <Package className="h-5 w-5 text-red-500" />;
      default: return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'order': return 'bg-blue-100 text-blue-800';
      case 'alert': return 'bg-orange-100 text-orange-800';
      case 'stock': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center">
          <Separator orientation="vertical" className="mr-4 h-6" />
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
        
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={checkForNewNotifications}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Checking...' : 'Check for New Notifications'}
          </Button>
          
          {stats.unread > 0 && (
            <Button onClick={markAllAsRead}>
              Mark All Read
            </Button>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Bell className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unread</p>
                <p className="text-2xl font-bold text-orange-600">{stats.unread}</p>
              </div>
              <Mail className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Orders</p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.by_type.find(t => t.type === 'order')?.count || 0}
                </p>
              </div>
              <ShoppingCart className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Alerts</p>
                <p className="text-2xl font-bold text-red-600">
                  {stats.by_type.find(t => t.type === 'alert')?.count || 0}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            System Notifications
          </CardTitle>
          <CardDescription>
            Manual notifications for new orders and low stock alerts - click "Check for New Notifications" to scan for updates
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div>Loading notifications...</div>
            </div>
          ) : notifications.length > 0 ? (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div 
                  key={notification.NotiID} 
                  className={`p-4 border rounded-lg transition-colors ${
                    notification.isRead === 0 ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {getNotificationIcon(notification.Type)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{notification.Title}</h4>
                          <Badge className={`text-xs ${getTypeColor(notification.Type)}`}>
                            {notification.Type}
                          </Badge>
                          {notification.isRead === 0 && (
                            <Badge variant="default" className="text-xs">New</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{notification.Message}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-400">
                          <span>{formatTimeAgo(notification.DateSent)}</span>
                          <span>{new Date(notification.DateSent).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleReadStatus(notification.NotiID, notification.isRead)}
                        title={notification.isRead === 0 ? 'Mark as read' : 'Mark as unread'}
                      >
                        {notification.isRead === 0 ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNotification(notification.NotiID)}
                        className="text-red-600 hover:text-red-700"
                        title="Delete notification"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">No notifications yet</p>
              <p className="text-sm">Click "Check for New Notifications" to scan for new orders and stock alerts</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default Notification;