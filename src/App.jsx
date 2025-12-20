import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Events from './pages/Events';
import MyEvents from './pages/MyEvents';
import EventFeed from './pages/EventFeed';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AdminDashboard from './pages/AdminDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import ManagerEvents from './pages/ManagerEvents';
import ManagerVolunteers from './pages/ManagerVolunteers';
import CreateEvent from './pages/CreateEvent';
import EventDetail from './pages/EventDetail';
import EventRegistrations from './pages/EventRegistrations';
import VolunteerDashboard from './pages/VolunteerDashboard';
import Profile from './pages/Profile';
import AdminUsers from './pages/AdminUsers';
import AdminUserDetail from './pages/AdminUserDetail';
import AdminEventDetail from './pages/AdminEventDetail';
import Notifications from './pages/Notifications';
import OAuth2Success from './pages/OAuth2Success';
import OAuth2Failure from './pages/OAuth2Failure';
import FCMNotificationSetup from './components/firebase/FCMNotificationSetup';
import NotificationToastContainer from './components/notifications/NotificationToastContainer';

import './App.css';

function App() {
  return (
    <Router>
      <FCMNotificationSetup />
      <NotificationToastContainer />
      <Routes>
        {/* OAuth2 callback routes (without layout) */}
        <Route path="/auth/success" element={<OAuth2Success />} />
        <Route path="/auth/failure" element={<OAuth2Failure />} />
        
        {/* Dashboard routes (without main layout) */}
        <Route path="/dashboard/admin" element={<AdminDashboard />} />
        <Route path="/dashboard/manager" element={<ManagerDashboard />} />
        <Route path="/dashboard/volunteer" element={<VolunteerDashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/users/:userId" element={<AdminUserDetail />} />
        <Route path="/admin/events/:eventId" element={<AdminEventDetail />} />
        
        {/* Manager routes */}
        <Route path="/manager/events" element={<ManagerEvents />} />
        <Route path="/manager/events/create" element={<CreateEvent />} />
        <Route path="/manager/events/:eventId" element={<EventDetail />} />
        <Route path="/manager/events/:eventId/registrations" element={<EventRegistrations />} />
        <Route path="/manager/events/:eventId/feed" element={<EventFeed />} />
        <Route path="/manager/volunteers" element={<ManagerVolunteers />} />
        
        <Route path="/volunteer/events" element={<Events />} />
        <Route path="/volunteer/events/:eventId/feed" element={<EventFeed />} />
        <Route path="/events" element={<Events />} />
        <Route path="/my-events" element={<MyEvents />} />
        
        <Route path="/*" element={
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/events" element={<Events />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
            </Routes>
          </Layout>
        } />
      </Routes>
    </Router>
  );
}

export default App;
