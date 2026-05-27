import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    maximas: [],
    minimas: [],
    labels: []
}

const forecastSlice = createSlice({
    name: "forecast",
    initialState,
    reducers: {
        setMaximas: (state, action) => {
            state.maximas = action.payload
        },

        setForecast: (state, action) => {
            state.maximas = action.payload.temperature_2m_max;
            state.minimas = action.payload.temperature_2m_min;
            state.labels = action.payload.time;
        }
    }
})

export const { setMaximas, setForecast } = forecastSlice.actions;

export default forecastSlice.reducer;