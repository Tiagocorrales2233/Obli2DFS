import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { toast } from 'react-toastify';
import api from '../../api/api';
import '../../styles/PatchJugadores.css';

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

const obtenerEmailSolicitud = (solicitud) => {
    const usuario = solicitud?.usuario || solicitud?.user || solicitud?.cliente || solicitud?.client;

    if (typeof usuario === 'object' && usuario !== null) {
        return usuario.email || usuario.mail || '';
    }

    return solicitud?.email || solicitud?.mail || solicitud?.correo || '';
};

const obtenerUsuarioIdSolicitud = (solicitud) => {
    const usuario = solicitud?.usuario || solicitud?.user || solicitud?.cliente || solicitud?.client;

    if (typeof usuario === 'object' && usuario !== null) {
        return usuario._id || usuario.id || usuario.usuarioId || usuario.userId || usuario.clienteId || '';
    }

    return usuario || solicitud?.usuarioId || solicitud?.userId || solicitud?.clienteId || solicitud?.clientId || '';
};

const obtenerMensajeError = (error) => {
    return error.response?.data?.error || error.response?.data?.message || error.message || 'Error al actualizar plan';
};

const PatchPlanUsuarioForm = () => {
    const { solicitudId } = useParams();
    const navigate = useNavigate();
    const [saving, setSaving] = useState(false);
    const solicitudes = useMemo(() => obtenerSolicitudesPlanGuardadas(), []);
    const solicitud = solicitudes.find(item => String(item.id || item._id) === decodeURIComponent(solicitudId || ''));
    const [plan, setPlan] = useState(solicitud?.planSolicitado || 'premium');
    const email = obtenerEmailSolicitud(solicitud);
    const usuarioId = obtenerUsuarioIdSolicitud(solicitud);

    const marcarSolicitud = (estado) => {
        const actualizadas = solicitudes.map(item => (
            String(item.id || item._id) === String(solicitud?.id || solicitud?._id)
                ? { ...item, estado, planSolicitado: plan }
                : item
        ));

        guardarSolicitudesPlan(actualizadas);
    };

    const actualizarPlan = async (e) => {
        e.preventDefault();

        if (!email) {
            toast.error('La solicitud no tiene mail de usuario');
            return;
        }

        try {
            setSaving(true);

            await api.patch('/v1/usuarios/cambiar-plan', {
                id: usuarioId,
                _id: usuarioId,
                usuario: usuarioId,
                usuarioId,
                userId: usuarioId,
                clienteId: usuarioId,
                email,
                plan,
                nuevoPlan: plan,
                planSolicitado: plan
            });

            marcarSolicitud('aceptada');
            toast.success('Plan actualizado correctamente');
            navigate('/admin/solicitudes');
        } catch (error) {
            const mensaje = obtenerMensajeError(error);
            toast.error(mensaje);
            console.error('Error al actualizar plan:', error.response?.data || error);
        } finally {
            setSaving(false);
        }
    };

    if (!solicitud) {
        return (
            <div className="patch-jugador-container">
                <main className="patch-jugador-main">
                    <div className="patch-state">No se encontro la solicitud.</div>
                </main>
            </div>
        );
    }

    return (
        <div className="patch-jugador-container">
            <header className="patch-jugador-header">
                <div className="patch-jugador-header-content">
                    <h1 className="patch-jugador-title">Editar Plan</h1>
                    <button type="button" className="patch-jugador-link" onClick={() => navigate('/admin/solicitudes')}>
                        Volver a solicitudes
                    </button>
                </div>
            </header>
            
            <main className="patch-jugador-main">
                <div className="patch-jugador-card">
                    <h2>Actualiza el plan del usuario seleccionado</h2>

                    <form onSubmit={actualizarPlan}>
                        <div className="patch-jugador-grid">
                            <div className="patch-field full">
                                <label htmlFor="email">Mail</label>
                                <input id="email" value={email} disabled />
                            </div>

                            <div className="patch-field full">
                                <label htmlFor="usuarioId">Id del usuario</label>
                                <input id="usuarioId" value={usuarioId || 'Sin id guardado'} disabled />
                            </div>

                            <div className="patch-field full">
                                <label htmlFor="plan">Plan</label>
                                <select
                                    id="plan"
                                    value={plan}
                                    onChange={(e) => setPlan(e.target.value)}
                                    disabled={saving}
                                >
                                    <option value="plus">Plus</option>
                                    <option value="premium">Premium</option>
                                </select>
                            </div>
                        </div>

                        <div className="patch-actions">
                            <button type="submit" className="patch-save" disabled={saving}>
                                {saving ? 'Guardando...' : 'Actualizar plan'}
                            </button>
                            <button type="button" className="patch-cancel" onClick={() => navigate('/admin/solicitudes')} disabled={saving}>
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default PatchPlanUsuarioForm;
