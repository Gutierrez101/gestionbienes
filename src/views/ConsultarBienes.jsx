import { useMemo, useState } from 'react';
import * as XLSX from 'xlsx';

const bienesDeEjemplo = [
  { id: 1, codigo: 'SIL-001', serie: 'SR-2026-001', modelo: 'Ergo Pro', marca: 'OfficeLine', ubicacion: 'Sala 1', custodio: 'Carlos Viteri' },
  { id: 2, codigo: 'SIL-002', serie: 'SR-2026-002', modelo: 'Fold Basic', marca: 'OfficeLine', ubicacion: 'Sala 2', custodio: 'Ana Torres' },
  { id: 3, codigo: 'MES-010', serie: 'MT-2026-010', modelo: 'Work Mod', marca: 'Mobiliario ESPE', ubicacion: 'Sala 3', custodio: 'Luis Gomez' },
  { id: 4, codigo: 'TAB-005', serie: 'TB-2026-005', modelo: 'Lab Stool', marca: 'LabTec', ubicacion: 'Laboratorio 1', custodio: 'Marta Rios' },
];

function descargarExcel(registros) {
  const datosFormateados = registros.map(item => ({
    'Código del bien': item.codigo,
    'Serie': item.serie,
    'Modelo': item.modelo,
    'Marca/Raza/Otros': item.marca,
    'Ubicación': item.ubicacion,
    'Custodio': item.custodio
  }));

  const worksheet = XLSX.utils.json_to_sheet(datosFormateados);

  worksheet['!cols'] = [
    { wch: 18 },
    { wch: 18 },
    { wch: 15 },
    { wch: 20 },
    { wch: 18 },
    { wch: 25 }
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Bienes Consultados");
  XLSX.writeFile(workbook, 'bienes_exportados.xlsx');
}

export default function ConsultarBienes() {
  const [codigo, setCodigo] = useState('');

  const resultados = useMemo(() => {
    const valor = codigo.trim().toLowerCase();
    if (!valor) return [];
    return bienesDeEjemplo.filter(bien => bien.codigo.toLowerCase().includes(valor));
  }, [codigo]);

  return (
    <div className="view-card">
      <div className="hero-panel hero-panel-secondary">
        <div className="hero-copy">
          <span className="eyebrow">Consulta rápida</span>
          <h2>Consultar Bienes</h2>
          <p>Busca por código y revisa la ficha esencial del bien en una pantalla sobria, clara y fácil de escanear.</p>
        </div>
        <div className="hero-stats">
          <div className="stat-card">
            <span>Modo</span>
            <strong>Consulta</strong>
          </div>
          <div className="stat-card">
            <span>Exportación</span>
            {/* Actualizamos la etiqueta de CSV a Excel */}
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
            // Llamamos a la nueva función de Excel
            onClick={() => descargarExcel(resultados)}
          >
            Exportar resultados
          </button>
        </div>
      </div>

      {codigo.trim() === '' ? (
        <p className="empty-state">Ingresa un código para ver resultados.</p>
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
                  <th>Marca/Raza/Otros</th>
                  <th>Ubicación</th>
                  <th>Custodio</th>
                </tr>
              </thead>
              <tbody>
                {resultados.map((bien) => (
                  <tr key={bien.codigo}>
                    <td>{bien.codigo}</td>
                    <td>{bien.serie}</td>
                    <td>{bien.modelo}</td>
                    <td>{bien.marca}</td>
                    <td>{bien.ubicacion}</td>
                    <td>{bien.custodio}</td>
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