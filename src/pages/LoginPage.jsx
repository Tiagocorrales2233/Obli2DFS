import { Link, useNavigate } from "react-router"
import { useRef } from "react"

const LoginPage = () => {
    const usernameRef = useRef();
    const passwordRef = useRef();
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        const username = usernameRef.current.value;
        const password = passwordRef.current.value;

        if (username === "a" && password === "a") {
            localStorage.setItem("usuario", username);
            navigate("/dashboard/index");
        } else {
            alert("Usuario o contraseña incorrectos");
            usernameRef.current.value = "";
            passwordRef.current.value = "";
        }
    };

    return (
        <>
            <header className="header">
                <div className="content">
                    <Link to="/" className="logo">🌤️<span>Weather App</span></Link>
                </div>
            </header>
            <div className="container auth">
                <header>
                    <h1>🌤️ Login</h1>
                </header>

                <form onSubmit={handleLogin}>
                    <div className="group">
                        <label htmlFor="username">Usuario:</label>
                        <input 
                            type="text" 
                            id="username"
                            ref={usernameRef}
                        />
                        <span className="error">Este campo es obligatorio</span>
                    </div>

                    <div className="group">
                        <label htmlFor="password">Contraseña:</label>
                        <input 
                            type="password" 
                            id="password"
                            ref={passwordRef}
                        />
                        <span className="error">Este campo es obligatorio</span>
                    </div>

                    <button type="submit">Ingresar</button>
                </form>
                <p className="link">
                    ¿No tienes cuenta? <Link to="/registro">Regístrate aquí</Link>
                </p>
            </div>
        </>
    )
}

export default LoginPage