// src/views/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [mfaRequired, setMfaRequired] = useState(false);
  const [qrUrl, setQrUrl] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const bodyPayload = { username: usuario, password: password };
      if (mfaRequired) {
        bodyPayload.totp_code = totpCode;
      }

      const response = await fetch('http://localhost:8000/api/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload)
      });

      const data = await response.json();

      if (response.ok) {
        if (data.mfa_required) {
          // El backend dice que credenciales son correctas, ahora toca MFA
          setMfaRequired(true);
          // Usamos una API pública de gráficos para renderizar la URI en un QR visible en pantalla
          setQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(data.provisioning_url)}`);
        } else {
          // Inicio de sesión completo exitoso
          localStorage.setItem('token', data.token);
          localStorage.setItem('rol', data.rol);
          localStorage.setItem('username', data.username);
          navigate('/dashboard'); 
        }
      } else {
        setError(data.error || 'Usuario o contraseña incorrectos');
      }
    } catch (error) {
      console.error('Error al conectar:', error);
      setError('Error de conexión con el servidor.');
    }
  };

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleLogin}>
        <h2>Iniciar Sesión</h2>
        
        {!mfaRequired ? (
          <>
            <div className="form-group">
              <label>Usuario</label>
              <input 
                type="text" 
                value={usuario} 
                onChange={(e) => setUsuario(e.target.value)} 
                placeholder="Ingrese usuario"
                required
              />
            </div>
            <div className="form-group">
              <label>Contraseña</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="Ingrese contraseña"
                required
              />
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', margin: '20px 0' }}>
            <p style={{ fontSize: '14px', color: '#555' }}>Escanea este QR con Google Authenticator e ingresa el código:</p>
            {qrUrl && <img src={qrUrl} alt="MFA QR Code" style={{ margin: '15px 0', border: '1px solid #ccc', padding: '5px' }} />}
            
            <div className="form-group" style={{ textAlign: 'left' }}>
              <label>Código de Seguridad (6 dígitos)</label>
              <input 
                type="text" 
                maxLength="6"
                value={totpCode} 
                onChange={(e) => setTotpCode(e.target.value)} 
                placeholder="000000"
                style={{ letterSpacing: '4px', textAlign: 'center', fontSize: '18px' }}
                required
              />
            </div>
          </div>
        )}

        {error && <div className="error-msg" style={{color: 'red', marginBottom: '15px', fontSize: '14px'}}>{error}</div>}
        <button type="submit" className="btn-primary">
          {mfaRequired ? 'Verificar Token' : 'Ingresar'}
        </button>
      </form>
    </div>
  );
}