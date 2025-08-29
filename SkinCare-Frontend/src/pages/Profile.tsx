import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { AiOutlineUser, AiOutlineEdit, AiOutlineSave, AiOutlineClose } from 'react-icons/ai';
import { BsPhone, BsEnvelope, BsGenderAmbiguous, BsHouse } from 'react-icons/bs';
import { MdOutlineShoppingBag, MdOutlinePayment } from 'react-icons/md';

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
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<UserData | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'orders'>('profile');
  const [loading, setLoading] = useState(true);
  const [profileImage, setProfileImage] = useState<string>('');

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = user.id;
  console.log(user);

  useEffect(() => {
    if (userId) {
      fetchUserData();
      fetchUserOrders();
    }
  }, [userId]);

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
        // Try different possible backend URLs
        const possibleUrls = [
          `http://localhost:8080/user/profile.php?id=${userId}`,
          `http://localhost/user/profile.php?id=${userId}`,
          `http://localhost:3001/user/profile.php?id=${userId}`,
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

      // Load profile image from localStorage if exists
      const savedImage = localStorage.getItem(`profileImage_${userId}`);
      if (savedImage) {
        setProfileImage(savedImage);
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
      // Mock order data for testing
      const mockOrders = [
        {
          OrderID: 1,
          orderDate: '2025-08-20T10:30:00',
          status: 'confirmed',
          totalAmount: 125000,
          paymentMethod: 'KBZ Bank',
          items: [
            {
              ID: 1,
              ProductID: 1,
              ProductName: 'Bella Face Wash',
              Quantity: 2,
              unitPrice: 35000,
              Image: 'face-wash-1.jpg',
            },
            {
              ID: 2,
              ProductID: 2,
              ProductName: 'EAORON Toner',
              Quantity: 1,
              unitPrice: 42000,
              Image: 'toner-1.jpg',
            },
          ],
        },
        {
          OrderID: 2,
          orderDate: '2025-08-15T14:20:00',
          status: 'delivered',
          totalAmount: 89000,
          paymentMethod: 'AyaPay',
          items: [
            {
              ID: 3,
              ProductID: 5,
              ProductName: 'Bella Moisturizer',
              Quantity: 1,
              unitPrice: 48000,
              Image: 'cream-1.jpg',
            },
          ],
        },
      ];

      try {
        // Try different possible backend URLs
        const possibleUrls = [
          `http://localhost:8080/order/user-orders.php?userId=${userId}`,
          `http://localhost/order/user-orders.php?userId=${userId}`,
          `http://localhost:3001/order/user-orders.php?userId=${userId}`,
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
        console.log('Using mock orders - backend not available');
        setOrders(mockOrders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Error loading orders');
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast.error('Image size should be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        setProfileImage(imageData);
        // Save to localStorage
        localStorage.setItem(`profileImage_${userId}`, imageData);
        toast.success('Profile image updated!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    if (!editedData) return;

    try {
      // Try to save to API first, fallback to localStorage
      try {
        const response = await fetch('http://localhost/skincare-backend/user/update-profile.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editedData),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setUserData(editedData);
            setIsEditing(false);
            toast.success('Profile updated successfully!');
            return;
          }
        }
        throw new Error('API not available');
      } catch (apiError) {
        // Fallback: save to localStorage
        localStorage.setItem(`userData_${userId}`, JSON.stringify(editedData));
        setUserData(editedData);
        setIsEditing(false);
        toast.success('Profile updated locally!');
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
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <AiOutlineUser className="w-12 h-12 text-gray-400" />
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-green-500 rounded-full p-1 cursor-pointer hover:bg-green-600 transition-colors">
                <AiOutlineEdit className="w-4 h-4 text-white" />
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{userData.CName}</h1>
              <p className="text-gray-600">{userData.CEmail}</p>
              <p className="text-sm text-green-600 mt-1">Skin Type: {userData.SkinType || 'Not specified'}</p>
            </div>
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
                        <option value="Sensitive">Sensitive</option>
                        <option value="Normal">Normal</option>
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
                <h2 className="text-xl font-semibold text-gray-900">Order History</h2>

                {orders.length === 0 ? (
                  <div className="text-center py-12">
                    <MdOutlineShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No orders yet</h3>
                    <p className="mt-1 text-sm text-gray-500">Start shopping to see your orders here.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
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
