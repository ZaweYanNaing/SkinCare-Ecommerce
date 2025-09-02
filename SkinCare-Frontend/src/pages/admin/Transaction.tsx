import { useState, useEffect } from 'react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Eye, Filter, Download, Calendar, DollarSign, ShoppingCart, TrendingUp } from 'lucide-react';
import { toast } from 'react-toastify';

interface Transaction {
  OrderID: number;
  orderDate: string;
  status: string;
  customerID: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  PaymentID: number;
  totalAmount: number;
  paymentMethod: string;
  PayDate: string;
  tranID: number;
  itemCount: number;
  items: string;
}

interface TransactionStats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  confirmedOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
}

interface TransactionDetail {
  order: {
    OrderID: number;
    orderDate: string;
    status: string;
    customerID: number;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    customerAddress: string;
    customerSkinType: string;
    PaymentID: number;
    totalAmount: number;
    paymentMethod: string;
    PayDate: string;
    tranID: number;
  };
  items: Array<{
    ID: number;
    Quantity: number;
    unitPrice: number;
    subtotal: number;
    ProductID: number;
    productName: string;
    productDescription: string;
    productImage: string;
    ForSkinType: string;
    CategoryName: string;
  }>;
  summary: {
    subtotal: number;
    tax: number;
    taxRate: number;
    shippingFee: number;
    total: number;
    itemCount: number;
  };
}

