import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { Search, AlertTriangle, Ban, UserCheck, Trash2, Users, Trophy, Medal, Award } from 'lucide-react';

interface Customer {
  CID: number;
  CName: string;
  CPhone: string;
  Address: string;
  CEmail: string;
  Gender: number;
  SkinType: string;
  JoinDate: string;
  OrderCount: number;
  TotalSpent: number;
  Rank?: number;
  Status?: 'active' | 'warned' | 'banned';
}

function CustomerAccounts() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await fetch('http://localhost/admin/customers.php');
      const data = await response.json();
      if (data.success) {
        // Sort customers by total spent (descending) and add ranking
        const sortedCustomers = data.data
          .sort((a: Customer, b: Customer) => b.TotalSpent - a.TotalSpent)
          .map((customer: Customer, index: number) => ({
            ...customer,
            Rank: index + 1,
            Status: customer.Status || 'active'
          }));
        setCustomers(sortedCustomers);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCustomer = async (customerId: number, customerName: string) => {
    if (!confirm(`Are you sure you want to delete customer "${customerName}"? This will also delete all their orders and data.`)) return;

    try {
      const response = await fetch('http://localhost/admin/customers.php', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: customerId })
      });

      const data = await response.json();
      if (data.success) {
        fetchCustomers();
        alert('Customer deleted successfully!');
      } else {
        alert('Failed to delete customer: ' + data.message);
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
      alert('Error deleting customer');
    }
  };

  const handleWarningCustomer = async (customerId: number, customerName: string) => {
    if (!confirm(`Are you sure you want to issue a warning to customer "${customerName}"?`)) return;

    try {
      const response = await fetch('http://localhost/admin/customers.php', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: customerId, 
          action: 'warning',
          status: 'warned'
        })
      });

      const data = await response.json();
      if (data.success) {
        fetchCustomers();
        alert('Warning issued successfully!');
      } else {
        alert('Failed to issue warning: ' + data.message);
      }
    } catch (error) {
      console.error('Error issuing warning:', error);
      alert('Error issuing warning');
    }
  };

  const handleBanCustomer = async (customerId: number, customerName: string) => {
    if (!confirm(`Are you sure you want to ban customer "${customerName}"? They will not be able to place orders.`)) return;

    try {
      const response = await fetch('http://localhost/admin/customers.php', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: customerId, 
          action: 'ban',
          status: 'banned'
        })
      });

      const data = await response.json();
      if (data.success) {
        fetchCustomers();
        alert('Customer banned successfully!');
      } else {
        alert('Failed to ban customer: ' + data.message);
      }
    } catch (error) {
      console.error('Error banning customer:', error);
      alert('Error banning customer');
    }
  };

  const handleUnbanCustomer = async (customerId: number, customerName: string) => {
    if (!confirm(`Are you sure you want to unban customer "${customerName}"?`)) return;

    try {
      const response = await fetch('http://localhost/admin/customers.php', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: customerId, 
          action: 'unban',
          status: 'active'
        })
      });

      const data = await response.json();
      if (data.success) {
        fetchCustomers();
        alert('Customer unbanned successfully!');
      } else {
        alert('Failed to unban customer: ' + data.message);
      }
    } catch (error) {
      console.error('Error unbanning customer:', error);
      alert('Error unbanning customer');
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.CName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.CEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'MMK',
      minimumFractionDigits: 0
    }).format(amount).replace('MMK', '') + ' MMK';
  };

  const getGenderText = (gender: number) => {
    return gender === 1 ? 'Male' : gender === 0 ? 'Female' : 'Not specified';
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Award className="h-5 w-5 text-amber-600" />;
    return null;
  };

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    if (rank === 2) return 'bg-gray-100 text-gray-800 border-gray-300';
    if (rank === 3) return 'bg-amber-100 text-amber-800 border-amber-300';
    if (rank <= 10) return 'bg-blue-100 text-blue-800 border-blue-300';
    return 'bg-gray-50 text-gray-600 border-gray-200';
  };

  const getCustomerTier = (totalSpent: number) => {
    if (totalSpent >= 1000000) return { tier: 'VIP', color: 'bg-purple-100 text-purple-800' };
    if (totalSpent >= 500000) return { tier: 'Gold', color: 'bg-yellow-100 text-yellow-800' };
    if (totalSpent >= 200000) return { tier: 'Silver', color: 'bg-gray-100 text-gray-800' };
    if (totalSpent >= 50000) return { tier: 'Bronze', color: 'bg-amber-100 text-amber-800' };
    return { tier: 'Regular', color: 'bg-green-100 text-green-800' };
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 text-xs">Active</Badge>;
      case 'warned':
        return <Badge className="bg-yellow-100 text-yellow-800 text-xs">Warned</Badge>;
      case 'banned':
        return <Badge className="bg-red-100 text-red-800 text-xs">Banned</Badge>;
      default:
        return <Badge className="bg-green-100 text-green-800 text-xs">Active</Badge>;
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center">
          <Separator orientation="vertical" className="mr-4 h-6" />
          <Breadcrumb>
            <BreadcrumbList className="text-[1rem]">
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/admin">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/admin/accManange">Account Management</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Customer Accounts</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold">{customers.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Customers</p>
                <p className="text-2xl font-bold text-green-600">
                  {customers.filter(c => c.OrderCount > 0).length}
                </p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatCurrency(customers.reduce((sum, c) => sum + c.TotalSpent, 0))}
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Order Value</p>
                <p className="text-2xl font-bold text-orange-600">
                  {customers.length > 0 ? formatCurrency(customers.reduce((sum, c) => sum + c.TotalSpent, 0) / customers.length) : '0 MMK'}
                </p>
              </div>
              <Users className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

     

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Customer Accounts
              </CardTitle>
              <CardDescription>Manage customer accounts and view their activity</CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div>Loading customers...</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Rank</th>
                    <th className="text-left p-3">Customer Info</th>
                    <th className="text-left p-3">Contact</th>
                    <th className="text-left p-3">Tier & Status</th>
                    <th className="text-left p-3">Orders</th>
                    <th className="text-left p-3">Total Spent</th>
                    <th className="text-left p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((customer) => {
                    const tier = getCustomerTier(customer.TotalSpent);
                    return (
                      <tr key={customer.CID} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            {getRankIcon(customer.Rank!)}
                            <Badge className={`${getRankBadgeColor(customer.Rank!)} border text-xs`}>
                              #{customer.Rank}
                            </Badge>
                          </div>
                        </td>
                        <td className="p-3">
                          <div>
                            <div className="font-medium">{customer.CName}</div>
                            <div className="text-sm text-gray-500">
                              ID: {customer.CID} • {getGenderText(customer.Gender)}
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <div>
                            <div className="text-sm">{customer.CEmail}</div>
                            <div className="text-sm text-gray-500">{customer.CPhone || 'No phone'}</div>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="space-y-1">
                            <Badge className={`text-xs ${tier.color}`}>
                              {tier.tier}
                            </Badge>
                            {getStatusBadge(customer.Status || 'active')}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="text-center">
                            <div className="font-medium">{customer.OrderCount}</div>
                            <div className="text-xs text-gray-500">orders</div>
                          </div>
                        </td>
                        <td className="p-3 font-medium">
                          {formatCurrency(customer.TotalSpent)}
                        </td>
                        <td className="p-3">
                          <div className="flex gap-1 flex-wrap">
                            {customer.Status !== 'banned' && (
                              <>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleWarningCustomer(customer.CID, customer.CName)}
                                  className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                                >
                                  <AlertTriangle className="h-4 w-4 mr-1" />
                                  Warn
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleBanCustomer(customer.CID, customer.CName)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Ban className="h-4 w-4 mr-1" />
                                  Ban
                                </Button>
                              </>
                            )}
                            {customer.Status === 'banned' && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleUnbanCustomer(customer.CID, customer.CName)}
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              >
                                <UserCheck className="h-4 w-4 mr-1" />
                                Unban
                              </Button>
                            )}
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleDeleteCustomer(customer.CID, customer.CName)}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              
              {filteredCustomers.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm ? 'No customers found matching your search.' : 'No customers available.'}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default CustomerAccounts;