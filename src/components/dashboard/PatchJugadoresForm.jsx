import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { toast } from 'react-toastify';
import api from '../../api/api';
import '../../styles/PatchJugadores.css';

const normalizarLista = (data) => {
    const listasPosibles = [
        data,
        data?.data,
        data?.jugadores,
        data?.categorias,
        data?.posiciones,
        data?.items,
        data?.results,
        data?.data?.jugadores,
        data?.data?.categorias,
        data?.data?.posiciones,
        data?.data?.items,
        data?.data?.results
    ];

    return listasPosibles.find(Array.isArray) || [];
};

const obtenerJugadorDesdeResponse = (data) => {
    if (data?.data && !Array.isArray(data.data)) return data.data;
    if (data?.jugador) return data.jugador;
    if (data?.player) return data.player;
    return data;
};

const obtenerPosicionId = (jugador) => {
    const posicion = jugador?.posicion || jugador?.categoria || jugador?.position;
    if (typeof posicion === 'object' && posicion !== null) {
        return posicion._id || posicion.id || '';
    }
    return posicion || '';
};

const PatchJugadoresForm = () => {
    const { jugadorId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [categorias, setCategorias] = useState([]);
    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        edad: '',
        posicion: '',
        nacionalidad: ''
    });

    const cargarDatos = useCallback(async () => {
        setLoading(true);

        try {
            const cacheBuster = Date.now();
            const categoriasRequest = api.get('/v1/categorias', { params: { _t: cacheBuster } });
            const jugadorRequest = api.get(`/v1/jugadores/${jugadorId}`, { params: { _t: cacheBuster } })
                .catch(async () => {
                    const response = await api.get('/v1/jugadores', { params: { _t: cacheBuster } });
                    return {
                        data: normalizarLista(response.data).find(jugador => (jugador?._id || jugador?.id) === jugadorId)
                    };
                });

            const [categoriasResponse, jugadorResponse] = await Promise.all([categoriasRequest, jugadorRequest]);
            const jugador = obtenerJugadorDesdeResponse(jugadorResponse.data);

            if (!jugador) {
                toast.error('No se encontro el jugador');
                navigate('/ver-jugadores');
                return;
            }

            setCategorias(normalizarLista(categoriasResponse.data));
            setFormData({
                nombre: jugador.nombre || jugador.name || '',
                apellido: jugador.apellido || jugador.lastName || '',
                edad: jugador.edad || jugador.age || '',
                posicion: obtenerPosicionId(jugador),
                nacionalidad: jugador.nacionalidad || jugador.country || ''
            });
        } catch (error) {
            toast.error('Error al cargar jugador');
            console.error('Error al cargar jugador:', error.response?.data || error);
        } finally {
            setLoading(false);
        }
    }, [jugadorId, navigate]);

    useEffect(() => {
        cargarDatos();
    }, [cargarDatos]);

    const actualizarCampo = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const actualizarJugador = async (e) => {
        e.preventDefault();

        if (!formData.nombre || !formData.apellido || !formData.edad || !formData.posicion || !formData.nacionalidad) {
            toast.error('Completa todos los campos');
            return;
        }

        try {
            setSaving(true);
            await api.patch(`/v1/jugadores/${jugadorId}`, {
                nombre: formData.nombre.trim(),
                apellido: formData.apellido.trim(),
                edad: Number(formData.edad),
                posicion: formData.posicion,
                nacionalidad: formData.nacionalidad.trim()
            });
            toast.success('Jugador actualizado correctamente');
            navigate('/ver-jugadores');
        } catch (error) {
            const mensaje = error.response?.data?.message || 'Error al actualizar jugador';
            toast.error(mensaje);
            console.error('Error al actualizar jugador:', error.response?.data || error);
        } finally {
            setSaving(false);
        }
    };

    const eliminarJugador = async () => {
        const confirmado = window.confirm('Seguro que quieres eliminar este jugador?');
        if (!confirmado) return;

        try {
            setSaving(true);
            await api.delete(`/v1/jugadores/${jugadorId}`);
            toast.success('Jugador eliminado correctamente');
            navigate('/ver-jugadores');
        } catch (error) {
            const mensaje = error.response?.data?.message || 'Error al eliminar jugador';
            toast.error(mensaje);
            console.error('Error al eliminar jugador:', error.response?.data || error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="patch-jugador-container">
                <main className="patch-jugador-main">
                    <div className="patch-state">Cargando jugador...</div>
                </main>
            </div>
        );
    }

    return (
        <div className="patch-jugador-container">
            <header className="patch-jugador-header">
                <div className="patch-jugador-header-content">
                    <h1 className="patch-jugador-title">Editar Jugador</h1>
                    <a href="/ver-jugadores" className="patch-jugador-link">
                        Volver a jugadores
                    </a>
                </div>
            </header>

            <main className="patch-jugador-main">
                <div className="patch-jugador-card">
                    <h2>Actualiza o elimina el jugador seleccionado</h2>

                    <form onSubmit={actualizarJugador}>
                        <div className="patch-jugador-grid">
                            <div className="patch-field">
                                <label htmlFor="nombre">Nombre</label>
                                <input
                                    id="nombre"
                                    name="nombre"
                                    value={formData.nombre}
                                    onChange={actualizarCampo}
                                    disabled={saving}
                                />
                            </div>

                            <div className="patch-field">
                                <label htmlFor="apellido">Apellido</label>
                                <input
                                    id="apellido"
                                    name="apellido"
                                    value={formData.apellido}
                                    onChange={actualizarCampo}
                                    disabled={saving}
                                />
                            </div>

                            <div className="patch-field">
                                <label htmlFor="edad">Edad</label>
                                <input
                                    id="edad"
                                    name="edad"
                                    type="number"
                                    value={formData.edad}
                                    onChange={actualizarCampo}
                                    disabled={saving}
                                />
                            </div>

                            <div className="patch-field">
                                <label htmlFor="nacionalidad">Nacionalidad</label>
                                <input
                                    id="nacionalidad"
                                    name="nacionalidad"
                                    value={formData.nacionalidad}
                                    onChange={actualizarCampo}
                                    disabled={saving}
                                />
                            </div>

                            <div className="patch-field full">
                                <label htmlFor="posicion">Posicion</label>
                                <select
                                    id="posicion"
                                    name="posicion"
                                    value={formData.posicion}
                                    onChange={actualizarCampo}
                                    disabled={saving}
                                >
                                    <option value="">Selecciona una posicion</option>
                                    {categorias.map((categoria, index) => (
                                        <option key={categoria?._id || categoria?.id || index} value={categoria?._id || categoria?.id || ''}>
                                            {categoria?.nombre || categoria?.name || categoria?.descripcion || `Categoria ${index + 1}`}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="patch-actions">
                            <button type="submit" className="patch-save" disabled={saving}>
                                {saving ? 'Guardando...' : 'Actualizar'}
                            </button>
                            <button type="button" className="patch-delete" onClick={eliminarJugador} disabled={saving}>
                                Eliminar
                            </button>
                            <button type="button" className="patch-cancel" onClick={() => navigate('/ver-jugadores')} disabled={saving}>
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default PatchJugadoresForm;
