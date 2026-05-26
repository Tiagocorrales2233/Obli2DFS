import { Outlet, useNavigate, Link } from "react-router"

const ContainerPage = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("usuario");
        navigate("/");
    };

    return (
        <>
            <header className="header">
                <div className="content">
                    <Link to="/dashboard" className="logo"><span>Obligatorio 2 DFS</span></Link>
                    <button className="btn" onClick={handleLogout} title="Cerrar sesión">
                        <i className="fas fa-sign-out-alt"></i>
                    </button>
                </div>
            </header>
            <div className="container">
                <Outlet />
            </div>
        </>
    )
}

export default ContainerPage