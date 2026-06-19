// ═══════════════════════════════════════════════════
// CONTEXTO DE AUTENTICACIÓN
// Permite compartir token, login y logout con TODA
// la app sin pasar props de componente en componente
// ═══════════════════════════════════════════════════


import { createContext, useContext, useState } from "react"; // createContext=caja global | useContext=leer caja | useState=estado reactivo

const AuthContext = createContext(); // caja vacía global, aún sin datos adentro

export function AuthProvider(props) { // componente que envuelve toda la app en main.jsx

    const { children } = props; // children = todos los componentes hijos que están adentro

    const [token, setToken] = useState(localStorage.getItem('token') || null); // busca token guardado en navegador, si no hay → null

    const login = (nuevoToken) => { // recibe el JWT que manda Spring Boot al hacer login exitoso
        localStorage.setItem('token', nuevoToken); // guarda token en navegador → sobrevive si el usuario recarga
        setToken(nuevoToken); // avisa a React del nuevo token → todos los componentes se actualizan
    };

    const logout = () => { // se ejecuta cuando el usuario cierra sesión
        localStorage.removeItem('token'); // borra token del navegador → si recarga, no hay sesión
        setToken(null); // avisa a React que no hay token → app vuelve a estado sin sesión
    }

    return ( // devuelve la caja con los datos disponibles para toda la app
        <AuthContext.Provider value={{ token, login, logout }}> {/* token=sesión activa | login=iniciar | logout=cerrar */}
            {children} {/* renderiza todos los componentes que están dentro de AuthProvider */}
        </AuthContext.Provider>
    );
}

export function useAuth(){ // hook personalizado → atajo para no escribir useContext(AuthContext) cada vez
    return useContext(AuthContext); // devuelve { token, login, logout } para usar en cualquier componente
}