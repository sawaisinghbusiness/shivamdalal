import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastProvider } from './components/Toast';
import { useAppData } from './store/AppData';
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
import Login from './pages/Login';
import Register from './pages/Register';
import KarigarApp from './pages/KarigarApp';
import './App.css';

const MAIN_TABS = ['/', '/emergency', '/furniture', '/painting', '/profile'];

export default function App() {
  const { pathname } = useLocation();
  const { auth } = useAppData();

  // Not logged in → only login / register
  if (!auth.loggedIn) {
    return (
      <ToastProvider>
        <div className="app-wrapper">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </ToastProvider>
    );
  }

  // Logged in as Karigar → Karigar app only
  if (auth.role === 'karigar') {
    return (
      <ToastProvider>
        <div className="app-wrapper">
          <Routes>
            <Route path="/karigar" element={<KarigarApp />} />
            <Route path="*" element={<Navigate to="/karigar" replace />} />
          </Routes>
        </div>
      </ToastProvider>
    );
  }

  // Logged in as Customer → full customer app
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
          <Route path="/profile/edit" element={<EditProfile />} />
          <Route path="/bookings" element={<MyBookings />} />
          <Route path="/addresses" element={<SavedAddresses />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/help" element={<Help />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        {showNav && <BottomNav />}
      </div>
    </ToastProvider>
  );
}
