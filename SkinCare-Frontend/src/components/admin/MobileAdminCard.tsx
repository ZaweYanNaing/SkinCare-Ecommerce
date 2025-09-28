import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MobileAdminCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  loading?: boolean;
}

export const MobileAdminCard: React.FC<MobileAdminCardProps> = ({
  title,
  value,
  icon: Icon,
  description,
  trend,
  loading = false,
}) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600 truncate">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-gray-500 flex-shrink-0" />
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <div className="text-2xl font-bold text-gray-900">
            {loading ? (
              <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
            ) : (
              value
            )}
          </div>
          {description && (
            <p className="text-xs text-gray-500 truncate">{description}</p>
          )}
          {trend && (
            <div className="flex items-center text-xs">
              <span
                className={`font-medium ${
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
              </span>
              <span className="text-gray-500 ml-1">from last month</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MobileAdminCard;