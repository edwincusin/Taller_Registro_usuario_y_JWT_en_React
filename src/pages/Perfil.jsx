import { useEffect, useState } from "react" // useEffect=ejecuta código al cargar | useState=maneja estados
import { useAuth } from "../context/AuthContext"; // trae token y logout del contexto global
import { useNavigate } from "react-router-dom"; // redirige al login después del logout
import { API_BASE_URL } from "../config/apiConfig"; // URL base de Spring Boot ej: http://localhost:8080
import {
    FaUserCircle,
    FaShieldAlt,
    FaUserCog,
    FaPowerOff,
    FaCheckCircle
} from "react-icons/fa";

function Perfil() {

    // ═══════════════════════════════════════════
    // ESTADOS
    // ═══════════════════════════════════════════
    const [datosPerfil, setDatosPerfil] = useState(null); // null = aún no han llegado datos de Spring Boot
    const [error, setError] = useState(''); // mensaje de error si falla la carga del perfil

    // ═══════════════════════════════════════════
    // HERRAMIENTAS EXTERNAS
    // ═══════════════════════════════════════════
    const { token, logout } = useAuth(); // token=JWT para autenticar | logout=limpia sesión del contexto
    const navigate = useNavigate(); // para redirigir al login tras el logout

    // ═══════════════════════════════════════════
    // LÓGICA — carga el perfil al entrar a la página
    // ═══════════════════════════════════════════
    useEffect(() => {
        const cargarPerfil = async () => {
            try {
                // 1. Pide los datos del perfil a Spring Boot enviando el token
                const response = await fetch(`${API_BASE_URL}auth/perfil`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}` // JWT que verifica Spring Boot para dar acceso
                    }
                });

                // 2. Si Spring Boot rechaza → lanza error
                if (!response.ok) {
                    throw new Error('No se pudo cargar perfil, inicie session nuevamente');
                }

                // 3. Guarda los datos del perfil en el estado para mostrarlos
                const datos = await response.json();
                setDatosPerfil(datos);

            } catch (error) {
                setError(error.message); // muestra el error en la vista
            }
        };

        cargarPerfil(); // ejecuta la función apenas carga el componente

    }, [token]); // se re-ejecuta si el token cambia

    // ═══════════════════════════════════════════
    // LOGOUT — cierra sesión en Spring Boot y limpia contexto
    // ═══════════════════════════════════════════
    const manejarLogout = async () => {
        try {
            // 1. Avisa a Spring Boot que revoque el token del lado del servidor
            await fetch(`${API_BASE_URL}/auth/logout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
        } catch (error) {
            console.log("ERROR DE RED AL INTENTAR REVOCAR EL TOKEN" + error); // error de red, continúa igual
        }

        logout(); // limpia token de localStorage y contexto global
        navigate('/login'); // redirige al login sin importar si Spring Boot respondió o no
    }

    // ═══════════════════════════════════════════
    // VISTA
    // ═══════════════════════════════════════════
    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="profile-header">
                    <h2>
                        <FaUserCircle className="title-icon" />
                        PERFIL DE USUARIO
                    </h2>

                    <button
                        className="btn-secondary"
                        onClick={manejarLogout}
                    >
                        <FaPowerOff />
                        &nbsp;Cerrar sesión
                    </button> {/* dispara logout en Spring Boot y limpia contexto */}
                    <button
                        className="btn-secondary"
                        onClick={()=>navigate('/vehiculos')}
                    > Gestionar Vehiculos </button>
                </div>

                {error && <p className="msg-error">{error}</p>} {/* muestra error solo si falló la carga del perfil */}

                {datosPerfil && ( // renderiza solo cuando Spring Boot ya respondió con los datos
                    <div className="profile-info">
                        <p>{datosPerfil.Mensaje}</p>        {/* mensaje de bienvenida que manda Spring Boot */}
                        <p>{datosPerfil.Rol_detectado}</p>  {/* rol del usuario ej: ADMIN, USER */}
                        <p>{datosPerfil.Usuario}</p>        {/* nombre de usuario autenticado */}
                        <p>{datosPerfil.Status}</p>         {/* estado de la sesión ej: activo */}
                    </div>
                )}

            </div>
        </div>
    )
}

export default Perfil; // exporta como componente principal → se importa sin llaves en App.jsx