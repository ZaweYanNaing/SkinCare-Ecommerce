'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, XAxis, YAxis } from 'recharts';
import { useEffect, useState } from 'react';

interface SalesData {
  category: string;
  sales: number;
  revenue: number;
}

export function OverviewChart() {
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSalesData();
  }, []);

  const fetchSalesData = async () => {
    try {
      const response = await fetch('http://localhost/admin/sales-by-category.php');
      const data = await response.json();
      
      if (data.success) {
        setSalesData(data.data);
      }
    } catch (error) {
      console.error('Error fetching sales data:', error);
    } finally {
      setLoading(false);
    }
  };

  const productSalesData = salesData.map((item, index) => ({
    product: item.category,
    sales: item.sales,
    fill: `var(--chart-${(index % 5) + 1})`,
  }));

  const chartConfig = {
    sales: {
      label: 'Sales',
    },
    ...salesData.reduce((acc, item, index) => {
      acc[item.category.toLowerCase().replace(/\s+/g, '')] = {
        label: item.category,
        color: `var(--chart-${(index % 5) + 1})`,
      };
      return acc;
    }, {} as Record<string, { label: string; color: string }>)
  } satisfies ChartConfig;
  
  if (loading) {
    return (
      <Card className="h-105 w-full">
        <CardHeader>
          <CardTitle>Sales data by category</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div>Loading chart data...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-105 w-full">
      <CardHeader>
        <CardTitle>Sales data by category</CardTitle>
        <CardDescription>Product performance overview by category</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <ChartContainer config={chartConfig} className="h-full">
          <BarChart
            accessibilityLayer
            data={productSalesData}
            layout="vertical"
            margin={{
              left: 0,
            }}
          >
            <YAxis
              dataKey="product"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value}
            />
            <XAxis dataKey="sales" type="number" hide />
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Bar dataKey="sales" layout="vertical" radius={5} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
