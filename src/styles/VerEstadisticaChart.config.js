const coloresGrafica = {
    dorado: '#FFD700',
    verde: '#047857',
    blanco: '#ffffff',
    texto: '#e5e7eb',
    grilla: 'rgba(255, 255, 255, 0.1)',
    fondo: 'rgba(255, 215, 0, 0.14)'
};

export const crearDatosGrafica = (jugadoresPorPosicion) => {
    return {
        labels: jugadoresPorPosicion.map(posicion => posicion.nombre),
        datasets: [
            {
                label: 'Jugadores por posicion',
                data: jugadoresPorPosicion.map(posicion => posicion.cantidad),
                borderColor: coloresGrafica.dorado,
                backgroundColor: coloresGrafica.fondo,
                pointBackgroundColor: coloresGrafica.dorado,
                pointBorderColor: coloresGrafica.blanco,
                pointHoverBackgroundColor: coloresGrafica.verde,
                pointHoverBorderColor: coloresGrafica.blanco,
                borderWidth: 4,
                pointRadius: 5,
                pointHoverRadius: 7,
                tension: 0.38,
                fill: true
            }
        ]
    };
};

export const opcionesGrafica = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            labels: {
                color: coloresGrafica.blanco,
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
                color: coloresGrafica.texto,
                font: {
                    weight: '700'
                }
            },
            grid: {
                color: coloresGrafica.grilla
            }
        },
        y: {
            beginAtZero: true,
            ticks: {
                color: coloresGrafica.texto,
                precision: 0
            },
            grid: {
                color: coloresGrafica.grilla
            }
        }
    }
};
