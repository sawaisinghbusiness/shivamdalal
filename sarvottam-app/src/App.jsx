import { Routes, Route, useLocation } from 'react-router-dom';
import { ToastProvider } from './components/Toast';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import Emergency from './pages/Emergency';
import Furniture from './pages/Furniture';
import Painting from './pages/Painting';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import MyBookings from './pages/MyBookings';
import SavedAddresses from './pages/SavedAddresses';
import Wallet from './pages/Wallet';
import Notifications from './pages/Notifications';
import Help from './pages/Help';
import './App.css';

// bottom nav sirf in main tabs pe dikhe
const MAIN_TABS = ['/', '/emergency', '/furniture', '/painting', '/profile'];

export default function App() {
  const { pathname } = useLocation();
  const showNav = MAIN_TABS.includes(pathname);

  return (
    <ToastProvider>
      <div className="app-wrapper">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/emergency" element={<Emergency />} />
          <Route path="/furniture" element={<Furniture />} />
          <Route path="/painting" element={<Painting />} />
          <Route path="/profile" element={<Profile />} />
          {/* Profile sub-pages */}
          <Route path="/profile/edit" element={<EditProfile />} />
          <Route path="/bookings" element={<MyBookings />} />
          <Route path="/addresses" element={<SavedAddresses />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/help" element={<Help />} />
        </Routes>
        {showNav && <BottomNav />}
      </div>
    </ToastProvider>
  );
}
