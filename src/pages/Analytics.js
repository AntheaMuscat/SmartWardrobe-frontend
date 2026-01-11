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
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import { colors } from "../styles/theme";

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
         credentials: "include",
      })
         .then((res) => {
            if (!res.ok) throw new Error(`Status ${res.status}`);
            return res.json();
         })
         .then(setData)
         .catch((err) => setError(err.message));
   }, []);

   if (error) return <p style={{ color: "white" }}>Analytics error: {error}</p>;
   if (!data) return <p style={{ color: "white" }}>Loading analytics...</p>;

   const mostWorn = data.most_worn || [];
   const favorites = data.favorites || [];

   // normalize mostWorn to array of objects: {name, count, image_url}
   const normalizedMostWorn = mostWorn.map((it) => {
      if (Array.isArray(it)) {
         return { name: it[0], count: it[1], image_url: null };
      }
      return { name: it.name ?? it[0], count: it.count ?? it[1], image_url: it.image_url ?? null };
   });

   // Generate visually distinct HSL colors for each item to avoid repeats
   const generatePalette = (n, s = 68, l = 55) => {
      if (!n || n <= 0) return [];
      return Array.from({ length: n }, (_, i) => `hsl(${Math.round((360 * i) / n)}, ${s}%, ${l}%)`);
   };

   const barBackgrounds = generatePalette(normalizedMostWorn.length, 62, 56);
   const pieBackgrounds = generatePalette(favorites.length || 3, 62, 56);

   const mostWornChart = {
      labels: normalizedMostWorn.map((m) => m.name),
      datasets: [
         {
            label: "Times Worn",
            data: normalizedMostWorn.map((m) => m.count),
            backgroundColor: barBackgrounds,
            borderColor: barBackgrounds,
            borderWidth: 1,
            borderRadius: 10,
         },
      ],
   };

   const favoritesPie = {
      labels: favorites.map(([style]) =>
         style ? style.charAt(0).toUpperCase() + style.slice(1) : ""
      ),
      datasets: [
         {
            data: favorites.map(([, count]) => count),
            backgroundColor: pieBackgrounds,
            hoverOffset: 6,
         },
      ],
   };

   return (
      <>
         <Navbar />

         <div
            style={{
               minHeight: "100vh",
               background: `linear-gradient(135deg, ${colors.secondary}, ${colors.accent2})`,
               padding: "3rem 2rem",
               fontFamily: "'Inter', sans-serif",
            }}
         >
            <div className="container">
               <motion.h1
                  className="fw-bold mb-5"
                  style={{ color: colors.primary, fontSize: "2.5rem" }}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
               >
                  Analytics 📊
               </motion.h1>

               <div className="row g-4">
                  {/* Most Worn */}
                  <motion.div
                     className="col-lg-6"
                     initial={{ opacity: 0, y: 40 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: 0.1 }}
                  >
                     <div
                        style={{
                           background: "white",
                           borderRadius: "20px",
                           padding: "2rem",
                           boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                           height: "100%",
                        }}
                     >
                        <h4
                           className="fw-bold mb-4"
                           style={{ color: colors.primary }}
                        >
                           Most Worn Outfits
                        </h4>

                        <Bar
                           data={mostWornChart}
                           options={{
                              responsive: true,
                              plugins: {
                                 legend: { display: false },
                              },
                           }}
                        />

                        <div style={{ display: "flex", gap: "1rem", marginTop: "1rem", alignItems: "center", flexWrap: "wrap" }}>
                           {normalizedMostWorn.map((item) => (
                              <div key={item.name} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                 {item.image_url ? (
                                    <img src={item.image_url} alt={item.name} style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 8, border: "1px solid #eee" }} />
                                 ) : (
                                    <div style={{ width: 56, height: 56, background: "#f3f4f6", borderRadius: 8 }} />
                                 )}
                                 <div style={{ fontSize: "0.9rem" }}>
                                    <div style={{ fontWeight: 600, color: colors.primary }}>{item.name}</div>
                                    <div style={{ color: "#777" }}>{item.count}×</div>
                                 </div>
                              </div>
                           ))}
                        </div>

                        <p
                           className="mt-3"
                           style={{ color: "#777", fontSize: "0.9rem" }}
                        >
                           Total outfit events: <strong>{data.total_outfit_events ?? 0}</strong>
                        </p>
                     </div>
                  </motion.div>

                  {/* Favorite Styles */}
                  <motion.div
                     className="col-lg-6"
                     initial={{ opacity: 0, y: 40 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: 0.2 }}
                  >
                     <div
                        style={{
                           background: "white",
                           borderRadius: "20px",
                           padding: "2rem",
                           boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                           height: "100%",
                        }}
                     >
                        <h4
                           className="fw-bold mb-4"
                           style={{ color: colors.primary }}
                        >
                           Favorite Styles
                        </h4>

                        <Pie
                           data={favoritesPie}
                           options={{
                              responsive: true,
                              plugins: {
                                 legend: {
                                    position: "bottom",
                                 },
                              },
                           }}
                        />
                     </div>
                  </motion.div>
               </div>
            </div>
         </div>
      </>
   );
}

export default Analytics;
