import { joiResolver } from "@hookform/resolvers/joi"
import { useForm } from "react-hook-form"
import { forecastSchema } from "../../validators/forecast.validators"
import api from "../../api/api"
import { useDispatch } from "react-redux"
import { setForecast, setMaximas } from "../../forecast/forecast.slice"

const ForecastForm = () => {
    const dispatch = useDispatch()
    const { register, handleSubmit, formState: { errors, isSubmitting, isDirty, isValid } } = useForm({
        resolver: joiResolver(forecastSchema),
        mode: "onChange"
    })

    const obtenerPronostico = async (data) => {
        console.log(data)
        const response = await api.get(`/forecast?latitude=${data.latitude}&longitude=${data.longitude}&daily=temperature_2m_max%2Ctemperature_2m_min&timezone=auto`)
        console.log(response.data);
        dispatch(setForecast(response.data.daily));
    }

    return (
        <div className="search-box">
            <form onSubmit={handleSubmit(obtenerPronostico)}>
                <label htmlFor="latitude">Latitud:</label>
                <input type="number" id="latitude" placeholder="-34.9011" step="any" {...register("latitude")} />
                {errors.latitude && <span className="error">{errors.latitude.message}</span>}

                <label htmlFor="longitude">Longitud:</label>
                <input type="number" id="longitude" placeholder="-56.1645" step="any" {...register("longitude")} />
                {errors.longitude && <span className="error">{errors.longitude.message}</span>}
                <button type="submit" disabled={!isValid}>
                    { isSubmitting ? <i className="fas fa-spinner fa-spin" /> : "Buscar" }
                </button>
            </form>
        </div>
    )
}

export default ForecastForm

/*
<button>
    <i className="fas fa-spinner fa-spin" />
</button>
*/