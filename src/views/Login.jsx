import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

export default function Login() {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [error, setError] = useState('');
  const [paso, setPaso] = useState(1); 
  
  const navigate = useNavigate();

  const handleSiguiente = (e) => {
    e.preventDefault();
    if (!usuario || !password) {
      setError('Por favor, ingresa tu usuario y contraseña.');
      return;
    }
    setError('');
    setPaso(2);
  };

  const handleLoginFinal = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await fetch('http://localhost:8000/api/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: usuario, 
          password: password,
          totp_code: mfaCode
        })
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token || data.key);
        localStorage.setItem('rol', data.rol);
        localStorage.setItem('username', data.username);
        navigate('/dashboard'); 
      } else {
        setError('Código de Google Authenticator incorrecto o credenciales inválidas.');
      }
    } catch (error) {
      console.error('Error al conectar:', error);
      setError('Error de conexión con el servidor.');
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    const tokenGoogle = credentialResponse.credential;
    setError('');

    try {
      const response = await fetch('http://localhost:8000/api/auth/google/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access_token: tokenGoogle, id_token: tokenGoogle }) 
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.key || data.token); 
        localStorage.setItem('rol', data.rol || 'Docente');
        localStorage.setItem('username', data.username || 'Usuario Google');
        navigate('/dashboard');
      } else {
        setError("El servidor rechazó el token de Google.");
      }
    } catch (error) {
      console.error("Error de red:", error);
      setError("Error de red al conectar con Google.");
    }
  };

  return (
    <GoogleOAuthProvider clientId="555530755257-de1mli1el3o20k05ni2l4g7kniq99lbj.apps.googleusercontent.com">
      <div className="login-page">
        
        {paso === 1 && (
          <form className="login-card" onSubmit={handleSiguiente}>
            <h2>Iniciar Sesión</h2>
            
            <div className="form-group">
              <label>Usuario (Cédula)</label>
              <input 
                type="text" 
                value={usuario} 
                onChange={(e) => setUsuario(e.target.value)} 
                placeholder="Ingrese su cédula"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Contraseña</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="Ingrese su contraseña"
                required
              />
            </div>

            {error && <div style={{color: 'red', marginBottom: '15px', fontSize: '14px', textAlign: 'center'}}>{error}</div>}
            
            <button type="submit" className="btn-primary">Siguiente</button>

            <div style={{ textAlign: 'center', marginTop: '25px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
              <p style={{ color: '#5f6f68', fontSize: '14px', marginBottom: '15px' }}>O ingresa con tu correo institucional:</p>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <GoogleLogin 
                  onSuccess={handleGoogleSuccess} 
                  onError={() => setError('Error al iniciar con Google.')} 
                  useOneTap={false}
                  shape="rectangular"
                  theme="outline"
                />
              </div>
            </div>
          </form>
        )}

        {paso === 2 && (
          <form className="login-card" onSubmit={handleLoginFinal}>
            <h2>Verificación de 2 Pasos</h2>
            <p style={{ textAlign: 'center', color: '#5f6f68', fontSize: '14px', marginBottom: '20px' }}>
              Protege tu cuenta con Google Authenticator.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
              <div style={{ padding: '10px', background: 'white', borderRadius: '10px', border: '1px solid #ddd' }}>
                <img 
                  src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=otpauth://totp/GestionBienes?secret=EJEMPLO&issuer=ESPE" 
                  alt="Código QR Authenticator" 
                  style={{ width: '150px', height: '150px' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label style={{ textAlign: 'center' }}>Ingresa el código de 6 dígitos</label>
              <input 
                type="text" 
                value={mfaCode} 
                onChange={(e) => setMfaCode(e.target.value)} 
                placeholder="000000"
                maxLength="6"
                required
                autoFocus
                style={{ letterSpacing: '8px', textAlign: 'center', fontSize: '24px', fontWeight: 'bold' }}
              />
            </div>

            {error && <div style={{color: 'red', marginBottom: '15px', fontSize: '14px', textAlign: 'center'}}>{error}</div>}
            
            <button type="submit" className="btn-primary" style={{ marginBottom: '10px' }}>Ingresar al Sistema</button>
            
            <button 
              type="button" 
              className="btn-secondary" 
              onClick={() => setPaso(1)}
              style={{ width: '100%', padding: '10px', background: '#f1f1f1', border: 'none', borderRadius: '8px', cursor: 'pointer', color: '#555', fontWeight: 'bold' }}
            >
              Volver
            </button>
          </form>
        )}

      </div>
    </GoogleOAuthProvider>
  );
}