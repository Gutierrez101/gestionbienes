import { useState } from 'react';
import * as XLSX from 'xlsx';

export default function CargarDatos() {
  const [bien, setBien] = useState({ codigo: '', descripcion: '', pcs: '', ubicacion: '', custodio: '' });

  const handleManualSubmit = (e) => {
    e.preventDefault();
    alert(`Bien ${bien.codigo} registrado y asignado al custodio ${bien.custodio}.`);
    setBien({ codigo: '', descripcion: '', pcs: '', ubicacion: '', custodio: '' });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(worksheet);
      // Asume que el JSON de Excel tiene una columna "Custodio"
      alert(`Se han importado exitosamente ${json.length} bienes mediante el archivo Excel.`);
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="view-card">
      <div className="hero-panel">
        <div className="hero-copy">
          <span className="eyebrow">Importación</span>
          <h2>Ingreso y Transferencia</h2>
          <p>Cargue y asigne bienes individual o masivamente. Asegúrese de indicar el custodio responsable.</p>
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
              <label>Descripción del Objeto</label>
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