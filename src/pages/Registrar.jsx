import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/apiConfig";

function Registrar() {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [rol, setRol] = useState('');
    const [errores, setErrores] = useState({});

    const navigate = useNavigate();

    //MANEJO DE ERRORES
    const [error, setError] = useState('');
    const [mensaje, setMensaje] = useState('');

    //FUNCION PARA MANEJAR GUARDAR
    const manejarGuardar = async (e) => {
        e.preventDefault();
        setError('');
        setMensaje('');
        const erroresActuales = validarCampos();
        if (Object.keys(erroresActuales).length > 0) {
            return;
        }
        
        try {
            const response = await fetch(`${API_BASE_URL}auth/registrar`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userName:username, password, rol })
                }
            );
            console.log("captura fetch");

            if (response.status !== 201) {
                throw new Error("Error al intentar guardar")
            }


            setMensaje("USUARIO CREADO CON EXITO");

            setTimeout(() => {
                navigate('/login')
            }, 2000);

        } catch (error) {
            setError(error.message);
        }
    }

    //FUNCION PARA VALIDAR CAMPOS
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
        setErrores(err);
        return err;
    }

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
                {errores.username && <p>{errores.username}</p>}
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
                    <button type="submit" >Guardar</button>
                </div>
                <div>
                    {error && <p>{error}</p>}
                    {mensaje && <p>{mensaje}</p>}
                </div>

            </div>
        </form>
    );
}

export default Registrar