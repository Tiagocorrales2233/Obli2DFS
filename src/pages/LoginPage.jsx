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
            <div className="video-background">
                <video autoPlay muted loop playsInline>
                    <source src="https://media.istockphoto.com/id/1298841325/video/football-match-goals-and-attacks.mp4?s=mp4-640x640-is" type="video/mp4" />
                    <source src="https://videos.pexels.com/video-files/3373028/3373028-sd_640_360_25fps.mp4" type="video/mp4" />
                </video>
            </div>
            <header className="header">
                <div className="content">
                    <Link to="/" className="logo"><span>Obligatorio 2 DFS</span></Link>
                </div>
            </header>
            <div className="container auth">
                <header>
                    <h1> Login</h1>
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