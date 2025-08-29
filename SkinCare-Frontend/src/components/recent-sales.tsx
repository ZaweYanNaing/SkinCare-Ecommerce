import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const salesData = [
  {
    rank: 1,
    orders: 80,
    amount: '$2,200',
    product: 'Hydrating Toner'
  },
  {
    rank: 2,
    orders: 50,
    amount: '$1,600',
    product: 'Cleansing Serum'
  },
  {
    rank: 3,
    orders: 60,
    amount: '$1,500',
    product: 'Anti-Aging Scrub'
  },
  {
    rank: 4,
    orders: 45,
    amount: '$1,300',
    product: 'Sunscreen Lotion'
  },
  {
    rank: 5,
    orders: 34,
    amount: '$1000',
    product: 'Moisturizing Cream'
  }
];

export function RecentSales() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ranking of best performing products</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-4 text-sm font-medium text-gray-600 border-b pb-2">
            <div>Rank</div>
            <div>Orders</div>
            <div>Sales Amount</div>
            <div>Top Product</div>
          </div>
          {salesData.map((sale) => (
            <div key={sale.rank} className="grid grid-cols-4 gap-4 text-sm py-2">
              <div className="font-medium">{sale.rank}</div>
              <div className="text-gray-600">{sale.orders}</div>
              <div className="font-medium">{sale.amount}</div>
              <div className="text-gray-600">{sale.product}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}