import Joi from "joi"

export const forecastSchema = Joi.object({
    latitude: Joi.number().required().min(-90).max(90).messages({
        "number.base": "La latitud debe ser un número",
        "number.empty": "La latitud es requerida",
        "number.min": "La latitud no puede ser menor a -90",
        "number.max": "La latitud no puede ser mayor a 90"
    }),
    longitude: Joi.number().required().min(-180).max(180).messages({
        "number.base": "La longitud debe ser un número",
        "number.empty": "La longitud es requerida",
        "number.min": "La longitud no puede ser menor a -180",
        "number.max": "La longitud no puede ser mayor a 180"
    })
})