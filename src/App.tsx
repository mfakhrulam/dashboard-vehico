import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { ROUTES } from '@/config/constants';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Dashboard from '@/pages/Dashboard';
import VehicleDetail from '@/pages/VehicleDetail';
import VehicleCreate from '@/pages/VehicleCreate';
import Profile from '@/pages/Profile';
import ServiceCreate from '@/pages/ServiceCreate';
import ServiceEdit from '@/pages/ServiceEdit';
import ProtectedRoute from '@/components/layout/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path={ROUTES.LOGIN} element={<Login />} />
        <Route path={ROUTES.REGISTER} element={<Register />} />

        {/* Protected routes */}
        <Route
          path={ROUTES.DASHBOARD}
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.VEHICLE_CREATE}
          element={
            <ProtectedRoute>
              <VehicleCreate />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vehicles/:id"
          element={
            <ProtectedRoute>
              <VehicleDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.PROFILE}
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.SERVICE_NEW}
          element={
            <ProtectedRoute>
              <ServiceCreate />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.SERVICE_EDIT(':id')}
          element={
            <ProtectedRoute>
              <ServiceEdit />
            </ProtectedRoute>
          }
        />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
        <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
