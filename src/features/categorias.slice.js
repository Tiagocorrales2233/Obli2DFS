import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    categorias: [],
    loading: false,
    error: null,
    selectedCategoria: null,
};

const categoriasSlice = createSlice({
    name: "categorias",
    initialState,
    reducers: {
        // Cuando comienza a cargar categorías
        setCategoriasLoading: (state) => {
            state.loading = true;
            state.error = null;
        },

        // Cuando obtiene la lista de categorías exitosamente
        setCategorias: (state, action) => {
            state.categorias = action.payload;
            state.loading = false;
            state.error = null;
        },

        // Cuando agrega una nueva categoría
        addCategoria: (state, action) => {
            state.categorias.push(action.payload);
            state.loading = false;
            state.error = null;
        },

        // Cuando actualiza una categoría
        updateCategoria: (state, action) => {
            const index = state.categorias.findIndex(c => c._id === action.payload._id);
            if (index !== -1) {
                state.categorias[index] = action.payload;
            }
            state.loading = false;
            state.error = null;
        },

        // Cuando elimina una categoría
        deleteCategoria: (state, action) => {
            state.categorias = state.categorias.filter(c => c._id !== action.payload);
            state.loading = false;
            state.error = null;
        },

        // Seleccionar una categoría específica
        selectCategoria: (state, action) => {
            state.selectedCategoria = action.payload;
        },

        // Error al hacer operaciones con categorías
        setCategoriasError: (state, action) => {
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
    setCategoriasLoading,
    setCategorias,
    addCategoria,
    updateCategoria,
    deleteCategoria,
    selectCategoria,
    setCategoriasError,
    clearError,
} = categoriasSlice.actions;

export default categoriasSlice.reducer;
