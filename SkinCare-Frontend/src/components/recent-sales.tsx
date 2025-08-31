import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';

interface SalesData {
  rank: number;
  orders: number;
  amount: string;
  product: string;
}

export function RecentSales() {
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopProducts();
  }, []);

  const fetchTopProducts = async () => {
    try {
      const response = await fetch('http://localhost/admin/top-products.php');
      const data = await response.json();
      
      if (data.success) {
        setSalesData(data.data);
      }
    } catch (error) {
      console.error('Error fetching top products:', error);
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
    return (
      <Card className='h-105'>
        <CardHeader>
          <CardTitle>Ranking of best performing products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div>Loading top products...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='h-105' data-chart="top-products">
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