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

               {Object.entries(outfitSuggestions).map(([style, data], i) => (
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

                     {/* Core Outfits (Top + Bottom or Dress) */}
                     {data.core_outfits?.length > 0 && (
                        <div className="mb-4">
                           <h4 style={{ color: colors.primary, marginBottom: "1rem" }}>
                              Core Outfits
                           </h4>
                           <div
                              className="d-grid"
                              style={{
                                 gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                                 gap: "35px",
                              }}
                           >
                              {data.core_outfits.map((pair, index) => {
                                 // pair may be legacy array [top, bottom] or new object {items, suggested_shoes, suggested_accessories}
                                 const isObject = pair && !Array.isArray(pair) && pair.items;
                                 const items = isObject ? pair.items : pair;
                                 const shoes = isObject ? (pair.suggested_shoes ? (Array.isArray(pair.suggested_shoes) ? pair.suggested_shoes[0] : pair.suggested_shoe) : pair.suggested_shoe) : null;
                                 const accessories = isObject ? (pair.suggested_accessories ? (Array.isArray(pair.suggested_accessories) ? pair.suggested_accessories[0] : pair.suggested_accessory) : pair.suggested_accessory) : null;

                                 return (
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
                                          {items.map(
                                             (item, j) =>
                                                item && (
                                                   <img
                                                      key={j}
                                                      src={item.image_path}
                                                      alt={item.type}
                                                      className="img-fluid rounded-4"
                                                      style={{
                                                         width: items[1] ? "48%" : "85%",
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
                                             {items
                                                .filter(Boolean)
                                                .map((i) => capitalizeWords(i.type))
                                                .join(" & ")}
                                          </h5>
                                          <p
                                             className="text-muted mb-0"
                                             style={{ fontSize: "0.95rem" }}
                                          >
                                             {items
                                                .filter(Boolean)
                                                .map((i) => capitalizeWords(i.colour))
                                                .join(" / ")}
                                          </p>
                                       </div>

                                       {/* Shoe Sugegstions */}
                                       {shoes && (
                                          <div style={{ marginTop: 16 }}>
                                             <h6 style={{ color: colors.primary, marginBottom: 8 }}>Recommended Shoe</h6>
                                             <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                                                <div style={{ width: 140, textAlign: "center" }}>
                                                   <img src={shoes.image_path} alt={shoes.type} style={{ width: 140, height: 110, objectFit: "contain", borderRadius: 8, background: "#f8f9fa" }} />
                                                   <div style={{ fontSize: 0.95, fontWeight: 600, color: colors.primary }}>{capitalizeWords(shoes.type)}</div>
                                                   <div style={{ fontSize: 0.85, color: "#666" }}>{capitalizeWords(shoes.colour)}</div>
                                                </div>
                                             </div>
                                          </div>
                                       )}

                                       {/* Accessory Suggestion */}
                                       {accessories && (
                                          <div style={{ marginTop: 12 }}>
                                             <h6 style={{ color: colors.primary, marginBottom: 8 }}>Recommended Accessory</h6>
                                             <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                                                <div style={{ width: 120, textAlign: "center" }}>
                                                   <img src={accessories.image_path} alt={accessories.type} style={{ width: 120, height: 100, objectFit: "contain", borderRadius: 8, background: "#f8f9fa" }} />
                                                   <div style={{ fontSize: 0.9, fontWeight: 600, color: colors.primary }}>{capitalizeWords(accessories.type)}</div>
                                                   <div style={{ fontSize: 0.78, color: "#666" }}>{capitalizeWords(accessories.colour)}</div>
                                                </div>
                                             </div>
                                          </div>
                                       )}
                                    </motion.div>
                                 );
                              })}
                           </div>
                        </div>
                     )}
                     {/* Fallback message if no core outfits */}
                     {!data.core_outfits?.length && (
                        <p className="text-muted text-center">
                           No suggestions for this style yet — add more items!
                        </p>
                     )}

                  </motion.div>
               ))}
            </div>
         </div>
      </>
   );
}

export default Outfits;