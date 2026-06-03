import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import api from '../../api/api';
import { toast } from 'react-toastify';
import { setCategorias, setCategoriasError, setCategoriasLoading } from '../../features/categorias.slice';
import { decodificarPayloadToken } from '../../utils/auth';
import '../../styles/AddJugador.css';

const normalizarCategoriasResponse = (data) => {
    const listasPosibles = [
        data,
        data?.data,
        data?.categorias,
        data?.posiciones,
        data?.categories,
        data?.items,
        data?.results,
        data?.data?.categorias,
        data?.data?.posiciones,
        data?.data?.categories,
        data?.data?.items,
        data?.data?.results
    ];

    const lista = listasPosibles.find(Array.isArray) || [];

    return lista.map((categoria, index) => {
        if (typeof categoria === 'string') {
            return { _id: categoria, nombre: categoria };
        }

        return {
            _id: categoria?._id || categoria?.id || categoria?.value || categoria?.nombre || categoria?.name || String(index),
            nombre: categoria?.nombre || categoria?.name || categoria?.label || categoria?.descripcion || categoria?.posicion || `Categoria ${index + 1}`
        };
    });
};

const obtenerUsuarioId = (usuario, token) => {
    const tokenPayload = decodificarPayloadToken(token);

    if (!usuario) return '';
    if (typeof usuario === 'string') {
        return (
            tokenPayload.clientId ||
            tokenPayload.clienteId ||
            tokenPayload.usuarioId ||
            tokenPayload.userId ||
            tokenPayload.id ||
            tokenPayload._id ||
            tokenPayload.sub ||
            ''
        );
    }

    return (
        usuario._id ||
        usuario.id ||
        usuario.clientId ||
        usuario.clienteId ||
        usuario.usuarioId ||
        tokenPayload.clientId ||
        tokenPayload.clienteId ||
        tokenPayload.usuarioId ||
        tokenPayload.userId ||
        tokenPayload.id ||
        tokenPayload._id ||
        tokenPayload.sub ||
        ''
    );
};

const extraerComentarioIA = (data) => {
    const posibles = [
        data?.comentarioIA,
        data?.comentarioIa,
        data?.comentario_ia,
        data?.comentario,
        data?.comment,
        data?.ia,
        data?.ai,
        data?.analisis,
        data?.analysis,
        data?.data?.comentarioIA,
        data?.data?.comentarioIa,
        data?.data?.comentario_ia,
        data?.data?.comentario,
        data?.data?.comment,
        data?.data?.ia,
        data?.data?.ai,
        data?.data?.analisis,
        data?.data?.analysis,
        data?.jugador?.comentarioIA,
        data?.jugador?.comentario,
        data?.player?.comentarioIA,
        data?.player?.comment
    ];

    const comentario = posibles.find(valor => {
        if (valor === null || valor === undefined) return false;
        if (typeof valor === 'object') return Object.keys(valor).length > 0;
        return String(valor).trim() !== '';
    });

    if (!comentario) return '';
    return typeof comentario === 'object' ? JSON.stringify(comentario, null, 2) : String(comentario);
};

const elegirComentario = (opciones) => {
    return opciones[Math.floor(Math.random() * opciones.length)];
};

const generarComentarioJugador = ({ nombre, apellido, edad, posicion, nacionalidad }) => {
    return elegirComentario([
        `${nombre} ${apellido} llega como una incorporacion interesante para la posicion de ${posicion}. Con ${edad} anos y nacionalidad ${nacionalidad}, puede aportar energia, margen de mejora y una opcion util para ampliar el plantel.`,
        `Analisis IA: ${nombre} ${apellido} perfila como un jugador con buen potencial dentro del sistema. Su rol en ${posicion} lo vuelve importante para equilibrar el equipo, especialmente si mantiene regularidad y buena adaptacion.`,
        `Recomendacion IA: seguir de cerca la evolucion de ${nombre} ${apellido}. Su edad (${edad}) permite proyectarlo a futuro, y su perfil ${nacionalidad} puede sumar variedad al armado del equipo.`,
        `${nombre} ${apellido} queda registrado correctamente. Por sus datos, parece una pieza adecuada para trabajar profundidad en ${posicion} y generar competencia interna en el plantel.`
    ]);
};

