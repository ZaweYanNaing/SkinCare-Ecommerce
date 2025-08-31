import { OverviewChart } from '@/components/charts/overview-chart';
import { RecentSales } from '@/components/recent-sales';
import { EnhancedExportDialog } from '@/components/EnhancedExportDialog';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { Activity, CreditCard, DollarSign, Users } from 'lucide-react';
import { useEffect, useState } from 'react';


interface OverviewStats {
  totalSales: string;
  totalOrders: number;
  bestSellingProduct: string;
  activeCustomers: number;
}

function Overview() {
  const [stats, setStats] = useState<OverviewStats>({
    totalSales: '0',
    totalOrders: 0,
    bestSellingProduct: 'N/A',
    activeCustomers: 0
  });
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    fetchOverviewStats();
  }, []);

  const fetchOverviewStats = async () => {
    try {
      const response = await fetch('http://localhost/admin/overview-stats.php');
      const data = await response.json();
      
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching overview stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const reportCards = [
    {
      title: 'Total Sales',
      value: loading ? 'Loading...' : `$${stats.totalSales}`,
      icon: DollarSign,
    },
    {
      title: 'Total Orders',
      value: loading ? 'Loading...' : stats.totalOrders.toString(),
      icon: Users,
    },
    {
      title: 'Best Selling Product',
      value: loading ? 'Loading...' : stats.bestSellingProduct,
      icon: CreditCard,
    },
    {
      title: 'Active Customers',
      value: loading ? 'Loading...' : stats.activeCustomers.toString(),
      icon: Activity,
    },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center">
          <Separator orientation="vertical" className="mr-4 h-6" />
          <Breadcrumb>
            <BreadcrumbList className="text-[1rem]">
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="#">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Overview</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="flex items-center gap-3">
          
          <EnhancedExportDialog disabled={loading} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {reportCards.map((card, index) => {
          const IconComponent = card.icon;
          return (
            <div key={index} className="rounded-2xl border border-zinc-200 p-6 shadow-sm bg-white">
              <div className="flex items-center justify-between pb-2">
                <p className="text-sm font-medium text-zinc-600">{card.title}</p>
                <IconComponent className="h-4 w-4 text-zinc-500" />
              </div>
              <div className="flex">
                <p className="text-2xl font-bold text-zinc-950">{card.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-8">
        <div className="lg:col-span-4 ">
          <OverviewChart />
        </div>
        <div className="lg:col-span-4">
          <RecentSales />
        </div>
      </div>
    </div>
  );
}

export default Overview;