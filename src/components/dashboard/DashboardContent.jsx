import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import api from "../../api/api";
import { deleteCategoria } from "../../features/categorias.slice";
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

const obtenerIdCategoria = (categoria) => {
    if (typeof categoria === "string") return categoria;
    return categoria?._id || categoria?.id || categoria?.value || "";
};

const obtenerTexto = (...valores) => {
    const valor = valores.find(item => item !== undefined && item !== null && String(item).trim() !== "");
    return valor !== undefined && valor !== null ? String(valor).trim() : "Sin dato";
};

const crearMapaCategorias = (categorias) => (
    categorias.reduce((mapa, categoria, index) => {
        const id = obtenerIdCategoria(categoria);
        if (id) {
            mapa[id] = obtenerNombreCategoria(categoria, index);
        }
        return mapa;
    }, {})
);

const pareceObjectId = (valor) => /^[a-f\d]{24}$/i.test(String(valor || ""));

const obtenerNombreJugador = (jugador, fallback = "Jugador") => {
    const nombre = String(jugador?.nombre || jugador?.name || "").trim();
    const apellido = String(jugador?.apellido || jugador?.lastName || "").trim();
    const nombreCompleto = `${nombre} ${apellido}`.trim();
    return nombreCompleto || fallback;
};

const obtenerPosicionJugador = (jugador, categoriasPorId = {}) => {
    const posicion = jugador?.posicion || jugador?.categoria || jugador?.position;

    if (typeof posicion === "object" && posicion !== null) {
        return obtenerTexto(posicion.nombre, posicion.name, posicion.label, posicion.descripcion);
    }

    if (pareceObjectId(posicion)) {
        return categoriasPorId[posicion] || "Sin posicion";
    }

    return obtenerTexto(posicion, "Sin posicion");
};

const obtenerPlanUsuario = (usuario) => String(usuario?.plan || "").trim().toLowerCase();

const puedeUsarChatbot = (usuario) => ["plus", "premium"].includes(obtenerPlanUsuario(usuario));

const esAdmin = (usuario) => {
    const rol = String(usuario?.rol || usuario?.role || "").trim().toLowerCase();
    return rol === "admin" || rol === "administrador";
};

const crearRespuestaChatbot = ({ pregunta, jugadores, categoriasPorId }) => {
    const consulta = pregunta.trim().toLowerCase();

    if (consulta.includes("gracias") || consulta.includes("muchas gracias") || consulta.includes("te agradezco")) {
        return "Gracias a vos. Si necesitas algun dato de algun jugador mas, no dudes en preguntar.";
    }

    if (jugadores.length === 0) {
        return "Todavia no hay jugadores cargados en la base. Cuando agregues algunos, puedo darte analisis generales sobre ellos.";
    }

    const jugadorMencionado = jugadores.find(jugador => (
        obtenerNombreJugador(jugador, "").toLowerCase().split(" ").some(parte => parte && consulta.includes(parte))
    ));

    const jugador = jugadorMencionado || jugadores[Math.floor(Math.random() * jugadores.length)];
    const nombre = obtenerNombreJugador(jugador);
    const posicion = obtenerPosicionJugador(jugador, categoriasPorId);
    const edad = obtenerTexto(jugador?.edad, jugador?.age);
    const nacionalidad = obtenerTexto(jugador?.nacionalidad, jugador?.country);

    if (consulta.includes("dato curioso") || consulta.includes("curiosidad") || consulta.includes("algo curioso")) {
        const datosCuriosos = [
            `${nombre} suele quedarse practicando remates despues de cada entrenamiento para mejorar su definicion.`,
            `Dato curioso: ${nombre} tiene una cabala antes de jugar y siempre revisa dos veces sus botines antes de salir a la cancha.`,
            `Una curiosidad sobre ${nombre}: en los partidos internos le dicen "el estratega" porque siempre intenta ordenar al equipo desde su posicion de ${posicion}.`,
            `${nombre} aparentemente empezo jugando en otra posicion, pero termino destacandose como ${posicion} por su lectura del juego.`
        ];

        return datosCuriosos[Math.floor(Math.random() * datosCuriosos.length)];
    }

    if (consulta.includes("mejor") || consulta.includes("recomenda") || consulta.includes("destaca")) {
        return `${nombre} podria ser una buena opcion para destacar. Segun sus datos, encaja como ${posicion} y tiene perfil para aportar equilibrio al equipo.`;
    }

    if (consulta.includes("edad") || consulta.includes("joven") || consulta.includes("viejo")) {
        return `${nombre} figura con edad ${edad}. Parece un jugador con margen para adaptarse y sostener rendimiento si recibe continuidad.`;
    }

    if (consulta.includes("posicion") || consulta.includes("puesto") || consulta.includes("rol")) {
        return `${nombre} esta asociado a la posicion ${posicion}. Para el plantel, podria servir como una pieza util para ordenar esa zona del campo.`;
    }

    if (consulta.includes("nacionalidad") || consulta.includes("pais")) {
        return `${nombre} aparece con nacionalidad ${nacionalidad}. Eso puede sumar variedad al plantel y abrir lecturas interesantes para compararlo con otros jugadores.`;
    }

    if (consulta.includes("cuantos") || consulta.includes("cantidad") || consulta.includes("total")) {
        return `En este momento hay ${jugadores.length} jugador(es) cargado(s). A nivel general, el plantel ya tiene material para analizar posiciones, edades y perfiles.`;
    }

    return `${nombre} me parece una pieza interesante dentro de los jugadores cargados. Como ${posicion}, podria aportar orden, competencia interna y una alternativa flexible para el equipo.`;
};

