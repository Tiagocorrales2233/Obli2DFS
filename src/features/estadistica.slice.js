import { createSlice } from "@reduxjs/toolkit";
import api from "../api/api";

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
    const valor = valores.find(item => item !== undefined && item !== null && String(item).trim() !== "");
    return valor === undefined ? "Sin dato" : String(valor);
};

const pareceObjectId = (valor) => {
    return typeof valor === "string" && /^[a-f\d]{24}$/i.test(valor);
};

const obtenerId = (item) => {
    if (typeof item === "string") return item;
    return item?._id || item?.id || item?.value || "";
};

const obtenerNombreCategoria = (categoria, index) => {
    if (typeof categoria === "string") return categoria;
    return obtenerTexto(categoria?.nombre, categoria?.name, categoria?.label, categoria?.descripcion, `Posicion ${index + 1}`);
};

const obtenerPosicionJugador = (jugador) => {
    const posicion = jugador?.posicion || jugador?.categoria || jugador?.position;

    if (typeof posicion === "object" && posicion !== null) {
        return {
            id: obtenerId(posicion),
            nombre: obtenerTexto(posicion.nombre, posicion.name, posicion.descripcion)
        };
    }

    return {
        id: pareceObjectId(posicion) ? posicion : "",
        nombre: pareceObjectId(posicion) ? "" : obtenerTexto(posicion)
    };
};

const crearEstadisticasPorPosicion = (jugadores, categorias) => {
    const posiciones = categorias.map((categoria, index) => {
        const id = obtenerId(categoria);
        const nombre = obtenerNombreCategoria(categoria, index);

        return {
            id,
            nombre,
            cantidad: 0
        };
    });

    const posicionesPorId = posiciones.reduce((mapa, posicion) => {
        if (posicion.id) {
            mapa[posicion.id] = posicion;
        }
        return mapa;
    }, {});

    const posicionesPorNombre = posiciones.reduce((mapa, posicion) => {
        mapa[posicion.nombre.toLowerCase()] = posicion;
        return mapa;
    }, {});

    jugadores.forEach((jugador) => {
        const posicionJugador = obtenerPosicionJugador(jugador);
        const posicion = posicionesPorId[posicionJugador.id] || posicionesPorNombre[posicionJugador.nombre.toLowerCase()];

        if (posicion) {
            posicion.cantidad += 1;
        }
    });

    return posiciones.sort((a, b) => b.cantidad - a.cantidad);
};

const initialState = {
    jugadoresPorPosicion: [],
    totalJugadores: 0,
    totalPosiciones: 0,
    loading: false,
    error: null,
    lastUpdated: null
};

const estadisticaSlice = createSlice({
    name: "estadistica",
    initialState,
    reducers: {
        setEstadisticaLoading: (state) => {
            state.loading = true;
            state.error = null;
        },
        setJugadoresPorPosicion: (state, action) => {
            const { jugadores, categorias } = action.payload;

            state.jugadoresPorPosicion = crearEstadisticasPorPosicion(jugadores, categorias);
            state.totalJugadores = jugadores.length;
            state.totalPosiciones = categorias.length;
            state.loading = false;
            state.error = null;
            state.lastUpdated = new Date().toISOString();
        },
        setEstadisticaError: (state, action) => {
            state.error = action.payload;
            state.loading = false;
        },
        clearEstadisticaError: (state) => {
            state.error = null;
        }
    }
});

export const cargarJugadoresPorPosicion = () => async (dispatch) => {
    dispatch(setEstadisticaLoading());

    try {
        const cacheBuster = Date.now();
        const [jugadoresResponse, categoriasResponse] = await Promise.all([
            api.get("/v1/jugadores", {
                params: { _t: cacheBuster }
            }),
            api.get("/v1/categorias", {
                params: { _t: cacheBuster }
            })
        ]);

        dispatch(setJugadoresPorPosicion({
            jugadores: normalizarLista(jugadoresResponse.data),
            categorias: normalizarLista(categoriasResponse.data)
        }));
    } catch (error) {
        dispatch(setEstadisticaError("Error al obtener estadisticas"));
        throw error;
    }
};

export const {
    setEstadisticaLoading,
    setJugadoresPorPosicion,
    setEstadisticaError,
    clearEstadisticaError
} = estadisticaSlice.actions;

export default estadisticaSlice.reducer;
