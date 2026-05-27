import { joiResolver } from "@hookform/resolvers/joi"
import { useForm } from "react-hook-form"
import { loginSchema } from "../../validators/auth.validators"
import { Link, useNavigate } from "react-router"
import { toast } from "react-toastify"


const LoginForm = () => {

    const navigate = useNavigate();

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: joiResolver(loginSchema)
    })

    const procesarForm = (data) => {
        console.log(data)
        
        // Obtener usuarios registrados del localStorage
        const registeredUsers = JSON.parse(localStorage.getItem("registeredUsers")) || [];
        
        // Buscar el usuario
        const user = registeredUsers.find(u => u.email === data.email);
        
        // Validar si el usuario existe
        if (!user) {
            toast.error("Usuario no registrado. Por favor, regístrate primero");
            return;
        }
        
        // Validar contraseña
        if (user.password !== data.password) {
            toast.error("Contraseña incorrecta");
            return;
        }
        
        // Login exitoso
        localStorage.setItem("usuario", data.email);
        toast.success("¡Bienvenido!")
        navigate("/dashboard/index");
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