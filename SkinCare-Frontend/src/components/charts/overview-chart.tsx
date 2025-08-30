'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';



export function OverviewChart() {


  const productSalesData = [
    {
      product: 'Toner',
      sales: 850,
      fill: 'var(--color-toner)',
    },
    {
      product: 'Serum',
      sales: 720,
      fill: 'var(--color-serum)',
    },
    {
      product: 'Scrub',
      sales: 650,
      fill: 'var(--color-scrub)',
    },
    {
      product: 'Lotion',
      sales: 580,
      fill: 'var(--color-lotion)',
    },
    {
      product: 'Cream',
      sales: 420,
      fill: 'var(--color-cream)',
    },
  ];

  const chartConfig = {
    sales: {
      label: 'Sales',
    },
    toner: {
      label: 'Toner',
      color: 'var(--chart-1)',
    },
    serum: {
      label: 'Serum',
      color: 'var(--chart-2)',
    },
    scrub: {
      label: 'Scrub',
      color: 'var(--chart-3)',
    },
    lotion: {
      label: 'Lotion',
      color: 'var(--chart-4)',
    },
    cream: {
      label: 'Cream',
      color: 'var(--chart-5)',
    },
  } satisfies ChartConfig;
  
  return (
    <Card className="h-105 w-full">
      <CardHeader>
        <CardTitle>Sales data for top skincare products</CardTitle>
        <CardDescription>Product performance overview</CardDescription>
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
                          tickFormatter={(value) => chartConfig[value.toLowerCase() as keyof typeof chartConfig]?.label}
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
