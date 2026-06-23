import { useState, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';

export default function ConsultarBienes() {
  const [bienesBD, setBienesBD] = useState([]);
  const [codigo, setCodigo] = useState('');
  const token = localStorage.getItem('token');

  // 1. CARGAR DATOS DE DJANGO
  useEffect(() => {
    if (token) {
      fetch('http://localhost:8000/api/bienes/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        }
      })
      .then(res => res.json())
      .then(data => {
        if(Array.isArray(data)) setBienesBD(data);
      })
      .catch(err => console.error('Error al consultar bienes:', err));
    }
  }, [token]);

  // 2. FILTRAR POR CÓDIGO (Como tenías originalmente)
  const resultados = useMemo(() => {
    const valor = codigo.trim().toLowerCase();
    if (!valor) return []; // Si está vacío, no muestra resultados
    return bienesBD.filter(bien => bien.codigo.toLowerCase().includes(valor));
  }, [codigo, bienesBD]);

  // 3. EXPORTAR A EXCEL
  const descargarExcel = (registros) => {
    const datosFormateados = registros.map(item => ({
      'Código': item.codigo,
      'Serie': item.serie,
      'Modelo': item.modelo,
      'Marca': item.marca,
      'Ubicación': item.ubicacion,
      'Custodio': item.custodio
    }));

    const worksheet = XLSX.utils.json_to_sheet(datosFormateados);
    worksheet['!cols'] = [{ wch: 18 }, { wch: 18 }, { wch: 15 }, { wch: 20 }, { wch: 18 }, { wch: 25 }];
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Consulta");
    XLSX.writeFile(workbook, 'Reporte_Bien.xlsx');
  };

  return (
    <div className="view-card">
      <div className="hero-panel hero-panel-secondary">
        <div className="hero-copy">
          <span className="eyebrow">Consulta rápida</span>
          <h2>Consultar Bienes</h2>
          <p>Busca por código y revisa la ficha del bien en la base de datos oficial.</p>
        </div>
        <div className="hero-stats">
          <div className="stat-card">
            <span>Modo</span>
            <strong>Solo Lectura</strong>
          </div>
          <div className="stat-card">
            <span>Exportación</span>
            <strong>Excel</strong>
          </div>
        </div>
      </div>

      <div className="control-panel consult-control-panel">
        <div className="search-bar search-bar-compact">
          <label htmlFor="codigo-busqueda">Código del bien</label>
          <input
            id="codigo-busqueda"
            type="text"
            value={codigo}
            placeholder="Ej: SIL-001"
            onChange={(e) => setCodigo(e.target.value)}
          />
        </div>

        <div className="actions-row consult-actions-row">
          <button
            className="btn-primary"
            disabled={resultados.length === 0}
            onClick={() => descargarExcel(resultados)}
          >
            Exportar resultados
          </button>
        </div>
      </div>

      {codigo.trim() === '' ? (
        <p className="empty-state">Ingresa un código para ver resultados de la base de datos.</p>
      ) : resultados.length === 0 ? (
        <p className="empty-state">No se encontraron bienes con ese código.</p>
      ) : (
        <div className="table-shell">
          <div className="table-header">
            <div>
              <h3>Resultado de búsqueda</h3>
              <p>Información disponible del bien consultado.</p>
            </div>
            <span className="table-badge">{resultados.length} ficha encontrada</span>
          </div>
          <div className="table-responsive">
            <table className="bienes-table">
              <thead>
                <tr>
                  <th>Código del bien</th>
                  <th>Serie</th>
                  <th>Modelo</th>
                  <th>Marca/Raza</th>
                  <th>Ubicación</th>
                  <th>Custodio</th>
                </tr>
              </thead>
              <tbody>
                {resultados.map((bien) => (
                  <tr key={bien.id}>
                    <td>{bien.codigo}</td>
                    <td>{bien.serie}</td>
                    <td>{bien.modelo}</td>
                    <td>{bien.marca}</td>
                    <td>{bien.ubicacion}</td>
                    <td><strong>{bien.custodio}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}