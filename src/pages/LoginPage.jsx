import { Link } from "react-router"
import LoginForm from "../components/login/LoginForm"

const LoginPage = () => {
    return (
        <>
            <header className="header">
                <div className="content">
                    <Link to="/" className="logo"><span>Obligatorio 2 DFS</span></Link>
                </div>
            </header>
            <div className="container auth">
                <header>
                    <h1>🌤️ Login</h1>
                </header>

                <LoginForm />
            </div>
        </>
    )
}

export default LoginPage