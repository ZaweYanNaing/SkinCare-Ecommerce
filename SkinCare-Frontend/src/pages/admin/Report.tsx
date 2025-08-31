import { useState } from 'react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { ChevronDownIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';

const data = [
  { month: 'Jan', sales: 4000, orders: 240 },
  { month: 'Feb', sales: 3000, orders: 139 },
  { month: 'Mar', sales: 2000, orders: 980 },
  { month: 'Apr', sales: 2780, orders: 390 },
  { month: 'May', sales: 1890, orders: 480 },
  { month: 'Jun', sales: 2390, orders: 380 },
];

const financeData = [
  { day: '07', value: 1200 },
  { day: '08', value: 1800 },
  { day: '09', value: 800 },
  { day: '10', value: 1000 },
  { day: '11', value: 1600 },
  { day: '12', value: 2200 },
];

const transactionsData = [
  { no: 1, customer: 'Sophia', amount: '$200', payment: 'Kpay' },
  { no: 2, customer: 'Liam', amount: '$230', payment: 'Visa' },
  { no: 3, customer: 'Ovlivia', amount: '$150', payment: 'PayPal' },
  { no: 4, customer: 'Noah', amount: '$300', payment: 'AYA pay' },
  { no: 5, customer: 'Ava', amount: '$170', payment: 'Credit Cart' },
];

function Report() {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(undefined);
  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <div className="mb-8 flex items-center justify-between ">
        <div className="flex items-center">
          <Separator orientation="vertical" className="mr-4 h-6" />
          <Breadcrumb>
            <BreadcrumbList className="text-[1rem]">
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="#">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Reports</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" id="date" className="w-35 justify-between font-normal">
              {date ? date.toLocaleDateString() : 'Select date'}
              <ChevronDownIcon />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto overflow-hidden p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              captionLayout="dropdown"
              onSelect={(date) => {
                setDate(date);
                setOpen(false);
              }}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Sales Report</CardTitle>
            <CardDescription>Sales and orders data for the past 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sales" fill="#3b82f6" />
                <Bar dataKey="orders" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Finance Chart and Transactions */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Finance Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Finance Chart</CardTitle>
              <div className="flex items-center justify-between">
                <CardDescription>Daily Finance</CardDescription>
                <span className="text-sm text-gray-500">Last 6 Days</span>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={financeData}>
                  <Line type="monotone" dataKey="value" stroke="#f97316" strokeWidth={3} dot={false} />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} interval={0} type="category" />
                  <YAxis hide />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Transactions Table */}
          <Card>
            <CardHeader>
              <CardTitle>Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-4 text-sm font-medium text-gray-600 border-b pb-2">
                  <div>No.</div>
                  <div>Customer</div>
                  <div>Amount</div>
                  <div>Payment</div>
                </div>
                {transactionsData.map((transaction) => (
                  <div key={transaction.no} className="grid grid-cols-4 gap-4 text-sm py-2">
                    <div className="font-medium">{transaction.no}</div>
                    <div className="text-gray-600">{transaction.customer}</div>
                    <div className="font-medium">{transaction.amount}</div>
                    <div className="text-gray-600">{transaction.payment}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 "></div>
      </div>
    </div>
  );
}

export default Report;
