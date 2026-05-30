import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import "../../styles/DashboardContent.css";

const DashboardContent = () => {
    const navigate = useNavigate();
    const { usuario } = useSelector(state => state.auth);

    const handleLogout = () => {
        localStorage.removeItem("usuario");
        navigate("/");
    };

    return (
        <div className="dashboard-container">
            {/* Header */}
            <header className="dashboard-header">
                <div className="header-content">
                    <div className="logo-section">
                        <h1 className="logo">⚽ DFS</h1>
                        <p className="subtitle">Fantasy Football Manager</p>
                    </div>
                    <div className="header-actions">
                        <div className="user-info">
                            <span className="user-email">{usuario?.email}</span>
                            <span className={`user-plan ${usuario?.plan}`}>{usuario?.plan?.toUpperCase()}</span>
                        </div>
                        <button className="logout-btn" onClick={handleLogout}>
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="hero">
                <div className="hero-content">
                    <h2 className="hero-title">Bienvenido a tu Gestor de Jugadores</h2>
                    <p className="hero-description">Administra jugadores, posiciones y crea tu equipo de ensueño</p>
                </div>
            </section>

            {/* Main Grid */}
            <main className="dashboard-main">
                {/* Stats Cards */}
                <section className="stats-section">
                    <div className="stat-card">
                        <div className="stat-icon">👥</div>
                        <h3>Jugadores</h3>
                        <p className="stat-number">0</p>
                        <p className="stat-label">Total en el sistema</p>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">⚙️</div>
                        <h3>Posiciones</h3>
                        <p className="stat-number">14</p>
                        <p className="stat-label">Disponibles</p>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">🎯</div>
                        <h3>Tu Equipo</h3>
                        <p className="stat-number">0</p>
                        <p className="stat-label">Jugadores seleccionados</p>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">🏆</div>
                        <h3>Puntos</h3>
                        <p className="stat-number">0</p>
                        <p className="stat-label">Tu puntuación total</p>
                    </div>
                </section>

                {/* Quick Actions */}
                <section className="actions-section">
                    <h2>Acciones Rápidas</h2>
                    <div className="actions-grid">
                        <button className="action-btn primary">
                            <span className="action-icon">➕</span>
                            <div>
                                <h4>Agregar Jugador</h4>
                                <p>Crea un nuevo jugador en el sistema</p>
                            </div>
                        </button>
                        <button className="action-btn">
                            <span className="action-icon">📋</span>
                            <div>
                                <h4>Ver Jugadores</h4>
                                <p>Explora todos los jugadores disponibles</p>
                            </div>
                        </button>
                        <button className="action-btn">
                            <span className="action-icon">🏅</span>
                            <div>
                                <h4>Mis Equipos</h4>
                                <p>Gestiona tus equipos y formaciones</p>
                            </div>
                        </button>
                        <button className="action-btn">
                            <span className="action-icon">📊</span>
                            <div>
                                <h4>Estadísticas</h4>
                                <p>Revisa tu desempeño y análisis</p>
                            </div>
                        </button>
                    </div>
                </section>

                {/* Featured Section */}
                <section className="featured-section">
                    <div className="featured-card">
                        <div className="featured-content">
                            <h3>Posiciones en el Fútbol</h3>
                            <p>Conoce las 14 posiciones diferentes disponibles en nuestro sistema:</p>
                            <div className="positions-grid">
                                <span className="position-badge">Arquero</span>
                                <span className="position-badge">Defensa</span>
                                <span className="position-badge">Lateral</span>
                                <span className="position-badge">Libero</span>
                                <span className="position-badge">Volante</span>
                                <span className="position-badge">Pivote</span>
                                <span className="position-badge">Mediocampista</span>
                                <span className="position-badge">Centrocampista</span>
                                <span className="position-badge">Carrilero</span>
                                <span className="position-badge">Extremo</span>
                                <span className="position-badge">Delantero</span>
                                <span className="position-badge">Enganche</span>
                                <span className="position-badge">Falso 9</span>
                            </div>
                        </div>
                        <div className="featured-image">
                            <div className="image-placeholder">
                                ⚽
                            </div>
                        </div>
                    </div>
                </section>

                {/* Info Cards */}
                <section className="info-section">
                    <div className="info-card">
                        <h3>🎨 Interfaz Moderna</h3>
                        <p>Diseño limpio y responsivo para la mejor experiencia de usuario</p>
                    </div>
                    <div className="info-card">
                        <h3>⚡ Rendimiento</h3>
                        <p>Cargue rápido y actualizaciones en tiempo real</p>
                    </div>
                    <div className="info-card">
                        <h3>🔒 Seguridad</h3>
                        <p>Tus datos están protegidos con autenticación JWT</p>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="dashboard-footer">
                <p>&copy; 2026 DFS - Fantasy Football Manager. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default DashboardContent;