const ChatbotJugadores = ({ jugadores = [], categorias = [] }) => {
    const [abierto, setAbierto] = useState(true);
    const [pregunta, setPregunta] = useState("");
    const [posicion, setPosicion] = useState({ x: 16, y: 128 });
    const arrastreRef = useRef({
        activo: false,
        movido: false,
        bloquearClick: false,
        inicioX: 0,
        inicioY: 0,
        posicionX: 0,
        posicionY: 0
    });
    const [mensajes, setMensajes] = useState([
        {
            autor: "bot",
            texto: "Preguntame algo sobre tus jugadores. Respondo con analisis genericos usando los datos cargados."
        }
    ]);
    const categoriasPorId = crearMapaCategorias(categorias);

    const enviarPregunta = (event) => {
        event.preventDefault();

        if (!pregunta.trim()) return;

        const textoPregunta = pregunta.trim();
        const respuesta = crearRespuestaChatbot({
            pregunta: textoPregunta,
            jugadores,
            categoriasPorId
        });

        setMensajes(prevMensajes => [
            ...prevMensajes,
            { autor: "usuario", texto: textoPregunta },
            { autor: "bot", texto: respuesta }
        ]);
        setPregunta("");
    };

    const iniciarArrastre = (event) => {
        if (event.target.closest(".chatbot-close, input, form")) return;

        arrastreRef.current = {
            activo: true,
            movido: false,
            bloquearClick: false,
            inicioX: event.clientX,
            inicioY: event.clientY,
            posicionX: posicion.x,
            posicionY: posicion.y
        };
        event.currentTarget.setPointerCapture(event.pointerId);
    };

    const moverArrastre = (event) => {
        if (!arrastreRef.current.activo) return;

        const deltaX = event.clientX - arrastreRef.current.inicioX;
        const deltaY = event.clientY - arrastreRef.current.inicioY;

        if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) {
            arrastreRef.current.movido = true;
        }

        const anchoElemento = event.currentTarget.offsetWidth || 64;
        const altoElemento = event.currentTarget.offsetHeight || 64;
        const margen = 8;
        const maxX = Math.max(margen, window.innerWidth - anchoElemento - margen);
        const maxY = Math.max(margen, window.innerHeight - altoElemento - margen);

        setPosicion({
            x: Math.min(Math.max(margen, arrastreRef.current.posicionX + deltaX), maxX),
            y: Math.min(Math.max(margen, arrastreRef.current.posicionY + deltaY), maxY)
        });
    };

    const finalizarArrastre = (event) => {
        if (!arrastreRef.current.activo) return;

        arrastreRef.current.activo = false;
        arrastreRef.current.bloquearClick = arrastreRef.current.movido;

        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
        }
    };

    const alternarChat = () => {
        if (arrastreRef.current.bloquearClick) {
            arrastreRef.current.bloquearClick = false;
            return;
        }

        setAbierto(prevAbierto => !prevAbierto);
    };

    const abrirChat = (event) => {
        event.stopPropagation();
        if (arrastreRef.current.bloquearClick) {
            arrastreRef.current.bloquearClick = false;
            return;
        }
        setAbierto(true);
    };

    const cerrarChat = (event) => {
        event.stopPropagation();
        arrastreRef.current.activo = false;
        arrastreRef.current.bloquearClick = false;
        setAbierto(false);
    };

    return (
        <aside
            className={`players-chatbot ${abierto ? "open" : "collapsed"}`}
            style={{ left: `${posicion.x}px`, top: `${posicion.y}px` }}
            onPointerDown={abierto ? iniciarArrastre : undefined}
            onPointerMove={abierto ? moverArrastre : undefined}
            onPointerUp={abierto ? finalizarArrastre : undefined}
            onPointerCancel={abierto ? finalizarArrastre : undefined}
            aria-label="Chat de jugadores"
        >
            {!abierto && (
                <button
                    type="button"
                    className="chatbot-toggle"
                    onPointerDown={iniciarArrastre}
                    onPointerMove={moverArrastre}
                    onPointerUp={finalizarArrastre}
                    onPointerCancel={finalizarArrastre}
                    onClick={abrirChat}
                    aria-label="Mostrar chat de jugadores"
                    title="Mostrar chat"
                >
                    <span className="chatbot-icon" aria-hidden="true">
                        <span className="chatbot-icon-dots" />
                    </span>
                </button>
            )}

            {abierto && (
                <div className="chatbot-panel">
                    <div className="chatbot-header">
                        <span className="chatbot-mark">#</span>
                        <div>
                            <h3>Asistente DFS</h3>
                            <p>Jugadores cargados</p>
                        </div>
                        <button
                            type="button"
                            className="chatbot-close"
                            onClick={cerrarChat}
                            aria-label="Cerrar chat de jugadores"
                            title="Cerrar chat"
                        >
                            X
                        </button>
                    </div>

                    <div className="chatbot-messages">
                        {mensajes.map((mensaje, index) => (
                            <div className={`chatbot-message ${mensaje.autor}`} key={`${mensaje.autor}-${index}`}>
                                {mensaje.texto}
                            </div>
                        ))}
                    </div>

                    <form className="chatbot-form" onSubmit={enviarPregunta}>
                        <input
                            type="text"
                            value={pregunta}
                            onChange={(event) => setPregunta(event.target.value)}
                            placeholder="Pregunta por un jugador..."
                            aria-label="Pregunta para el asistente de jugadores"
                        />
                        <button type="submit" aria-label="Enviar pregunta">
                            <span className="chatbot-send-icon" aria-hidden="true" />
                        </button>
                    </form>
                </div>
            )}
        </aside>
    );
};

