// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Layout
import AdminLayout from './layouts/AdminLayout';

// Vistas
import Login from './views/Login';
import Dashboard from './views/Dashboard';
import CrearUsuarios from './views/CrearUsuarios';
import RegistrarBienes from './views/RegistrarBienes';
import CargarDatos from './views/CargarDatos';
import ConsultarBienes from './views/ConsultarBienes';

// Componente Guardián para proteger rutas por Rol
function ProtectedRoute({ children, allowedRoles }) {
  const rol = localStorage.getItem('rol');

  // Si no ha iniciado sesión, redirigir al Login
  if (!rol) {
    return <Navigate to="/" replace />;
  }

  // Si el rol no está autorizado, mostrar tarjeta de error visual
  if (allowedRoles && !allowedRoles.includes(rol)) {
    return (
      <div className="view-card" style={{ textAlign: 'center', marginTop: '40px', padding: '40px' }}>
        <div style={{ fontSize: '50px', marginBottom: '15px' }}>⚠️</div>
        <h2 style={{ color: 'var(--danger)', fontWeight: '700' }}>Acceso Restringido</h2>
        <p style={{ color: 'var(--text-muted)', margin: '10px 0 25px' }}>
          No dispones de los permisos de {allowedRoles.join(' o ')} requeridos para visualizar esta sección.
        </p>
        <button className="btn-primary" style={{ width: 'auto' }} onClick={() => window.location.href = '/dashboard'}>
          Regresar al Panel Seguro
        </button>
      </div>
    );
  }

  return children;
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta pública */}
        <Route path="/" element={<Login />} />
        
        {/* Rutas Compartidas y Protegidas */}
        <Route element={<AdminLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          
          <Route path="/crear-usuarios" element={
            <ProtectedRoute allowedRoles={['Administrador']}>
              <CrearUsuarios />
            </ProtectedRoute>
          } />
          
          <Route path="/registrar-bienes" element={
            <ProtectedRoute allowedRoles={['Administrador']}>
              <RegistrarBienes />
            </ProtectedRoute>
          } />
          
          <Route path="/cargar-datos" element={
            <ProtectedRoute allowedRoles={['Administrador']}>
              <CargarDatos />
            </ProtectedRoute>
          } />
          
          <Route path="/consultar-bienes" element={
            <ProtectedRoute allowedRoles={['Docente']}>
              <ConsultarBienes />
            </ProtectedRoute>
          } />
        </Route>
      </Routes>
    </Router>
  );
}