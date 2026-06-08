import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { cargarJugadoresPorPosicion } from '../../features/estadistica.slice';
import '../../styles/VerEstadisticas.css';
import VerEstadisticaChart from './VerEstadisticaChart';

const VerEstadisticasForm = () => {
    const dispatch = useDispatch();
    const {
        jugadoresPorPosicion,
        totalJugadores,
        totalPosiciones,
        loading,
        lastUpdated
    } = useSelector(state => state.estadistica);

    const cargarEstadisticas = useCallback(async () => {
        try {
            await dispatch(cargarJugadoresPorPosicion());
        } catch (error) {
            toast.error('Error al obtener estadisticas');
            console.error('Error al obtener estadisticas:', error.response?.data || error);
        }
    }, [dispatch]);

    useEffect(() => {
        cargarEstadisticas();

        const refrescarSiVuelveLaVentana = () => {
            if (!document.hidden) {
                cargarEstadisticas();
            }
        };

        document.addEventListener('visibilitychange', refrescarSiVuelveLaVentana);
        window.addEventListener('focus', cargarEstadisticas);
        const intervalo = window.setInterval(cargarEstadisticas, 15000);

        return () => {
            document.removeEventListener('visibilitychange', refrescarSiVuelveLaVentana);
            window.removeEventListener('focus', cargarEstadisticas);
            window.clearInterval(intervalo);
        };
    }, [cargarEstadisticas]);

    return (
        <div className="ver-estadisticas-container">
            <header className="ver-estadisticas-header">
                <div className="ver-estadisticas-header-content">
                    <h1 className="ver-estadisticas-title">Estadisticas</h1>
                    <a href="/dashboard/index" className="ver-estadisticas-back-link">
                        Volver al Dashboard
                    </a>
                </div>
            </header>

            <main className="ver-estadisticas-main">
                <div className="ver-estadisticas-toolbar">
                    <div>
                        <h2>{loading ? 'Cargando estadisticas...' : 'Jugadores por posicion'}</h2>
                        <p>Grafico generado con las posiciones actuales de la base.</p>
                    </div>
                </div>

                <section className="estadisticas-summary">
                    <div className="estadistica-card">
                        <span>Total jugadores</span>
                        <strong>{loading ? '...' : totalJugadores}</strong>
                    </div>
                    <div className="estadistica-card">
                        <span>Posiciones en base</span>
                        <strong>{loading ? '...' : totalPosiciones}</strong>
                    </div>
                    <div className="estadistica-card">
                        <span>Ultima actualizacion</span>
                        <strong className="estadistica-card-time">
                            {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : 'Sin dato'}
                        </strong>
                    </div>
                </section>

                {loading && !lastUpdated ? (
                    <div className="ver-estadisticas-state">Cargando estadisticas...</div>
                ) : (
                    <VerEstadisticaChart jugadoresPorPosicion={jugadoresPorPosicion} />
                )}
            </main>
        </div>
    );
};

export default VerEstadisticasForm;
