import { Outlet } from 'react-router';
import { ToastContainer } from 'react-toastify';
import Footer from '../components/footer';
import Navbar from '../components/navbar';
import { NavProvider } from '../contexts/NavContext';
export default function Layout() {
  return (
    <div className="mt-1">
      <NavProvider>
        <Navbar />

        <div className="mx-10">
          <ToastContainer />
          <Outlet />
        </div>

        <Footer />
      </NavProvider>
    </div>
  );
}
