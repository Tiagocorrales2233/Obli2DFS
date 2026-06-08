import { useMemo } from 'react';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend
} from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(
    ArcElement,
    Tooltip,
    Legend
);

const coloresGrafica = {
    fondos: [
        'rgba(255, 99, 132, 0.22)',
        'rgba(54, 162, 235, 0.22)',
        'rgba(255, 206, 86, 0.22)',
        'rgba(75, 192, 192, 0.22)',
        'rgba(153, 102, 255, 0.22)',
        'rgba(255, 159, 64, 0.22)',
        'rgba(34, 197, 94, 0.22)',
        'rgba(236, 72, 153, 0.22)'
    ],
    bordes: [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)',
        'rgba(34, 197, 94, 1)',
        'rgba(236, 72, 153, 1)'
    ]
};

const repetirColores = (colores, cantidad) => {
    return Array.from({ length: cantidad }, (_, index) => colores[index % colores.length]);
};

const crearDatosGrafica = (jugadoresPorPosicion) => {
    const cantidadPosiciones = jugadoresPorPosicion.length;

    return {
        labels: jugadoresPorPosicion.map(posicion => posicion.nombre),
        datasets: [
            {
                label: 'Jugadores por posicion',
                data: jugadoresPorPosicion.map(posicion => posicion.cantidad),
                backgroundColor: repetirColores(coloresGrafica.fondos, cantidadPosiciones),
                borderColor: repetirColores(coloresGrafica.bordes, cantidadPosiciones),
                borderWidth: 1,
                hoverOffset: 10
            }
        ]
    };
};

const opcionesGrafica = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'top',
            labels: {
                color: '#ffffff',
                boxWidth: 50,
                boxHeight: 14,
                padding: 14,
                font: {
                    size: 14,
                    weight: '500'
                }
            }
        },
        tooltip: {
            callbacks: {
                label: (context) => `${context.label}: ${context.parsed} jugador(es)`
            }
        }
    }
};

const VerEstadisticaChart = ({ jugadoresPorPosicion = [] }) => {
    const datosGrafica = useMemo(() => {
        return crearDatosGrafica(jugadoresPorPosicion);
    }, [jugadoresPorPosicion]);

    return (
        <div className="estadisticas-chart">
            {jugadoresPorPosicion.length > 0 ? (
                <Pie data={datosGrafica} options={opcionesGrafica} />
            ) : (
                <div className="ver-estadisticas-state">No hay posiciones creadas en la base de datos.</div>
            )}
        </div>
    );
};

export default VerEstadisticaChart;
