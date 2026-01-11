import { useEffect, useState } from "react";
import { Bar, Pie } from "react-chartjs-2";
import {
   Chart as ChartJS,
   BarElement,
   CategoryScale,
   LinearScale,
   ArcElement,
   Tooltip,
   Legend,
   BarController,
   PieController,
} from "chart.js";

ChartJS.register(
   CategoryScale,
   LinearScale,
   BarElement,
   ArcElement,
   Tooltip,
   Legend,
   BarController,
   PieController
);

function Analytics() {
   const [data, setData] = useState(null);
   const [error, setError] = useState(null);

   useEffect(() => {
      fetch("https://antheamuscat-smart-wardrobe-backend.hf.space/analytics", {
         credentials: "include", // 🔥 REQUIRED
      })
         .then((res) => {
            if (!res.ok) throw new Error(`Status ${res.status}`);
            return res.json();
         })
         .then(setData)
         .catch((err) => {
            console.error("Analytics error:", err);
            setError(err.message || "Failed to load analytics");
         });
   }, []);


   if (error) return <p>Analytics error: {error}</p>;
   if (!data) return <p>Loading analytics...</p>;

   const mostWorn = Array.isArray(data.most_worn) ? data.most_worn : [];
   const favorites = Array.isArray(data.favorites) ? data.favorites : [];

   const mostWornChart = {
      labels: mostWorn.map(([name]) => name),
      datasets: [
         {
            label: "Times Worn",
            data: mostWorn.map(([, count]) => count),
            backgroundColor: "#6366f1",
         },
      ],
   };

   const favoritesPie = {
      labels: favorites.map(([style]) => (style ? style.charAt(0).toUpperCase() + style.slice(1) : "")),
      datasets: [
         {
            data: favorites.map(([, count]) => count),
            backgroundColor: ["#6366f1", "#ec4899", "#10b981"],
         },
      ],
   };

   return (
      <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
         <h1>Smart Wardrobe Analytics</h1>

         <div style={{ display: "flex", flexWrap: "wrap", gap: "2rem" }}>
            <div style={{ flex: 1, minWidth: "400px" }}>
               <h2>Most Worn Outfits</h2>
               <Bar data={mostWornChart} options={{ responsive: true }} />
               <p>Total tracked events: {data.total_outfit_events ?? 0}</p>
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