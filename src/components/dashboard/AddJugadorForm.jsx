import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import api from '../../api/api';
import { toast } from 'react-toastify';
import '../../styles/AddJugador.css';
import { setCategorias, setCategoriasError, setCategoriasLoading } from '../../features/categorias.slice';

const AddJugadorForm = () => {
    const { usuario } = useSelector(state => state.auth);
    const { categorias } = useSelector(state => state.categorias);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        edad: '',
        categoria: '',
        nacionalidad: '',
        imagen: null
    });

    // Obtener categorías al cargar el componente
    useEffect(() => {
        const obtenerCategorias = async () => {
            dispatch(setCategoriasLoading());
            try {
                const response = await api.get('/v1/categorias');
                dispatch(setCategorias(response.data));
            } catch (error) {
                dispatch(setCategoriasError(error.toString()));
                toast.error('Error al obtener categorías');
                console.error(error);
            }
        };
        obtenerCategorias();
    }, [dispatch]);

    // Manejar cambios en inputs de texto
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Manejar cambio de imagen
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                imagen: file
            }));

            // Mostrar preview de la imagen
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
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

            // Crear FormData para enviar con imagen
            const form = new FormData();
            form.append('nombre', formData.nombre);
            form.append('apellido', formData.apellido);
            form.append('edad', formData.edad);
            form.append('categoria', formData.categoria);
            form.append('nacionalidad', formData.nacionalidad);
            form.append('usuario', usuario._id); // ID del usuario autenticado
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
                                    onChange={handleChange}
                                    placeholder="Ej: 25"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="categoria">Categoría:</label>
                                <select
                                    id="categoria"
                                    name="categoria"
                                    value={formData.categoria}
                                    onChange={handleChange}
                                >
                                    <option value="">Selecciona una categoría</option>
                                    {categorias.map(cat => (
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
                                        <span className="icon">📸</span>
                                        <span className="text">Selecciona una imagen</span>
                                        <span className="subtext">PNG, JPG, GIF (máx. 5MB)</span>
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
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AddJugadorForm;
