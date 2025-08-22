import { MapPin, Phone, Mail, Receipt } from 'lucide-react';
import { useRef } from 'react';

interface CartItem {
  ProductID: number;
  Name: string;
  Description: string;
  Price: number;
  Stock: number;
  ForSkinType: string;
  CategoryID: number;
  Image: string;
  quantity: number;
  addedAt: string;
}

interface VoucherProps {
  cartItems: CartItem[];
  customerInfo?: {
    name: string;
    email: string;
    phone?: string;
  };
  onClose: () => void;
}

// Clear shopping cart after successful order

export default function Voucher({ cartItems, customerInfo, onClose }: VoucherProps) {
  const voucherRef = useRef<HTMLDivElement>(null);

  const handleClose = () => {
    onClose();
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.Price * item.quantity, 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getSubtotal = () => {
    return getTotalPrice();
  };

  const getTax = () => {
    return Math.round(getTotalPrice() * 0.05); // 5% tax
  };

  const getShipping = () => {
    return getTotalPrice() > 50000 ? 0 : 3000; // Free shipping over 50,000 Ks
  };

  const getFinalTotal = () => {
    return getSubtotal() + getTax() + getShipping();
  };

  const generateOrderNumber = () => {
    return `SKC-${Date.now().toString().slice(-8)}`;
  };

  const getCurrentDateTime = () => {
    return new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-gray-200 bg-opacity-50 flex items-center justify-center z-100 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Receipt className="w-6 h-6 text-green-700" />
            Order Voucher
          </h2>
          <button onClick={handleClose} className="text-gray-500 hover:text-gray-700 text-2xl font-bold">
            ×
          </button>
        </div>

        {/* Voucher Content */}
        <div ref={voucherRef} className="p-6 bg-gradient-to-br from-green-50 to-white">
          {/* Company Header */}
          <div className="text-center mb-8 border-b-2 border-green-200 pb-6">
            <h1 className="text-3xl font-bold text-green-800 mb-2">SkinCare Store</h1>
            <p className="text-gray-600 mb-2">Premium Skincare Products</p>
            <div className="flex justify-center items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>123 Beauty Street, Yangon</span>
              </div>
              <div className="flex items-center gap-1">
                <Phone className="w-4 h-4" />
                <span>+95 9 123 456 789</span>
              </div>
            </div>
          </div>

          {/* Order Info */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-green-600" />
                Order Details
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order Number:</span>
                  <span className="font-mono font-semibold">{generateOrderNumber()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date & Time:</span>
                  <span className="font-semibold">{getCurrentDateTime()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Items:</span>
                  <span className="font-semibold">{getTotalItems()}</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Mail className="w-4 h-4 text-green-600" />
                Customer Info
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-semibold">{customerInfo?.name || 'Guest Customer'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-semibold text-xs">{customerInfo?.email || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone:</span>
                  <span className="font-semibold">{customerInfo?.phone || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
            <div className="bg-green-700 text-white p-3">
              <h3 className="font-semibold">Order Items</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-3 font-semibold text-gray-700">Product</th>
                    <th className="text-center p-3 font-semibold text-gray-700">Qty</th>
                    <th className="text-right p-3 font-semibold text-gray-700">Unit Price</th>
                    <th className="text-right p-3 font-semibold text-gray-700">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map((item, index) => (
                    <tr key={item.ProductID} className={index % 2 === 0 ? 'bg-gray-25' : 'bg-white'}>
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                            {item.Image && <img src={`/src/assets/${item.Image}`} alt={item.Name} className="w-full h-full object-cover" />}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800 text-sm">{item.Name}</p>
                            <p className="text-xs text-gray-500">{item.ForSkinType}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-center font-semibold">{item.quantity}</td>
                      <td className="p-3 text-right font-semibold">{item.Price.toLocaleString()} Ks</td>
                      <td className="p-3 text-right font-semibold text-green-700">{(item.Price * item.quantity).toLocaleString()} Ks</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="space-y-3">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span className="font-semibold">{getSubtotal().toLocaleString()} Ks</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax (5%):</span>
                <span className="font-semibold">{getTax().toLocaleString()} Ks</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping:</span>
                <span className="font-semibold">{getShipping() === 0 ? 'FREE' : `${getShipping().toLocaleString()} Ks`}</span>
              </div>
              <div className="border-t-2 border-green-200 pt-3">
                <div className="flex justify-between text-xl font-bold text-green-800">
                  <span>Total Amount:</span>
                  <span>{getFinalTotal().toLocaleString()} Ks</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center border-t-2 border-green-200 pt-6">
            <p className="text-gray-600 mb-2">Thank you for shopping with SkinCare Store!</p>
            <p className="text-sm text-gray-500">For any queries, contact us at support@skincarestore.com</p>
            <div className="mt-4 text-xs text-gray-400">
              <p>This is a computer-generated voucher. No signature required.</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 p-6 border-t bg-gray-50">
          <button
            onClick={handlePrint}
            className="flex-1 bg-green-700 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-800 transition-colors flex items-center justify-center gap-2"
          >
            <Receipt className="w-4 h-4" />
            Print Voucher
          </button>
          <button
            onClick={handleClose}
            className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
