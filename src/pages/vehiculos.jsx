import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../config/apiConfig"; // URL base de Spring Boot ej: http://localhost:8080
import ListaVehiculos from "../components/ListaVehiculos";

function Vehiculos() {

    // Estados del formulario: cada campo controlado tiene su propio estado
    const [marca, setMarca] = useState("");
    const [modelo, setModelo] = useState("");
    const [archivo, setArchivo] = useState(null); // guarda el objeto File seleccionado (no el FileList)

    // Estados para feedback visual al usuario (éxito / error)
    const [errorMsg, setErrorMsg] = useState("");
    const [succesMsg, setSucceMsg] = useState("");

    const navigate = useNavigate();

    // Token JWT del usuario autenticado, viene del contexto global de auth
    const { token } = useAuth();

    // NUEVO: estado donde se guarda el array de vehículos traídos del backend
    const [listaVehiculos, setlistaVehiculos] = useState([]);

    // NUEVO: useCallback memoriza la función para que no se recree en cada render.
    // Es necesario porque "cargarVehiculos" es dependencia del useEffect de abajo;
    // sin useCallback se generaría un loop infinito (nueva función -> efecto se dispara -> nuevo render -> nueva función...)
    const cargarVehiculos = useCallback (async () => {
        try {
            const response = await fetch(`${API_BASE_URL}auth/vehiculo/listar`,
                {
                    method: 'GET',
                    // Token JWT requerido porque el endpoint está protegido
                    headers:{'Authorization': `Bearer ${token}`}
                }
            )

            if (!response.ok) {
                throw new Error("No se pudo obtner la lista de vehiculos")
            }

            // await es obligatorio: response.json() devuelve una Promise,
            // sin await se guardaría la Promise en el estado en vez del array real
            const datosParseadosJson=await response.json();
            setlistaVehiculos(datosParseadosJson);
        } catch (error) {
            setErrorMsg(error.message);
        }
    },[token]) // se recrea solo si cambia el token (ej. nuevo login)

    // NUEVO: dispara la carga de vehículos al montar el componente
    // (y de nuevo si cargarVehiculos cambia, lo cual solo pasa si cambia el token)
    useEffect(()=>{
        cargarVehiculos();
    },[cargarVehiculos])

    // Se ejecuta cada vez que el usuario selecciona un archivo en el input type="file"
    const manejarArchivo = (e) => {
        // e.target.files es un FileList (aunque solo se permita 1 archivo),
        // por eso se accede al índice [0] para obtener el File real
        setArchivo(e.target.files[0])
    }



    // Se ejecuta al enviar el formulario
    const manejarSubmit = async (e) => {
        e.preventDefault(); // evita que el navegador recargue la página

        // Limpiamos mensajes previos antes de un nuevo intento
        setErrorMsg('');
        setSucceMsg('');

        // Validación mínima en cliente: la foto es obligatoria
        if (!archivo) {
            setErrorMsg("Debe seleccionar una foto del vehiculo");
            return;
        }

        // FormData es necesario porque se envía un archivo binario (multipart/form-data),
        // no se puede mandar JSON normal cuando hay un File de por medio
        const formData = new FormData();
        formData.append("file", archivo);   // debe coincidir con @RequestParam("file") del backend
        formData.append("marca", marca);    // debe coincidir con @RequestParam("marca")
        formData.append("modelo", modelo);  // debe coincidir con @RequestParam("modelo")

        try {
            const response = await fetch(`${API_BASE_URL}auth/vehiculo/registrar`, {
                method: 'POST',
                headers: {
                    // Token JWT requerido porque el endpoint está protegido
                    'Authorization': `Bearer ${token}`
                },
                // OJO: no se define 'Content-Type' manualmente.
                // El navegador lo setea solo con el boundary correcto al usar FormData.
                body: formData
            });

            // El backend responde JSON tanto en éxito como en error: { "Mensaje": "..." }
            const datosResuesta = await response.json();

            if (!response.ok) {
                // response.ok es false en status 4xx/5xx (ej. 500 del backend)
                throw new Error(datosResuesta.Mensaje)
            }

            setSucceMsg(datosResuesta.Mensaje)

            // Reseteamos el formulario tras un registro exitoso
            setMarca("");
            setArchivo(null);
            setModelo("");

            // NUEVO: refresca la lista de vehículos para que el recién registrado
            // aparezca de inmediato, sin necesidad de recargar la página
            cargarVehiculos();

        } catch (error) {
            // Captura tanto errores de red (fetch falla) como el throw manual de arriba
            setErrorMsg(error.message)
        }
    }

    return (
        <div>
            <button onClick={() => navigate('/perfil')}>Regresar</button>
            <h1>Gestin de vehiculos</h1>
            <h2>Registrar nuevo vehiculo</h2>

            <form onSubmit={manejarSubmit}>
                <div>
                    <label>Marca: </label>
                    {/* Input controlado: value + onChange ligados al estado */}
                    <input type="text"
                        value={marca}
                        onChange={(e) => setMarca(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Modelo: </label>
                    <input type="text"
                        value={modelo}
                        onChange={(e) => setModelo(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Foto: </label>
                    {/* Input de archivo NO puede ser controlado con "value" por seguridad del navegador,
                        por eso solo se usa onChange */}
                    <input type="file"
                        accept="image/*"
                        onChange={manejarArchivo}
                    />
                </div>
                <div>
                    <button type="submit">Registrar Vehiculo</button>
                </div>
            </form>

            {/* Renderizado condicional: solo se muestra si el string no está vacío */}
            <div>
                {errorMsg && <p>{errorMsg}</p>}
                {succesMsg && <p>{succesMsg}</p>}
            </div>
            <div>
                {/* NUEVO: se pasa la lista como prop; ListaVehiculos descarga
                    cada foto protegida y renderiza la tarjeta de cada vehículo */}
                <ListaVehiculos
                vehiculos={listaVehiculos}
                />
            </div>
        </div>
    )
}

export default Vehiculos;