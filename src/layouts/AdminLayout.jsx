import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const rol = localStorage.getItem('rol');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h3>Gestión Bienes</h3>
          <p style={{ margin: '5px 0 0', opacity: 0.9, fontSize: '0.85rem' }}>Rol: {rol}</p>
        </div>
        
        <ul className="sidebar-menu" style={{ marginTop: '20px' }}>
          <li>
            <NavLink to="/dashboard" end className={({ isActive }) => isActive ? 'sidebar-button is-active' : 'sidebar-button'}>
              Inicio (Panel)
            </NavLink>
          </li>
          
          {rol === 'Administrador' && (
            <>
              <li>
                <NavLink to="/crear-usuarios" className={({ isActive }) => isActive ? 'sidebar-button is-active' : 'sidebar-button'}>
                  Crear Usuarios
                </NavLink>
              </li>
              <li>
                <NavLink to="/registrar-bienes" className={({ isActive }) => isActive ? 'sidebar-button is-active' : 'sidebar-button'}>
                  Registrar Bienes
                </NavLink>
              </li>
              <li>
                <NavLink to="/cargar-datos" className={({ isActive }) => isActive ? 'sidebar-button is-active' : 'sidebar-button'}>
                  Cargar Datos
                </NavLink>
              </li>
            </>
          )}

          <li>
            <NavLink to="/consultar-bienes" className={({ isActive }) => isActive ? 'sidebar-button is-active' : 'sidebar-button'}>
              Consultar Bienes
            </NavLink>
          </li>
        </ul>

        <button className="btn-logout" onClick={handleLogout}>
          Cerrar Sesión
        </button>
      </aside>

      <main className="main-content">
        <div key={location.pathname} className="route-surface">
          <Outlet />
        </div>
      </main>
    </div>
  );
}