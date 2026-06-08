import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'react-toastify';
import api from '../../api/api';
import '../../styles/VerJugadores.css';
import '../../styles/FiltroJugadores.css';

const normalizarLista = (data) => {
    const listasPosibles = [
        data,
        data?.data,
        data?.jugadores,
        data?.categorias,
        data?.posiciones,
        data?.players,
        data?.categories,
        data?.items,
        data?.results,
        data?.docs,
        data?.data?.jugadores,
        data?.data?.categorias,
        data?.data?.posiciones,
        data?.data?.players,
        data?.data?.categories,
        data?.data?.items,
        data?.data?.results,
        data?.data?.docs
    ];

    return listasPosibles.find(Array.isArray) || [];
};

const obtenerTexto = (...valores) => {
    const valor = valores.find(item => item !== undefined && item !== null && String(item).trim() !== '');
    return valor === undefined ? 'Sin dato' : String(valor);
};

const pareceObjectId = (valor) => {
    return typeof valor === 'string' && /^[a-f\d]{24}$/i.test(valor);
};

const obtenerId = (item) => {
    if (typeof item === 'string') return item;
    return item?._id || item?.id || item?.value || '';
};

const obtenerNombreCategoria = (categoria) => {
    if (typeof categoria === 'string') return categoria;
    return obtenerTexto(categoria?.nombre, categoria?.name, categoria?.label, categoria?.descripcion);
};

const crearMapaCategorias = (categorias) => {
    return categorias.reduce((mapa, categoria) => {
        const id = obtenerId(categoria);
        if (id) {
            mapa[id] = obtenerNombreCategoria(categoria);
        }
        return mapa;
    }, {});
};

const obtenerPosicion = (jugador, categoriasPorId) => {
    const posicion = jugador?.posicion || jugador?.categoria || jugador?.position;

    if (typeof posicion === 'object' && posicion !== null) {
        return obtenerTexto(posicion.nombre, posicion.name, posicion.descripcion);
    }

    if (pareceObjectId(posicion)) {
        return categoriasPorId[posicion] || 'Sin dato';
    }

    return obtenerTexto(posicion);
};

const obtenerClub = (jugador) => {
    const club = jugador?.club || jugador?.equipo || jugador?.team || jugador?.institucion;

    if (typeof club === 'object' && club !== null) {
        return obtenerTexto(club.nombre, club.name, club.descripcion);
    }

    return pareceObjectId(club) ? 'Club sin dato' : obtenerTexto(club);
};

const obtenerImagen = (jugador) => {
    return jugador?.imagen || jugador?.image || jugador?.foto || jugador?.avatar || '';
};

