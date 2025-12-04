import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Causes from './pages/Causes';
import Events from './pages/Events';
import MyEvents from './pages/MyEvents';
import EventFeed from './pages/EventFeed';
import Gallery from './pages/Gallery';
import News from './pages/News';
import Contact from './pages/Contact';
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
import VolunteerDashboard from './pages/VolunteerDashboard';
import Profile from './pages/Profile';
import AdminUsers from './pages/AdminUsers';
import AdminUserDetail from './pages/AdminUserDetail';
import OAuth2Success from './pages/OAuth2Success';
import OAuth2Failure from './pages/OAuth2Failure';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* OAuth2 callback routes (without layout) */}
        <Route path="/auth/success" element={<OAuth2Success />} />
        <Route path="/auth/failure" element={<OAuth2Failure />} />
        
        {/* Dashboard routes (without main layout) */}
        <Route path="/dashboard/admin" element={<AdminDashboard />} />
        <Route path="/dashboard/manager" element={<ManagerDashboard />} />
        <Route path="/dashboard/volunteer" element={<VolunteerDashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/users/:userId" element={<AdminUserDetail />} />
        
        {/* Manager routes */}
        <Route path="/manager/events" element={<ManagerEvents />} />
        <Route path="/manager/events/create" element={<CreateEvent />} />
        <Route path="/manager/events/:eventId" element={<EventDetail />} />
        <Route path="/manager/volunteers" element={<ManagerVolunteers />} />
        
        <Route path="/volunteer/events" element={<Events />} />
        <Route path="/volunteer/events/:eventId/feed" element={<EventFeed />} />
        <Route path="/events" element={<Events />} />
        <Route path="/my-events" element={<MyEvents />} />
        
        {/* Main site routes (with main layout) */}
        <Route path="/*" element={
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/causes" element={<Causes />} />
              <Route path="/events" element={<Events />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/news" element={<News />} />
              <Route path="/contact" element={<Contact />} />
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
