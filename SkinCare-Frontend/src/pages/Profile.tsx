import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router';
import { AiOutlineUser, AiOutlineEdit, AiOutlineSave, AiOutlineClose, AiOutlineHome } from 'react-icons/ai';
import { BsPhone, BsEnvelope, BsGenderAmbiguous, BsHouse, BsFilter } from 'react-icons/bs';
import { MdOutlineShoppingBag, MdOutlinePayment, MdClear } from 'react-icons/md';
import { DatePicker } from '@/components/ui/date-picker';

interface UserData {
  CID: number;
  CName: string;
  CPhone: string;
  Address: string;
  CEmail: string;
  Gender: number | null;
  SkinType: string;
}

interface OrderItem {
  ID: number;
  ProductID: number;
  ProductName: string;
  Quantity: number;
  unitPrice: number;
  Image: string;
}

interface Order {
  OrderID: number;
  orderDate: string;
  status: string;
  totalAmount: number;
  paymentMethod: string;
  items: OrderItem[];
}

function Profile() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<UserData | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'orders'>('profile');
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState({
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    isActive: false,
  });

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = user.id;
  console.log(user);

  useEffect(() => {
    if (userId) {
      fetchUserData();
      fetchUserOrders();
    }
  }, [userId]);

  // Filter orders based on date range
  useEffect(() => {
    if (!dateFilter.isActive) {
      setFilteredOrders(orders);
    } else {
      const filtered = orders.filter((order) => {
        const orderDate = new Date(order.orderDate);
        const start = dateFilter.startDate;
        const end = dateFilter.endDate;

        if (start && end) {
          return orderDate >= start && orderDate <= end;
        } else if (start) {
          return orderDate >= start;
        } else if (end) {
          return orderDate <= end;
        }
        return true;
      });
      setFilteredOrders(filtered);
    }
  }, [orders, dateFilter]);

  const fetchUserData = async () => {
    try {
      // For now, use mock data if backend is not available
      // Replace this with actual API call when backend is set up
      const mockUserData = {
        CID: userId,
        CName: user.name || 'John Doe',
        CPhone: '09123456789',
        Address: '123 Main Street, Yangon',
        CEmail: user.email || 'user@example.com',
        Gender: 1,
        SkinType: 'Combination',
      };

      // Try to fetch from API first, fallback to mock data
      try {
        // Try different possible backend URLs (Docker setup)
        const possibleUrls = [
          `http://localhost/user/profile.php?id=${userId}`,
          `http://localhost:80/user/profile.php?id=${userId}`,
          `http://127.0.0.1/user/profile.php?id=${userId}`,
        ];

        let apiSuccess = false;
        for (const url of possibleUrls) {
          try {
            const response = await fetch(url);
            if (response.ok) {
              const text = await response.text();
              // Check if response is valid JSON
              if (text.startsWith('{') || text.startsWith('[')) {
                const data = JSON.parse(text);
                if (data.success) {
                  setUserData(data.user);
                  setEditedData(data.user);
                  apiSuccess = true;
                  break;
                }
              }
            }
          } catch (urlError) {
            continue; // Try next URL
          }
        }

        if (!apiSuccess) {
          throw new Error('No backend available');
        }
      } catch (apiError) {
        console.log('Using mock data - backend not available');
        // Check if we have saved data in localStorage
        const savedData = localStorage.getItem(`userData_${userId}`);
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          setUserData(parsedData);
          setEditedData(parsedData);
        } else {
          setUserData(mockUserData);
          setEditedData(mockUserData);
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Error loading profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserOrders = async () => {
    try {
      try {
        // Try different possible backend URLs (Docker setup)
        const possibleUrls = [
          `http://localhost/order/user-orders.php?userId=${userId}`,
          `http://localhost:80/order/user-orders.php?userId=${userId}`,
          `http://127.0.0.1/order/user-orders.php?userId=${userId}`,
        ];

        let apiSuccess = false;
        for (const url of possibleUrls) {
          try {
            const response = await fetch(url);
            if (response.ok) {
              const text = await response.text();
              if (text.startsWith('{') || text.startsWith('[')) {
                const data = JSON.parse(text);
                if (data.success) {
                  setOrders(data.orders);
                  apiSuccess = true;
                  break;
                }
              }
            }
          } catch (urlError) {
            continue;
          }
        }

        if (!apiSuccess) {
          throw new Error('No backend available');
        }
      } catch (apiError) {
        console.log('backend not available');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Error loading orders');
    }
  };

  const handleSaveProfile = async () => {
    if (!editedData) return;

    console.log('Saving profile data:', editedData);

    try {
      // Try different possible backend URLs (Docker setup)
      const possibleUrls = [
        'http://localhost/user/update-profile.php',
        'http://localhost:80/user/update-profile.php',
        'http://127.0.0.1/user/update-profile.php',
      ];

      let apiSuccess = false;
      for (const url of possibleUrls) {
        try {
          console.log(`Trying to save to: ${url}`);
          const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(editedData),
          });

          console.log('Response status:', response.status);

          if (response.ok) {
            const text = await response.text();
            console.log('Response text:', text);

            if (text.startsWith('{') || text.startsWith('[')) {
              const data = JSON.parse(text);
              console.log('Parsed response:', data);

              if (data.success) {
                setUserData(editedData);
                setIsEditing(false);
                toast.success('Profile updated in database successfully!');
                apiSuccess = true;
                break;
              } else {
                console.error('API returned error:', data.message);
                toast.error(data.message || 'Failed to update profile');
              }
            } else {
              console.error('Invalid JSON response:', text);
            }
          }
        } catch (urlError) {
          console.error(`Error with URL ${url}:`, urlError);
          continue;
        }
      }

      if (!apiSuccess) {
        console.log('All API attempts failed, saving locally');
        // Fallback: save to localStorage
        localStorage.setItem(`userData_${userId}`, JSON.stringify(editedData));
        setUserData(editedData);
        setIsEditing(false);
        toast.success('Profile updated locally (database not available)');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error updating profile');
    }
  };

  const handleCancelEdit = () => {
    setEditedData(userData);
    setIsEditing(false);
  };

  const handleDateFilterChange = (field: 'startDate' | 'endDate', value: Date | undefined) => {
    setDateFilter((prev) => ({
      ...prev,
      [field]: value,
      isActive: value !== undefined || (field === 'startDate' ? prev.endDate !== undefined : prev.startDate !== undefined),
    }));
  };

  const clearDateFilter = () => {
    setDateFilter({
      startDate: undefined,
      endDate: undefined,
      isActive: false,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'delivered':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Login</h2>
          <p className="text-gray-600">You need to login to view your profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 md:flex justify-between items-center">
          <div className="flex items-center space-x-6 ">
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
              <AiOutlineUser className="w-12 h-12 text-gray-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{userData.CName}</h1>
              <p className="text-gray-600">{userData.CEmail}</p>
              <p className="text-sm text-green-600 mt-1">Skin Type: {userData.SkinType || 'Not specified'}</p>
            </div>
          </div>

          {/* Go Home Button */}
          <div className="my-8">
            <button
              onClick={() => navigate('/')}
              className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow-md"
            >
              <AiOutlineHome className="mr-2" />
              Go Home
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'profile' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <AiOutlineUser className="inline mr-2" />
                Profile Information
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'orders' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <MdOutlineShoppingBag className="inline mr-2" />
                Order History
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      <AiOutlineEdit className="mr-2" />
                      Edit Profile
                    </button>
                  ) : (
                    <div className="flex space-x-2">
                      <button
                        onClick={handleSaveProfile}
                        className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                      >
                        <AiOutlineSave className="mr-2" />
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        <AiOutlineClose className="mr-2" />
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <AiOutlineUser className="mr-2" />
                      Full Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedData?.CName || ''}
                        onChange={(e) => setEditedData((prev) => (prev ? { ...prev, CName: e.target.value } : null))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="px-3 py-2 bg-gray-50 rounded-lg">{userData.CName}</p>
                    )}
                  </div>

                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <BsEnvelope className="mr-2" />
                      Email
                    </label>
                    <p className="px-3 py-2 bg-gray-50 rounded-lg text-gray-600">{userData.CEmail}</p>
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>

                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <BsPhone className="mr-2" />
                      Phone Number
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editedData?.CPhone || ''}
                        onChange={(e) => setEditedData((prev) => (prev ? { ...prev, CPhone: e.target.value } : null))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="px-3 py-2 bg-gray-50 rounded-lg">{userData.CPhone || 'Not provided'}</p>
                    )}
                  </div>

                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <BsGenderAmbiguous className="mr-2" />
                      Gender
                    </label>
                    {isEditing ? (
                      <select
                        value={editedData?.Gender || ''}
                        onChange={(e) => setEditedData((prev) => (prev ? { ...prev, Gender: e.target.value ? Number(e.target.value) : null } : null))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="">Select Gender</option>
                        <option value="1">Male</option>
                        <option value="0">Female</option>
                      </select>
                    ) : (
                      <p className="px-3 py-2 bg-gray-50 rounded-lg">
                        {userData.Gender === 1 ? 'Male' : userData.Gender === 0 ? 'Female' : 'Not specified'}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <BsHouse className="mr-2" />
                      Address
                    </label>
                    {isEditing ? (
                      <textarea
                        value={editedData?.Address || ''}
                        onChange={(e) => setEditedData((prev) => (prev ? { ...prev, Address: e.target.value } : null))}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="px-3 py-2 bg-gray-50 rounded-lg">{userData.Address || 'Not provided'}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Skin Type</label>
                    {isEditing ? (
                      <select
                        value={editedData?.SkinType || ''}
                        onChange={(e) => setEditedData((prev) => (prev ? { ...prev, SkinType: e.target.value } : null))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="">Select Skin Type</option>
                        <option value="Oily">Oily</option>
                        <option value="Dry">Dry</option>
                        <option value="Combination">Combination</option>
                      </select>
                    ) : (
                      <p className="px-3 py-2 bg-gray-50 rounded-lg">{userData.SkinType || 'Not specified'}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <h2 className="text-xl font-semibold text-gray-900">Order History</h2>

                  {/* Date Filter Controls */}
                  <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 bg-gray-50 p-4 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2 lg:mb-0">
                      <BsFilter className="text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">Filter by date range:</span>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
                      <DatePicker
                        date={dateFilter.startDate}
                        onDateChange={(date) => handleDateFilterChange('startDate', date)}
                        label="From"
                        placeholder="Select start date"
                        className="w-full sm:w-48"
                      />

                      <DatePicker
                        date={dateFilter.endDate}
                        onDateChange={(date) => handleDateFilterChange('endDate', date)}
                        label="To"
                        placeholder="Select end date"
                        className="w-full sm:w-48"
                      />

                      {dateFilter.isActive && (
                        <button
                          onClick={clearDateFilter}
                          className="flex items-center gap-1 px-3 py-2 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors border border-red-200"
                          title="Clear date filter"
                        >
                          <MdClear className="h-4 w-4" />
                          Clear Filter
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Filter Results Summary */}
                {dateFilter.isActive && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800">
                      Showing {filteredOrders.length} of {orders.length} orders
                      {dateFilter.startDate && ` from ${dateFilter.startDate.toLocaleDateString()}`}
                      {dateFilter.endDate && ` to ${dateFilter.endDate.toLocaleDateString()}`}
                    </p>
                  </div>
                )}

                {filteredOrders.length === 0 ? (
                  <div className="text-center py-12">
                    <MdOutlineShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      {dateFilter.isActive ? 'No orders found for selected date range' : 'No orders yet'}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {dateFilter.isActive
                        ? 'Try adjusting your date filter or clear it to see all orders.'
                        : 'Start shopping to see your orders here.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredOrders.map((order) => (
                      <div key={order.OrderID} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">Order #{order.OrderID}</h3>
                            <p className="text-sm text-gray-600">
                              {new Date(order.orderDate).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                            <p className="text-lg font-semibold text-gray-900 mt-1">${order.totalAmount.toLocaleString()}</p>
                          </div>
                        </div>

                        <div className="border-t border-gray-200 pt-4">
                          <div className="flex items-center mb-3">
                            <MdOutlinePayment className="mr-2 text-gray-400" />
                            <span className="text-sm text-gray-600">Payment: {order.paymentMethod}</span>
                          </div>

                          <div className="space-y-3">
                            {order.items.map((item) => (
                              <div key={item.ID} className="flex items-center space-x-4">
                                <img src={`../../src/assets/${item.Image}`} alt={item.ProductName} className="w-16 h-16 object-cover rounded-lg" />
                                <div className="flex-1">
                                  <h4 className="text-sm font-medium text-gray-900">{item.ProductName}</h4>
                                  <p className="text-sm text-gray-600">Quantity: {item.Quantity}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-medium text-gray-900">${(item.unitPrice * item.Quantity).toLocaleString()}</p>
                                  <p className="text-xs text-gray-600">${item.unitPrice.toLocaleString()} each</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
