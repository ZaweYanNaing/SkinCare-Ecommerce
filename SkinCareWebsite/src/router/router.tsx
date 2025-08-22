import { createBrowserRouter } from 'react-router';
import Layout from '../Layout/Layout';
import Home from '../pages/Home';
import NewProduct from '../pages/NewProduct';
import Proudct from '../pages/Product';
import ProductDeatil from '../pages/ProductDetail';
import WishList from '../pages/WishList';
import SignIn from '../pages/auth/SignIn';
import SignUp from '../pages/auth/SignUp';

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
