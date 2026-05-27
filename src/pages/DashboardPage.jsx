import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router";
import ForecastChart from "../components/dashboard/ForecastChart"
import ForecastForm from "../components/dashboard/ForecastForm"

const DashboardPage = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("usuario");
        navigate("/");
    };

    return (
        <>
            
        </>
    )
}

export default DashboardPage