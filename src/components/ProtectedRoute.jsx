//import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router";

// Componente arrow que actúa como layout/protección de rutas
const ProtectedRoute = () => {
    //const isAuth = useSelector((state) => state.auth.isAuthenticated);
    const isAuth = localStorage.getItem("usuario") !== null;

    // Si no está autenticado → redirige a login
    if (!isAuth) return <Navigate to="/" replace />;

    // Si está autenticado → renderiza rutas hijas
    return <Outlet />;
};

export default ProtectedRoute;