import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useSelector } from 'react-redux';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);


const ForecastChart = () => {
    
    const maximas = useSelector(state => state.forecast.maximas);
    const minimas = useSelector(state => state.forecast.minimas);
    const labels = useSelector(state => state.forecast.labels);
    
    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Chart.js Bar Chart',
            },
        },
    };

    const data = {
        labels,
        datasets: [
            {
                label: 'Máximas',
                data: maximas,
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
            },
            {
                label: 'Mínimas',
                data: minimas,
                backgroundColor: 'rgba(53, 162, 235, 0.5)',
            }
        ],
    };


    return (
        <div className="chart-container">
            <Bar options={options} data={data} />
        </div>
    )
}

export default ForecastChart