import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const rol = localStorage.getItem('rol');

  const handleLogout = () => {
    localStorage.removeItem('rol');
    navigate('/');
  };

  return (
    <div className="dashboard-layout">
      {/* Menú Lateral */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h3>Gestión Lab</h3>
          <small>{rol}</small>
        </div>
        
        <ul className="sidebar-menu">
          <li>
            <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'sidebar-button is-active' : 'sidebar-button'}>
              Inicio
            </NavLink>
          </li>
          
          {/* Vistas para Administrador */}
          {rol === 'Administrador' && (
            <>
              <li><NavLink to="/crear-usuarios" className={({ isActive }) => isActive ? 'sidebar-button is-active' : 'sidebar-button'}>Crear Usuarios</NavLink></li>
              <li><NavLink to="/registrar-bienes" className={({ isActive }) => isActive ? 'sidebar-button is-active' : 'sidebar-button'}>Registrar Bienes</NavLink></li>
              <li><NavLink to="/cargar-datos" className={({ isActive }) => isActive ? 'sidebar-button is-active' : 'sidebar-button'}>Cargar Datos</NavLink></li>
            </>
          )}

          {/* Vistas para Estudiantes/Usuarios */}
          {(rol === 'Docente' || rol === 'Usuario') && (
            <li>
              <NavLink to="/consultar-bienes" className={({ isActive }) => isActive ? 'sidebar-button is-active' : 'sidebar-button'}>
                Consultar Bienes
              </NavLink>
            </li>
          )}
        </ul>

        <button className="btn-logout" onClick={handleLogout}>
          Cerrar Sesión
        </button>
      </aside>

      {/* Área de Contenido Dinámico */}
      <main className="main-content">
        <div key={location.pathname} className="route-surface">
          <Outlet />
        </div>
      </main>
    </div>
  );
}