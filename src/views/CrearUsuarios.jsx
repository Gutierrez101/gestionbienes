import { useState, useEffect } from 'react';

export default function CrearUsuarios() {
  const userRol = localStorage.getItem('rol');
  const token = localStorage.getItem('token');
  const [usuario, setUsuario] = useState({ cedula: '', nombre: '', email: '', password: '', rol: 'Docente' });
  const [usuarios, setUsuarios] = useState([]);
  const [editandoId, setEditandoId] = useState(null);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);

  useEffect(() => {
    if (userRol === 'Administrador') {
      cargarUsuarios();
    }
  }, [userRol]);

  const cargarUsuarios = async () => {
    if (!token) return;
    setLoadingUsuarios(true);
    try {
      const response = await fetch('http://localhost:8000/api/usuarios/', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${token}`,
        },
      });
      if (!response.ok) throw new Error('No se pudieron cargar los usuarios');
      const data = await response.json();
      setUsuarios(data);
    } catch (error) {
      console.error(error);
      alert('Error al cargar usuarios. Comprueba que el backend esté corriendo y el token sea válido.');
    } finally {
      setLoadingUsuarios(false);
    }
  };

  const limpiarFormulario = () => {
    setUsuario({ cedula: '', nombre: '', email: '', password: '', rol: 'Docente' });
    setEditandoId(null);
  };

  const handleCrear = async (e) => {
    e.preventDefault();
    if (!token) return alert('Debes iniciar sesión con un usuario Administrador.');

    const datosAEnviar = {
      username: usuario.cedula,
      cedula: usuario.cedula,
      first_name: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol === 'Docente' ? 'Docente' : 'Administrador',
    };

    if (usuario.password.trim() !== '') {
      datosAEnviar.password = usuario.password;
    }

    const url = editandoId
      ? `http://localhost:8000/api/usuarios/${editandoId}/`
      : 'http://localhost:8000/api/usuarios/';
    const method = editandoId ? 'PATCH' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify(datosAEnviar),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error API:', errorData);
        alert(`Error al ${editandoId ? 'editar' : 'crear'} usuario.`);
        return;
      }

      alert(`Usuario ${editandoId ? 'actualizado' : 'creado'} correctamente.`);
      limpiarFormulario();
      cargarUsuarios();
    } catch (error) {
      console.error(error);
      alert('Error de conexión con el backend.');
    }
  };

  const handleEditar = (item) => {
    setUsuario({
      cedula: item.cedula || item.username || '',
      nombre: item.first_name || '',
      email: item.email || '',
      password: '',
      rol: item.rol || 'Docente',
    });
    setEditandoId(item.id);
  };

  const handleEliminar = async (id) => {
    if (!token) return alert('Debes iniciar sesión con un usuario Administrador.');
    const confirmado = window.confirm('¿Eliminar este usuario? Esta acción no se puede deshacer.');
    if (!confirmado) return;

    try {
      const response = await fetch(`http://localhost:8000/api/usuarios/${id}/`, {
        method: 'DELETE',
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      if (!response.ok) throw new Error('No se pudo eliminar el usuario');
      alert('Usuario eliminado correctamente.');
      cargarUsuarios();
    } catch (error) {
      console.error(error);
      alert('No se pudo eliminar el usuario.');
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
            <label>{editandoId ? 'Contraseña (opcional)' : 'Contraseña'}</label>
            <input 
              type="password" 
              value={usuario.password} 
              onChange={(e) => setUsuario({...usuario, password: e.target.value})} 
              placeholder={editandoId ? 'Dejar en blanco para mantener la contraseña actual' : 'Asigne una contraseña'}
              required={!editandoId}
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
            {editandoId ? 'Actualizar Usuario' : 'Registrar Cuenta Segura'}
          </button>
          {editandoId && (
            <button
              type="button"
              className="btn-secondary"
              style={{ marginLeft: '10px' }}
              onClick={limpiarFormulario}
            >
              Cancelar edición
            </button>
          )}
        </form>
      </div>

      <div>
        <h3>Lista de usuarios</h3>
        {loadingUsuarios ? (
          <p>Cargando usuarios...</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Cédula</th>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((item) => (
                  <tr key={item.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                    <td>{item.id}</td>
                    <td>{item.cedula || item.username}</td>
                    <td>{item.first_name || '-'}</td>
                    <td>{item.email || '-'}</td>
                    <td>{item.rol || '-'}</td>
                    <td>
                      <button className="btn-small btn-edit" onClick={() => handleEditar(item)}>
                        Editar
                      </button>
                      <button
                        className="btn-small btn-delete"
                        onClick={() => handleEliminar(item.id)}
                        style={{ marginLeft: '8px' }}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}