import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/apiConfig"; // URL base del backend Spring Boot

function Registrar() {

    // ═══════════════════════════════════════════
    // ESTADOS DEL FORMULARIO
    // ═══════════════════════════════════════════
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [rol, setRol] = useState('');
    const [errores, setErrores] = useState({}); // errores de validación por campo (frontend)

    const navigate = useNavigate(); // para redirigir a /login tras el registro exitoso

    // ═══════════════════════════════════════════
    // ESTADOS DE RESULTADO DEL FETCH
    // ═══════════════════════════════════════════
    const [error, setError] = useState('');   // mensaje de error que devuelve el backend
    const [mensaje, setMensaje] = useState(''); // mensaje de éxito tras crear el usuario

    // ═══════════════════════════════════════════
    // ENVÍO DEL FORMULARIO — valida y luego llama a Spring Boot
    // ═══════════════════════════════════════════
    const manejarGuardar = async (e) => {
        e.preventDefault();
        setError('');     // limpia mensajes previos en cada intento
        setMensaje('');

        // 1. Validación local antes de gastar una petición HTTP
        const erroresActuales = validarCampos();
        if (Object.keys(erroresActuales).length > 0) {
            return; // si hay errores de campo, no continúa al fetch
        }

        try {
            // 2. POST hacia Spring Boot — nota el mapeo username -> userName
            //    (el backend espera "userName", el frontend usa "username")
            const response = await fetch(`${API_BASE_URL}auth/registrar`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userName: username, password, rol })
                }
            );

            // 3. Si no es 201, el backend devolvió un error (ej: usuario duplicado)
            if (response.status !== 201) {
                const datoError = await response.json(); // body JSON: { mensaje: "..." }
                throw new Error(datoError.mensaje + ". Prueba con otro nombre")
            }

            // 4. Éxito: muestra mensaje y redirige a login tras 2 segundos
            setMensaje("USUARIO CREADO CON EXITO");
            setTimeout(() => {
                navigate('/login')
            }, 2000);

        } catch (error) {
            setError(error.message); // muestra el error (de red o del backend) en pantalla
        }
    }

    // ═══════════════════════════════════════════
    // VALIDACIÓN LOCAL — revisa los 3 campos antes de enviar
    // ═══════════════════════════════════════════
    function validarCampos() {

        let err = {};

        if (username.trim() === '') {
            err.username = "Campo vacio"
        }
        if (password.trim() === '' || password.length < 8) {
            err.password = "Campo incompleto, min 8 caracteres"
        }
        if (rol.trim() === '') {
            err.rol = "Campo obligatorio"
        }
        setErrores(err);   // actualiza el estado para mostrar en el JSX
        return err;        // devuelve el valor fresco (el estado tarda en actualizarse)
    }

    // ═══════════════════════════════════════════
    // VISTA — formulario de registro
    // ═══════════════════════════════════════════
    return (
        <form onSubmit={manejarGuardar}>
            <div>
                <div>
                    <h2>Registro de cuenta</h2>
                </div>
                <div>
                    <label>Usuario* </label>
                    <input type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Ejem: EDWINCSN"
                    />
                </div>
                {errores.username && <p>{errores.username}</p>} {/* error de validación local */}

                <div>
                    <label>Contraseña* </label>
                    <input type="text"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="cadena de minimo 8 caracteres"
                    />
                </div>
                {errores.password && <p>{errores.password}</p>}

                <div>
                    <label>Rol* </label>
                    <select
                        value={rol}
                        onChange={(e) => setRol(e.target.value)}
                    >
                        <option value="" disabled>Seleccione un rol</option>
                        <option value="ADMIN">Administrador</option>
                        <option value="USER">Usuario</option>
                    </select>
                </div>
                {errores.rol && <p>{errores.rol}</p>}

                <div>
                    <button type="submit">Guardar</button>
                </div>

                <div>
                    {error && <p>{error}</p>}     {/* error del backend (ej: usuario duplicado) */}
                    {mensaje && <p>{mensaje}</p>} {/* mensaje de éxito */}
                </div>
            </div>
        </form>
    );
}

export default Registrar