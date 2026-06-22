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
                                    <button className="btn-editar">Editar</button>
                                    <button className="btn-eliminar"
                                        onClick={() => eliminarPelicula(pelicula.id)}
                                    >Eliminar</button>
                                </div>
                            </li>
                        )
                    })}
                </ul>
            )}
        </div>
    )
}

export default ListarPeliculas;