const DashboardContent = () => {
    const { usuario } = useSelector(state => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [resumen, setResumen] = useState({
        jugadores: 0,
        categorias: 0,
        jugadoresLista: [],
        categoriasLista: []
    });
    const [cargandoResumen, setCargandoResumen] = useState(true);
    const [posicionesSeleccionadas, setPosicionesSeleccionadas] = useState([]);
    const [eliminandoPosiciones, setEliminandoPosiciones] = useState(false);

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
                jugadoresLista: jugadores,
                categoriasLista: categorias
            });
            setPosicionesSeleccionadas(prevSeleccionadas => {
                const idsActuales = new Set(categorias.map(obtenerIdCategoria).filter(Boolean));
                return prevSeleccionadas.filter(id => idsActuales.has(id));
            });
        } catch (error) {
            console.error("Error al obtener resumen del dashboard:", error.response?.data || error);
            setResumen({
                jugadores: 0,
                categorias: 0,
                jugadoresLista: [],
                categoriasLista: []
            });
        } finally {
            setCargandoResumen(false);
        }
    }, []);

    const alternarPosicionSeleccionada = (categoria) => {
        const categoriaId = obtenerIdCategoria(categoria);

        if (!categoriaId) {
            toast.error("No se pudo identificar la posicion");
            return;
        }

        setPosicionesSeleccionadas(prevSeleccionadas => (
            prevSeleccionadas.includes(categoriaId)
                ? prevSeleccionadas.filter(id => id !== categoriaId)
                : [...prevSeleccionadas, categoriaId]
        ));
    };

    const eliminarPosicionesSeleccionadas = async () => {
        if (posicionesSeleccionadas.length === 0 || eliminandoPosiciones) return;

        const confirmado = window.confirm(
            `Seguro que quieres eliminar ${posicionesSeleccionadas.length} posicion(es)?`
        );

        if (!confirmado) return;

        setEliminandoPosiciones(true);

        try {
            await Promise.all(
                posicionesSeleccionadas.map(categoriaId => api.delete(`/v1/categorias/${categoriaId}`))
            );

            posicionesSeleccionadas.forEach(categoriaId => dispatch(deleteCategoria(categoriaId)));
            setPosicionesSeleccionadas([]);
            toast.success("Posicion(es) eliminada(s) correctamente");
            await cargarResumen();
        } catch (error) {
            toast.error("Error al eliminar posicion(es)");
            console.error("Error al eliminar posiciones:", error.response?.data || error);
        } finally {
            setEliminandoPosiciones(false);
        }
    };

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
            {puedeUsarChatbot(usuario) && (
                <ChatbotJugadores
                    jugadores={resumen.jugadoresLista}
                    categorias={resumen.categoriasLista}
                />
            )}

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
                    <p className="hero-description">Administra jugadores, posiciones y crea tu equipo de ensueño</p>
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
                        {esAdmin(usuario) && (
                            <button className="action-btn admin-action" onClick={() => navigate("/admin/solicitudes")}>
                                <span className="action-icon">!</span>
                                <div>
                                    <h4>Solicitudes de plan</h4>
                                    <p>Revisa pedidos de cambio a premium</p>
                                </div>
                            </button>
                        )}
                    </div>
                </section>

                <section className="featured-section">
                    <div className="featured-card">
                        <div className="featured-content">
                            <h3>Posiciones en el Futbol</h3>
                            <p>Posiciones disponibles actualmente en el sistema:</p>
                            <div className="positions-grid">
                                {resumen.categoriasLista.length > 0 ? (
                                    resumen.categoriasLista.map((categoria, index) => {
                                        const categoriaId = obtenerIdCategoria(categoria);
                                        const seleccionada = posicionesSeleccionadas.includes(categoriaId);

                                        return (
                                            <button
                                                type="button"
                                                className={`position-badge ${seleccionada ? "selected" : ""}`}
                                                key={categoriaId || categoria?.nombre || index}
                                                onClick={() => alternarPosicionSeleccionada(categoria)}
                                                disabled={eliminandoPosiciones}
                                            >
                                                {obtenerNombreCategoria(categoria, index)}
                                            </button>
                                        );
                                    })
                                ) : (
                                    <span className="position-badge">Sin posiciones creadas</span>
                                )}
                            </div>
                            {posicionesSeleccionadas.length > 0 && (
                                <div className="positions-selection-actions">
                                    <span className="positions-selected-count">
                                        {posicionesSeleccionadas.length} seleccionada(s)
                                    </span>
                                    <button
                                        type="button"
                                        className="positions-delete-btn"
                                        onClick={eliminarPosicionesSeleccionadas}
                                        disabled={eliminandoPosiciones}
                                        aria-label="Eliminar posiciones seleccionadas"
                                    >
                                        {eliminandoPosiciones ? "..." : "🗑"}
                                    </button>
                                </div>
                            )}
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
