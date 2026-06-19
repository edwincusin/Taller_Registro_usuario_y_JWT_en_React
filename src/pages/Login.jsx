import { useState } from "react"
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../config/apiConfig";

function Login() {

    // ═══════════════════════════════════════════
    // ESTADOS — guardan los valores del formulario
    // ═══════════════════════════════════════════
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    // ═══════════════════════════════════════════
    // HERRAMIENTAS EXTERNAS
    // ═══════════════════════════════════════════
    const navigate = useNavigate(); // para redirigir después del login
    const { login } = useAuth(); // función del contexto global para guardar el token

    // ═══════════════════════════════════════════
    // LÓGICA — comunicación con Spring Boot
    // ═══════════════════════════════════════════
    const manejarSubmit = async (e) => {
        e.preventDefault();
        setError('');
        console.log("captura los del fech")
        try {
            // 1. Manda credenciales a Spring Boot
            const response = await fetch(`${API_BASE_URL}auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            console.log("captura los del fech")
            // 2. Si Spring Boot rechaza → lanza error
            if (!response.ok) {
                throw new Error('Usuario o contraseña incorrecta')
            }

            // 3. Extrae el token JWT de la respuesta
            const datos = await response.json();

            // 4. Guarda el token en localStorage y contexto global
            login(datos.token);

            // 5. Redirige al usuario a su perfil
            navigate('/perfil');

        } catch (error) {
            setError(error.message); // muestra el error en el formulario
        }
    }

    // ═══════════════════════════════════════════
    // VISTA — formulario de login
    // ═══════════════════════════════════════════
    return (
        <div className="auth-page">
            <form className="auth-card" onSubmit={manejarSubmit}>
                <div className="auth-header">
                    <h1>Iniciar sesión</h1>
                </div>
                <div className="form-group">
                    <label>Usuario:</label>
                    <input type="text"
                        className="form-input"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Contraseña:</label>
                    <input type="text"
                        className="form-input"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <div className="form-feedback">
                    {error && <p className="msg-error">{error}</p>}
                </div>
                <div className="form-actions">
                    <button className="btn-primary" type="submit">Ingresar</button>
                </div>

                <div className="auth-switch">
                    ¿No tienes cuenta?  <Link to={"/registrar"}>Crear cuenta</Link>
                </div>

            </form>
        </div>
    )
}

export default Login;