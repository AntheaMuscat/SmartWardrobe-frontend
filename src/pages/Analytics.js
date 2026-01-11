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

   const mostWornChart = {
      labels: mostWorn.map(([name]) => name),
      datasets: [
         {
            label: "Times Worn",
            data: mostWorn.map(([, count]) => count),
            backgroundColor: colors.primary,
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
            backgroundColor: [
               colors.primary,
               colors.accent1,
               colors.accent2,
            ],
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

                        <p
                           className="mt-3"
                           style={{ color: "#777", fontSize: "0.9rem" }}
                        >
                           Total outfit events:{" "}
                           <strong>{data.total_outfit_events ?? 0}</strong>
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
