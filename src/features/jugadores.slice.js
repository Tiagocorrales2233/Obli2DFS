import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    jugadores: [],
    loading: false,
    error: null,
    selectedJugador: null,
};

const jugadoresSlice = createSlice({
    name: "jugadores",
    initialState,
    reducers: {
        // Cuando comienza a cargar jugadores
        setJugadoresLoading: (state) => {
            state.loading = true;
            state.error = null;
        },

        // Cuando obtiene la lista de jugadores exitosamente
        setJugadores: (state, action) => {
            state.jugadores = action.payload;
            state.loading = false;
            state.error = null;
        },

        // Cuando agrega un nuevo jugador
        addJugador: (state, action) => {
            state.jugadores.push(action.payload);
            state.loading = false;
            state.error = null;
        },

        // Cuando actualiza un jugador
        updateJugador: (state, action) => {
            const index = state.jugadores.findIndex(j => j._id === action.payload._id);
            if (index !== -1) {
                state.jugadores[index] = action.payload;
            }
            state.loading = false;
            state.error = null;
        },

        // Cuando elimina un jugador
        deleteJugador: (state, action) => {
            state.jugadores = state.jugadores.filter(j => j._id !== action.payload);
            state.loading = false;
            state.error = null;
        },

        // Seleccionar un jugador específico
        selectJugador: (state, action) => {
            state.selectedJugador = action.payload;
        },

        // Error al hacer operaciones con jugadores
        setJugadoresError: (state, action) => {
            state.error = action.payload;
            state.loading = false;
        },

        // Limpiar errores
        clearError: (state) => {
            state.error = null;
        },
    },
});

export const {
    setJugadoresLoading,
    setJugadores,
    addJugador,
    updateJugador,
    deleteJugador,
    selectJugador,
    setJugadoresError,
    clearError,
} = jugadoresSlice.actions;

export default jugadoresSlice.reducer;
