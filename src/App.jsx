import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Causes from './pages/Causes';
import Events from './pages/Events';
import Gallery from './pages/Gallery';
import News from './pages/News';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import ManagerDashboard from './pages/ManagerDashboard';
import VolunteerDashboard from './pages/VolunteerDashboard';
import OAuth2Callback from './pages/OAuth2Callback';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* OAuth2 callback route (without layout) */}
        <Route path="/oauth2/callback" element={<OAuth2Callback />} />
        
        {/* Dashboard routes (without main layout) */}
        <Route path="/dashboard/manager" element={<ManagerDashboard />} />
        <Route path="/dashboard/volunteer" element={<VolunteerDashboard />} />
        
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
            </Routes>
          </Layout>
        } />
      </Routes>
    </Router>
  );
}

export default App;
