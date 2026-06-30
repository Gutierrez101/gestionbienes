import { useEffect, useState } from 'react';

export default function Dashboard() {
  const [rol, setRol] = useState('');
  const [totalBienes, setTotalBienes] = useState(0);

  useEffect(() => {
    const currentRol = localStorage.getItem('rol') || 'Usuario';
    setRol(currentRol);

    // Consulta a Django para saber cuántos bienes existen en total
    const token = localStorage.getItem('token');
    if (token) {
      fetch('http://localhost:8000/api/bienes/', {
        headers: { 'Authorization': `Token ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if(Array.isArray(data)) setTotalBienes(data.length);
      })
      .catch(err => console.error("Error cargando estadísticas:", err));
    }
  }, []);

  return (
    <div className="view-card">
      <div className="hero-panel">
        <div className="hero-copy">
          <span className="eyebrow">{rol === 'Administrador' ? 'Administración' : 'Portal'}</span>
          <h2>Panel de {rol}</h2>
          <p>
            {rol === 'Administrador' 
              ? 'Gestiona usuarios, realiza el ingreso de activos y mantén el control total del inventario.'
              : 'Bienvenido al sistema. Utiliza el menú lateral para consultar los bienes registrados.'}
          </p>
        </div>
        <div className="hero-stats">
          <div className="stat-card">
            <span>Bienes en Base de Datos</span>
            <strong>{totalBienes}</strong>
          </div>
          <div className="stat-card">
            <span>Estado del Servidor</span>
            <strong>En línea 🟢</strong>
          </div>
        </div>
      </div>

      <div className="table-shell">
        <div className="table-header">
          <div>
            <h3>Información del Sistema</h3>
            <p>Estado actual de tu sesión.</p>
          </div>
        </div>
        <div style={{ padding: '20px', color: '#5f6f68' }}>
          Has ingresado correctamente como <strong>{rol}</strong>. Selecciona una opción del menú de la izquierda para comenzar a trabajar.
        </div>

        <div className="framework-section">
          <div className="table-header">
            <div>
              <h3>Marcos de seguridad</h3>
              <p>Referencias operativas para control, detección y respuesta.</p>
            </div>
          </div>
          <div className="framework-grid">
            <div className="framework-card">
              <h4>MITRE ATT&CK</h4>
              <ul>
                <li>Mapeo de tácticas y técnicas de ataque.</li>
                <li>Soporte para priorizar detecciones y respuestas.</li>
                <li>Base para evaluar riesgos del inventario y usuarios.</li>
              </ul>
            </div>
            <div className="framework-card">
              <h4>NIST CSF 2.0</h4>
              <ul>
                <li>Govern, Identify, Protect, Detect, Respond y Recover.</li>
                <li>Orientación para fortalecer controles y continuidad.</li>
                <li>Alineación con buenas prácticas de gobierno digital.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}