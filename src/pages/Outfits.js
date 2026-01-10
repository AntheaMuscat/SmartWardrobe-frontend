import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { colors } from "../styles/theme";
import Navbar from "../components/Navbar";

function Outfits() {
   const [outfitSuggestions, setOutfitSuggestions] = useState({});

   useEffect(() => {
      fetchOutfits();
   }, []);

   const fetchOutfits = () => {
      console.log("Fetching new outfits...");
      fetch(`https://antheamuscat-smart-wardrobe-backend.hf.space/outfits?nocache=${Date.now()}`)
         .then((res) => res.json())
         .then((data) => {
            console.log("Got data:", data);
            setOutfitSuggestions(data.outfit_suggestions || {});
         })
         .catch((err) => console.error("Fetch error:", err));
   };

   const capitalizeWords = (text) =>
      text
         ? text
            .toLowerCase()
            .replace(/\b\w/g, (char) => char.toUpperCase())
            .replace(/\s+/g, " ")
         : "";

   return (
      <>
         <Navbar />
         <div
            style={{
               minHeight: "100vh",
               background: `linear-gradient(135deg, ${colors.secondary}, ${colors.accent2})`,
               fontFamily: "'Inter', sans-serif",
               padding: "3rem 2rem",
            }}
         >
            <div className="container">
               <motion.h1
                  className="fw-bold mb-5"
                  style={{
                     color: colors.primary,
                     fontSize: "2.3rem",
                     textAlign: "left",
                  }}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
               >
                  Outfit Suggestions 👕
               </motion.h1>

               <button
                  onClick={fetchOutfits}
                  style={{
                     backgroundColor: colors.primary,
                     color: "white",
                     border: "none",
                     borderRadius: "8px",
                     padding: "10px 20px",
                     fontWeight: "bold",
                     cursor: "pointer",
                     marginBottom: "2rem",
                  }}
               >
                  🔁 Refresh Outfits
               </button>

               {Object.entries(outfitSuggestions).map(([style, outfits], i) => (
                  <motion.div
                     key={style}
                     className="mb-5"
                     initial={{ opacity: 0, y: 40 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: i * 0.1 }}
                  >
                     <h2
                        className="fw-bold mb-4"
                        style={{
                           color: colors.primary,
                           fontSize: "1.7rem",
                           textAlign: "left",
                        }}
                     >
                        {capitalizeWords(style)} Wear
                     </h2>

                     <div
                        className="d-grid"
                        style={{
                           gridTemplateColumns:
                              "repeat(auto-fill, minmax(320px, 1fr))",
                           gap: "35px",
                        }}
                     >
                        {outfits.map((pair, index) => (
                           <motion.div
                              key={index}
                              className="p-4 rounded-4"
                              style={{
                                 backgroundColor: "white",
                                 boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
                                 border: "1px solid rgba(0,0,0,0.1)",
                                 transition: "all 0.3s ease",
                                 cursor: "default",
                              }}
                              whileHover={{ scale: 1.04 }}
                           >
                              <div
                                 className="d-flex justify-content-center align-items-center"
                                 style={{
                                    minHeight: "250px",
                                    gap: "10px",
                                 }}
                              >
                                 {pair.map(
                                    (item, j) =>
                                       item && (
                                          <img
                                             key={j}
                                             src={item.image_path} 
                                             alt={item.type}
                                             className="img-fluid rounded-4"
                                             style={{
                                                width: pair[1] ? "48%" : "85%",
                                                height: "220px",
                                                objectFit: "contain",
                                                backgroundColor: "#f8f9fa",
                                                borderRadius: "12px",
                                                padding: "10px",
                                                transition: "transform 0.3s ease",
                                             }}
                                          />
                                       )
                                 )}
                              </div>

                              <div
                                 style={{
                                    textAlign: "center",
                                    marginTop: "18px",
                                 }}
                              >
                                 <h5
                                    className="fw-bold mb-2"
                                    style={{
                                       color: colors.primary,
                                       fontSize: "1.1rem",
                                    }}
                                 >
                                    {pair
                                       .filter(Boolean)
                                       .map((i) => capitalizeWords(i.type))
                                       .join(" & ")}
                                 </h5>
                                 <p
                                    className="text-muted mb-0"
                                    style={{ fontSize: "0.95rem" }}
                                 >
                                    {pair
                                       .filter(Boolean)
                                       .map((i) => capitalizeWords(i.colour))
                                       .join(" / ")}
                                 </p>
                              </div>
                           </motion.div>
                        ))}
                     </div>
                  </motion.div>
               ))}
            </div>
         </div>
      </>
   );
}

export default Outfits;
