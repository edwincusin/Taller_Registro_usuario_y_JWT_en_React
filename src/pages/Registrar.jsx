import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/apiConfig"; // URL base del backend Spring Boot
import {
    FaUserPlus,
    FaUser,
    FaLock,
    FaUserShield,
    FaSave,
    FaTimesCircle,
    FaCheckCircle,
    FaExclamationTriangle
} from "react-icons/fa";

function Registrar() {

    // ═══════════════════════════════════════════
    // ESTADOS DEL FORMULARIO
    // ═══════════════════════════════════════════
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmarPassword, setConfirmarPassword] = useState('');
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
            setMensaje("USUARIO CREADO CON ÉXITO");
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
            err.username = "Campo vacío"
        }
        if (password.trim() === '' || password.length < 8) {
            err.password = "Cadena de mínimo 8 caracteres"
        }
        if (rol.trim() === '') {
            err.rol = "Campo obligatorio"
        }
        if (confirmarPassword.trim() === '') {
            err.confirmarPassword = "Campo obligatorio"
        }
        if (confirmarPassword!==password) {
            err.confirmarPassword = "Contraseñas no coiciden"
        }

        setErrores(err);   // actualiza el estado para mostrar en el JSX
        return err;        // devuelve el valor fresco (el estado tarda en actualizarse)
    }

    // ═══════════════════════════════════════════
    // VISTA — formulario de registro
    // ═══════════════════════════════════════════
    return (
        <div className="auth-page">
            <form className="auth-card" onSubmit={manejarGuardar}>
                <div className="auth-header">
                    <h2>
                        <FaUserPlus className="title-icon" />
                        Registro de usuario
                    </h2>
                </div>
                <div className="form-group">
                    <label>
                        <FaUser className="input-icon" />
                        Usuario*:
                    </label>
                    <input type="text"
                        className="form-input"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Ejem: EDWINCSN"
                    />
                </div>
                {errores.username && <p className="field-error">{errores.username}</p>} {/* error de validación local */}

                <div className="form-group">
                    <label>
                        <FaLock className="input-icon" />
                        Contraseña*:
                    </label>
                    <input type="password"
                        className="form-input"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Cadena de mínimo 8 caracteres"
                    />
                </div>
                {errores.password && <p className="field-error">{errores.password}</p>}

                {/* {-------------------------------------------------------------} */}

                <div className="form-group">
                    <label>
                        <FaLock className="input-icon" />
                        Confirmar Contraseña*:
                    </label>
                    <input type="password"
                        className="form-input"
                        value={confirmarPassword}
                        onChange={(e) => setConfirmarPassword(e.target.value)}
                        placeholder="Confirmar"
                    />
                </div>
                {errores.confirmarPassword && <p className="field-error">{errores.confirmarPassword}</p>}


                <div className="form-group">
                    <label>
                        <FaUserShield className="input-icon" />
                        Rol*:
                    </label>
                    <select
                        className="form-input"
                        value={rol}
                        onChange={(e) => setRol(e.target.value)}
                    >
                        <option value="" disabled>Seleccione un rol</option>
                        <option value="ADMIN">Administrador</option>
                        <option value="USER">Usuario</option>
                    </select>
                </div>
                {errores.rol && <p className="field-error">{errores.rol}</p>}

                <div className="form-actions">
                    <button className="btn-primary" type="submit">
                        <FaSave />
                        &nbsp;Guardar
                    </button>
                </div>
                <div className="form-actions">
                    <button
                        className="btn-danger"
                        type="button"
                        onClick={() => navigate('/login')}
                    >
                        <FaTimesCircle />
                        &nbsp;Cancelar
                    </button>
                </div>

                <div className="form-feedback">
                    {error &&
                        <p className="msg-error">
                            <FaExclamationTriangle />
                            &nbsp;{error}
                        </p>
                    }     {/* error del backend (ej: usuario duplicado) */}

                    {mensaje &&
                        <p className="msg-success">
                            <FaCheckCircle />
                            &nbsp;{mensaje}
                        </p>
                    }

                    {/* mensaje de éxito */}
                </div>
            </form>
        </div>
    );
}

export default Registrar