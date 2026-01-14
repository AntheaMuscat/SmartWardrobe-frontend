import { useEffect, useState } from "react";
import { colors } from "../styles/theme";
import Navbar from "../components/Navbar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function AddClothes() {
   const [humidityData, setHumidityData] = useState({});
   const [brightness, setBrightness] = useState(1);
   const [color, setColor] = useState("#ffffff");
   const [message, setMessage] = useState("");

   const PI_URL = "https://lemon-berries-heal.loca.lt"; // Raspberry Pi IP

   useEffect(() => {
      const fetchHumidity = async () => {
         try {
            const res = await fetch(`${PI_URL}/humidity`);
            const data = await res.json();
            setHumidityData(data);
         } catch (err) {
            console.error(err);
         }
      };

      fetchHumidity();
      const interval = setInterval(fetchHumidity, 30000); // every 30 seconds
      return () => clearInterval(interval);
   }, []);

   const captureImage = async () => {
      let seconds = 5;
      const toastId = toast.info(`Taking picture in ${seconds}...`, {
         autoClose: false,
      });

      const countdown = setInterval(() => {
         seconds--;
         if (seconds > 0) {
            toast.update(toastId, {
               render: `Taking picture in ${seconds}...`,
            });
         } else {
            clearInterval(countdown);
         }
      }, 1000);

      try {
         await new Promise((resolve) => setTimeout(resolve, 5000));
         const res = await fetch(`${PI_URL}/capture`, { method: "POST" });
         const data = await res.json();
         setMessage(`Captured: ${data.file}`);

         toast.update(toastId, {
            render: "Image captured — processing complete! Added to wardrobe.",
            type: "success",
            isLoading: false,
            autoClose: 4000,
         });
      } catch (err) {
         console.error(err);
         clearInterval(countdown);
         toast.update(toastId, {
            render: "Capture failed. Check connection to Raspberry Pi.",
            type: "error",
            isLoading: false,
            autoClose: 5000,
         });
      }
   };

   const setLed = async (newColor = color, newBrightness = brightness) => {
      // 👈 Convert hex to RGB BEFORE sending
      const rgb = hexToRgb(newColor || color);
      setColor(newColor || color);
      setBrightness(newBrightness);

      try {
         const response = await fetch(`${PI_URL}/led`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
               color: rgb,  // 👈 Always RGB array [255,0,0]
               brightness: newBrightness
            }),
         });

         if (!response.ok) throw new Error('LED update failed');
         toast.success("LED updated! ✨");
      } catch (err) {
         console.error("LED Error:", err);
         toast.error("Failed to update LED. Check Pi connection.");
      }
   };

   // Move hexToRgb above the return (it's already there but ensure it's called)
   const hexToRgb = (hex) => {
      const bigint = parseInt(hex.slice(1), 16);
      return [
         (bigint >> 16) & 255,  // R
         (bigint >> 8) & 255,   // G
         bigint & 255           // B
      ];
   };

   return (
      <>
         <Navbar />
         <div
            style={{
               background: `linear-gradient(135deg, ${colors.secondary}, ${colors.accent2})`,
               minHeight: "100vh",
               padding: "2rem 1rem",
               color: colors.black,
               display: "flex",
               flexDirection: "column",
               alignItems: "center",
            }}
         >
            
            <div
               style={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "1rem",
                  textAlign: "center",
                  marginBottom: "2rem",
               }}
            >
               <h1
                  style={{
                     color: colors.primary,
                     fontSize: "2.3rem",
                     margin: 0,
                  }}
               >
                  Smart Wardrobe Controller
               </h1>

               <button
                  onClick={captureImage}
                  style={{
                     backgroundColor: colors.primary,
                     color: "white",
                     border: "none",
                     borderRadius: "12px",
                     padding: "12px 28px",
                     fontWeight: "600",
                     cursor: "pointer",
                     boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
                     transition: "all 0.3s ease",
                  }}
                  onMouseOver={(e) =>
                     (e.currentTarget.style.backgroundColor = colors.accent1)
                  }
                  onMouseOut={(e) =>
                     (e.currentTarget.style.backgroundColor = colors.primary)
                  }
               >
                  📷 Capture Clothing
               </button>
            </div>

            
            <div
               style={{
                  display: "flex",
                  justifyContent: "center",
                  marginBottom: "1.5rem",
                  width: "100%",
               }}
            >
               <img
                  src={`${PI_URL}/video_feed`}
                  alt="Live Feed"
                  style={{
                     width: "100%",
                     maxWidth: "640px",
                     height: "auto",
                     aspectRatio: "4 / 3",
                     borderRadius: "15px",
                     boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
                     backgroundColor: "#000",
                     objectFit: "cover",
                  }}
               />
            </div>

            <p style={{ marginTop: "0.5rem", fontWeight: "500" }}>{message}</p>

            
            <div
               style={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  gap: "1.5rem",
                  width: "100%",
                  maxWidth: "900px",
                  marginTop: "2rem",
               }}
            >
               
               <div
                  style={{
                     backgroundColor: colors.white,
                     borderRadius: "12px",
                     padding: "1.2rem",
                     flex: "1 1 300px",
                     textAlign: "center",
                     boxShadow: "0 6px 15px rgba(0,0,0,0.1)",
                  }}
               >
                  <h3 style={{ color: colors.primary, marginBottom: "0.5rem" }}>
                     🌡 Environment
                  </h3>
                  <p style={{ margin: 0 }}>
                     Humidity: {humidityData.humidity ?? "—"}%
                  </p>
                  <p style={{ margin: 0 }}>
                     Temperature: {humidityData.temperature ?? "—"}°C
                  </p>
               </div>

               
               <div
                  style={{
                     backgroundColor: colors.white,
                     borderRadius: "12px",
                     padding: "1.2rem",
                     flex: "1 1 300px",
                     textAlign: "center",
                     boxShadow: "0 6px 15px rgba(0,0,0,0.1)",
                  }}
               >
                  <h3 style={{ color: colors.primary, marginBottom: "0.5rem" }}>
                     💡 LED Control
                  </h3>
                  <input
                     type="color"
                     value={color}
                     onChange={(e) => setLed(e.target.value)}  // 👈 This now works
                     style={{
                        marginBottom: "1rem",
                        width: "60%",
                        height: "40px",
                        border: "none",
                        cursor: "pointer",
                        borderRadius: "8px",
                     }}
                  />
                  <input
                     type="range"
                     min="0"
                     max="1"
                     step="0.05"
                     value={brightness}
                     onChange={(e) => setLed(color, parseFloat(e.target.value))}  // 👈 Pass color too
                     style={{ width: "100%" }}
                  />
               </div>
            </div>
         </div>

         {/* Toasts */}
         <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            pauseOnHover
            theme="colored"
         />

         
         <style>
            {`
              @media (max-width: 768px) {
                h1 {
                  font-size: 1.8rem !important;
                }
                button {
                  width: 100%;
                  max-width: 320px;
                }
                img {
                  max-width: 100% !important;
                }
              }
            `}
         </style>
      </>
   );
}

export default AddClothes;
