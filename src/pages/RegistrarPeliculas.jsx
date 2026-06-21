

function RegistrarPeliculas() {
    return (
        <div>
            <div>
            <h1>Registrar pelicula</h1>
        </div>

        <form className="formulario-pelicula">
            <div className="campo">
                <label htmlFor="titulo">Título</label>
                <input
                    type="text"
                    id="titulo"
                    name="titulo"
                    placeholder="Ej: Matrix"
                />
            </div>

            <div className="campo">
                <label htmlFor="genero">Género</label>
                <select id="genero" name="genero" defaultValue="">
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
                />
            </div>

            <div className="campo">
                <label htmlFor="foto">Foto / Póster</label>
                <input
                    type="file"
                    id="foto"
                    name="foto"
                    accept="image/*"
                />
            </div>

            <button type="submit">Guardar Película</button>
        </form>
        </div>
        
    )
}

export default RegistrarPeliculas;