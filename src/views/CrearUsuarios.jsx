import { useState } from 'react';

// Función nativa del navegador para hashear la contraseña
async function hashPassword(password) {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export default function CrearUsuarios() {
  const [usuario, setUsuario] = useState({ cedula: '', nombre: '', email: '', password: '', rol: 'Usuario' });

  const handleCrear = async (e) => {
    e.preventDefault();
    const passwordHasheada = await hashPassword(usuario.password);
    
    const datosAEnviar = {
      ...usuario,
      password: passwordHasheada
    };

    console.log("Datos encriptados a enviar a la BD:", datosAEnviar);
    alert(`Usuario ${usuario.nombre} creado correctamente.\n(Revisa la consola para ver el Hash)`);
    
    setUsuario({ cedula: '', nombre: '', email: '', password: '', rol: 'Usuario' });
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
              <option value="Usuario">Usuario / Estudiante</option>
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