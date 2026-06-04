import { useEffect, useMemo, useRef, useState } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LineController,
    LinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend
} from 'chart.js';
import { Chart } from 'react-chartjs-2';

ChartJS.register(
    LineController,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend
);

const createGradient = (ctx, area) => {
    const gradient = ctx.createLinearGradient(0, area.bottom, 0, area.top);

    gradient.addColorStop(0, '#22c55e');
    gradient.addColorStop(0.5, '#facc15');
    gradient.addColorStop(1, '#38bdf8');

    return gradient;
};

const VerEstadisticaChart = ({ jugadoresPorPosicion = [] }) => {
    const chartRef = useRef(null);
    const [chartData, setChartData] = useState({ labels: [], datasets: [] });

    const estadisticas = useMemo(() => {
        return {
            labels: jugadoresPorPosicion.map(posicion => posicion.nombre),
            valores: jugadoresPorPosicion.map(posicion => posicion.cantidad)
        };
    }, [jugadoresPorPosicion]);

    useEffect(() => {
        const chart = chartRef.current;

        if (!chart || !chart.chartArea) {
            return;
        }

        setChartData({
            labels: estadisticas.labels,
            datasets: [
                {
                    label: 'Jugadores por posicion',
                    data: estadisticas.valores,
                    borderColor: createGradient(chart.ctx, chart.chartArea),
                    backgroundColor: 'rgba(250, 204, 21, 0.14)',
                    pointBackgroundColor: '#facc15',
                    pointBorderColor: '#ffffff',
                    pointHoverBackgroundColor: '#38bdf8',
                    pointHoverBorderColor: '#ffffff',
                    borderWidth: 4,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    tension: 0.38,
                    fill: true
                }
            ]
        });
    }, [estadisticas]);

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: {
                    color: '#ffffff',
                    font: {
                        weight: '700'
                    }
                }
            },
            tooltip: {
                callbacks: {
                    label: (context) => `${context.dataset.label}: ${context.parsed.y}`
                }
            }
        },
        scales: {
            x: {
                ticks: {
                    color: '#e5e7eb',
                    font: {
                        weight: '700'
                    }
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                }
            },
            y: {
                beginAtZero: true,
                ticks: {
                    color: '#e5e7eb',
                    precision: 0
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                }
            }
        }
    };

    return (
        <div className="estadisticas-chart">
            {estadisticas.labels.length > 0 ? (
                <Chart ref={chartRef} type="line" data={chartData} options={options} />
            ) : (
                <div className="ver-estadisticas-state">No hay posiciones creadas en la base de datos.</div>
            )}
        </div>
    );
};

export default VerEstadisticaChart;
