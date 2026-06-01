import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import api from '../api/api';
import { toast } from 'react-toastify';
import '../styles/AddJugador.css';

const CATEGORIAS_FALLBACK = [
    { _id: 'arquero', nombre: 'Arquero' },
    { _id: 'defensa', nombre: 'Defensa' },
    { _id: 'lateral', nombre: 'Lateral' },
    { _id: 'libero', nombre: 'Libero' },
    { _id: 'volante', nombre: 'Volante' },
    { _id: 'pivote', nombre: 'Pivote' },
    { _id: 'mediocampista', nombre: 'Mediocampista' },
    { _id: 'centrocampista', nombre: 'Centrocampista' },
    { _id: 'carrilero', nombre: 'Carrilero' },
    { _id: 'extremo', nombre: 'Extremo' },
    { _id: 'delantero', nombre: 'Delantero' },
    { _id: 'enganche', nombre: 'Enganche' },
    { _id: 'falso-9', nombre: 'Falso 9' }
];

const normalizarCategoriasResponse = (data) => {
    const listasPosibles = [
        data,
        data?.data,
        data?.categorias,
        data?.categories,
        data?.items,
        data?.results,
        data?.data?.categorias,
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

const AddJugadorPage = () => {
    const { usuario, token } = useSelector(state => state.auth);
    const navigate = useNavigate();
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(false);
    const [cargandoCategorias, setCargandoCategorias] = useState(true);
    const [imagePreview, setImagePreview] = useState(null);
    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        edad: '',
        categoria: '',
        nacionalidad: '',
        imagen: null
    });

    // Si no hay usuario logueado, redirigir al login
    useEffect(() => {
        if (!usuario) {
            navigate('/');
        }
    }, [usuario, navigate]);

    // Obtener categorías al cargar el componente
    useEffect(() => {
        const obtenerCategorias = async () => {
            if (!token) {
                setCategorias(CATEGORIAS_FALLBACK);
                setCargandoCategorias(false);
                return;
            }

            setCargandoCategorias(true);
            try {
                const respuesta = await api.get('/v1/categorias');
                const categoriasApi = normalizarCategoriasResponse(respuesta.data);

                if (categoriasApi.length === 0) {
                    console.log('Respuesta de categorias sin lista reconocible:', respuesta.data);
                    setCategorias(CATEGORIAS_FALLBACK);
                    return;
                }

                setCategorias(categoriasApi);
            } catch (error) {
                console.log('Error al obtener categorías:', error.message);
                setCategorias(CATEGORIAS_FALLBACK);
            } finally {
                setCargandoCategorias(false);
            }
        };
        obtenerCategorias();
    }, [token]);

    // Cuando el usuario cambia un input de texto
    const actualizarCampo = (e) => {
        // Obtener el nombre del campo y el valor
        const { name, value } = e.target;
        
        // Crear copia del formulario y cambiar el campo
        const nuevoFormData = { ...formData };
        nuevoFormData[name] = value;
        setFormData(nuevoFormData);
    };

    // Cuando el usuario selecciona una imagen
    const capturarImagen = (e) => {
        // Obtener el archivo que seleccionó
        const archivo = e.target.files[0];
        
        if (archivo) {
            // Actualizar el formulario con la imagen
            const nuevoFormData = { ...formData };
            nuevoFormData.imagen = archivo;
            setFormData(nuevoFormData);

            // Crear vista previa de la imagen
            const lector = new FileReader();
            lector.onloadend = () => {
                setImagePreview(lector.result);
            };
            lector.readAsDataURL(archivo);
        }
    };

    // Enviar formulario
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validaciones básicas
        if (!formData.nombre || !formData.apellido || !formData.edad || !formData.categoria || !formData.nacionalidad) {
            toast.error('Completa todos los campos');
            return;
        }

        try {
            setLoading(true);

            if (!token) {
                const jugadoresGuardados = JSON.parse(localStorage.getItem('jugadoresLocales')) || [];
                const jugadorLocal = {
                    _id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
                    ...formData,
                    imagen: imagePreview,
                    usuario: usuario?._id || usuario?.email || usuario
                };

                localStorage.setItem('jugadoresLocales', JSON.stringify([...jugadoresGuardados, jugadorLocal]));
                toast.success('Â¡Jugador creado exitosamente!');
                navigate('/dashboard/index');
                return;
            }

            // Crear FormData para enviar con imagen
            const form = new FormData();
            form.append('nombre', formData.nombre);
            form.append('apellido', formData.apellido);
            form.append('edad', formData.edad);
            form.append('categoria', formData.categoria);
            form.append('nacionalidad', formData.nacionalidad);
            form.append('usuario', usuario._id || usuario.id || usuario.email); // ID del usuario autenticado
            if (formData.imagen) {
                form.append('imagen', formData.imagen);
            }

            // Enviar a la API
            const response = await api.post('/v1/jugadores', form, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            toast.success('¡Jugador creado exitosamente!');
            navigate('/dashboard/index'); // Redirigir al dashboard

        } catch (error) {
            const mensaje = error.response?.data?.message || 'Error al crear jugador';
            toast.error(mensaje);
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/dashboard/index');
    };

    return (
        <div className="add-jugador-container">
            {/* Header */}
            <header className="add-jugador-header">
                <div className="add-jugador-header-content">
                    <h1 className="add-jugador-title">Crear Nuevo Jugador</h1>
                    <a href="/dashboard/index" className="back-link">
                        ← Volver al Dashboard
                    </a>
                </div>
            </header>

            {/* Main Content */}
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
                                    onChange={actualizarCampo}
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
                                    onChange={actualizarCampo}
                                    placeholder="Ej: Pérez"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="edad">Edad:</label>
                                <input
                                    type="number"
                                    id="edad"
                                    name="edad"
                                    value={formData.edad}
                                    onChange={actualizarCampo}
                                    placeholder="Ej: 25"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="categoria">Posición:</label>
                                <select
                                    id="categoria"
                                    name="categoria"
                                    value={formData.categoria}
                                    onChange={actualizarCampo}
                                    disabled={cargandoCategorias}
                                >
                                    <option value="">
                                        {cargandoCategorias ? 'Cargando categoriaes...' : 'Selecciona una posición'}
                                    </option>
                                    {Array.isArray(categorias) && categorias.length > 0 && categorias.map(cat => (
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
                                    onChange={actualizarCampo}
                                    placeholder="Ej: Uruguay"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="imagen">Foto del Jugador:</label>
                                <div className="image-upload-area">
                                    <label htmlFor="imagen" className="image-upload-label">
                                        <span className="icon">📸</span>
                                        <span className="text">Selecciona una imagen</span>
                                        <span className="subtext">PNG, JPG, GIF (máx. 5MB)</span>
                                    </label>
                                    <input
                                        type="file"
                                        id="imagen"
                                        accept="image/*"
                                        onChange={capturarImagen}
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
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AddJugadorPage;
