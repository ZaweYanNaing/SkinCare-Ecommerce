import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  ShoppingCart, 
  DollarSign, 
  Package,
  Eye,
  Heart,
  Star,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface StatCard {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
    period: string;
  };
  icon: React.ElementType;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
}

interface AdminStatsDashboardProps {
  stats: StatCard[];
  loading?: boolean;
}

const colorClasses = {
  blue: {
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    icon: 'text-blue-500',
    trend: 'text-blue-600',
  },
  green: {
    bg: 'bg-green-50',
    text: 'text-green-600',
    icon: 'text-green-500',
    trend: 'text-green-600',
  },
  yellow: {
    bg: 'bg-yellow-50',
    text: 'text-yellow-600',
    icon: 'text-yellow-500',
    trend: 'text-yellow-600',
  },
  red: {
    bg: 'bg-red-50',
    text: 'text-red-600',
    icon: 'text-red-500',
    trend: 'text-red-600',
  },
  purple: {
    bg: 'bg-purple-50',
    text: 'text-purple-600',
    icon: 'text-purple-500',
    trend: 'text-purple-600',
  },
};

export const AdminStatsDashboard: React.FC<AdminStatsDashboardProps> = ({
  stats,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-5 w-5 bg-gray-200 rounded"></div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-20"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        const colors = colorClasses[stat.color];
        
        return (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600 truncate">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${colors.bg}`}>
                  <Icon className={`h-4 w-4 ${colors.icon}`} />
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-gray-900">
                  {stat.value}
                </div>
                
                {stat.change && (
                  <div className="flex items-center text-sm">
                    {stat.change.type === 'increase' ? (
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                    )}
                    <span
                      className={`font-medium ${
                        stat.change.type === 'increase' ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {stat.change.value}%
                    </span>
                    <span className="text-gray-500 ml-1">
                      {stat.change.period}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

// Quick Stats Component for smaller displays
interface QuickStatsProps {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: string;
  totalProducts: number;
  loading?: boolean;
}

export const QuickStats: React.FC<QuickStatsProps> = ({
  totalUsers,
  totalOrders,
  totalRevenue,
  totalProducts,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white p-4 rounded-lg border animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-12"></div>
          </div>
        ))}
      </div>
    );
  }

  const quickStats = [
    { label: 'Users', value: totalUsers, icon: Users, color: 'text-blue-600' },
    { label: 'Orders', value: totalOrders, icon: ShoppingCart, color: 'text-green-600' },
    { label: 'Revenue', value: totalRevenue, icon: DollarSign, color: 'text-yellow-600' },
    { label: 'Products', value: totalProducts, icon: Package, color: 'text-purple-600' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {quickStats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className="bg-white p-4 rounded-lg border hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <Icon className={`h-5 w-5 ${stat.color}`} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Activity Feed Component
interface ActivityItem {
  id: string;
  type: 'order' | 'user' | 'product' | 'review';
  message: string;
  timestamp: string;
  status?: 'success' | 'warning' | 'error';
}

interface ActivityFeedProps {
  activities: ActivityItem[];
  loading?: boolean;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  activities,
  loading = false,
}) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'order': return ShoppingCart;
      case 'user': return Users;
      case 'product': return Package;
      case 'review': return Star;
      default: return AlertCircle;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-3 animate-pulse">
                <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No recent activity</p>
          ) : (
            activities.map((activity) => {
              const Icon = getActivityIcon(activity.type);
              return (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <Icon className={`h-4 w-4 ${getStatusColor(activity.status)}`} />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500">{activity.timestamp}</p>
                  </div>
                  {activity.status && (
                    <Badge 
                      variant={activity.status === 'error' ? 'destructive' : 'secondary'}
                      className="text-xs"
                    >
                      {activity.status}
                    </Badge>
                  )}
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminStatsDashboard;