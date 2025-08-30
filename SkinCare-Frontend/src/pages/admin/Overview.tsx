
import { OverviewChart } from '@/components/charts/overview-chart';
import { RecentSales } from '@/components/recent-sales';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { Activity, CreditCard, DollarSign, Users } from 'lucide-react';

function Overview() {
  const reportCards = [
    {
      title: 'Total Sales',
      value: '12,000$',
      icon: DollarSign,
    },
    {
      title: 'Total Orders',
      value: '5730',
      icon: Users,
    },
    {
      title: 'Best Selling Product',
      value: 'Toner',
      icon: CreditCard,
    },
    {
      title: 'Active now',
      value: '573',
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
        <div className="flex items-center gap-2">
          <select className="px-3 py-2 border rounded-md text-sm">
            <option>Select date</option>
          </select>
          <button className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium">
            Export
          </button>
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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="lg:col-span-4">
          <OverviewChart />
        </div>
        <div className="lg:col-span-3">
          <RecentSales />
        </div>
      </div>
    </div>
  );
}

export default Overview;