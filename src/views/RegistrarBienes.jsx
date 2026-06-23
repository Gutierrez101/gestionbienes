import { useMemo, useState } from 'react';

const bienesIniciales = [
  { id: 1, codigo: 'SIL-001', serie: 'SR-2026-001', modelo: 'Ergo Pro', marca: 'OfficeLine', ubicacion: 'Sala 1', custodio: 'Carlos Viteri' },
  { id: 2, codigo: 'SIL-002', serie: 'SR-2026-002', modelo: 'Fold Basic', marca: 'OfficeLine', ubicacion: 'Sala 2', custodio: 'Ana Torres' },
  { id: 3, codigo: 'MES-010', serie: 'MT-2026-010', modelo: 'Work Mod', marca: 'Mobiliario ESPE', ubicacion: 'Sala 3', custodio: 'Luis Gomez' },
  { id: 4, codigo: 'TAB-005', serie: 'TB-2026-005', modelo: 'Lab Stool', marca: 'LabTec', ubicacion: 'Laboratorio 1', custodio: 'Marta Rios' },
];

export default function AdministrarBienes() {
  const [bienes, setBienes] = useState(bienesIniciales);
  const [busqueda, setBusqueda] = useState('');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  
  // ESTADO NUEVO: Controla qué bien se va a eliminar para mostrar el modal
  const [bienAEliminar, setBienAEliminar] = useState(null);
  
  const [formData, setFormData] = useState({
    codigo: '', serie: '', modelo: '', marca: '', ubicacion: '', custodio: ''
  });

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

  const handleGuardar = () => {
    if (!formData.codigo || !formData.serie || !formData.modelo || !formData.marca || !formData.ubicacion || !formData.custodio) {
      alert('Por favor completa todos los campos, incluyendo el custodio.');
      return;
    }

    if (editandoId) {
      setBienes(bienes.map(bien => bien.id === editandoId ? { ...bien, ...formData } : bien ));
      setEditandoId(null);
    } else {
      const nuevoId = Math.max(...bienes.map(b => b.id), 0) + 1;
      setBienes([...bienes, { id: nuevoId, ...formData }]);
    }
    setFormData({ codigo: '', serie: '', modelo: '', marca: '', ubicacion: '', custodio: '' });
    setMostrarFormulario(false);
  };

  const handleEditar = (bien) => {
    setFormData(bien); setEditandoId(bien.id); setMostrarFormulario(true);
  };

  // Función que ABRE el modal en lugar de usar confirm()
  const prepararEliminacion = (bien) => {
    setBienAEliminar(bien);
  };

  // Función que EJECUTA el borrado real y cierra el modal
  const confirmarEliminacion = () => {
    setBienes(bienes.filter(bien => bien.id !== bienAEliminar.id));
    setBienAEliminar(null); // Cierra el modal
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
        <button className="btn-primary" onClick={() => setMostrarFormulario(!mostrarFormulario)}>
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
            <button type="button" className="btn-primary" onClick={handleGuardar}>Guardar</button>
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
                    {/* Al dar clic aquí, abrimos el modal pasándole la info del bien */}
                    <button className="btn-small btn-delete" onClick={() => prepararEliminacion(bien)} title="Eliminar bien">
                      Borrar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {bienAEliminar && (
        <div className="modal-overlay">
          <div className="modal-card">
            
            {/* Ícono de Advertencia SVG */}
            <div className="modal-icon">
              <svg width="36" height="36" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            <h3>¿Eliminar registro?</h3>
            <p>Estás a punto de borrar el bien <strong>{bienAEliminar.codigo}</strong> asignado a <strong>{bienAEliminar.custodio}</strong>.<br/>Esta acción no se puede deshacer.</p>
            
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