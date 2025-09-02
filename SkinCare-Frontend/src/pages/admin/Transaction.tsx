
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

function Transaction() {
  const transactions = [
    {
      id: '#TXN001',
      customer: 'John Doe',
      product: 'Hydrating Toner',
      amount: '$29.99',
      status: 'Completed',
      date: '2024-01-15',
      paymentMethod: 'Credit Card'
    },
    {
      id: '#TXN002',
      customer: 'Jane Smith',
      product: 'Cleansing Serum',
      amount: '$39.99',
      status: 'Processing',
      date: '2024-01-14',
      paymentMethod: 'PayPal'
    },
    {
      id: '#TXN003',
      customer: 'Mike Johnson',
      product: 'Anti-Aging Scrub',
      amount: '$34.99',
      status: 'Shipped',
      date: '2024-01-13',
      paymentMethod: 'Credit Card'
    },
    {
      id: '#TXN004',
      customer: 'Sarah Wilson',
      product: 'Moisturizing Cream',
      amount: '$44.99',
      status: 'Cancelled',
      date: '2024-01-12',
      paymentMethod: 'Bank Transfer'
    }
  ];

  return (
    <div className="my-5.5 min-w-275">
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
                <BreadcrumbPage>Transactions</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>View and manage all customer transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Transaction ID</th>
                  <th className="text-left p-3">Customer</th>
                  <th className="text-left p-3">Product</th>
                  <th className="text-left p-3">Amount</th>
                  <th className="text-left p-3">Payment Method</th>
                  <th className="text-left p-3">Date</th>
                  <th className="text-left p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b">
                    <td className="p-3 font-medium">{transaction.id}</td>
                    <td className="p-3">{transaction.customer}</td>
                    <td className="p-3">{transaction.product}</td>
                    <td className="p-3 font-medium">{transaction.amount}</td>
                    <td className="p-3">{transaction.paymentMethod}</td>
                    <td className="p-3 text-gray-600">{transaction.date}</td>
                    <td className="p-3">
                      <Badge 
                        variant={
                          transaction.status === 'Completed' ? 'default' : 
                          transaction.status === 'Processing' ? 'secondary' : 
                          transaction.status === 'Shipped' ? 'outline' : 'destructive'
                        }
                      >
                        {transaction.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Transaction;