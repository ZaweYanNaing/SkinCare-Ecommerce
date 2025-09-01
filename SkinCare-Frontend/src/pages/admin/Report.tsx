import { useState, useEffect } from 'react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { EnhancedExportDialog } from '@/components/EnhancedExportDialog';

interface MonthlySalesData {
  month: string;
  sales: number;
  orders: number;
}

interface FinanceData {
  day: string;
  value: number;
}

interface TransactionData {
  orders: number;
  no: number;
  customer: string;
  amount: string;
  payment: string;
  payDate?: string;
}

function Report() {
  const [monthlySalesData, setMonthlySalesData] = useState<MonthlySalesData[]>([]);
  const [financeData, setFinanceData] = useState<FinanceData[]>([]);
  const [transactionsData, setTransactionsData] = useState<TransactionData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);

      // Fetch monthly sales data
      const monthlySalesResponse = await fetch('http://localhost/admin/monthly-sales-report.php');
      const monthlySalesResult = await monthlySalesResponse.json();

      // Fetch daily finance data
      const financeResponse = await fetch('http://localhost/admin/daily-finance-report.php');
      const financeResult = await financeResponse.json();

      // Fetch transactions data
      const transactionsResponse = await fetch('http://localhost/admin/transactions-report.php');
      const transactionsResult = await transactionsResponse.json();

      // Debug logging
      console.log('Monthly Sales Result:', monthlySalesResult);
      console.log('Finance Result:', financeResult);
      console.log('Transactions Result:', transactionsResult);

      if (monthlySalesResult.success) {
        setMonthlySalesData(monthlySalesResult.data);
      } else {
        console.error('Monthly sales error:', monthlySalesResult.message);
      }

      if (financeResult.success) {
        setFinanceData(financeResult.data);
      } else {
        console.error('Finance error:', financeResult.message);
      }

      if (transactionsResult.success) {
        setTransactionsData(transactionsResult.data);
      } else {
        console.error('Transactions error:', transactionsResult.message);
      }
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };
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
        <div className="flex items-center gap-3">
          <EnhancedExportDialog disabled={loading} exportEndpoint="http://localhost/admin/export-report.php" filename="report_data" />
        </div>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Sales Report</CardTitle>
            <CardDescription>Sales and orders data for the past 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-[300px]">
                <div>Loading monthly sales data...</div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlySalesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="sales" fill="#3b82f6" />
                  <Bar dataKey="orders" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            )}
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
              {loading ? (
                <div className="flex items-center justify-center h-[280px]">
                  <div>Loading finance data...</div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={financeData}>
                    <Line type="monotone" dataKey="value" stroke="#f97316" strokeWidth={3} dot={false} />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} interval={0} type="category" />
                    <YAxis hide />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Top Customers Table */}
          <Card>
            <CardHeader>
              <CardTitle>Top 5 Customers</CardTitle>
              <CardDescription>Customers with highest total purchase amounts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="grid grid-cols-4 gap-4 text-sm font-medium text-gray-600 border-b pb-2 flex-1">
                    <div>Rank</div>
                    <div>Customer</div>
                    <div>Total Amount</div>
                    <div>Orders</div>
                  </div>
                </div>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div>Loading top customers...</div>
                  </div>
                ) : transactionsData.length > 0 ? (
                  transactionsData.map((transaction) => (
                    <div key={transaction.no} className="grid grid-cols-4 gap-4 text-sm py-2">
                      <div className="font-medium">#{transaction.no}</div>
                      <div className="text-gray-600">{transaction.customer}</div>
                      <div className="font-medium text-green-600">{transaction.amount}</div>
                      <div className="text-gray-600">{transaction.orders} orders</div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">No customer data available</div>
                )}
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
