import { useMemo, useState, useEffect } from 'react';

export default function AdministrarBienes() {
  const [bienes, setBienes] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [bienAEliminar, setBienAEliminar] = useState(null);
  
  const [formData, setFormData] = useState({
    codigo: '', serie: '', modelo: '', marca: '', ubicacion: '', custodio: ''
  });

  const token = localStorage.getItem('token');
  const userRol=localStorage.getItem('rol');

  if(userRol!=='Administrador')
  {
    return (
      <div className="view-card" style={{ textAlign: 'center', marginTop: '40px', padding: '40px' }}>
        <div style={{ fontSize: '50px', marginBottom: '15px' }}>🔒</div>
        <h2 style={{ color: 'var(--espe-red)', fontWeight: '700' }}>Acceso Restringido</h2>
        <p style={{ color: '#5f6f68', margin: '10px 0 25px' }}>
          Su cuenta tiene rol de <strong>Docente</strong>. Solo los Administradores pueden registrar o editar bienes.
        </p>
      </div>
    );
  }

  const fetchBienes = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/bienes/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setBienes(data);
      }
    } catch (error) {
      console.error('Error al conectar con Django:', error);
    }
  };

  useEffect(() => {
    if (token) {
      fetchBienes();
    }
  }, [token]);

  const bienesFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    if (!texto) return bienes;
    return bienes.filter(bien =>
      bien.codigo.toLowerCase().includes(texto) ||
      bien.serie.toLowerCase().includes(texto) ||
      bien.modelo.toLowerCase().includes(texto) ||
      bien.marca.toLowerCase().includes(texto) ||
      bien.ubicacion.toLowerCase().includes(texto) ||
      bien.custodio.toLowerCase().includes(texto)
    );
  }, [busqueda, bienes]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGuardar = async () => {
    if (!formData.codigo || !formData.serie || !formData.modelo || !formData.marca || !formData.ubicacion || !formData.custodio) {
      alert('Por favor completa todos los campos, incluyendo el custodio.');
      return;
    }

    try {
      const url = editandoId 
        ? `http://localhost:8000/api/bienes/${editandoId}/` 
        : 'http://localhost:8000/api/bienes/';
      const method = editandoId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        fetchBienes();
        setEditandoId(null);
        setFormData({ codigo: '', serie: '', modelo: '', marca: '', ubicacion: '', custodio: '' });
        setMostrarFormulario(false);
      } else {
        alert('Error al guardar. Verifica que el Código no esté duplicado.');
      }
    } catch (error) {
      console.error('Error al guardar:', error);
    }
  };

  const handleEditar = (bien) => {
    setFormData(bien); 
    setEditandoId(bien.id);
    setMostrarFormulario(true);
  };

  const prepararEliminacion = (bien) => {
    setBienAEliminar(bien);
  };

  const confirmarEliminacion = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/bienes/${bienAEliminar.id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Token ${token}`
        }
      });

      if (response.ok) {
        fetchBienes();
        setBienAEliminar(null);
      } else {
        alert('Error al eliminar el registro.');
      }
    } catch (error) {
      console.error('Error al eliminar:', error);
    }
  };

  return (
    <div className="view-card">
      <div className="hero-panel">
        <div className="hero-copy">
          <span className="eyebrow">Inventario</span>
          <h2>Administrar Bienes</h2>
          <p>Vista integral para revisar activos y responsables (Custodios).</p>
        </div>
      </div>

      <div className="control-panel">
        <div className="search-bar search-bar-compact">
          <label>Buscar por código, ubicación o custodio</label>
          <input type="text" value={busqueda} placeholder="Ej: SIL-001, Carlos Viteri" onChange={(e) => setBusqueda(e.target.value)} />
        </div>
        <button className="btn-primary" onClick={() => {
          setMostrarFormulario(!mostrarFormulario);
          if (mostrarFormulario) {
            setEditandoId(null);
            setFormData({ codigo: '', serie: '', modelo: '', marca: '', ubicacion: '', custodio: '' });
          }
        }}>
          {mostrarFormulario ? 'Cancelar' : '+ Registrar nuevo bien'}
        </button>
      </div>

      {mostrarFormulario && (
        <div className="form-shell" style={{ marginBottom: '30px', padding: '20px', background: '#f8fbf9', borderRadius: '15px' }}>
          <h3>{editandoId ? 'Editar bien' : 'Registrar nuevo bien'}</h3>
          <form>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div className="form-group"><label>Código *</label><input type="text" name="codigo" value={formData.codigo} onChange={handleInputChange} /></div>
              <div className="form-group"><label>Serie *</label><input type="text" name="serie" value={formData.serie} onChange={handleInputChange} /></div>
              <div className="form-group"><label>Modelo *</label><input type="text" name="modelo" value={formData.modelo} onChange={handleInputChange} /></div>
              <div className="form-group"><label>Marca *</label><input type="text" name="marca" value={formData.marca} onChange={handleInputChange} /></div>
              <div className="form-group"><label>Ubicación *</label><input type="text" name="ubicacion" value={formData.ubicacion} onChange={handleInputChange} /></div>
              <div className="form-group"><label>Custodio Asignado *</label><input type="text" name="custodio" value={formData.custodio} onChange={handleInputChange} placeholder="Nombre de la persona responsable"/></div>
            </div>
            <button type="button" className="btn-primary" onClick={handleGuardar}>Guardar en BD</button>
          </form>
        </div>
      )}

      <div className="table-shell">
        <div className="table-header">
          <div><h3>Listado de bienes</h3><p>Activos y sus custodios actuales.</p></div>
        </div>
        <div className="table-responsive">
          <table className="bienes-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Serie</th>
                <th>Modelo</th>
                <th>Ubicación</th>
                <th>Custodio</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {bienesFiltrados.map((bien) => (
                <tr key={bien.id}>
                  <td>{bien.codigo}</td>
                  <td>{bien.serie}</td>
                  <td>{bien.modelo}</td>
                  <td>{bien.ubicacion}</td>
                  <td><strong>{bien.custodio}</strong></td>
                  <td className="actions-cell">
                    <button className="btn-small btn-edit" onClick={() => handleEditar(bien)} title="Editar bien">
                      Editar
                    </button>
                    <button className="btn-small btn-delete" onClick={() => prepararEliminacion(bien)} title="Eliminar bien">
                      Borrar
                    </button>
                  </td>
                </tr>
              ))}
              {bienesFiltrados.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: '#666' }}>No se encontraron bienes registrados.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {bienAEliminar && (
        <div className="modal-overlay">
          <div className="modal-card">
            
            <div className="modal-icon">
              <svg width="36" height="36" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            <h3>¿Eliminar registro?</h3>
            <p>Estás a punto de borrar el bien <strong>{bienAEliminar.codigo}</strong> asignado a <strong>{bienAEliminar.custodio}</strong> de la base de datos.<br/>Esta acción no se puede deshacer.</p>
            
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setBienAEliminar(null)}>
                Cancelar
              </button>
              <button className="btn-confirm-delete" onClick={confirmarEliminacion}>
                Sí, eliminar
              </button>
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
}