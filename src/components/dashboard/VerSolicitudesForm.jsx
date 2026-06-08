import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'react-toastify';
import api from '../../api/api';
import '../../styles/VerSolicitudesAdmin.css';

const normalizarLista = (data) => {
    const listasPosibles = [
        data,
        data?.data,
        data?.solicitudes,
        data?.requests,
        data?.items,
        data?.results,
        data?.docs,
        data?.data?.solicitudes,
        data?.data?.requests,
        data?.data?.items,
        data?.data?.results,
        data?.data?.docs
    ];

    return listasPosibles.find(Array.isArray) || [];
};

const obtenerIdSolicitud = (solicitud) => {
    return solicitud?._id || solicitud?.id || solicitud?.value || '';
};

const obtenerEmailSolicitud = (solicitud) => {
    const usuario = solicitud?.usuario || solicitud?.user || solicitud?.cliente || solicitud?.client;

    if (typeof usuario === 'object' && usuario !== null) {
        return usuario.email || usuario.mail || '';
    }

    return solicitud?.email || solicitud?.mail || solicitud?.correo || '';
};

const obtenerEstadoSolicitud = (solicitud) => {
    return String(solicitud?.estado || solicitud?.status || 'pendiente').trim().toLowerCase();
};

const obtenerMensajeSolicitud = (solicitud) => {
    return solicitud?.mensaje || solicitud?.message || solicitud?.comentario || 'Sin mensaje';
};

const formatearEstado = (estado) => {
    const estados = {
        pendiente: 'Pendiente',
        aceptada: 'Aceptada',
        aceptado: 'Aceptada',
        aprobada: 'Aprobada',
        aprobado: 'Aprobada',
        rechazada: 'Rechazada',
        rechazado: 'Rechazada'
    };

    return estados[estado] || estado || 'Pendiente';
};

const obtenerSolicitudesPlanGuardadas = () => {
    try {
        return JSON.parse(localStorage.getItem('solicitudesCambioPlan') || '[]');
    } catch {
        return [];
    }
};

const guardarSolicitudesPlan = (solicitudes) => {
    localStorage.setItem('solicitudesCambioPlan', JSON.stringify(solicitudes));
};

const VerSolicitudesForm = () => {
    const navigate = useNavigate();
    const [solicitudes, setSolicitudes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actualizandoId, setActualizandoId] = useState('');

    const cargarSolicitudes = useCallback(async () => {
        setLoading(true);

        try {
            setSolicitudes(normalizarLista(obtenerSolicitudesPlanGuardadas()));
        } catch (error) {
            setSolicitudes([]);
            toast.error('Error al obtener solicitudes de cambio de plan');
            console.error('Error al obtener solicitudes:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const actualizarEstadoLocal = (solicitudId, estado) => {
        setSolicitudes(prevSolicitudes => {
            const actualizadas = prevSolicitudes.map(solicitud => (
                obtenerIdSolicitud(solicitud) === solicitudId
                    ? { ...solicitud, estado }
                    : solicitud
            ));

            guardarSolicitudesPlan(actualizadas);
            return actualizadas;
        });
    };

    const aprobarSolicitud = async (solicitud) => {
        const solicitudId = obtenerIdSolicitud(solicitud);
        const email = obtenerEmailSolicitud(solicitud);

        if (!email) {
            toast.error('La solicitud no tiene mail de usuario');
            return;
        }

        try {
            setActualizandoId(solicitudId || email);

            await api.patch('/v1/usuarios/cambiar-plan', {
                email,
                plan: 'premium'
            });

            actualizarEstadoLocal(solicitudId, 'aceptada');
            toast.success('Plan actualizado a premium');
        } catch (error) {
            toast.error('Error al aprobar la solicitud');
            console.error('Error al aprobar solicitud:', error.response?.data || error);
        } finally {
            setActualizandoId('');
        }
    };

    useEffect(() => {
        cargarSolicitudes();
    }, [cargarSolicitudes]);

    return (
        <div className="solicitudes-admin-container">
            <header className="solicitudes-admin-header">
                <div className="solicitudes-admin-header-content">
                    <h1 className="solicitudes-admin-title">Solicitudes de cambio de plan</h1>
                    <button type="button" className="solicitudes-back-link" onClick={() => navigate('/dashboard/index')}>
                        Volver al Dashboard
                    </button>
                </div>
            </header>

            <main className="solicitudes-admin-main">
                {loading ? (
                    <div className="solicitudes-state">Cargando solicitudes...</div>
                ) : solicitudes.length === 0 ? (
                    <div className="solicitudes-state">No hay solicitudes de cambio de plan.</div>
                ) : (
                    <div className="solicitudes-list">
                        {solicitudes.map((solicitud, index) => {
                            const solicitudId = obtenerIdSolicitud(solicitud);
                            const email = obtenerEmailSolicitud(solicitud);
                            const estado = obtenerEstadoSolicitud(solicitud);
                            const actualizando = actualizandoId === (solicitudId || email);
                            const pendiente = estado === 'pendiente';

                            return (
                                <article className="solicitud-card" key={solicitudId || email || index}>
                                    <div className="solicitud-card-header">
                                        <div>
                                            <span>Mail del usuario</span>
                                            <strong>{email || 'Sin mail'}</strong>
                                        </div>
                                        <span className={`solicitud-estado ${estado}`}>
                                            {formatearEstado(estado)}
                                        </span>
                                    </div>

                                    <p>{obtenerMensajeSolicitud(solicitud)}</p>

                                    <div className="solicitud-card-footer">
                                        <span>Plan solicitado: premium</span>
                                        <button
                                            type="button"
                                            onClick={() => aprobarSolicitud(solicitud)}
                                            disabled={!pendiente || actualizando}
                                        >
                                            {actualizando ? 'Actualizando...' : pendiente ? 'Aprobar' : 'Procesada'}
                                        </button>
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

export default VerSolicitudesForm;
