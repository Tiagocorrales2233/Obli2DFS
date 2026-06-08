import { createSlice } from "@reduxjs/toolkit";
import { isTokenValido } from "../utils/auth";

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
        setAuthLoading: (state) => {
            state.loading = true;
            state.error = null;
        },

        setAuthSuccess: (state, action) => {
            const { token, usuario } = action.payload;
            if (!usuario) {
                state.usuario = null;
                state.token = null;
                state.isAuthenticated = false;
                state.loading = false;
                state.error = "Respuesta de autenticación inválida";
                localStorage.removeItem("usuario");
                localStorage.removeItem("token");
                return;
            }

            const tokenValido = isTokenValido(token);

            state.token = tokenValido ? token : null;
            state.usuario = usuario;
            state.isAuthenticated = true;
            state.loading = false;
            state.error = null;
            localStorage.setItem("usuario", JSON.stringify(usuario));
            if (tokenValido) {
                localStorage.setItem("token", token);
            } else {
                localStorage.removeItem("token");
            }
        },

        setAuthError: (state, action) => {
            state.error = action.payload;
            state.loading = false;
            state.isAuthenticated = false;
        },

        logout: (state) => {
            state.usuario = null;
            state.token = null;
            state.isAuthenticated = false;
            state.error = null;
            localStorage.removeItem("usuario");
            localStorage.removeItem("token");
        },

        restoreSession: (state, action) => {
            const { usuario, token } = action.payload;
            if (usuario) {
                state.usuario = usuario;
                state.token = isTokenValido(token) ? token : null;
                state.isAuthenticated = true;
            }
        },
    },
});

export const { setAuthLoading, setAuthSuccess, setAuthError, logout, restoreSession } = authSlice.actions;
export default authSlice.reducer;
