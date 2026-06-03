import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { toast } from 'react-toastify';
import api from '../../api/api';
import { addCategoria } from '../../features/categorias.slice';
import { decodificarPayloadToken } from '../../utils/auth';
import '../../styles/AddCategoria.css';

const obtenerUsuarioId = (usuario, token) => {
    const tokenPayload = decodificarPayloadToken(token);

    if (!usuario) {
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

    if (typeof usuario === 'string') {
        return (
            tokenPayload.clientId ||
            tokenPayload.clienteId ||
            tokenPayload.usuarioId ||
            tokenPayload.userId ||
            tokenPayload.id ||
            tokenPayload._id ||
            tokenPayload.sub ||
            usuario
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

const AddCategoriaForm = () => {
    const { usuario, token } = useSelector(state => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: ''
    });

    const actualizarCampo = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const nombre = formData.nombre.trim();
        const descripcion = formData.descripcion.trim();

        if (!nombre || !descripcion) {
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

            const payload = {
                nombre,
                descripcion,
                usuario: usuarioId
            };

            const respuesta = await api.post('/v1/categorias', payload);
            dispatch(addCategoria(respuesta.data?.data || respuesta.data || payload));
            toast.success('Categoria creada exitosamente');
            navigate('/dashboard/index');
        } catch (error) {
            const datosError = error.response?.data;
            const errores = datosError?.error || datosError?.errors;
            const mensaje = Array.isArray(errores) && errores.length > 0
                ? 'La posicion creada no es valida'
                : datosError?.message || 'La posicion creada no es valida';

            toast.error(mensaje);
            console.error('Error al crear categoria:', datosError || error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/dashboard/index');
    };

    return (
        <div className="add-categoria-container">
            <header className="add-categoria-header">
                <div className="add-categoria-header-content">
                    <h1 className="add-categoria-title">Crear Nueva Categoria</h1>
                    <a href="/dashboard/index" className="categoria-back-link">
                        Volver al Dashboard
                    </a>
                </div>
            </header>

            <main className="add-categoria-main">
                <div className="add-categoria-wrapper">
                    <div className="categoria-form-card">
                        <h2>Completa los datos de la categoria</h2>

                        <form onSubmit={handleSubmit}>
                            <div className="categoria-form-group">
                                <label htmlFor="nombre">Nombre:</label>
                                <input
                                    type="text"
                                    id="nombre"
                                    name="nombre"
                                    value={formData.nombre}
                                    onChange={actualizarCampo}
                                    placeholder="Ej: Defensa"
                                    disabled={loading}
                                />
                            </div>

                            <div className="categoria-form-group">
                                <label htmlFor="descripcion">Descripcion:</label>
                                <textarea
                                    id="descripcion"
                                    name="descripcion"
                                    value={formData.descripcion}
                                    onChange={actualizarCampo}
                                    placeholder="Ej: Categoria para alta admin"
                                    rows="5"
                                    disabled={loading}
                                />
                            </div>

                            <div className="categoria-form-buttons">
                                <button
                                    type="button"
                                    className="categoria-btn-cancel"
                                    onClick={handleCancel}
                                    disabled={loading}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="categoria-btn-submit"
                                    disabled={loading}
                                >
                                    {loading ? 'Creando...' : 'Crear Categoria'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AddCategoriaForm;
