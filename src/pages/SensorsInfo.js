import { useEffect, useState } from "react";
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
         <div style={{
            padding: "3rem",
            minHeight: "100vh",
            backgroundColor: colors.secondary,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "2rem"
         }}>
            <h1 style={{ color: colors.primary, fontSize: "2.5rem", textAlign: "center" }}>
               📡 Smart Wardrobe Sensor Dashboard
            </h1>
            <p style={{ textAlign: "center", color: "#555", maxWidth: "700px" }}>
               Live temperature, humidity, motion, and LED status from your Raspberry Pi sensors.
               Updates every 10 seconds.
            </p>

            {loading ? (
               <p style={{ textAlign: "center", fontSize: "1.2rem" }}>Loading sensor logs...</p>
            ) : logs.length === 0 ? (
               <p style={{ textAlign: "center", fontSize: "1.2rem" }}>No logs yet.</p>
            ) : (
               <div style={{
                  width: "100%",
                  maxWidth: "900px",
                  backgroundColor: colors.white,
                  borderRadius: "16px",
                  padding: "2rem",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
               }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "center" }}>
                     <thead>
                        <tr>
                           <th style={{ padding: "0.75rem", borderBottom: "2px solid #eee" }}>Time</th>
                           <th style={{ padding: "0.75rem", borderBottom: "2px solid #eee" }}>Temp (°C)</th>
                           <th style={{ padding: "0.75rem", borderBottom: "2px solid #eee" }}>Humidity (%)</th>
                           <th style={{ padding: "0.75rem", borderBottom: "2px solid #eee" }}>Motion</th>
                           <th style={{ padding: "0.75rem", borderBottom: "2px solid #eee" }}>LED</th>
                        </tr>
                     </thead>
                     <tbody>
                        {logs.map((log, idx) => (
                           <tr key={idx} style={{ borderBottom: "1px solid #f0f0f0" }}>
                              <td style={{ padding: "0.75rem" }}>{new Date(log.timestamp).toLocaleString()}</td>
                              <td style={{ padding: "0.75rem" }}>{log.temperature ?? "—"}</td>
                              <td style={{ padding: "0.75rem" }}>{log.humidity ?? "—"}</td>
                              <td style={{ padding: "0.75rem" }}>{log.motion_detected ? "✅" : "❌"}</td>
                              <td style={{ padding: "0.75rem", display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem" }}>
                                 <span style={{ color: `rgb(${log.led_color?.join(",")})` }}>■</span>
                                 {log.led_brightness ?? "—"}
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            )}
         </div>
         <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      </>
   );
}
