import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import { RouterProvider } from 'react-router-dom';

// We will change this value before each test to set the initial route for the in-memory router
let initialPath = '/';

// Mock react-router's createBrowserRouter to actually create a memory router with controllable initialEntries
vi.mock('react-router', async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    createBrowserRouter: (routes: any) =>
      actual.createMemoryRouter(routes, { initialEntries: [initialPath] }),
  };
});

// Mock layout components to include an Outlet so nested routes render children
vi.mock('@/Layout/AdminLayoutWithSidebar', async () => {
  const { Outlet } = await import('react-router-dom');
  return {
    default: () => (
      <div>
        ADMIN LAYOUT
        <Outlet />
      </div>
    ),
  };
});

vi.mock('../Layout/Layout', async () => {
  const { Outlet } = await import('react-router-dom');
  return {
    default: () => (
      <div>
        APP LAYOUT
        <Outlet />
      </div>
    ),
  };
});

// Pass-through protected route for testing (no auth logic here)
vi.mock('@/components/ProtectedAdminRoute', () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock pages used by the router to simple components with recognizable text
vi.mock('../pages/Home', () => ({ default: () => <div>HOME PAGE</div> }));
vi.mock('../pages/NewProduct', () => ({ default: () => <div>NEW PRODUCT PAGE</div> }));
vi.mock('../pages/Product', () => ({ default: () => <div>PRODUCT LIST PAGE</div> }));
vi.mock('../pages/WishList', () => ({ default: () => <div>WISHLIST PAGE</div> }));
vi.mock('../pages/Profile', () => ({ default: () => <div>PROFILE PAGE</div> }));
vi.mock('../pages/auth/SignIn', () => ({ default: () => <div>SIGNIN PAGE</div> }));
vi.mock('../pages/auth/SignUp', () => ({ default: () => <div>SIGNUP PAGE</div> }));
vi.mock('../pages/ProductDetail', async () => {
  const { useParams } = await import('react-router-dom');
  const ProductDetail = () => {
    const { id } = useParams();
    return <div>PRODUCT DETAIL PAGE ID: {id}</div>;
  };
  return { default: ProductDetail };
});

vi.mock('@/pages/admin/Login', () => ({ default: () => <div>ADMIN LOGIN PAGE</div> }));
vi.mock('@/pages/admin/AccManagement', () => ({ default: () => <div>ADMIN ACCOUNT MANAGEMENT</div> }));
vi.mock('@/pages/admin/CustomerAccounts', () => ({ default: () => <div>ADMIN CUSTOMER ACCOUNTS</div> }));
vi.mock('@/pages/admin/AdminAccounts', () => ({ default: () => <div>ADMIN ACCOUNTS</div> }));
vi.mock('@/pages/admin/Notification', () => ({ default: () => <div>ADMIN NOTIFICATION</div> }));
vi.mock('@/pages/admin/Overview', () => ({ default: () => <div>ADMIN OVERVIEW</div> }));
vi.mock('@/pages/admin/ProductCreate', () => ({ default: () => <div>ADMIN PRODUCT CREATE</div> }));
vi.mock('@/pages/admin/ProductEdit', () => ({ default: () => <div>ADMIN PRODUCT EDIT</div> }));
vi.mock('@/pages/admin/Report', () => ({ default: () => <div>ADMIN REPORT</div> }));
vi.mock('@/pages/admin/Transaction', () => ({ default: () => <div>ADMIN TRANSACTION</div> }));

async function renderAt(path: string) {
  initialPath = path;
  // Reset module cache so the router is re-created with the new initial path
  vi.resetModules();
  // Re-import after reset; mocks declared above are kept
  const { router } = await import('./router');
  return render(<RouterProvider router={router} />);
}

beforeEach(() => {
  cleanup();
});

afterEach(() => {
  cleanup();
});

describe('App Router', () => {
  it('Should render Home component at root path "/" within the app layout', async () => {
    await renderAt('/');
    expect(screen.getByText('APP LAYOUT')).toBeInTheDocument();
    expect(screen.getByText('HOME PAGE')).toBeInTheDocument();
  });

  it('Should render SignIn component at "/auth/signin"', async () => {
    await renderAt('/auth/signin');
    expect(screen.getByText('SIGNIN PAGE')).toBeInTheDocument();
  });

  it('Should render ProductDetail with dynamic id at "/products/:id"', async () => {
    await renderAt('/products/42');
    expect(screen.getByText('PRODUCT DETAIL PAGE ID: 42')).toBeInTheDocument();
  });

  it('Should render WishList at "/wishList"', async () => {
    await renderAt('/wishList');
    expect(screen.getByText('WISHLIST PAGE')).toBeInTheDocument();
  });

  it('Should render Admin Overview under protected admin layout at "/admin"', async () => {
    await renderAt('/admin');
    // Layout and nested overview page should both render
    expect(screen.getByText('ADMIN LAYOUT')).toBeInTheDocument();
    expect(screen.getByText('ADMIN OVERVIEW')).toBeInTheDocument();
  });

  it('Should render Admin Product Edit at "/admin/products"', async () => {
    await renderAt('/admin/products');
    expect(screen.getByText('ADMIN LAYOUT')).toBeInTheDocument();
    expect(screen.getByText('ADMIN PRODUCT EDIT')).toBeInTheDocument();
  });

  it('Should render Product list at "/product" route', async () => {
    await renderAt('/product');
    expect(screen.getByText('PRODUCT LIST PAGE')).toBeInTheDocument();
  });
});
