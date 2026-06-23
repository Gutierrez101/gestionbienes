// src/views/Dashboard.jsx
import { useEffect, useState } from 'react';

export default function Dashboard() {
  const [rol, setRol] = useState('');

  useEffect(() => {
    setRol(localStorage.getItem('rol') || 'Docente');
  }, []);

  return (
    <div className="view-card">
      <div className="hero-panel">
        <div className="hero-copy">
          <span className="eyebrow">{rol === 'Administrador' ? 'Administración' : 'Portal'}</span>
          <h2>Panel del {rol}</h2>
          <p>{rol === 'Administrador' 
            ? 'Gestiona todos los bienes, visualiza movimientos en laboratorios y mantén el control de tu inventario.'
            : 'Revisa los bienes asignados a tu cuenta y su estado actual de disponibilidad.'}</p>
        </div>
        <div className="hero-stats">
          <div className="stat-card">
            <span>{rol === 'Administrador' ? 'Bienes Registrados' : 'Bienes Asignados'}</span>
            <strong>{rol === 'Administrador' ? '10' : '4'}</strong>
          </div>
          <div className="stat-card">
            <span>Total Unidades (PCS)</span>
            <strong>{rol === 'Administrador' ? '45' : '4'}</strong>
          </div>
        </div>
      </div>

      <div className="table-shell">
        <div className="table-header">
          <div>
            <h3>{rol === 'Administrador' ? 'Últimos Movimientos en Laboratorios' : 'Mis Bienes Asignados'}</h3>
            <p>{rol === 'Administrador' 
              ? 'Historial reciente de movimientos y cambios en ubicación.'
              : 'Relación completa de bienes bajo tu responsabilidad.'}</p>
          </div>
          <span className="table-badge">{rol === 'Administrador' ? '3 movimientos' : '3 bienes'}</span>
        </div>
        <div className="table-responsive">
          <table className="bienes-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Descripción</th>
                <th>Ubicación</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>SIL-001</strong></td>
                <td>Silla ergonómica office</td>
                <td>Sala 1</td>
                <td className="status-active">Disponible</td>
              </tr>
              <tr>
                <td><strong>MES-010</strong></td>
                <td>Mesa de trabajo modular</td>
                <td>Sala 3</td>
                <td className="status-active">Disponible</td>
              </tr>
              <tr>
                <td><strong>TAB-005</strong></td>
                <td>Taburete laboratorio</td>
                <td>Laboratorio 1</td>
                <td className="status-active">Disponible</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}