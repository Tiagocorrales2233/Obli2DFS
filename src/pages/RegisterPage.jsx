import { joiResolver } from "@hookform/resolvers/joi"
import { useForm } from "react-hook-form"
import { registerSchema } from "../validators/auth.validators"
import { Link, useNavigate } from "react-router"
import { toast } from "react-toastify"
import { useDispatch } from "react-redux"
import { setAuthLoading, setAuthSuccess, setAuthError } from "../features/auth.slice"
import api from "../api/api"
import { normalizarAuthResponse } from "../utils/auth"

const RegisterPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: joiResolver(registerSchema)
    })

    const procesarForm = async (data) => {
        try {
            // Mostrar loading
            dispatch(setAuthLoading());

            // Llamar a la API para registrarse
            const response = await api.post('/v1/auth/register', {
                email: data.email,
                password: data.password,
                confirmPassword: data.confirmPassword,
                rol: "cliente",
                plan: "plus"
            });

            // Si el registro es exitoso, hacer auto-login
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

            toast.success("¡Registro exitoso!");
            navigate("/dashboard/index", { replace: true });

        } catch (error) {
            // Si hay error, mostrar en Redux y al usuario
            const mensaje = error.response?.data?.message || error.message || "Error al registrarse";
            dispatch(setAuthError(mensaje));
            toast.error(mensaje);
        }
    }

    return (
        <>
            <header className="header">
                <div className="content">
                    <Link to="/" className="logo"><span>Registro Obligatorio 2 DFS</span></Link>
                </div>
            </header>
            <div className="container auth">
                <header>
                    <h1> Registro</h1>
                </header>

                <form onSubmit={handleSubmit(procesarForm)}>
                    <div className="group">
                        <label htmlFor="email">Correo:</label>
                        <input 
                            type="email" 
                            id="email"
                            placeholder="tu@correo.com"
                            {...register("email")}
                        />
                        {errors.email && <span className="error">{errors.email.message}</span>}
                    </div>

                    <div className="group">
                        <label htmlFor="password">Contraseña:</label>
                        <input 
                            type="password" 
                            id="password"
                            placeholder="Mínimo 6 caracteres"
                            {...register("password")}
                        />
                        {errors.password && <span className="error">{errors.password.message}</span>}
                    </div>

                    <div className="group">
                        <label htmlFor="confirmPassword">Confirmar Contraseña:</label>
                        <input 
                            type="password" 
                            id="confirmPassword"
                            placeholder="Repite tu contraseña"
                            {...register("confirmPassword")}
                        />
                        {errors.confirmPassword && <span className="error">{errors.confirmPassword.message}</span>}
                    </div>

                    <button type="submit">Registrarse</button>
                </form>
                <p className="link">
                    ¿Ya tienes cuenta? <Link to="/">Ingresa aquí</Link>
                </p>
            </div>
        </>
    )
}

export default RegisterPage