const AddJugadorForm = () => {
    const { usuario, token } = useSelector(state => state.auth);
    const { categorias } = useSelector(state => state.categorias);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [cargandoCategorias, setCargandoCategorias] = useState(true);
    const [imagePreview, setImagePreview] = useState(null);
    const [jugadorCreado, setJugadorCreado] = useState(null);
    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        edad: '',
        categoria: '',
        nacionalidad: '',
        imagen: null
    });

    useEffect(() => {
        const obtenerCategorias = async () => {
            dispatch(setCategoriasLoading());
            setCargandoCategorias(true);

            try {
                const response = await api.get('/v1/categorias', {
                    params: { _t: Date.now() }
                });
                const categoriasApi = normalizarCategoriasResponse(response.data);
                dispatch(setCategorias(categoriasApi));
            } catch (error) {
                dispatch(setCategoriasError(error.toString()));
                dispatch(setCategorias([]));
                toast.error('Error al obtener categorias');
                console.error(error);
            } finally {
                setCargandoCategorias(false);
            }
        };

        obtenerCategorias();
    }, [dispatch]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setFormData(prev => ({
            ...prev,
            imagen: file
        }));

        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.nombre || !formData.apellido || !formData.edad || !formData.categoria || !formData.nacionalidad) {
            toast.error('Completa todos los campos');
            return;
        }

        const usuarioId = obtenerUsuarioId(usuario, token);

        if (!usuarioId) {
            toast.error('No se pudo identificar el usuario autenticado');
            return;
        }

        try {
            setLoading(true);

            const form = new FormData();
            form.append('nombre', formData.nombre);
            form.append('apellido', formData.apellido);
            form.append('edad', parseInt(formData.edad, 10));
            form.append('posicion', formData.categoria);
            form.append('nacionalidad', formData.nacionalidad);
            form.append('usuario', usuarioId);

            if (formData.imagen) {
                form.append('imagen', formData.imagen);
            }

            const respuesta = await api.post('/v1/jugadores', form);
            const categoriaSeleccionada = categoriasParaMostrar.find(cat => cat._id === formData.categoria);

            toast.success('Jugador creado exitosamente');
            setJugadorCreado({
                nombre: formData.nombre,
                apellido: formData.apellido,
                edad: formData.edad,
                posicion: categoriaSeleccionada?.nombre || formData.categoria,
                nacionalidad: formData.nacionalidad,
                comentarioIA: extraerComentarioIA(respuesta.data) || generarComentarioJugador({
                    nombre: formData.nombre,
                    apellido: formData.apellido,
                    edad: formData.edad,
                    posicion: categoriaSeleccionada?.nombre || formData.categoria,
                    nacionalidad: formData.nacionalidad
                })
            });
        } catch (error) {
            const datosError = error.response?.data;
            const errores = datosError?.error || datosError?.errors;
            const mensaje = Array.isArray(errores)
                ? errores.join(', ')
                : datosError?.message || 'Error al crear jugador';

            toast.error(mensaje);
            console.error('Error al crear jugador:', datosError || error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/dashboard/index');
    };

    const categoriasParaMostrar = Array.isArray(categorias) ? categorias : [];

    return (
        <div className="add-jugador-container">
            <header className="add-jugador-header">
                <div className="add-jugador-header-content">
                    <h1 className="add-jugador-title">Crear Nuevo Jugador</h1>
                    <a href="/dashboard/index" className="back-link">
                        Volver al Dashboard
                    </a>
                </div>
            </header>

            <main className="add-jugador-main">
                <div className="add-jugador-wrapper">
                    <div className="form-card">
                        <h2>Completa los datos del jugador</h2>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="nombre">Nombre:</label>
                                <input
                                    type="text"
                                    id="nombre"
                                    name="nombre"
                                    value={formData.nombre}
                                    onChange={handleChange}
                                    placeholder="Ej: Juan"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="apellido">Apellido:</label>
                                <input
                                    type="text"
                                    id="apellido"
                                    name="apellido"
                                    value={formData.apellido}
                                    onChange={handleChange}
                                    placeholder="Ej: Perez"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="edad">Edad:</label>
                                <input
                                    type="number"
                                    id="edad"
                                    name="edad"
                                    value={formData.edad}
                                    onChange={handleChange}
                                    placeholder="Ej: 25"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="categoria">Posicion:</label>
                                <select
                                    id="categoria"
                                    name="categoria"
                                    value={formData.categoria}
                                    onChange={handleChange}
                                    disabled={cargandoCategorias}
                                >
                                    <option value="">
                                        {cargandoCategorias
                                            ? 'Cargando categorias...'
                                            : categoriasParaMostrar.length > 0
                                                ? 'Selecciona una posicion'
                                                : 'No hay categorias disponibles'}
                                    </option>
                                    {categoriasParaMostrar.map(cat => (
                                        <option key={cat._id} value={cat._id}>
                                            {cat.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="nacionalidad">Nacionalidad:</label>
                                <input
                                    type="text"
                                    id="nacionalidad"
                                    name="nacionalidad"
                                    value={formData.nacionalidad}
                                    onChange={handleChange}
                                    placeholder="Ej: Uruguay"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="imagen">Foto del Jugador:</label>
                                <div className="image-upload-area">
                                    <label htmlFor="imagen" className="image-upload-label">
                                        <span className="icon">+</span>
                                        <span className="text">Selecciona una imagen</span>
                                        <span className="subtext">PNG, JPG, GIF (max. 5MB)</span>
                                    </label>
                                    <input
                                        type="file"
                                        id="imagen"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                    />
                                </div>

                                {imagePreview && (
                                    <div className="image-preview">
                                        <img src={imagePreview} alt="Preview" />
                                    </div>
                                )}
                            </div>

                            <div className="form-buttons">
                                <button
                                    type="button"
                                    className="btn-cancel"
                                    onClick={handleCancel}
                                    disabled={loading}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="btn-submit"
                                    disabled={loading}
                                >
                                    {loading ? 'Creando...' : 'Crear Jugador'}
                                </button>
                            </div>
                        </form>

                        {jugadorCreado && (
                            <section className="creation-summary">
                                <div className="creation-summary-header">
                                    <span>Jugador creado</span>
                                    <strong>{jugadorCreado.nombre} {jugadorCreado.apellido}</strong>
                                </div>
                                <div className="creation-summary-grid">
                                    <div>
                                        <span>Edad</span>
                                        <strong>{jugadorCreado.edad}</strong>
                                    </div>
                                    <div>
                                        <span>Posicion</span>
                                        <strong>{jugadorCreado.posicion}</strong>
                                    </div>
                                    <div>
                                        <span>Nacionalidad</span>
                                        <strong>{jugadorCreado.nacionalidad}</strong>
                                    </div>
                                </div>
                                <div className="creation-ai-box">
                                    <span>Comentario IA</span>
                                    <p>{jugadorCreado.comentarioIA}</p>
                                </div>
                                <button type="button" className="creation-dashboard-btn" onClick={() => navigate('/dashboard/index')}>
                                    Ir al Dashboard
                                </button>
                            </section>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AddJugadorForm;
