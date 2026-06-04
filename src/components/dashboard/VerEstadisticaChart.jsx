import { useMemo } from 'react';
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
import '../../styles/VerEstadisticaChart.css';
import { crearDatosGrafica, opcionesGrafica } from '../../styles/VerEstadisticaChart.config';

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

const VerEstadisticaChart = ({ jugadoresPorPosicion = [] }) => {
    const datosGrafica = useMemo(() => {
        return crearDatosGrafica(jugadoresPorPosicion);
    }, [jugadoresPorPosicion]);

    return (
        <div className="estadisticas-chart">
            {jugadoresPorPosicion.length > 0 ? (
                <Chart type="line" data={datosGrafica} options={opcionesGrafica} />
            ) : (
                <div className="ver-estadisticas-state">No hay posiciones creadas en la base de datos.</div>
            )}
        </div>
    );
};

export default VerEstadisticaChart;
