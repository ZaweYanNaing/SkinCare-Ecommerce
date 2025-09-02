import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';
import './index.css';
import { router } from './router/router';
import { AdminAuthProvider } from './contexts/AdminAuthContext';

createRoot(document.getElementById('root')!).render(
  <AdminAuthProvider>
    <RouterProvider router={router} />
  </AdminAuthProvider>
);
