import { Navigate, Outlet } from "react-router";

const obtenerUsuarioGuardado = () => {
    try {
        const usuario = localStorage.getItem("usuario");

        if (!usuario || usuario === "undefined") {
            return null;
        }

        return JSON.parse(usuario);
    } catch {
        return null;
    }
};

const esAdmin = (usuario) => {
    const rol = String(usuario?.rol || usuario?.role || "").trim().toLowerCase();
    return rol === "admin" || rol === "administrador";
};

const ProtectedRoute = ({ adminOnly = false }) => {
    const usuario = localStorage.getItem("usuario");
    const isAuth = usuario !== null && usuario !== "undefined";

    if (!isAuth) return <Navigate to="/" replace />;//si no conectado, redirigir a login
    if (adminOnly && !esAdmin(obtenerUsuarioGuardado())) return <Navigate to="/dashboard/index" replace />;

    return <Outlet />;
};

export default ProtectedRoute;
