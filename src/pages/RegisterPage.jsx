import { Link, useNavigate } from "react-router"
import { useRef } from "react"

const RegisterPage = () => {
    const usernameRef = useRef();
    const passwordRef = useRef();
    const navigate = useNavigate();

    const handleRegister = (e) => {
        e.preventDefault();
        const username = usernameRef.current.value;
        const password = passwordRef.current.value;

        if (username && password) {
            localStorage.setItem("usuario", username);
            alert("Registro exitoso. Iniciando sesión...");
            navigate("/dashboard/index");
        } else {
            alert("Completa todos los campos");
        }
    };

    return (
        <>
            <header className="header">
                <div className="content">
                    <Link to="/" className="logo"><span>Registro Obligatorio 2 DFS</span></Link>
                </div>
            </header>
            <div className="container auth">
                <header>
                    <h1>🌤️ Registro</h1>
                </header>

                <form onSubmit={handleRegister}>
                    <div className="group">
                        <label htmlFor="username">Usuario:</label>
                        <input 
                            type="text" 
                            id="username"
                            ref={usernameRef}
                            required
                        />
                    </div>

                    <div className="group">
                        <label htmlFor="password">Contraseña:</label>
                        <input 
                            type="password" 
                            id="password"
                            ref={passwordRef}
                            required
                        />
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