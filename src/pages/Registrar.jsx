import { useState } from "react";

function Registrar() {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [rol, setRol] = useState('');
    const [errores, setErrores] = useState({});


    //FUNCION PARA MANEJAR GUARDAR
    const manejarGuardar = (e) => {
        e.preventDefault();
        const erroresActuales = validarCampos();
        if (Object.keys(erroresActuales).length > 0) {
            return;
        }
    }

    //FUNCION PARA VALIDAR CAMPOS
    function validarCampos() {

        let error = {};

        if (username.trim() === '') {
            error.username = "Campo vacio"
        }
        if (password.trim() == '' || password.length < 8) {
            error.password = "Campo incompleto, min 8 caracteres"
        }
        if (rol.trim() == '') {
            error.rol = "Campo obligatorio"
        }
        setErrores(error);
        return error;
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

            </div>
        </form>
    );
}

export default Registrar