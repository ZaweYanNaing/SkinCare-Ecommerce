import { createBrowserRouter } from 'react-router';
import AdminLayoutWithSidebar from '@/Layout/AdminLayoutWithSidebar';
import Layout from '../Layout/Layout';
import Home from '../pages/Home';
import Consult from '../pages/Consult';
import ExpertDashboard from '../pages/ExpertDashboard';
import Proudct from '../pages/Product';
import ProductDeatil from '../pages/ProductDetail';
import WishList from '../pages/WishList';
import SignIn from '../pages/auth/SignIn';
import SignUp from '../pages/auth/SignUp';
import Profile from '../pages/Profile';
import AdminLogin from '@/pages/admin/Login';
import AccManagement from '@/pages/admin/AccManagement';
import CustomerAccounts from '@/pages/admin/CustomerAccounts';
import AdminAccounts from '@/pages/admin/AdminAccounts';
import ExpertAccounts from '../pages/admin/ExpertAccounts';
import Notification from '@/pages/admin/Notification';
import Overview from '@/pages/admin/Overview';
import ProductCreate from '@/pages/admin/ProductCreate';
import ProductEdit from '@/pages/admin/ProductEdit';
import Report from '@/pages/admin/Report';
import Transaction from '@/pages/admin/Transaction';
import ProtectedAdminRoute from '@/components/ProtectedAdminRoute';

export const router = createBrowserRouter([
  {
    path: '/auth/signup',
    element: <SignUp />,
  },
  {
    path: '/auth/signin',
    element: <SignIn />,
  },
  {
    path: '/profile',
    element: <Profile />,
  },
  {
    path: '/admin/login',
    element: <AdminLogin />,
  },
  {
    path: '/expert',
    element: <ExpertDashboard />,
  },
  {
    path: '/admin',
    element: (
      <ProtectedAdminRoute>
        <AdminLayoutWithSidebar />
      </ProtectedAdminRoute>
    ),
    children: [
      {
        path: '',
        element: <Overview />,
      },
      {
        path: 'report',
        element: <Report />,
      },
      {
        path: 'notification',
        element: <Notification />,
      },
      {
        path: 'accManange',
        element: <AccManagement />,
      },
      {
        path: 'customers',
        element: <CustomerAccounts />,
      },
      {
        path: 'admins',
        element: <AdminAccounts />,
      },
      {
        path: 'experts',
        element: <ExpertAccounts />,
      },
      {
        path: 'productCreate',
        element: <ProductCreate />,
      },
      {
        path: 'products',
        element: <ProductEdit />,
      },
      {
        path: 'transaction',
        element: <Transaction />,
      },
    ],
  },

  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <Home />,
      },
      {
        path: '/product',
        element: <Proudct />,
      },
      {
        path: '/wishList',
        element: <WishList />,
      },
      {
        path: '/consult',
        element: <Consult />,
      },
      {
        path: '/products/:id',
        element: <ProductDeatil />,
      },
    ],
  },
]);
