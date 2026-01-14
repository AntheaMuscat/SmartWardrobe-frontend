import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import { colors } from "../styles/theme";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const PI_URL = "http://172.20.206.140:8000";

export default function SensorsInfo() {
   const [logs, setLogs] = useState([]);
   const [loading, setLoading] = useState(true);

   const fetchSensorLogs = async () => {
      try {
         const res = await fetch(`${PI_URL}/sensor-logs`);
         const data = await res.json();
         setLogs(data.logs || []);
         setLoading(false);
      } catch (err) {
         console.error(err);
         toast.error("Failed to fetch sensor logs");
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchSensorLogs();
      const interval = setInterval(fetchSensorLogs, 10000);
      return () => clearInterval(interval);
   }, []);

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
            <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
               <motion.h1
                  style={{
                     color: colors.primary,
                     fontSize: "2.8rem",
                     textAlign: "center",
                     marginBottom: "0.5rem",
                  }}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
               >
                  📡 Smart Wardrobe Sensor Dashboard
               </motion.h1>
               <motion.p
                  style={{ color: "#555", textAlign: "center", marginBottom: "2rem" }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
               >
                  Live temperature, humidity, motion, and LED status from your Raspberry Pi sensors.
                  Updates every 10 seconds.
               </motion.p>

               {loading ? (
                  <p style={{ textAlign: "center", fontSize: "1.2rem" }}>Loading sensor logs...</p>
               ) : logs.length === 0 ? (
                  <p style={{ textAlign: "center", fontSize: "1.2rem" }}>No logs yet.</p>
               ) : (
                  <div
                     style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                        gap: "20px",
                     }}
                  >
                     {logs.map((log, idx) => (
                        <motion.div
                           key={idx}
                           style={{
                              backgroundColor: colors.white,
                              borderRadius: "16px",
                              padding: "1.5rem",
                              boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                              display: "flex",
                              flexDirection: "column",
                              gap: "0.5rem",
                              position: "relative",
                           }}
                           initial={{ opacity: 0, y: 20 }}
                           animate={{ opacity: 1, y: 0 }}
                           transition={{ delay: idx * 0.05 }}
                        >
                           <h4 style={{ color: colors.primary, marginBottom: "0.5rem" }}>
                              {new Date(log.timestamp).toLocaleString()}
                           </h4>
                           <p style={{ margin: 0 }}><strong>Temperature:</strong> {log.temperature ?? "—"}°C</p>
                           <p style={{ margin: 0 }}><strong>Humidity:</strong> {log.humidity ?? "—"}%</p>
                           <p style={{ margin: 0 }}>
                              <strong>Motion:</strong> {log.motion_detected ? "✅ Detected" : "❌ None"}
                           </p>
                           <p style={{ margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                              <strong>LED:</strong>{" "}
                              <span style={{ color: `rgb(${log.led_color?.join(",")})` }}>■</span>
                              {log.led_brightness ?? "—"}
                           </p>
                        </motion.div>
                     ))}
                  </div>
               )}
            </div>
         </div>
         <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      </>
   );
}
