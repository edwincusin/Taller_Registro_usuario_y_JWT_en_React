import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"; // BrowserRouter=activa rutas | Routes=contenedor | Route=ruta individual | Navigate=redirige
import { AuthProvider } from "./context/AuthContext"; // proveedor del token global para toda la app
import Perfil from "./pages/Perfil"; // página protegida → solo accesible con token
import Login from "./pages/Login"; // página pública → accesible sin token
import ProtectedRoute from "./components/ProtectedRoute"; // guardián → verifica token antes de dejar pasar
import Registrar from "./pages/Registrar";
import Vehiculos from "./pages/Vehiculos";
import Peliculas from "./pages/Peliculas";

export function App() {

  return (

    // ═══════════════════════════════════════════
    // CONTEXTO GLOBAL — envuelve todo para que
    // token, login y logout estén disponibles
    // en cualquier componente de la app
    // ═══════════════════════════════════════════
    <AuthProvider>
      {/* SISTEMA DE NAVEGACIÓN — sin esto las rutas no funcionan */}
      <BrowserRouter>
        <Routes>
          {/* RUTA PÚBLICA — cualquiera puede entrar sin token */}
          <Route
            path="/login"
            element={<Login />}
          />
          {/* RUTAS PROTEGIDAS — ProtectedRoute verifica el token antes de mostrar */}
          <Route element={<ProtectedRoute />}>
            <Route
              path="/perfil"
              element={<Perfil />}
            />
            <Route
              path="/vehiculos"
              element={<Vehiculos />}
            />
          </Route>
          <Route
            path="/registrar"
            element={<Registrar />}
          />{/*Registrar vehiculos*/}
          <Route
            path="/peliculas"
            element={<Peliculas/>}
          />{/*Registrar vehiculos*/}
          {/* RUTA COMODÍN — cualquier URL desconocida redirige al login */}
          <Route
            path="*"
            element={<Navigate to="/login" replace />}
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}