import { configureStore } from '@reduxjs/toolkit';
import forecastReducer from '../forecast/forecast.slice';

export const store = configureStore({
  reducer: {
    forecast: forecastReducer,
  },
});
