import { LogIn, Minus, Plus, Tickets, Trash2 } from 'lucide-react';
import { Link } from 'react-router';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import queryString from 'query-string';
import { useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import logo from '../assets/skincareLogo.png';
import { NavContext } from '../contexts/NavContext';
import Voucher from './Voucher';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

import { toast } from 'react-toastify';
import { Button } from './ui/button';

import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

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

const payment = [
  {
    value: 'kpay',
    label: 'KPay',
    number: '09962031033',
  },
  {
    value: 'ayapay',
    label: 'AyaPay',
    number: '09442031033',
  },
  {
    value: 'kbz',
    label: 'KBZ bank',
    number: '59302224499494',
  },
  {
    value: 'cb',
    label: 'CB bank',
    number: '023019244993543',
  },
];

export default function navbar() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  let [, setIsLoggedIn] = useState(true);
  const [search, setSearch] = useState('');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [showVoucher, setShowVoucher] = useState(false);
  const { showNavBar } = useContext<any>(NavContext);
  const location = useLocation();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const [valueOpt, setValueOpt] = useState('');
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  // Load cart items from localStorage
  useEffect(() => {
    const loadCartItems = () => {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      setCartItems(cart);
    };

    loadCartItems();

    // Listen for storage changes to update cart when items are added from other components
    const handleStorageChange = () => {
      loadCartItems();
    };

    window.addEventListener('storage', handleStorageChange);
    // Also listen for custom cart update events
    window.addEventListener('cartUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cartUpdated', handleStorageChange);
    };
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearch = e.target.value;
    setSearch(newSearch);

    const parsed = queryString.parse(location.search);
    const newQueryString = queryString.stringify({
      ...parsed,
      search: newSearch,
    });
    if (location.pathname === '/product') navigate(`${location.pathname}?${newQueryString}`);
    else navigate(`/product?${newQueryString}`);
  };

  const updateCartQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const updatedCart = cartItems.map((item) => (item.ProductID === productId ? { ...item, quantity: newQuantity } : item));

    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const removeFromCart = (productId: number) => {
    const updatedCart = cartItems.filter((item) => item.ProductID !== productId);
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    window.dispatchEvent(new Event('cartUpdated'));
    toast.success('Item removed from cart!');
  };

  const getSubtotal = () => {
    return cartItems.reduce((total, item) => total + item.Price * item.quantity, 0);
  };

  const getTax = () => {
    return Math.round(getSubtotal() * 0.05); // 5% tax
  };

  const getShipping = () => {
    return getSubtotal() > 50000 ? 0 : 3000; // Free shipping over 50,000 Ks
  };

  const getTotalPrice = () => {
    return getSubtotal() + getTax() + getShipping();
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const handleVoucherClose = () => {
    setShowVoucher(false);
    // Clear shopping cart after successful order
    localStorage.removeItem('cart');
    setCartItems([]);
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const createOrder = async () => {
    if (!value) {
      toast.error('Please select a payment method!');
      return;
    }

    if (!valueOpt || valueOpt.length < 6) {
      toast.error('Please enter a valid 6-digit transaction ID!');
      return;
    }

    if (!user.id) {
      toast.error('Please login to place an order!');
      return;
    }

    setIsCreatingOrder(true);

    try {
      const orderData = {
        customerID: user.id,
        items: cartItems.map((item) => ({
          ProductID: item.ProductID,
          quantity: item.quantity,
          Price: item.Price,
        })),
        payment: {
          amount: getTotalPrice(),
          tranID: valueOpt,
          paymentMethod: payment.find((p) => p.value === value)?.label || value,
        },
        status: 'pending',
      };

      const response = await fetch('http://localhost/order.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Order created successfully!');
        setShowVoucher(true);

        // Reset form
        setValue('');
        setValueOpt('');
        setOpen(false);
      } else {
        toast.error(result.error || 'Failed to create order');
      }
    } catch (error) {
      console.error('Order creation error:', error);
      toast.error('Failed to create order. Please try again.');
    } finally {
      setIsCreatingOrder(false);
    }
  };

  return (
    <div
      className={`top-0 flex h-20 w-full items-center justify-between px-10 ${showNavBar ? 'fixed right-0 left-0 z-30 w-full justify-center' : 'shadow-lg'}`}
    >
      <img className={`w-20 ${showNavBar ? 'hidden' : ' '}`} src={logo} alt="" />

      {/*links to all pages */}
      <div
        className={`flex gap-x-14 font-semibold tracking-wider ${showNavBar ? 'mt-10 rounded-[35px] border-[#E5F5F0] bg-[#FCFCFC]/[2%] px-[49px] py-[21px] shadow-[5px_10px_24px_rgba(140,136,136,0.25)] backdrop-blur-[10px]' : 'ms-[273px]'}`}
      >
        <Link to="/">Home</Link>
        <Link to="/product"> Product </Link>
        <Link to="/wishList"> WishList </Link>
        <Link to="/consult"> Consult </Link>
      </div>

      {/*Search and Profile , Shopping Cart */}
      <div className={`flex gap-x-6 ${showNavBar ? 'hidden' : ' '}`}>
        <div className="flex w-[217.85px] items-center gap-x-3 rounded-[44px] bg-[#E5F5F0] px-5 py-2.5">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input value={search} onChange={handleSearchChange} type="text" placeholder="Search..." className="w-[100px] flex-1 outline-0" />
        </div>

        {!!user.email && (
          <div className="flex gap-x-6">
            <Popover>
              <PopoverTrigger asChild>
                <div className="flex cursor-pointer items-center justify-center rounded-[8px] bg-[#E5F5F0] px-3">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5">
                    <g clip-path="url(#clip0_23_763)">
                      <path
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        d="M18.0406 16.5625C16.8508 14.5055 15.0172 13.0305 12.8773 12.3313C15.053 11.0361 16.0951 8.44698 15.4235 6.00575C14.7518 3.56451 12.5319 1.87287 10 1.87287C7.46806 1.87287 5.24816 3.56451 4.57652 6.00575C3.90487 8.44698 4.94704 11.0361 7.12266 12.3313C4.98281 13.0297 3.14922 14.5047 1.95938 16.5625C1.84059 16.7562 1.83627 16.9991 1.94811 17.1969C2.05995 17.3947 2.27031 17.5162 2.49752 17.5142C2.72473 17.5123 2.93298 17.3872 3.04141 17.1875C4.51328 14.6438 7.11484 13.125 10 13.125C12.8852 13.125 15.4867 14.6438 16.9586 17.1875C17.067 17.3872 17.2753 17.5123 17.5025 17.5142C17.7297 17.5162 17.9401 17.3947 18.0519 17.1969C18.1637 16.9991 18.1594 16.7562 18.0406 16.5625ZM5.625 7.5C5.625 5.08375 7.58375 3.125 10 3.125C12.4162 3.125 14.375 5.08375 14.375 7.5C14.375 9.91625 12.4162 11.875 10 11.875C7.58483 11.8724 5.62758 9.91517 5.625 7.5Z"
                        fill="#0D1C17"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_23_763">
                        <rect width="20" height="20" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-30">
                <div className="flex flex-col items-center justify-between gap-y-3">
                  <Link to="/profile">
                    <p className="cursor-pointer text-xs md:text-xs lg:text-sm border-0">Profile</p>
                  </Link>
                  <div className="cursor-pointer w-full flex justify-center">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <p className="cursor-pointer text-xs md:text-xs lg:text-sm border-0">Logout</p>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="py-10">
                        <AlertDialogHeader className="flex gap-y-6">
                          <AlertDialogTitle>Log out</AlertDialogTitle>
                          <AlertDialogDescription>Are you sure to log out?</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => {
                              localStorage.removeItem('user');
                              localStorage.removeItem('token');
                              localStorage.removeItem('cart');
                              setCartItems([]);
                              window.dispatchEvent(new Event('cartUpdated'));
                              toast('Logout Successfully');
                              setIsLoggedIn(false);
                            }}
                          >
                            Logout
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <Sheet>
              <SheetTrigger className="w-full rounded-[8px] bg-[#E5F5F0]">
                <div className="relative w-full flex items-center justify-center rounded-[8px] bg-[#E5F5F0] px-3 cursor-pointer">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M2.5 3.75H3.75L6.25 13.75H15L17.5 6.25H5"
                      stroke="#0D1C17"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle cx="6.25" cy="16.25" r="1.25" stroke="#0D1C17" strokeWidth="1.5" />
                    <circle cx="15" cy="16.25" r="1.25" stroke="#0D1C17" strokeWidth="1.5" />
                  </svg>
                  {getTotalItems() > 0 && (
                    <span className="absolute -top-2 -right-2 bg-green-700 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {getTotalItems()}
                    </span>
                  )}
                </div>
              </SheetTrigger>

              <SheetContent className="w-[400px] sm:w-[540px]">
                <SheetHeader>
                  <SheetTitle>Shopping Cart ({getTotalItems()} items)</SheetTitle>
                  <SheetDescription>Review your items before checkout</SheetDescription>
                  {cartItems.length > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-green-800">Total Amount:</span>
                        <span className="text-lg font-bold text-green-700">{getTotalPrice().toLocaleString()} Ks</span>
                      </div>
                      <div className="text-xs text-green-600 mt-1">
                        Includes tax ({getTax().toLocaleString()} Ks) and shipping (
                        {getShipping() === 0 ? 'FREE' : `${getShipping().toLocaleString()} Ks`})
                      </div>
                    </div>
                  )}
                </SheetHeader>

                <div className="mt-6 flex flex-col h-full">
                  {cartItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center flex-1 text-gray-500">
                      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" className="mb-4">
                        <path
                          d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.7 15.3C4.3 15.7 4.6 16.5 5.1 16.5H17M17 13V16.5M9 19.5C9.8 19.5 10.5 20.2 10.5 21S9.8 22.5 9 22.5 7.5 21.8 7.5 21 8.2 19.5 9 19.5ZM20 19.5C20.8 19.5 21.5 20.2 21.5 21S20.8 22.5 20 22.5 18.5 21.8 18.5 21 19.2 19.5 20 19.5Z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <p className="text-lg font-medium">Your cart is empty</p>
                      <p className="text-sm">Add some products to get started</p>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1 overflow-y-auto ">
                        <ScrollArea className="w-full h-120">
                          {cartItems.map((item) => (
                            <div key={item.ProductID} className="flex items-center space-x-4 p-4 border rounded-lg">
                              <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                                {item.Image && <img src={`/src/assets/${item.Image}`} alt={item.Name} className="w-full h-full object-cover" />}
                              </div>

                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-sm truncate">{item.Name}</h3>
                                <p className="text-xs text-gray-500 truncate">{item.ForSkinType}</p>
                                <p className="font-semibold text-green-700">{item.Price} Ks</p>
                              </div>

                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => updateCartQuantity(item.ProductID, item.quantity - 1)}
                                  className="p-1 rounded-full hover:bg-gray-100"
                                >
                                  <Minus className="w-4 h-4" />
                                </button>
                                <span className="w-8 text-center font-medium">{item.quantity}</span>
                                <button
                                  onClick={() => updateCartQuantity(item.ProductID, item.quantity + 1)}
                                  className="p-1 rounded-full hover:bg-gray-100"
                                  disabled={item.quantity >= item.Stock}
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => removeFromCart(item.ProductID)}
                                  className="p-1 rounded-full hover:bg-red-100 text-red-600 ml-2"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </ScrollArea>
                      </div>

                      <div className="border-t p-4 mt-4 space-y-4">
                        <div className="w-full flex justify-center  ">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button className="cursor-pointer " size="lg">
                                <Tickets />
                                Checkout
                              </Button>
                            </DialogTrigger>

                            <DialogContent className="sm:max-w-[425px] lg:w-full ">
                              <DialogHeader>
                                <DialogTitle className="text-center my-6 text-2xl">Checkout Voucher</DialogTitle>
                                <DialogDescription>
                                  Total Amount : <span className="text-black text-xl font-bold"> {getTotalPrice()}</span> Ks
                                </DialogDescription>
                              </DialogHeader>
                              <div className="grid gap-4">
                                <div className="space-y-3">
                                  <label className="text-sm font-medium text-gray-700">Select Payment Method:</label>
                                  <Popover open={open} onOpenChange={setOpen}>
                                    <PopoverTrigger asChild>
                                      <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
                                        {value ? payment.find((framework) => framework.value === value)?.label : 'Choose Payment Method...'}
                                        <ChevronsUpDown className="opacity-50" />
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-full p-0">
                                      <Command>
                                        <CommandInput placeholder="Search payment method..." className="h-9" />
                                        <CommandList>
                                          <CommandEmpty>No payment method found.</CommandEmpty>
                                          <CommandGroup>
                                            {payment.map((framework) => (
                                              <CommandItem
                                                key={framework.value}
                                                value={framework.value}
                                                onSelect={(currentValue) => {
                                                  setValue(currentValue === value ? '' : currentValue);
                                                  setOpen(false);
                                                }}
                                              >
                                                <div className="flex flex-col">
                                                  <span className="font-medium">{framework.label}</span>
                                                  <span className="text-xs text-gray-500">{framework.number}</span>
                                                </div>
                                                <Check className={cn('ml-auto', value === framework.value ? 'opacity-100' : 'opacity-0')} />
                                              </CommandItem>
                                            ))}
                                          </CommandGroup>
                                        </CommandList>
                                      </Command>
                                    </PopoverContent>
                                  </Popover>
                                </div>

                                {/* Payment Number Display */}
                                {value && (
                                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
                                    <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                      <span className="text-sm font-medium text-green-800">
                                        {payment.find((p) => p.value === value)?.label} Selected
                                      </span>
                                    </div>
                                    <div className="bg-white border border-green-200 rounded-md p-3">
                                      <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Payment Number:</span>
                                        <div className="flex items-center gap-2">
                                          <span className="font-mono font-semibold text-green-700 text-lg">
                                            {payment.find((p) => p.value === value)?.number}
                                          </span>
                                          <button
                                            onClick={() => {
                                              const paymentNumber = payment.find((p) => p.value === value)?.number;
                                              if (paymentNumber) {
                                                navigator.clipboard.writeText(paymentNumber);
                                                toast.success('Payment number copied to clipboard!');
                                              }
                                            }}
                                            className="text-green-600 hover:text-green-800 text-xs bg-green-100 hover:bg-green-200 px-2 py-1 rounded transition-colors"
                                          >
                                            Copy
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="text-xs text-green-700 bg-green-100 rounded-md p-2">
                                      <strong>Instructions:</strong> Transfer the total amount ({getTotalPrice()} Ks) to the above number and proceed
                                      with voucher generation.
                                    </div>
                                    <div className="text-lg my-5">Enter the last Transition ID</div>
                                    <div className="my-4 w-full flex justify-center">
                                      <InputOTP maxLength={6} value={valueOpt} onChange={(valueOpt) => setValueOpt(valueOpt)}>
                                        <InputOTPGroup>
                                          <InputOTPSlot index={0} />
                                          <InputOTPSlot index={1} />
                                          <InputOTPSlot index={2} />
                                          <InputOTPSlot index={3} />
                                          <InputOTPSlot index={4} />
                                          <InputOTPSlot index={5} />
                                        </InputOTPGroup>
                                      </InputOTP>
                                    </div>
                                  </div>
                                )}
                              </div>
                              <DialogFooter>
                                <DialogClose asChild>
                                  <Button variant="outline">Cancel</Button>
                                </DialogClose>
                                <Button type="submit" onClick={createOrder} disabled={!value || !valueOpt || isCreatingOrder}>
                                  {isCreatingOrder ? 'Creating Order...' : 'Generate Voucher'}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        )}

        {!user.email && (
          <div className="flex">
            <Popover>
              <PopoverTrigger asChild>
                <div className="flex cursor-pointer items-center justify-center rounded-[8px] bg-[#E5F5F0] px-3">
                  <LogIn className="size-5 text-gray-700" />
                </div>
              </PopoverTrigger>

              <PopoverContent className="w-30">
                <div className="flex flex-col items-center justify-center gap-y-5">
                  <Link to="/auth/signin">
                    <p className="cursor-pointer">Login</p>
                  </Link>
                  <Link to="/auth/signup">
                    <p className="cursor-pointer">Register</p>
                  </Link>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        )}
      </div>

      {/* Voucher Modal */}
      {showVoucher && (
        <Voucher
          cartItems={cartItems}
          customerInfo={{
            name: user.name || 'Guest Customer',
            email: user.email || '',
            phone: user.phone || '',
          }}
          onClose={handleVoucherClose}
        />
      )}
    </div>
  );
}
