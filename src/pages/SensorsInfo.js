import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { colors } from "../styles/theme";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const PI_URL = "http://172.20.206.140:8000"; // replace with your Pi backend URL

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
      const interval = setInterval(fetchSensorLogs, 10000); // refresh every 10s
      return () => clearInterval(interval);
   }, []);

   return (
      <>
         <Navbar />
         <div style={{ padding: "2rem", minHeight: "100vh", backgroundColor: colors.secondary }}>
            <h1 style={{ textAlign: "center", color: colors.primary }}>📡 Sensor Logs</h1>

            {loading ? (
               <p style={{ textAlign: "center" }}>Loading sensor logs...</p>
            ) : logs.length === 0 ? (
               <p style={{ textAlign: "center" }}>No logs yet.</p>
            ) : (
               <div style={{ display: "flex", flexDirection: "column", gap: "1rem", alignItems: "center" }}>
                  {logs.map((log, idx) => (
                     <div
                        key={idx}
                        style={{
                           width: "100%",
                           maxWidth: "600px",
                           backgroundColor: colors.white,
                           borderRadius: "12px",
                           padding: "1rem 1.5rem",
                           boxShadow: "0 6px 15px rgba(0,0,0,0.1)",
                           display: "flex",
                           justifyContent: "space-between",
                           flexWrap: "wrap",
                           gap: "0.5rem"
                        }}
                     >
                        <div><strong>Time:</strong> {new Date(log.timestamp).toLocaleString()}</div>
                        <div><strong>Temp:</strong> {log.temperature ?? "—"}°C</div>
                        <div><strong>Humidity:</strong> {log.humidity ?? "—"}%</div>
                        <div><strong>Motion:</strong> {log.motion_detected ? "✅" : "❌"}</div>
                        <div>
                           <strong>LED:</strong>
                           <span style={{ marginLeft: 5, color: `rgb(${log.led_color?.join(",")})` }}>
                              ■
                           </span>
                           {log.led_brightness ?? "—"}
                        </div>
                     </div>
                  ))}
               </div>
            )}
         </div>
         <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      </>
   );
}
