import { useRef, useState, useEffect } from "react";

const DashboardPage = () => {
    const latitudeRef = useRef();
    const longitudeRef = useRef();
    const [loading, setLoading] = useState(false);
    const [weatherData, setWeatherData] = useState(null);
    const chartRef = useRef(null);

    const handleSearch = async () => {
        const latitude = latitudeRef.current.value;
        const longitude = longitudeRef.current.value;

        if (!latitude || !longitude) {
            alert("Ingresa latitud y longitud");
            return;
        }

        setLoading(true);

        try {
            // Usando API gratuita Open-Meteo (no requiere API key)
            const response = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min&timezone=auto`
            );
            const data = await response.json();
            
            if (data.daily) {
                setWeatherData(data.daily);
                console.log("Datos del clima:", data.daily);
            }
        } catch (error) {
            console.error("Error al buscar:", error);
            alert("Error al buscar el clima");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (weatherData && window.Chart) {
            const canvas = document.getElementById("temperatureChart");
            if (canvas && chartRef.current) {
                chartRef.current.destroy();
            }

            const ctx = canvas.getContext("2d");
            const maxTemps = weatherData.temperature_2m_max.slice(0, 5);
            const minTemps = weatherData.temperature_2m_min.slice(0, 5);
            const dias = ["Día 1", "Día 2", "Día 3", "Día 4", "Día 5"];

            chartRef.current = new window.Chart(ctx, {
                type: "bar",
                data: {
                    labels: dias,
                    datasets: [
                        {
                            label: "Temperatura Máxima",
                            data: maxTemps,
                            backgroundColor: "#e1b12c",
                            borderColor: "#fbc531",
                            borderWidth: 1
                        },
                        {
                            label: "Temperatura Mínima",
                            data: minTemps,
                            backgroundColor: "#273c75",
                            borderColor: "#40739e",
                            borderWidth: 1
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: "Temperatura (°C)"
                            }
                        }
                    },
                    plugins: {
                        title: {
                            display: true,
                            text: "Temperaturas Máximas y Mínimas",
                            font: {
                                size: 16,
                                family: "Nunito"
                            }
                        }
                    }
                }
            });
        }

        return () => {
            if (chartRef.current) {
                chartRef.current.destroy();
            }
        };
    }, [weatherData]);

    return (
        <div className="dashboard-content">
            <div className="search">
                <label htmlFor="latitude">Latitud:</label>
                <input 
                    type="number" 
                    id="latitude" 
                    placeholder="-34.9011" 
                    step="any"
                    ref={latitudeRef}
                    defaultValue="-34.9011"
                />
                <label htmlFor="longitude">Longitud:</label>
                <input 
                    type="number" 
                    id="longitude" 
                    placeholder="-56.1645" 
                    step="any"
                    ref={longitudeRef}
                    defaultValue="-56.1645"
                />
                <button onClick={handleSearch} type="button" disabled={loading}>
                    Buscar
                </button>
                {loading && (
                    <button type="button">
                        <i className="fas fa-spinner fa-spin"></i>
                    </button>
                )}
            </div>

            <div className="chart">
                <canvas id="temperatureChart"></canvas>
            </div>

            {weatherData && (
                <div style={{ marginTop: "20px", textAlign: "left", color: "#444" }}>
                    <h3>Datos del clima:</h3>
                    <p>Temperaturas máximas: {weatherData.temperature_2m_max.slice(0, 5).join(", ")} °C</p>
                    <p>Temperaturas mínimas: {weatherData.temperature_2m_min.slice(0, 5).join(", ")} °C</p>
                </div>
            )}
        </div>
    )
}

export default DashboardPage