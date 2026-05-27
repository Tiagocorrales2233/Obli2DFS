import { joiResolver } from "@hookform/resolvers/joi"
import { useForm } from "react-hook-form"
import { registerSchema } from "../validators/auth.validators"
import { Link, useNavigate } from "react-router"
import { toast } from "react-toastify"

const RegisterPage = () => {
    const navigate = useNavigate();

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: joiResolver(registerSchema)
    })

    const procesarForm = (data) => {
        console.log(data)
        
        // Obtener usuarios registrados del localStorage o crear un array vacío
        const registeredUsers = JSON.parse(localStorage.getItem("registeredUsers")) || [];
        
        // Verificar si el email ya está registrado
        const userExists = registeredUsers.some(user => user.email === data.email);
        if (userExists) {
            toast.error("Este correo ya está registrado");
            return;
        }
        
        // Agregar el nuevo usuario
        registeredUsers.push({
            email: data.email,
            password: data.password
        });
        
        // Guardar en localStorage
        localStorage.setItem("registeredUsers", JSON.stringify(registeredUsers));
        localStorage.setItem("usuario", data.email);
        
        toast.success("¡Registro exitoso!")
        toast.info("Por favor, inicia sesión con tus credenciales")
        navigate("/");
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