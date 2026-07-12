import { useEffect, useState } from 'react';

export default function Blockchain() {
  const [entries, setEntries] = useState([]);
  const [status, setStatus] = useState('Cargando cadena de auditoría...');
  const [validChain, setValidChain] = useState(true);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  const mitreMetadata = {
    T1110: {
      tactic: 'Credential Access',
      technique: 'Brute Force / Credential Access',
      description: 'Intentos de acceder con credenciales válidas, contraseñas débiles o robadas.',
      examples: ['Password brute force', 'Credential stuffing', 'Weak passwords'],
      mitigationId: 'M1050',
      mitigation: 'Implementar protección contra explotación, WAF, validación de entradas, autenticación fuerte y parches periódicos.',
    },
    T1082: {
      tactic: 'Discovery',
      technique: 'System Information Discovery',
      description: 'Técnica de reconocimiento. El actor busca información sobre el sistema para identificar debilidades y preparar ataques posteriores. No es una vulnerabilidad, sino una forma de encontrar datos útiles.',
      examples: ['Consultas a endpoints', 'Lectura de configuración', 'Revisión de versiones de software'],
      mitigationId: 'M1040',
      mitigation: 'Restringir información expuesta, aplicar controles de acceso, y monitorear consultas inusuales.',
      note: 'T1082 es una técnica MITRE ATT&CK de descubrimiento, no una vulnerabilidad específica.',
    },
    T1136: {
      tactic: 'Persistence',
      technique: 'Create Account',
      description: 'Creación o modificación de cuentas para mantener acceso persistente al sistema.',
      examples: ['Añadir usuario administrativo', 'Crear cuentas de servicio'],
      mitigationId: 'M1027',
      mitigation: 'Controlar la creación de cuentas, auditar cambios de permisos y eliminar cuentas no autorizadas rápidamente.',
    },
    T1562: {
      tactic: 'Defense Evasion',
      technique: 'Impair Defenses',
      description: 'Modificar o deshabilitar mecanismos de detección y protección para evitar ser identificado.',
      examples: ['Deshabilitar registros', 'Alterar configuraciones de seguridad'],
      mitigationId: 'M1042',
      mitigation: 'Asegurar y monitorear las defensas; aplicar políticas de integridad de archivos y alertas de cambio.',
    },
    T1485: {
      tactic: 'Impact',
      technique: 'Data Destruction',
      description: 'Eliminar o corromper datos para causar perjuicio al objetivo.',
      examples: ['Borrar registros', 'Sobrescribir archivos', 'Destruir bases de datos'],
      mitigationId: 'M1036',
      mitigation: 'Mantener copias de seguridad, controles de acceso estrictos y detección de actividades destructivas.',
    },
  };

  const getMitreInfo = (entry) => {
    return mitreMetadata[entry.mitre_technique] || {
      tactic: entry.mitre_tactic || 'N/A',
      technique: entry.mitre_technique || 'N/A',
      description: 'No hay descripción disponible para este código MITRE.',
      examples: [],
      mitigationId: 'N/A',
      mitigation: 'No hay mitigación definida.',
    };
  };

  useEffect(() => {
    const fetchChain = async () => {
      setLoading(true);
      setStatus('Recuperando registros de auditoría...');

      try {
        if (!token) {
          throw new Error('No se encontró token de autenticación. Inicia sesión primero.');
        }

        const response = await fetch('http://localhost:8000/api/auditoria-chain/', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Token ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Error al obtener la cadena de auditoría');
        }

        const data = await response.json();
        const auditEntries = Array.isArray(data) ? data : data.entries || [];
        setEntries(auditEntries);
        setValidChain(auditEntries.length > 0);
        setStatus(auditEntries.length > 0 ? 'Cadena de auditoría cargada.' : 'No hay registros de auditoría.');
      } catch (error) {
        setStatus(error.message || 'Error al cargar la cadena de auditoría.');
      } finally {
        setLoading(false);
      }
    };

    fetchChain();
  }, [token]);

  return (
    <div className="view-card">
      <div className="hero-panel">
        <div className="hero-copy">
          <span className="eyebrow">Auditoría Blockchain</span>
          <h2>Cadena de auditoría inmutable</h2>
          <p>Verifica que los registros de auditoría estén encadenados y no hayan sido modificados.</p>
        </div>
        <div className="hero-stats">
          <div className="stat-card">
            <span>Integridad</span>
            <strong>{validChain ? 'Válida' : 'Inconsistente'}</strong>
          </div>
          <div className="stat-card">
            <span>Registros</span>
            <strong>{entries.length}</strong>
          </div>
        </div>
      </div>

      <div className="table-shell" style={{ padding: '20px' }}>
        <div className="table-header">
          <div>
            <h3>Cadena de auditoría</h3>
            <p>Cada entrada incluye un hash, referencia anterior y datos MITRE ATT&CK.</p>
          </div>
        </div>

        <div style={{ display: 'grid', gap: '16px', marginBottom: '16px' }}>
          <div style={{ color: validChain ? '#1f8a70' : '#b91c1c' }}>
            {loading ? 'Cargando...' : status}
          </div>
          <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '16px' }}>
            <strong>MITRE ATT&CK mappings</strong>
            <ul style={{ margin: '12px 0 0 20px', padding: 0, listStyleType: 'disc', color: '#334155' }}>
              <li><strong>Credential Access / T1110</strong> — intentos de inicio de sesión</li>
              <li><strong>Persistence / T1136</strong> — creación de usuarios</li>
              <li><strong>Discovery / T1082</strong> — consultas/lectura de datos</li>
              <li><strong>Defense Evasion / T1562</strong> — actualizaciones de recursos</li>
              <li><strong>Impact / T1485</strong> — eliminación de datos</li>
            </ul>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Usuario</th>
                <th>Acción</th>
                <th>Tabla</th>
                <th>MITRE Táctica</th>
                <th>MITRE Técnica</th>
                <th>Timestamp</th>
                <th>Hash</th>
                <th>Previous Hash</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                  <td>{entry.id}</td>
                  <td>{entry.usuario}</td>
                  <td>{entry.accion}</td>
                  <td>{entry.tabla}</td>
                  <td>{entry.mitre_tactic || '—'}</td>
                  <td>{entry.mitre_technique || '—'}</td>
                  <td>{new Date(entry.timestamp).toLocaleString()}</td>
                  <td style={{ wordBreak: 'break-word' }}>{entry.hash}</td>
                  <td style={{ wordBreak: 'break-word' }}>{entry.previous_hash}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ marginTop: '24px', padding: '20px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '10px' }}>
        <h3>Resumen MITRE ATT&CK</h3>
        <p style={{ marginBottom: '16px', color: '#475569' }}>
          Esta vista muestra cómo el sistema clasifica eventos de auditoría según técnicas MITRE. Cuando veas <strong>T1082</strong>, recuerda que se trata de un patrón de descubrimiento de información, no de una vulnerabilidad.
        </p>
        {entries.length > 0 ? (
          entries.slice(0, 1).map((entry) => {
            const mitreInfo = getMitreInfo(entry);
            return (
              <div key={entry.id}>
                <p><strong>Táctica:</strong> {mitreInfo.tactic}</p>
                <p><strong>Técnica:</strong> {mitreInfo.technique} ({entry.mitre_technique || 'N/A'})</p>
                <p><strong>Descripción:</strong> {mitreInfo.description}</p>
                {mitreInfo.note && <p><strong>Nota:</strong> {mitreInfo.note}</p>}
                <p><strong>Mitigación recomendada:</strong> {mitreInfo.mitigation}</p>
                <p><strong>ID de mitigación:</strong> {mitreInfo.mitigationId}</p>
                {mitreInfo.examples.length > 0 && (
                  <div>
                    <strong>Ejemplos:</strong>
                    <ul style={{ marginTop: '8px', paddingLeft: '20px', color: '#334155' }}>
                      {mitreInfo.examples.map((example, index) => (
                        <li key={index}>{example}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <p>No hay registros MITRE para mostrar.</p>
        )}
      </div>
    </div>
  );
}
