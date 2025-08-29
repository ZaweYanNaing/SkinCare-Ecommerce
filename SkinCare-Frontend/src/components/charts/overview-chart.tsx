'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const chartData = [
  { product: 'Toner', value: 100, color: '#ef4444' },
  { product: 'Serum', value: 80, color: '#10b981' },
  { product: 'Scrub', value: 60, color: '#3b82f6' },
  { product: 'Lotion', value: 70, color: '#f59e0b' },
  { product: 'Cream', value: 40, color: '#ec4899' },
];

export function OverviewChart() {
  const maxValue = Math.max(...chartData.map(item => item.value));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales data for top skincare products</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {chartData.map((item, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className="w-16 text-sm text-gray-600">{item.product}</div>
              <div className="flex-1">
                <div className="h-8 bg-gray-100 rounded-md overflow-hidden">
                  <div
                    className="h-full rounded-md transition-all duration-300"
                    style={{
                      width: `${(item.value / maxValue) * 100}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}