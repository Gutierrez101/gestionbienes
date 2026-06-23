import { useState } from 'react';
import * as XLSX from 'xlsx';

export default function CargarDatos() {
  const [bien, setBien] = useState({ codigo: '', descripcion: '', pcs: '', ubicacion: '', custodio: '' });
  const token = localStorage.getItem('token');
  const userRol = localStorage.getItem('rol');

  if (userRol !== 'Administrador') {
    return (
      <div className="view-card" style={{ textAlign: 'center', marginTop: '40px', padding: '40px' }}>
        <div style={{ fontSize: '50px', marginBottom: '15px' }}>⚠️</div>
        <h2 style={{ color: 'var(--espe-red)', fontWeight: '700' }}>Acceso Denegado</h2>
      </div>
    );
  }

  const handleManualSubmit = async (e) => {
    e.preventDefault();

    const datosDjango = {
      codigo: bien.codigo,
      serie: 'S/N',
      modelo: bien.descripcion,
      marca: 'Genérico',
      ubicacion: bien.ubicacion,
      custodio: bien.custodio
    };

    try {
      const response = await fetch('http://localhost:8000/api/bienes/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify(datosDjango)
      });

      if (response.ok) {
        alert(`Bien ${bien.codigo} registrado en la BD y asignado a ${bien.custodio}.`);
        setBien({ codigo: '', descripcion: '', pcs: '', ubicacion: '', custodio: '' });
      } else {
        alert('Error al registrar. Verifica que el código no exista ya.');
      }
    } catch (error) {
      console.error(error);
      alert('Error de red al conectar con Django.');
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    
    reader.onload = async (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(worksheet);

      let exitosos = 0;

      for (const fila of json) {
        const datosDjango = {
          codigo: fila['Código'] || fila['codigo'] || `EXC-${Math.floor(Math.random()*10000)}`,
          serie: fila['Serie'] || fila['serie'] || 'S/N',
          modelo: fila['Modelo'] || fila['modelo'] || fila['Descripción'] || 'Desconocido',
          marca: fila['Marca'] || fila['marca'] || 'Desconocida',
          ubicacion: fila['Ubicación'] || fila['ubicacion'] || 'Bodega Principal',
          custodio: fila['Custodio'] || fila['custodio'] || 'Sin Asignar'
        };

        try {
          const res = await fetch('http://localhost:8000/api/bienes/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Token ${token}`
            },
            body: JSON.stringify(datosDjango)
          });
          if (res.ok) exitosos++;
        } catch(err) {
          console.error('Error guardando fila del excel:', err);
        }
      }

      alert(`Se han importado exitosamente ${exitosos} de ${json.length} bienes a la Base de Datos.`);
      e.target.value = null;
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="view-card">
      <div className="hero-panel">
        <div className="hero-copy">
          <span className="eyebrow">Importación</span>
          <h2>Ingreso y Transferencia</h2>
          <p>Cargue y asigne bienes individual o masivamente hacia la Base de Datos. Asegúrese de indicar el custodio responsable.</p>
        </div>
      </div>

      <div className="form-sections" style={{ gridTemplateColumns: '1fr 1fr', display: 'grid', gap: '25px' }}>
        
        {/* Carga Individual */}
        <div className="form-card">
          <div className="form-header">
            <h3>Carga Individual</h3>
          </div>
          
          <form onSubmit={handleManualSubmit}>
            <div className="form-group">
              <label>Código Único</label>
              <input type="text" value={bien.codigo} onChange={(e) => setBien({...bien, codigo: e.target.value})} required />
            </div>
            
            <div className="form-group">
              <label>Descripción del Objeto (Modelo)</label>
              <input type="text" value={bien.descripcion} onChange={(e) => setBien({...bien, descripcion: e.target.value})} required />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div className="form-group">
                <label>Cantidad (PCS)</label>
                <input type="number" value={bien.pcs} onChange={(e) => setBien({...bien, pcs: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Ubicación</label>
                <input type="text" value={bien.ubicacion} onChange={(e) => setBien({...bien, ubicacion: e.target.value})} required />
              </div>
            </div>

            <div className="form-group">
              <label>Custodio (Responsable)</label>
              <input type="text" placeholder="Nombre del docente/estudiante" value={bien.custodio} onChange={(e) => setBien({...bien, custodio: e.target.value})} required />
            </div>

            <button type="submit" className="btn-primary" style={{ marginTop: '5px' }}>
              Registrar y Asignar Bien
            </button>
          </form>
        </div>

        {/* Carga Masiva */}
        <div className="form-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="form-header">
            <h3>Carga Masiva de Registros</h3>
            <p>El archivo debe ser formato (.xlsx o .xls).</p>
          </div>

          <div style={{ flex: 1, border: '2px dashed var(--border)', borderRadius: '15px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '30px', background: 'var(--bg-light)', textAlign: 'center' }}>
            <div style={{ fontSize: '45px', marginBottom: '15px' }}>📄</div>
            <label htmlFor="excel-upload" className="btn-primary" style={{ cursor: 'pointer', display: 'inline-block' }}>
              Seleccionar Archivo Excel
            </label>
            <input id="excel-upload" type="file" accept=".xlsx, .xls" onChange={handleFileUpload} style={{ display: 'none' }} />
          </div>
        </div>
      </div>
    </div>
  );
}