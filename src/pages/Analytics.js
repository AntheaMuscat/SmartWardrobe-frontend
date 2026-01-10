import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { colors } from "../styles/theme";
import Navbar from "../components/Navbar";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, ArcElement, Tooltip, Legend } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(BarElement, CategoryScale, LinearScale, ArcElement, Tooltip, Legend);

function Analytics() {
   const [analyticsData, setAnalyticsData] = useState(null);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      fetchAnalytics();
   }, []);

   const fetchAnalytics = async () => {
      try {
         const res = await fetch(`https://antheamuscat-smart-wardrobe-backend.hf.space/analytics?nocache=${Date.now()}`);
         const data = await res.json();
         setAnalyticsData(data);
         setLoading(false);
      } catch (err) {
         console.error("Analytics fetch error:", err);
         setLoading(false);
      }
   };

   if (loading) return <p>Loading analytics...</p>;

   // Chart for most worn
   const mostWornChart = {
      labels: analyticsData.most_worn.map(([type]) => type),
      datasets: [{
         label: 'Wear Count',
         data: analyticsData.most_worn.map(([, count]) => count),
         backgroundColor: colors.primary,
      }]
   };

   // Pie for favorites
   const favoritesPie = {
      labels: analyticsData.favorites.map(([style]) => style),
      datasets: [{
         data: analyticsData.favorites.map(([, count]) => count),
         backgroundColor: [colors.primary, colors.accent1, colors.accent2],
      }]
   };

   // Line for sensor data
   const sensorChart = {
      labels: ['Reading 1', '2', '3', '4', '5'],
      datasets: [
         { label: 'Temperature (°C)', data: analyticsData.sensor_chart.temperatures, borderColor: colors.primary },
         { label: 'Humidity (%)', data: analyticsData.sensor_chart.humidities, borderColor: colors.accent1 }
      ]
   };

   return (
      <>
         <Navbar />
         <div style={{ padding: "2rem", background: `linear-gradient(135deg, ${colors.secondary}, ${colors.accent2})` }}>
            <h1 style={{ color: colors.primary }}>Analytics Dashboard</h1>
            <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
               <div style={{ width: "400px" }}>
                  <h2>Most Worn Items</h2>
                  <Bar data={mostWornChart} />
               </div>
               <div style={{ width: "400px" }}>
                  <h2>Favorite Styles</h2>
                  <Pie data={favoritesPie} />
               </div>
               <div style={{ width: "400px" }}>
                  <h2>Sensor Performance</h2>
                  <Line data={sensorChart} />
               </div>
            </div>
         </div>
      </>
   );
}

export default Analytics;