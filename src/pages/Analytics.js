import { useEffect, useState } from "react";
import { Bar, Pie } from "react-chartjs-2";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, ArcElement, Tooltip, Legend);

function Analytics() {
   const [data, setData] = useState(null);

   useEffect(() => {
      fetch("https://antheamuscat-smart-wardrobe-backend.hf.space/analytics")
         .then(res => res.json())
         .then(setData)
         .catch(err => console.error("Analytics error:", err));
   }, []);

   if (!data) return <p>Loading analytics...</p>;

   // Most Worn Bar Chart
   const mostWornChart = {
      labels: data.most_worn.map(([name]) => name),
      datasets: [{
         label: "Times Worn",
         data: data.most_worn.map(([, count]) => count),
         backgroundColor: "#6366f1",
      }]
   };

   // Favorite Styles Pie
   const favoritesPie = {
      labels: data.favorites.map(([style]) => style.charAt(0).toUpperCase() + style.slice(1)),
      datasets: [{
         data: data.favorites.map(([, count]) => count),
         backgroundColor: ["#6366f1", "#ec4899", "#10b981"],
      }]
   };

   return (
      <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
         <h1>Smart Wardrobe Analytics</h1>

         <div style={{ display: "flex", flexWrap: "wrap", gap: "2rem" }}>
            <div style={{ flex: 1, minWidth: "400px" }}>
               <h2>Most Worn Outfits</h2>
               <Bar data={mostWornChart} options={{ responsive: true }} />
               <p>Total tracked events: {data.total_outfit_events}</p>
            </div>

            <div style={{ flex: 1, minWidth: "400px" }}>
               <h2>Favorite Styles</h2>
               <Pie data={favoritesPie} options={{ responsive: true }} />
            </div>
         </div>
      </div>
   );
}

export default Analytics;