import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../config/apiConfig";

function ListarPeliculas({ peliculas, actualizarPel }) {

    // Guarda las URLs locales (blob) de cada foto, indexadas por id de vehículo
    const [fotosUrl, setFotosUrl] = useState({});
    const { token } = useAuth();
    // Feedback visual de éxito / error
    const [errorMsg, setErrorMsg] = useState("");
    const [succesMsg, setSucceMsg] = useState("");

    const [peliculaAEditar, setPeliculaAEditar] = useState(null);

    const [editTitulo, setEditTitulo] = useState("");
    const [editGenero, setEditGenero] = useState("");
    const [editSinopsis, setEditSinopsis] = useState("");
    const [editArchivo, setEditArchivo] = useState(null);

    useEffect(() => {
        // Acumula las URLs creadas en este efecto para poder liberarlas en el cleanup
        const urlsCreadas = [];

        const descargarFotos = async () => {
            for (const pelicula of peliculas) {
                try {
                    // Pide la foto protegida del vehículo, enviando el JWT
                    const response = await fetch(`${API_BASE_URL}auth/peliculas/${pelicula.id}/foto`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (response.ok) {
                        // La respuesta son bytes de imagen, no JSON -> se lee como blob
                        const blob = await response.blob();

                        // Convierte el blob en una URL temporal usable en <img src="">
                        const urlLocal = URL.createObjectURL(blob);
                        urlsCreadas.push(urlLocal);

                        // Forma funcional + spread: agrega esta foto sin perder las ya guardadas
                        setFotosUrl((prev) => (
                            { ...prev, [pelicula.id]: urlLocal }
                        ))
                    }

                } catch (error) {
                    console.log("Fallo al descargar la foto : " + error.message)
                }
            }
        }

        if (peliculas.length > 0) {
            descargarFotos();
        }

        // Cleanup: se ejecuta al desmontar o antes de re-ejecutar el efecto.
        // Libera la memoria de las URLs blob creadas (evita memory leaks)
        return () => {
            for (const url of urlsCreadas) {
                URL.revokeObjectURL(url);
            }
        }

    }, [peliculas, token]); // se vuelve a ejecutar si cambia la lista o el token




    const eliminarPelicula = async (id) => {
        const confirmado = window.confirm("¿Estás seguro de eliminar esta película?");
        if (!confirmado) return; // si cancela, cortamos la ejecución aquí
        // Limpiamos mensajes previos antes de un nuevo intento
        setErrorMsg('');
        setSucceMsg('');
        try {
            const response = await fetch(`${API_BASE_URL}auth/peliculas/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const datosResponse = await response.json()
            if (!response.ok) {
                throw new Error(datosResponse.Mensaje)
            }
            setSucceMsg(datosResponse.Mensaje)
            actualizarPel();

        } catch (error) {
            setErrorMsg(error.message)
        } finally {
            setTimeout(() => {
                setErrorMsg('');
                setSucceMsg('');
            }, 3000)
        }
    }

    //PARTE PARA EDITAR UNA PELICULA
    useEffect(() => {
        if (peliculaAEditar) {
            setEditTitulo(peliculaAEditar.titulo);
            setEditGenero(peliculaAEditar.genero);
            setEditSinopsis(peliculaAEditar.sinopis);
            setEditArchivo(null);
        } else {
            setEditTitulo('');
            setEditGenero('');
            setEditSinopsis('');
            setEditArchivo(null);
        }
    }, [peliculaAEditar]);

    // Se ejecuta al enviar el formulario con datos modificados
    const editarPelicula = async (e) => {
        e.preventDefault();
        // Limpiamos mensajes previos antes de un nuevo intento
        setErrorMsg('');
        setSucceMsg('');


        // FormData es necesario porque se envía un archivo binario (multipart/form-data),
        // no se puede mandar JSON normal cuando hay un File de por medio
        const formData = new FormData();
        if(editArchivo) {
            formData.append("file", editArchivo);
        }
        formData.append("titulo", editTitulo);      // debe coincidir con @RequestParam("titulo")
        formData.append("genero", editGenero);      // debe coincidir con @RequestParam("genero")
        formData.append("sinopsis", editSinopsis);  // debe coincidir con @RequestParam("sinopsis")

        try {
            const response = await fetch(`${API_BASE_URL}auth/peliculas/${peliculaAEditar.id}`, {
                method: 'PUT',
                headers: {
                    // Token JWT requerido porque el endpoint está protegido
                    'Authorization': `Bearer ${token}`
                },
                // OJO: no se define 'Content-Type' manualmente.
                // El navegador lo setea solo con el boundary correcto al usar FormData.
                body: formData
            });

            // El backend responde JSON tanto en éxito como en error: { "Mensaje": "..." }
            const datosRespuesta = await response.json();

            if (!response.ok) {
                // response.ok es false en status 4xx/5xx (ej. 500 del backend)
                throw new Error(datosRespuesta.Mensaje)
            }

            setSucceMsg(datosRespuesta.Mensaje)

            // NUEVO: refresca la lista de peliculas para que el recién registrado
            // aparezca de inmediato, sin necesidad de recargar la página
            actualizarPel();
            setPeliculaAEditar(null)
        } catch (error) {
            // Captura tanto errores de red (fetch falla) como el throw manual de arriba
            setErrorMsg(error.message)
        } finally {
            setTimeout(() => {
                setErrorMsg('');
                setSucceMsg('');
            }, 3000)
        }
    }

    return (
        <div>
            <div className="auth-header">
                {errorMsg && <p className="pelicula-msg-error">{errorMsg}</p>}
                {succesMsg && <p className="pelicula-msg-success">{succesMsg}</p>}
            </div>
            {peliculas.length === 0 ? (
                <p className="pelicula-empty">No hay películas registradas</p>
            ) : (
                <ul className="grid-peliculas" style={{ listStyle: "none", padding: 0, margin: 0 }}>
                    {peliculas.map((pelicula) => {
                        return (
                            <li key={pelicula.id} className="pelicula-card">
                                {fotosUrl[pelicula.id] && (
                                    <img src={fotosUrl[pelicula.id]}
                                        alt="Foto de la película" />
                                )}
                                <div className="pelicula-card-body">
                                    <p className="pelicula-card-titulo">{pelicula.titulo}</p>
                                    <p className="pelicula-card-genero">{pelicula.genero}</p>
                                    <p className="pelicula-card-sinopsis">{pelicula.sinopis}</p>
                                </div>
                                <div className="pelicula-card-acciones">
                                    <button className="btn-editar"
                                        onClick={() => setPeliculaAEditar(pelicula)}
                                    >Editar</button>
                                    <button className="btn-eliminar"
                                        onClick={() => eliminarPelicula(pelicula.id)}
                                    >Eliminar</button>
                                </div>
                            </li>
                        )
                    })}
                </ul>
            )}
            {/* MODAL DE EDICIÓN — va aquí, fuera del map y del ternario */}
            {peliculaAEditar && (
                <div className="modal-overlay">
                    <div className="modal-contenido">
                        <div className="auth-header">
                            <h2>Editar Película</h2>
                        </div>

                        <form className="formulario-pelicula" onSubmit={editarPelicula}>
                            <div className="campo">
                                <label htmlFor="editTitulo">Título</label>
                                <input
                                    type="text"
                                    id="editTitulo"
                                    placeholder="Título de la película"
                                    required
                                    value={editTitulo}
                                    onChange={(e) => setEditTitulo(e.target.value)}
                                />
                            </div>

                            <div className="campo">
                                <label htmlFor="editGenero">Género</label>
                                <select id="editGenero"
                                    value={editGenero}
                                    onChange={(e) => setEditGenero(e.target.value)}
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
                                <label htmlFor="editSinopsis">Sinopsis</label>
                                <textarea
                                    id="editSinopsis"
                                    rows={4}
                                    placeholder="Breve descripción de la película..."
                                    required
                                    value={editSinopsis}
                                    onChange={(e) => setEditSinopsis(e.target.value)}
                                />
                            </div>

                            <div className="campo">
                                <label htmlFor="editFoto">Foto / Póster (opcional)</label>
                                <input
                                    type="file"
                                    id="editFoto"
                                    accept="image/*"
                                    onChange={(e) => setEditArchivo(e.target.files[0])}
                                />
                                <small style={{ color: "#64748b", marginTop: "6px" }}>
                                    Dejar vacío para mantener la foto actual
                                </small>
                            </div>

                            <button type="submit" className="btn-guardar-pelicula">
                                Guardar Cambios
                            </button>
                            <button
                                type="button"
                                className="btn-danger"
                                onClick={() => setPeliculaAEditar(null)}
                                style={{ marginTop: "10px" }}
                            >
                                Cancelar
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ListarPeliculas;