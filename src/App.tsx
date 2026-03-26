import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { ROUTES } from '@/config/constants';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Dashboard from '@/pages/Dashboard';
import Garage from '@/pages/Garage';
import VehicleDetail from '@/pages/VehicleDetail';
import VehicleCreate from '@/pages/VehicleCreate';
import VehicleEdit from '@/pages/VehicleEdit';
import Profile from '@/pages/Profile';
import Settings from '@/pages/Settings';
import ServiceCreate from '@/pages/ServiceCreate';
import ServiceEdit from '@/pages/ServiceEdit';
import Services from '@/pages/Services';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import ErrorBoundary from '@/components/common/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
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
            path={ROUTES.GARAGE}
            element={
              <ProtectedRoute>
                <Garage />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.SERVICES}
            element={
              <ProtectedRoute>
                <Services />
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
            path={ROUTES.VEHICLE_EDIT(':id')}
            element={
              <ProtectedRoute>
                <VehicleEdit />
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
            path={ROUTES.SETTINGS}
            element={
              <ProtectedRoute>
                <Settings />
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
    </ErrorBoundary>
  );
}

export default App;
