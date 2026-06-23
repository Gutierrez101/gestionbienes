import { useState } from 'react';

export default function CrearUsuarios() {
  const userRol = localStorage.getItem('rol');
  const token = localStorage.getItem('token');
  const [usuario, setUsuario] = useState({ cedula: '', nombre: '', email: '', password: '', rol: 'Usuario' });

  if (userRol !== 'Administrador') {
    return (
      <div className="view-card" style={{ textAlign: 'center', marginTop: '40px', padding: '40px' }}>
        <div style={{ fontSize: '50px', marginBottom: '15px' }}>⚠️</div>
        <h2 style={{ color: 'var(--espe-red)', fontWeight: '700' }}>Acceso Denegado</h2>
        <p style={{ color: '#5f6f68', margin: '10px 0 25px' }}>
          No dispones de los permisos de Administrador requeridos para crear usuarios.
        </p>
      </div>
    );
  }

  const handleCrear = async (e) => {
    e.preventDefault();
    
    const datosAEnviar = {
      username: usuario.cedula,
      cedula: usuario.cedula,
      first_name: usuario.nombre,
      email: usuario.email,
      password: usuario.password,
      rol: usuario.rol === 'Docente' ? 'Docente' : 'Administrador'
    };
    try {
      const response = await fetch('http://localhost:8000/api/usuarios/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify(datosAEnviar)
      });

      if (response.ok) {
        alert(`Usuario ${usuario.nombre} creado correctamente en la Base de Datos.`);
        setUsuario({ cedula: '', nombre: '', email: '', password: '', rol: 'Usuario' });
      } else {
        const errorData = await response.json();
        console.error("Detalle del error:", errorData);
        alert('Error al crear usuario. Revisa que la Cédula no esté registrada ya.');
      }
    } catch (error) {
      console.error('Error de conexión:', error);
      alert('Error de red. Asegúrate de que el backend de Django esté encendido.');
    }
  };

  return (
    <div className="view-card">
      <div className="hero-panel">
        <div className="hero-copy">
          <span className="eyebrow">Gestión</span>
          <h2>Administración de Usuarios</h2>
          <p>Registre personal o estudiantes. Las credenciales se protegerán automáticamente mediante encriptación.</p>
        </div>
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <form onSubmit={handleCrear}>
          
          <div className="form-group">
            <label>Cédula de Identidad</label>
            <input 
              type="text" 
              value={usuario.cedula} 
              onChange={(e) => setUsuario({...usuario, cedula: e.target.value})} 
              placeholder="Ej: 17xxxxxx45"
              required 
            />
          </div>

          <div className="form-group">
            <label>Nombre Completo</label>
            <input 
              type="text" 
              value={usuario.nombre} 
              onChange={(e) => setUsuario({...usuario, nombre: e.target.value})} 
              placeholder="Ej: Juan Pérez"
              required 
            />
          </div>

          <div className="form-group">
            <label>Correo Electrónico</label>
            <input 
              type="email" 
              value={usuario.email} 
              onChange={(e) => setUsuario({...usuario, email: e.target.value})} 
              placeholder="ejemplo@espe.edu.ec"
              required 
            />
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <input 
              type="password" 
              value={usuario.password} 
              onChange={(e) => setUsuario({...usuario, password: e.target.value})} 
              placeholder="Asigne una contraseña"
              required 
            />
          </div>

          <div className="form-group">
            <label>Rol de Sistema</label>
            <select 
              value={usuario.rol} 
              onChange={(e) => setUsuario({...usuario, rol: e.target.value})}
              style={{
                width: '100%', padding: '12px', border: '1px solid var(--border)',
                borderRadius: '10px', outline: 'none', backgroundColor: '#fff', color: '#333'
              }}
            >
              <option value="Docente">Docente</option>
              <option value="Administrador">Administrador</option>
            </select>
          </div>

          <button type="submit" className="btn-primary" style={{ marginTop: '10px' }}>
            Registrar Cuenta Segura
          </button>
        </form>
      </div>
    </div>
  );
}