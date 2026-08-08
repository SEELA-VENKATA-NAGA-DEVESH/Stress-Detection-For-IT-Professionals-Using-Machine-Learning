/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/dashboard", {
          method: "GET",
          credentials: "include", // Include cookies in the request
        });
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const result = await response.json();
        console.log(result);
        setData(result);
      } catch (error) {
        setError(error.message);
      }
    };

    fetchData();
  }, []);

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (!data) {
    return <div className="text-gray-500">Loading...</div>;
  }

  const heartRateData = data.state.map((item) => item.Heart);
  const caloriesRate = data.state.map((item) => item.Calories);
  const moveRate = data.state.map((item) => item.Move);
  const stepRate = data.state.map((item) => item.Steps);
  const sleepRate = data.state.map((item) => item.Sleep);

  const weeklyLabels = data.state.map((item) =>
    new Date(item.Date).toLocaleDateString()
  );

  const heartData = {
    labels: weeklyLabels,
    datasets: [
      {
        label: "Weekly Heart Data",
        data: heartRateData,
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
      },
    ],
  };

  const caloriesData = {
    labels: weeklyLabels,
    datasets: [
      {
        label: "Weekly Calories Data",
        data: caloriesRate,
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
      },
    ],
  };

  const stepsData = {
    labels: weeklyLabels,
    datasets: [
      {
        label: "Weekly Steps Data",
        data: stepRate,
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
      },
    ],
  };

  const moveData = {
    labels: weeklyLabels,
    datasets: [
      {
        label: "Weekly Move Data",
        data: moveRate,
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
      },
    ],
  };

  const sleepData = {
    labels: weeklyLabels,
    datasets: [
      {
        label: "Weekly Sleep Data",
        data: sleepRate,
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
      },
    ],
  };

  const averageRate = data.averages;
  const averageData = {
    labels: Object.keys(averageRate), // Using keys as labels for averages
    datasets: [
      {
        label: "Average Data",
        data: Object.values(averageRate), // Using values as data points for averages
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
      },
    ],
  };

  const prediction = data.predictions;

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Data Overview",
      },
    },
  };

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen p-6 text-white "
      style={{ backgroundColor: "transparent" }}
    >
      <h1 className="mb-8 text-5xl font-bold text-slate-800">Welcome to Your Dashboard</h1>
      <p className="max-w-xl mb-12 text-xl text-center text-slate-800">
        Track your weekly data and monitor your progress over time with
        beautiful and interactive charts.
      </p>
      <div className="flex flex-wrap justify-center w-full max-w-4xl gap-4">
        <div className="w-full p-4 bg-gray-100 rounded-lg shadow-lg bg-opacity-70 lg:w-2/5">
          <h2 className="mb-6 text-xl font-semibold text-gray-800">
            Weekly Heart Data
          </h2>
          <Line data={heartData} options={chartOptions} />
        </div>
        <div className="w-full p-4 bg-gray-100 rounded-lg shadow-lg bg-opacity-70 lg:w-2/5">
          <h2 className="mb-6 text-xl font-semibold text-gray-800">
            Weekly Calories Data
          </h2>
          <Line data={caloriesData} options={chartOptions} />
        </div>
        <div className="w-full p-4 bg-gray-100 rounded-lg shadow-lg bg-opacity-70 lg:w-2/5">
          <h2 className="mb-6 text-xl font-semibold text-gray-800">
            Weekly Steps Data
          </h2>
          <Line data={stepsData} options={chartOptions} />
        </div>
        <div className="w-full p-4 bg-gray-100 rounded-lg shadow-lg bg-opacity-70 lg:w-2/5">
          <h2 className="mb-6 text-xl font-semibold text-gray-800">
            Weekly Sleep Data
          </h2>
          <Line data={sleepData} options={chartOptions} />
        </div>
      </div>
      <div className="w-full max-w-4xl p-4 mt-8 bg-gray-100 rounded-lg shadow-lg bg-opacity-70">
        <h2 className="mb-6 text-xl font-semibold text-gray-800">Averages</h2>
        <Line data={averageData} options={chartOptions} />
      </div>
      <div className="w-full max-w-4xl p-4 mt-8 bg-gray-100 rounded-lg shadow-lg bg-opacity-70">
        <h2 className="mb-6 text-xl font-semibold text-gray-800">
          Predictions
        </h2>
        <pre className="p-4 text-gray-800 bg-gray-200 rounded-lg">
          The Predicted Stress is:{" "}
          <span
            className={`font-bold ${
              prediction.predictedStress === "high"
                ? "text-red-500"
                : prediction.predictedStress === "normal"
                ? "text-yellow-500"
                : "text-green-500"
            }`}
          >
            {prediction.predictedStress.toUpperCase()}
          </span>
        </pre>
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Recommended Action:
          </h3>
          <p className="p-4 text-gray-800 bg-gray-200 rounded-lg">
            {prediction.action}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
