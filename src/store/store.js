import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth.slice';
import jugadoresReducer from '../features/jugadores.slice';
import categoriasReducer from '../features/categorias.slice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    jugadores: jugadoresReducer,
    categorias: categoriasReducer,
  },
});
