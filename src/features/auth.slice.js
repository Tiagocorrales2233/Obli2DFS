import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    usuario: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        // Cuando inicia el proceso de login/register
        setAuthLoading: (state) => {
            state.loading = true;
            state.error = null;
        },

        // Login exitoso
        setAuthSuccess: (state, action) => {
            const { token, usuario } = action.payload;
            state.token = token;
            state.usuario = usuario;
            state.isAuthenticated = true;
            state.loading = false;
            state.error = null;
            // Guardar en localStorage
            localStorage.setItem("usuario", JSON.stringify(usuario));
            localStorage.setItem("token", token);
        },

        // Error en login/register
        setAuthError: (state, action) => {
            state.error = action.payload;
            state.loading = false;
            state.isAuthenticated = false;
        },

        // Logout
        logout: (state) => {
            state.usuario = null;
            state.token = null;
            state.isAuthenticated = false;
            state.error = null;
            localStorage.removeItem("usuario");
            localStorage.removeItem("token");
        },

        // Restaurar sesión desde localStorage
        restoreSession: (state, action) => {
            const { usuario, token } = action.payload;
            if (usuario && token) {
                state.usuario = usuario;
                state.token = token;
                state.isAuthenticated = true;
            }
        },
    },
});

export const { setAuthLoading, setAuthSuccess, setAuthError, logout, restoreSession } = authSlice.actions;
export default authSlice.reducer;
