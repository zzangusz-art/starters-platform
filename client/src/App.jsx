import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';

import SMDashboard from './pages/StarMaster/Dashboard';
import SMMyFranchises from './pages/StarMaster/MyFranchises';
import SMCreateFranchise from './pages/StarMaster/CreateFranchise';
import SMApplications from './pages/StarMaster/Applications';

import SRDashboard from './pages/StarRookie/Dashboard';
import SRBrowse from './pages/StarRookie/Browse';
import SRMyApplications from './pages/StarRookie/MyApplications';

import MKDashboard from './pages/StarMaker/Dashboard';

import MGDashboard from './pages/StarManager/Dashboard';
import MGUsers from './pages/StarManager/Users';
import MGFranchises from './pages/StarManager/Franchises';
import MGApplications from './pages/StarManager/Applications';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-brand-black flex items-center justify-center"><div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to={getRoleHome(user.role)} replace />;
  return children;
};

const getRoleHome = (role) => {
  const map = { star_master: '/master', star_rookie: '/rookie', star_maker: '/maker', star_manager: '/manager' };
  return map[role] || '/';
};

const RoleRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  return <Navigate to={getRoleHome(user.role)} replace />;
};

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<ProtectedRoute><RoleRedirect /></ProtectedRoute>} />

        {/* 스타마스터 */}
        <Route path="/master" element={<ProtectedRoute roles={['star_master']}><SMDashboard /></ProtectedRoute>} />
        <Route path="/master/franchises" element={<ProtectedRoute roles={['star_master']}><SMMyFranchises /></ProtectedRoute>} />
        <Route path="/master/franchises/new" element={<ProtectedRoute roles={['star_master']}><SMCreateFranchise /></ProtectedRoute>} />
        <Route path="/master/franchises/:id/edit" element={<ProtectedRoute roles={['star_master']}><SMCreateFranchise /></ProtectedRoute>} />
        <Route path="/master/applications" element={<ProtectedRoute roles={['star_master']}><SMApplications /></ProtectedRoute>} />

        {/* 스타루키 */}
        <Route path="/rookie" element={<ProtectedRoute roles={['star_rookie']}><SRDashboard /></ProtectedRoute>} />
        <Route path="/rookie/browse" element={<ProtectedRoute roles={['star_rookie']}><SRBrowse /></ProtectedRoute>} />
        <Route path="/rookie/applications" element={<ProtectedRoute roles={['star_rookie']}><SRMyApplications /></ProtectedRoute>} />

        {/* 스타메이커 */}
        <Route path="/maker" element={<ProtectedRoute roles={['star_maker']}><MKDashboard /></ProtectedRoute>} />

        {/* 스타매니저 */}
        <Route path="/manager" element={<ProtectedRoute roles={['star_manager']}><MGDashboard /></ProtectedRoute>} />
        <Route path="/manager/users" element={<ProtectedRoute roles={['star_manager']}><MGUsers /></ProtectedRoute>} />
        <Route path="/manager/franchises" element={<ProtectedRoute roles={['star_manager']}><MGFranchises /></ProtectedRoute>} />
        <Route path="/manager/applications" element={<ProtectedRoute roles={['star_manager']}><MGApplications /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  </BrowserRouter>
);

export default App;
