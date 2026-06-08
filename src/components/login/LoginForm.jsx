import { joiResolver } from "@hookform/resolvers/joi"
import { useForm } from "react-hook-form"
import { loginSchema } from "../../validators/auth.validators"
import { Link, useNavigate } from "react-router"
import { toast } from "react-toastify"
import { useDispatch } from "react-redux"
import { setAuthLoading, setAuthSuccess, setAuthError } from "../../features/auth.slice"
import api from "../../api/api"
import { normalizarAuthResponse } from "../../utils/auth"


const LoginForm = () => {

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: joiResolver(loginSchema)
    })

    const procesarForm = async (data) => {
        try {
            // Mostrar loading
            dispatch(setAuthLoading());

            // Llamar a la API
            const response = await api.post('/v1/auth/login', {
                email: data.email,
                password: data.password
            });

            // Si tiene éxito, guardar en Redux
            const auth = normalizarAuthResponse(response.data);
            const usuarioBase = auth.usuario || {};
            const usuario = {
                ...(typeof usuarioBase === "object" ? usuarioBase : {}),
                _id: usuarioBase?._id || usuarioBase?.id || auth.clientId,
                id: usuarioBase?.id || usuarioBase?._id || auth.clientId,
                email: usuarioBase?.email || data.email,
                rol: usuarioBase?.rol || usuarioBase?.role,
                role: usuarioBase?.role || usuarioBase?.rol,
                plan: usuarioBase?.plan || "plus"
            };

            dispatch(setAuthSuccess({
                token: auth.token || null,
                usuario
            }));

            toast.success("¡Bienvenido!");
            navigate("/dashboard/index", { replace: true });

        } catch (error) {
            // Si hay error, mostrar en Redux y al usuario
            const mensaje = error.response?.data?.message || error.message || "Error al iniciar sesión";
            dispatch(setAuthError(mensaje));
            toast.error(mensaje);
        }
    }

    return (
        <>
            <form onSubmit={handleSubmit(procesarForm)}>
                <div className="group">
                    <label htmlFor="email">Correo:</label>
                    <input type="email" id="email" placeholder="tu@correo.com" {...register("email")} />
                    {errors.email && <span className="error">{errors.email.message}</span>}
                </div>
                <div className="group">
                    <label htmlFor="password">Contraseña:</label>
                    <input type="password" id="password" placeholder="Mínimo 6 caracteres" {...register("password")} />
                    {errors.password && <span className="error">{errors.password.message}</span>}
                </div>
                <button type="submit">Ingresar</button>
            </form>
            <p className="link">
                ¿No tienes cuenta? <Link to="/registro">Regístrate aquí</Link>
            </p>
        </>

    )
}

export default LoginForm
