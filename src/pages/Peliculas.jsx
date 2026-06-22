import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../config/apiConfig";
import { useCallback, useEffect, useState } from "react";
import ListarPeliculas from "../components/ListarPeliculas";


function Peliculas() {
    // Estado para controlar si el formulario está visible o no
    const [mostrarFormulario, setMostrarFormulario] = useState(false);

    // Estados para los campos de texto del formulario
    const [titulo, setTitulo] = useState("");
    const [genero, setGenero] = useState("");
    const [sinopsis, setSinopsis] = useState("");

    // Estado para el archivo de la foto (separado, porque los input file no se controlan igual)
    const [archivo, setArchivo] = useState(null);

    // Estado para guardar la lista de películas que vas a traer del backend
    const [peliculas, setPeliculas] = useState([]);
    // Feedback visual de éxito / error
    const [errorMsg, setErrorMsg] = useState("");
    const [succesMsg, setSucceMsg] = useState("");

    // Hook de navegación (si vas a tener un botón "Regresar" como en Vehiculos.jsx)
    const navigate = useNavigate();

    // Token JWT desde el contexto de autenticación
    const { token } = useAuth();



    // NUEVO: useCallback memoriza la función para que no se recree en cada render.
    // Es necesario porque "cargarPeliculas" es dependencia del useEffect de abajo;
    // sin useCallback se generaría un loop infinito (nueva función -> efecto se dispara -> nuevo render -> nueva función...)
    const cargarPeliculas = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE_URL}auth/peliculas`,
                {
                    method: 'GET',
                    // Token JWT requerido porque el endpoint está protegido
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            )

            if (!response.ok) {
                throw new Error("No se pudo obtner la lista de vehiculos")
            }

            // await es obligatorio: response.json() devuelve una Promise,
            // sin await se guardaría la Promise en el estado en vez del array real
            const datosParseadosJson = await response.json();
            setPeliculas(datosParseadosJson);
        } catch (error) {
            setErrorMsg(error.message);
        }
    }, [token]) // se recrea solo si cambia el token (ej. nuevo login)

    // NUEVO: dispara la carga de vehículos al montar el componente
    // (y de nuevo si cargarVehiculos cambia, lo cual solo pasa si cambia el token)
    useEffect(() => {
        cargarPeliculas();
    }, [cargarPeliculas])

    // Se ejecuta al enviar el formulario
    const manejarSubmit = async (e) => {
        e.preventDefault(); // evita que el navegador recargue la página

        // Limpiamos mensajes previos antes de un nuevo intento
        setErrorMsg('');
        setSucceMsg('');

        // Validación mínima en cliente: la foto es obligatoria
        if (!archivo) {
            setErrorMsg("Debe seleccionar una foto de la pelicula");
            return;
        }

        // FormData es necesario porque se envía un archivo binario (multipart/form-data),
        // no se puede mandar JSON normal cuando hay un File de por medio
        const formData = new FormData();
        formData.append("file", archivo);          // debe coincidir con @RequestParam("file") del backend
        formData.append("titulo", titulo);      // debe coincidir con @RequestParam("titulo")
        formData.append("genero", genero);      // debe coincidir con @RequestParam("genero")
        formData.append("sinopsis", sinopsis);  // debe coincidir con @RequestParam("sinopsis")

        try {
            const response = await fetch(`${API_BASE_URL}auth/peliculas`, {
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
            setTitulo("");
            setGenero("");
            setSinopsis("");
            setArchivo(null);

            // NUEVO: refresca la lista de vehículos para que el recién registrado
            // aparezca de inmediato, sin necesidad de recargar la página
            cargarPeliculas();

        } catch (error) {
            // Captura tanto errores de red (fetch falla) como el throw manual de arriba
            setErrorMsg(error.message)
        }
    }




    return (
        <div> {/*este es el contenedor principal*/}
            <div className="auth-header">
                <h1>GESTION DE PELICULAS</h1>
            </div>

            <button className="btn-toggle-formulario" onClick={() => setMostrarFormulario(!mostrarFormulario)}>
                {mostrarFormulario ? "✕ Cancelar" : "+ Nueva Película"}
            </button>

            {mostrarFormulario && (
                <div> {/*este es el contenedor DE FORMULARIO*/}
                    <div className="auth-header">
                        <h2>Registrar pelicula</h2>
                    </div>

                    <form className="formulario-pelicula" onSubmit={manejarSubmit}>
                        <div className="campo">
                            <label htmlFor="titulo">Título</label>
                            <input
                                type="text"
                                id="titulo"
                                name="titulo"
                                placeholder="Ej: Matrix"
                                required
                                value={titulo}
                                onChange={(e) => setTitulo(e.target.value)}
                            />
                        </div>

                        <div className="campo">
                            <label htmlFor="genero">Género</label>
                            <select id="genero" name="genero"
                                value={genero}
                                onChange={(e) => setGenero(e.target.value)}
                            >
                                <option value="" disabled>Selecciona un género</option>
                                <option value="Accion">Acción</option>
                                <option value="Comedia">Comedia</option>
                                <option value="Drama">Drama</option>
                                <option value="Terror">Terror</option>
                                <option value="CienciaFiccion">Ciencia ficción</option>
                                <option value="Fantasia">Fantasía</option>
                                <option value="Romance">Romance</option>
                                <option value="Suspenso">Suspenso</option>
                                <option value="Animacion">Animación</option>
                                <option value="Documental">Documental</option>
                            </select>
                        </div>

                        <div className="campo">
                            <label htmlFor="sinopsis">Sinopsis</label>
                            <textarea
                                id="sinopsis"
                                name="sinopsis"
                                rows={4}
                                placeholder="Breve descripción de la película..."
                                required
                                value={sinopsis}
                                onChange={(e) => setSinopsis(e.target.value)}
                            />
                        </div>

                        <div className="campo">
                            <label htmlFor="foto">Foto / Póster</label>
                            <input
                                type="file"
                                id="foto"
                                name="foto"
                                accept="image/*"
                                onChange={(e) => setArchivo(e.target.files[0])}
                            />
                        </div>

                        <button type="submit" className="btn-guardar-pelicula">Guardar Película</button>
                        <div>
                            {errorMsg && <p className="pelicula-msg-error">{errorMsg}</p>}
                            {succesMsg && <p className="pelicula-msg-success">{succesMsg}</p>}
                        </div>
                    </form>
                </div>
            )}


            <div>{/*este es el contenedor para las targetas de peliculas*/}
                <div className="auth-header">
                    <h2>Lista peliculas</h2>
                    <p style={{ color: "var(--primary)", fontSize: "14px", marginTop: "6px" }}>
                        Total: {peliculas.length} películas
                    </p>
                </div>

                <div>
                    <ListarPeliculas
                        peliculas={peliculas}
                        actualizarPel={cargarPeliculas}
                    />
                </div>

            </div>
        </div>
    )
}

export default Peliculas;