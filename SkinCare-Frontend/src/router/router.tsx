import { createBrowserRouter } from 'react-router';
import AdminLayoutWithSidebar from '@/Layout/AdminLayoutWithSidebar';
import Layout from '../Layout/Layout';
import Home from '../pages/Home';
import NewProduct from '../pages/NewProduct';
import Proudct from '../pages/Product';
import ProductDeatil from '../pages/ProductDetail';
import WishList from '../pages/WishList';
import SignIn from '../pages/auth/SignIn';
import SignUp from '../pages/auth/SignUp';
import Profile from '../pages/Profile';
import AccManagement from '@/pages/admin/AccManagement';
import Notification from '@/pages/admin/Notification';
import Overview from '@/pages/admin/Overview';
import ProductCreate from '@/pages/admin/ProductCreate';
import ProductEdit from '@/pages/admin/ProductEdit';
import Report from '@/pages/admin/Report';
import Transaction from '@/pages/admin/Transaction';

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
    path: '/admin',
    element: <AdminLayoutWithSidebar />,
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
        path: 'productCreate',
        element: <ProductCreate />,
      },
      {
        path: 'productEdit',
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
        path: '/new',
        element: <NewProduct />,
      },
      {
        path: '/products/:id',
        element: <ProductDeatil />,
      },
    ],
  },
]);
