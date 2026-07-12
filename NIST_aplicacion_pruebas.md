# Aplicación de NIST en el proyecto GestionBienes

## 1. Controles NIST implementados

### 1.1 NIST AU - Auditoría y Accountability
- Se creó el modelo `AuditoriaLog` en `inventario/models.py`.
- Se agregó middleware `AuditoriaMiddleware` en `inventario/middleware.py`.
- El middleware registra acciones importantes fuera de `/api/login/`, incluyendo el método HTTP, usuario, IP y status.
- Se registran eventos de auditoría en `login` exitoso y fallido dentro de `inventario/views.py`.
- Se expuso `AuditoríaLog` en admin a través de `inventario/admin.py`.
- En `backend/settings.py` se configuró logger a archivo `logs/auditoria.log`.

### 1.2 NIST IA - Identificación y Autenticación
- `backend/settings.py` usa validadores de contraseña:
  - `UserAttributeSimilarityValidator`
  - `MinimumLengthValidator`
  - `CommonPasswordValidator`
  - `NumericPasswordValidator`
- `PASSWORD_HASHERS` incluye `BCryptSHA256PasswordHasher` como principal.
- En `inventario/views.py` la vista `CrearUsuarioView` valida contraseñas y crea usuarios.
- Se agregó protección de intentos fallidos de login en `inventario/views.py`:
  - contador por IP en cache
  - alerta cuando se supera `FAILED_LOGIN_THRESHOLD = 5`
  - alerta impresa en consola `ESP ALERT` y por email simulado en consola

### 1.3 NIST SC - Protección de Comunicaciones
- En `inventario/middleware.py` se añadieron headers HTTP:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `X-XSS-Protection: 1; mode=block`
  - `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- Estos headers se aplican en cada respuesta.

### 1.4 NIST AC - Control de Acceso
- En `backend/settings.py` se permite CORS solo para `http://localhost:5173`.
- `CSRF_TRUSTED_ORIGINS` incluye frontend y backend locales.
- Se usan permisos `IsAdministrador` para endpoints de administración.

### 1.5 NIST SI - Integridad de datos y validación
- En `backend/settings.py` se limitó el tamaño de carga de datos a 5 MB.
- La creación de usuarios valida la fortaleza de la contraseña.

## 2. Archivos clave y su función

| Archivo | Función |
|---|---|
| `inventario/models.py` | Modelo `AuditoriaLog` y usuario personalizado `Usuario` |
| `inventario/middleware.py` | Auditoría de requests y headers de seguridad |
| `inventario/views.py` | Login con auditoría, alerta de intentos fallidos y creación segura de usuarios |
| `backend/settings.py` | Configuraciones NIST: CORS, CSRF, headers, loggers, validadores de contraseña |
| `inventario/admin.py` | Panel admin para revisar auditoría |
| `NIST_aplicacion_pruebas.md` | Documento de implementación y pruebas |

## 3. Cómo se probó NIST con backend y frontend

### 3.1 Paso 1: Ejecutar backend y frontend
Terminal 1 (backend):
```bash
cd C:\Users\duval\gestionbienes
python manage.py runserver
```
Terminal 2 (frontend):
```bash
cd C:\Users\duval\gestionbienes
npm run dev
```

### 3.2 Paso 2: Login exitoso en frontend
- Abre `http://localhost:5173`.
- Ingresa con usuario `testuser` y contraseña `123456`.
- Resultado esperado:
  - Dashboard carga
  - En backend aparece consola `ESP - Login exitoso: testuser desde 127.0.0.1`
  - Se crea un registro `LOGIN` exitoso en auditoría.

### 3.3 Paso 3: Login fallido en Postman
Request:
- Método: `POST`
- URL: `http://localhost:8000/api/login/`
- Headers:
  - `Content-Type: application/json`
- Body:
```json
{
  "username": "noexiste",
  "password": "wrong"
}
```
Resultado esperado:
- `400 Bad Request`
- Se crea un registro `LOGIN` fallido en auditoría

### 3.4 Paso 4: Disparar alerta de seguridad
- Repite el request fallido 5 veces.
- Resultado esperado:
  - En backend aparece `ESP ALERT - Alerta: 5 intentos fallidos de login...`
  - Se imprime la alerta por consola y se intenta enviar email en consola.

### 3.5 Paso 5: Ver auditoría en Django Admin
- Abre `http://localhost:8000/admin/`.
- Entra con un superusuario.
- Navega a `Auditorías`.
- Deberías ver entradas de `LOGIN` y `CREATE`.

### 3.6 Paso 6: Ver headers de seguridad
Request GET a `http://localhost:8000/admin/` y revisar headers en la respuesta:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`

## 4. Postman: pasos para validar rápido

### Login exitoso
- `POST http://localhost:8000/api/login/`
- Body:
```json
{
  "username": "testuser",
  "password": "123456"
}
```

### Intentos fallidos
- `POST http://localhost:8000/api/login/`
- Body:
```json
{
  "username": "noexiste",
  "password": "wrong"
}
```
- Ejecutar 5 veces.

### Crear usuario seguro
- `POST http://localhost:8000/api/crear-usuario/`
- Headers:
  - `Authorization: Token <TOKEN>`
  - `Content-Type: application/json`
- Body:
```json
{
  "username": "docente_nuevo",
  "password": "Docente@2026",
  "email": "docente@espe.edu.ec",
  "rol": "Docente",
  "cedula": "1234567890"
}
```

## 5. Resultado esperado en el sistema
- Se registran auditorías de login exitoso/fallido.
- Se disparan alertas en consola cuando hay muchos intentos fallidos.
- Los headers de seguridad aparecen en respuestas.
- La creación de usuarios valida contraseñas.
- El frontend puede acceder con login válido.

## 6. Integración blockchain añadida
- Se cambió el demo a un contrato `hello world` simulado localmente en `src/views/Blockchain.jsx`.
- La vista ahora simula lectura y escritura de un valor `hello` sin usar Solidity ni MetaMask.
- Se mantiene un historial de versiones para mostrar cómo cambia el valor.
- Esta implementación demuestra el concepto de smart contract en React de forma simple.

### Cómo usar la integración blockchain
1. Instala dependencias:
   ```bash
   npm install
   ```
2. Inicia el frontend:
   ```bash
   npm run dev
   ```
3. Abre `http://localhost:5173`.
4. Inicia sesión y navega a `Blockchain`.
5. Usa `Leer hello` para simular una lectura y `Actualizar hello` para simular una escritura.

---

### Nota
Este documento está en la raíz del proyecto como `NIST_aplicacion_pruebas.md`.
Puedes abrirlo directamente en VS Code o leerlo con cualquier editor.