const VerJugadoresForm = () => {
    const navigate = useNavigate();
    const [jugadores, setJugadores] = useState([]);
    const [categoriasPorId, setCategoriasPorId] = useState({});
    const [loading, setLoading] = useState(true);
    const [minEdad, setMinEdad] = useState('');
    const [jugadoresFiltrados, setJugadoresFiltrados] = useState([]);

    const cargarJugadores = useCallback(async () => {
        setLoading(true);

        try {
            const cacheBuster = Date.now();
            const [jugadoresResponse, categoriasResponse] = await Promise.all([
                api.get('/v1/jugadores', {
                    params: { _t: cacheBuster }
                }),
                api.get('/v1/categorias', {
                    params: { _t: cacheBuster }
                })
            ]);

            const categorias = normalizarLista(categoriasResponse.data);
            setCategoriasPorId(crearMapaCategorias(categorias));
            const listaJugadores = normalizarLista(jugadoresResponse.data);
            setJugadores(listaJugadores);
            setJugadoresFiltrados(listaJugadores); 
        } catch (error) {
            setJugadores([]);
            setJugadoresFiltrados([]);
            setCategoriasPorId({});
            toast.error('Error al obtener jugadores');
            console.error('Error al obtener jugadores:', error.response?.data || error);
        } finally {
            setLoading(false);
        }
    }, []);

    const eliminarJugador = async (jugadorId) => {
        const confirmado = window.confirm('Seguro que quieres eliminar este jugador?');
        if (!confirmado) return;

        try {
            await api.delete(`/v1/jugadores/${jugadorId}`);
            toast.success('Jugador eliminado correctamente');
            cargarJugadores();
        } catch (error) {
            toast.error('Error al eliminar jugador');
            console.error('Error al eliminar jugador:', error.response?.data || error);
        }
    };
    
    const handleFiltrarPorEdad = () => {
        const edadMinima = parseInt(minEdad, 10);
        if (isNaN(edadMinima)) {
            setJugadoresFiltrados(jugadores);
            return;
        }
        const filtrados = jugadores.filter(jugador => {
            const edad = parseInt(obtenerTexto(jugador?.edad, jugador?.age), 10);
            return !isNaN(edad) && edad >= edadMinima;
        });
        setJugadoresFiltrados(filtrados);
    };

    const handleLimpiarFiltro = () => {
        setMinEdad('');
        setJugadoresFiltrados(jugadores);
    };

    useEffect(() => {
        cargarJugadores();

        const refrescarSiVuelveLaVentana = () => {
            if (!document.hidden) {
                cargarJugadores();
            }
        };

        document.addEventListener('visibilitychange', refrescarSiVuelveLaVentana);
        window.addEventListener('focus', cargarJugadores);

        return () => {
            document.removeEventListener('visibilitychange', refrescarSiVuelveLaVentana);
            window.removeEventListener('focus', cargarJugadores);
        };
    }, [cargarJugadores]);

    return (
        <div className="ver-jugadores-container">
            <header className="ver-jugadores-header">
                <div className="ver-jugadores-header-content">
                    <h1 className="ver-jugadores-title">Jugadores Disponibles</h1>
                    <a href="/dashboard/index" className="ver-jugadores-back-link">
                        Volver al Dashboard
                    </a>
                </div>
            </header>

            <main className="ver-jugadores-main">
                <div className="ver-jugadores-toolbar">
                    <div>
                        <h2>{loading ? 'Cargando jugadores...' : `${jugadoresFiltrados.length} jugadores encontrados`}</h2>
                        <p>Lista actualizada directamente desde la base de datos.</p>
                    </div>
                    <div className="filtro-container">
                        <input
                            type="number"
                            placeholder="Edad mínima"
                            value={minEdad}
                            onChange={(e) => setMinEdad(e.target.value)}
                            className="filtro-input"
                        />
                        <button onClick={handleFiltrarPorEdad} className="filtro-button">Filtrar</button>
                        <button onClick={handleLimpiarFiltro} className="filtro-button">Limpiar</button>
                    </div>
                </div>

                {loading ? (
                    <div className="ver-jugadores-state">Cargando jugadores...</div>
                ) : jugadoresFiltrados.length === 0 ? (
                    <div className="ver-jugadores-state">No hay jugadores que coincidan con el filtro.</div>
                ) : (
                    <div className="jugadores-grid">
                        {jugadoresFiltrados.map((jugador, index) => {
                            const jugadorId = jugador?._id || jugador?.id;
                            const nombre = obtenerTexto(jugador?.nombre, jugador?.name);
                            const apellido = obtenerTexto(jugador?.apellido, jugador?.lastName);
                            const imagen = obtenerImagen(jugador);
                            const club = obtenerClub(jugador);
                            const posicion = obtenerPosicion(jugador, categoriasPorId);
                            const iniciales = `${nombre[0] || ''}${apellido[0] || ''}`.toUpperCase();

                            return (
                                <article className="jugador-card" key={jugadorId || index}>
                                    <div className="jugador-avatar">
                                        {imagen ? <img src={imagen} alt={`${nombre} ${apellido}`} /> : iniciales}
                                    </div>
                                    <div className="jugador-info">
                                        <h3>{nombre} {apellido}</h3>
                                        <p className="jugador-subtitle">{club === 'Sin dato' ? 'Club sin dato' : club}</p>
                                        <div className="jugador-details">
                                            <div className="jugador-detail">
                                                <span>Posicion</span>
                                                <strong>{posicion}</strong>
                                            </div>
                                            <div className="jugador-detail">
                                                <span>Edad</span>
                                                <strong>{obtenerTexto(jugador?.edad, jugador?.age)}</strong>
                                            </div>
                                            <div className="jugador-detail">
                                                <span>Nacionalidad</span>
                                                <strong>{obtenerTexto(jugador?.nacionalidad, jugador?.country)}</strong>
                                            </div>
                                        </div>
                                        {jugadorId && (
                                            <div className="jugador-actions">
                                                <button
                                                    type="button"
                                                    className="jugador-action editar"
                                                    onClick={() => navigate(`/jugadores/${jugadorId}/editar`)}
                                                >
                                                    Actualizar
                                                </button>
                                                <button
                                                    type="button"
                                                    className="jugador-action eliminar"
                                                    onClick={() => eliminarJugador(jugadorId)}
                                                >
                                                    Eliminar
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
};

export default VerJugadoresForm;
