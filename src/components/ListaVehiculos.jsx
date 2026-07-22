import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../config/apiConfig"; // URL base de Spring Boot ej: http://localhost:8080

function ListaVehiculos({ vehiculos }) {

    // Guarda las URLs locales (blob) de cada foto, indexadas por id de vehículo
    const [fotosUrl, setFotosUrl] = useState({});
    const { token } = useAuth();

    useEffect(() => {
        // Acumula las URLs creadas en este efecto para poder liberarlas en el cleanup
        const urlsCreadas = [];

        const descargarFotos = async () => {
            for (const vehiculo of vehiculos) {
                try {
                    // Pide la foto protegida del vehículo, enviando el JWT
                    const response = await fetch(`${API_BASE_URL}auth/vehiculo/${vehiculo.id}/foto`, {
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
                            { ...prev, [vehiculo.id]: urlLocal }
                        ))
                    }

                } catch (error) {
                    console.log("Fallo a ldescargar la foto : " + error.message)
                }
            }
        }

        if (vehiculos.length > 0) {
            descargarFotos();
        }

        // Cleanup: se ejecuta al desmontar o antes de re-ejecutar el efecto.
        // Libera la memoria de las URLs blob creadas (evita memory leaks)
        return () => {
            for (const url of urlsCreadas) {
                URL.revokeObjectURL(url);
            }
        }

    }, [vehiculos, token]); // se vuelve a ejecutar si cambia la lista o el token


    return (
        <div>
            <h2>Vehiculos Registrados</h2>
            {vehiculos.length === 0 ? (<p>No hay vehiculos registrados</p>) : (
                <ul>
                    {vehiculos.map((vehiculo) => {
                        // return explícito obligatorio: con llaves {} el map no retorna nada solo
                        return (
                            <li key={vehiculo.id}>
                                <p>Marca: {vehiculo.marca}</p>
                                <p>Modelo: {vehiculo.modelo}</p>
                                <p>Tipo: {vehiculo.mime_type}</p>
                                {
                                    // Solo muestra la imagen si ya terminó de descargarse
                                    fotosUrl[vehiculo.id] && (
                                        <img src={fotosUrl[vehiculo.id]}
                                            alt="Fotos del vehicuslo"
                                            width='50px' />
                                    )
                                }
                            </li>
                        )
                    })}
                </ul>
            )}
        </div>
    )
}
export default ListaVehiculos;