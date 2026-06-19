// protege las rutas privadas de la app, si no hay token redirige al login
import { useAuth } from "../context/AuthContext"; // importa hook para leer el token global del contexto
import { Navigate, Outlet } from "react-router-dom" // Navigate=redirige a otra ruta | Outlet=renderiza la página protegida

function ProtectedRoute() { // componente guardián que decide si el usuario puede ver la página o no
    const { token } = useAuth(); // lee el token del contexto global → si hay token hay sesión activa, si es null no hay sesión

    if (!token) { // si NO hay token → el usuario no está logueado
        return <Navigate to="/login" replace /> // redirige al login | replace=no guarda esta ruta en el historial del navegador
    } else { // si SÍ hay token → el usuario está autenticado
        return <Outlet /> // renderiza la página que el usuario quería ver (dashboard, perfil, reportes, etc)
    }
}

export default ProtectedRoute; // exporta el componente para usarlo en App.jsx envolviendo las rutas privadas