function Transaction() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<TransactionStats>({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    confirmedOrders: 0,
    shippedOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
  });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionDetail | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isStatusUpdateDialogOpen, setIsStatusUpdateDialogOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [newStatus, setNewStatus] = useState('');

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  useEffect(() => {
    fetchTransactions();
  }, [currentPage, searchTerm, statusFilter, dateFrom, dateTo]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      console.log('Fetching transactions...');

      // Use simple API first to test
      const response = await fetch('http://localhost/admin/transactions-simple.php');
      console.log('Response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Response data:', data);

      if (data.success) {
        // Add missing properties to match interface
        const processedTransactions = data.data.map((transaction: any) => ({
          ...transaction,
          customerPhone: transaction.customerPhone || '',
          PaymentID: transaction.PaymentID || 0,
          PayDate: transaction.PayDate || transaction.orderDate,
          tranID: transaction.tranID || 0,
          itemCount: transaction.itemCount || 1,
          items: transaction.items || 'N/A',
        }));

        setTransactions(processedTransactions);
        setStats(data.stats);
        setTotalPages(data.pagination.totalPages);
        toast.success('Transactions loaded successfully');
      } else {
        console.error('API returned error:', data.message);
        toast.error('Failed to fetch transactions: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Error fetching transactions: ' + (error instanceof Error ? error.message : 'Network error'));
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactionDetails = async (orderId: number) => {
    try {
      const response = await fetch(`http://localhost/admin/transaction-details.php?orderId=${orderId}`);
      const data = await response.json();

      if (data.success) {
        setSelectedTransaction(data.data);
        setIsDetailDialogOpen(true);
      } else {
        toast.error('Failed to fetch transaction details');
      }
    } catch (error) {
      console.error('Error fetching transaction details:', error);
      toast.error('Error fetching transaction details');
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedOrderId || !newStatus) {
      toast.error('Please select a status');
      return;
    }

    try {
      const response = await fetch('http://localhost/admin/transactions.php', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: selectedOrderId,
          status: newStatus,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Order status updated successfully');
        setIsStatusUpdateDialogOpen(false);
        setSelectedOrderId(null);
        setNewStatus('');
        fetchTransactions();
      } else {
        toast.error('Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Error updating order status');
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'default';
      case 'confirmed':
        return 'secondary';
      case 'shipped':
        return 'outline';
      case 'pending':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'MMK',
      minimumFractionDigits: 0,
    })
      .format(amount)
      .replace('MMK', 'MMK ');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
              <BreadcrumbItem>
                <BreadcrumbPage>Transactions</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalRevenue)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold">{stats.totalOrders}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                <p className="text-2xl font-bold text-orange-600">{stats.pendingOrders}</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Delivered Orders</p>
                <p className="text-2xl font-bold text-green-600">{stats.deliveredOrders}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="search"
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateFrom">Date From</Label>
              <Input id="dateFrom" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateTo">Date To</Label>
              <Input id="dateTo" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('');
                  setDateFrom('');
                  setDateTo('');
                  setCurrentPage(1);
                }}
                variant="outline"
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>View and manage all customer transactions</CardDescription>
            </div>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div>Loading transactions...</div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Order ID</th>
                      <th className="text-left p-3">Customer</th>
                      <th className="text-left p-3">Items</th>
                      <th className="text-left p-3">Amount</th>
                      <th className="text-left p-3">Payment Method</th>
                      <th className="text-left p-3">Date</th>
                      <th className="text-left p-3">Status</th>
                      <th className="text-left p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((transaction) => (
                      <tr key={transaction.OrderID} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-medium">#{transaction.OrderID}</td>
                        <td className="p-3">
                          <div>
                            <div className="font-medium">{transaction.customerName || 'N/A'}</div>
                            <div className="text-sm text-gray-500">{transaction.customerEmail}</div>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="text-sm">
                            <div>{transaction.itemCount} items</div>
                            <div className="text-gray-500 truncate max-w-32" title={transaction.items}>
                              {transaction.items}
                            </div>
                          </div>
                        </td>
                        <td className="p-3 font-medium">{formatCurrency(transaction.totalAmount)}</td>
                        <td className="p-3">{transaction.paymentMethod}</td>
                        <td className="p-3 text-sm text-gray-600">{formatDate(transaction.orderDate)}</td>
                        <td className="p-3">
                          <Badge variant={getStatusBadgeVariant(transaction.status)}>{transaction.status}</Badge>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => fetchTransactionDetails(transaction.OrderID)}>
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedOrderId(transaction.OrderID);
                                setNewStatus(transaction.status);
                                setIsStatusUpdateDialogOpen(true);
                              }}
                            >
                              Update Status
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))} disabled={currentPage === 1}>
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}

              {transactions.length === 0 && <div className="text-center py-8 text-gray-500">No transactions found matching your criteria.</div>}
            </>
          )}
        </CardContent>
      </Card>

      {/* Transaction Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Transaction Details - Order #{selectedTransaction?.order.OrderID}</DialogTitle>
            <DialogDescription>Complete information about this transaction</DialogDescription>
          </DialogHeader>

          {selectedTransaction && (
            <div className="space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Order Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Order ID:</span>
                      <span className="font-medium">#{selectedTransaction.order.OrderID}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Order Date:</span>
                      <span>{formatDate(selectedTransaction.order.orderDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <Badge variant={getStatusBadgeVariant(selectedTransaction.order.status)}>{selectedTransaction.order.status}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Method:</span>
                      <span>{selectedTransaction.order.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Transaction ID:</span>
                      <span className="font-medium">{selectedTransaction.order.tranID}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Customer Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium">{selectedTransaction.order.customerName || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span>{selectedTransaction.order.customerEmail}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phone:</span>
                      <span>{selectedTransaction.order.customerPhone || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Skin Type:</span>
                      <span>{selectedTransaction.order.customerSkinType || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Address:</span>
                      <span className="text-right max-w-48 break-words">{selectedTransaction.order.customerAddress || 'N/A'}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Order Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedTransaction.items.map((item) => (
                      <div key={item.ID} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                            {item.productImage ? (
                              <img
                                src={`http://localhost/uploads/${item.productImage}`}
                                alt={item.productName}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <div className="text-gray-400 text-xs">No Image</div>
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{item.productName}</div>
                            <div className="text-sm text-gray-500">{item.CategoryName}</div>
                            <div className="text-sm text-gray-500">For {item.ForSkinType} skin</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(item.subtotal)}</div>
                          <div className="text-sm text-gray-500">
                            {item.Quantity} × {formatCurrency(item.unitPrice)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Order Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal ({selectedTransaction.summary.itemCount} items):</span>
                      <span>{formatCurrency(selectedTransaction.summary.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax ({(selectedTransaction.summary.taxRate * 100).toFixed(0)}%):</span>
                      <span>{formatCurrency(selectedTransaction.summary.tax)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping Fee:</span>
                      <span>{formatCurrency(selectedTransaction.summary.shippingFee)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total:</span>
                      <span>{formatCurrency(selectedTransaction.summary.total)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog open={isStatusUpdateDialogOpen} onOpenChange={setIsStatusUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>Change the status of order #{selectedOrderId}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newStatus">New Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStatusUpdateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleStatusUpdate}>Update Status</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Transaction;
