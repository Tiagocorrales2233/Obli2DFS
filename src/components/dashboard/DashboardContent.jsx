import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import api from "../../api/api";
import "../../styles/DashboardContent.css";

const normalizarLista = (data, posiblesClaves = []) => {
    const listasPosibles = [
        data,
        data?.data,
        data?.items,
        data?.results,
        data?.docs,
        ...posiblesClaves.map(clave => data?.[clave]),
        ...posiblesClaves.map(clave => data?.data?.[clave])
    ];

    return listasPosibles.find(Array.isArray) || [];
};

const obtenerNombreCategoria = (categoria, index) => {
    if (typeof categoria === "string") return categoria;

    return (
        categoria?.nombre ||
        categoria?.name ||
        categoria?.label ||
        categoria?.descripcion ||
        `Categoria ${index + 1}`
    );
};

const DashboardContent = () => {
    const { usuario } = useSelector(state => state.auth);
    const navigate = useNavigate();
    const [resumen, setResumen] = useState({
        jugadores: 0,
        categorias: 0,
        categoriasLista: []
    });
    const [cargandoResumen, setCargandoResumen] = useState(true);

    const cargarResumen = useCallback(async () => {
        setCargandoResumen(true);

        try {
            const cacheBuster = Date.now();
            const [jugadoresResponse, categoriasResponse] = await Promise.all([
                api.get("/v1/jugadores", { params: { _t: cacheBuster } }),
                api.get("/v1/categorias", { params: { _t: cacheBuster } })
            ]);

            const jugadores = normalizarLista(jugadoresResponse.data, ["jugadores", "players"]);
            const categorias = normalizarLista(categoriasResponse.data, ["categorias", "posiciones", "categories"]);

            setResumen({
                jugadores: jugadores.length,
                categorias: categorias.length,
                categoriasLista: categorias
            });
        } catch (error) {
            console.error("Error al obtener resumen del dashboard:", error.response?.data || error);
            setResumen({
                jugadores: 0,
                categorias: 0,
                categoriasLista: []
            });
        } finally {
            setCargandoResumen(false);
        }
    }, []);

    useEffect(() => {
        cargarResumen();

        const refrescarSiVuelveLaVentana = () => {
            if (!document.hidden) {
                cargarResumen();
            }
        };

        document.addEventListener("visibilitychange", refrescarSiVuelveLaVentana);
        window.addEventListener("focus", cargarResumen);

        return () => {
            document.removeEventListener("visibilitychange", refrescarSiVuelveLaVentana);
            window.removeEventListener("focus", cargarResumen);
        };
    }, [cargarResumen]);

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div className="header-content">
                    <div className="logo-section"></div>
                    <div className="header-actions">
                        <div className="user-info">
                            <span className="user-email">{usuario?.email}</span>
                            <span className={`user-plan ${usuario?.plan}`}>{usuario?.plan?.toUpperCase()}</span>
                        </div>
                    </div>
                </div>
            </header>

            <section className="hero">
                <div className="hero-content">
                    <h2 className="hero-title">Bienvenido a tu Gestor de Jugadores</h2>
                    <p className="hero-description">Administra jugadores, posiciones y crea tu equipo de ensueno</p>
                </div>
            </section>

            <main className="dashboard-main">
                <section className="stats-section">
                    <div className="stat-card">
                        <div className="stat-icon">+</div>
                        <h3>Jugadores</h3>
                        <p className="stat-number">{cargandoResumen ? "..." : resumen.jugadores}</p>
                        <p className="stat-label">Total en el sistema</p>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">#</div>
                        <h3>Posiciones</h3>
                        <p className="stat-number">{cargandoResumen ? "..." : resumen.categorias}</p>
                        <p className="stat-label">Disponibles</p>
                    </div>
                </section>

                <section className="actions-section">
                    <h2>Acciones Rapidas</h2>
                    <div className="actions-grid">
                        <button className="action-btn primary" onClick={() => navigate("/agregar-jugador")}>
                            <span className="action-icon">+</span>
                            <div>
                                <h4>Agregar Jugador</h4>
                                <p>Crea un nuevo jugador en el sistema</p>
                            </div>
                        </button>
                        <button className="action-btn primary" onClick={() => navigate("/agregar-categoria")}>
                            <span className="action-icon">+</span>
                            <div>
                                <h4>Agregar Categoria</h4>
                                <p>Crea una nueva categoria en el sistema</p>
                            </div>
                        </button>
                        <button className="action-btn" onClick={() => navigate("/ver-jugadores")}>
                            <span className="action-icon">#</span>
                            <div>
                                <h4>Ver Jugadores</h4>
                                <p>Explora todos los jugadores disponibles</p>
                            </div>
                        </button>
                        <button className="action-btn" onClick={() => navigate("/ver-estadisticas")}>
                            <span className="action-icon">#</span>
                            <div>
                                <h4>Estadisticas</h4>
                                <p>Revisa los datos disponibles del sistema</p>
                            </div>
                        </button>
                    </div>
                </section>

                <section className="featured-section">
                    <div className="featured-card">
                        <div className="featured-content">
                            <h3>Posiciones en el Futbol</h3>
                            <p>Posiciones disponibles actualmente en el sistema:</p>
                            <div className="positions-grid">
                                {resumen.categoriasLista.length > 0 ? (
                                    resumen.categoriasLista.map((categoria, index) => (
                                        <span
                                            className="position-badge"
                                            key={categoria?._id || categoria?.id || categoria?.nombre || index}
                                        >
                                            {obtenerNombreCategoria(categoria, index)}
                                        </span>
                                    ))
                                ) : (
                                    <span className="position-badge">Sin posiciones creadas</span>
                                )}
                            </div>
                        </div>
                        <div className="featured-image">
                            <div className="image-placeholder">+</div>
                        </div>
                    </div>
                </section>

                <section className="info-section">
                    <div className="info-card">
                        <h3>Interfaz Moderna</h3>
                        <p>Diseno limpio y responsivo para la mejor experiencia de usuario</p>
                    </div>
                    <div className="info-card">
                        <h3>Rendimiento</h3>
                        <p>Carga rapida y actualizaciones desde la base de datos</p>
                    </div>
                    <div className="info-card">
                        <h3>Seguridad</h3>
                        <p>Tus datos estan protegidos con autenticacion JWT</p>
                    </div>
                </section>
            </main>

            <footer className="dashboard-footer">
                <p>&copy; 2026 DFS - Fantasy Football Manager. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default DashboardContent;
