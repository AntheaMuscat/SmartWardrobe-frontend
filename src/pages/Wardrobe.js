import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { colors } from "../styles/theme";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

function Wardrobe() {
   console.log("👟 Wardrobe component mounted");

   const [wardrobeData, setWardrobeData] = useState([]);
   const [selectedItems, setSelectedItems] = useState([]);
   const navigate = useNavigate();

   const topsRef = useRef(null);
   const bottomsRef = useRef(null);
   const outerwearRef = useRef(null);
   const dressesRef = useRef(null);
   const shoesRef = useRef(null);
   const accessoriesRef = useRef(null);

   const API_URL = "https://antheamuscat-smart-wardrobe-backend.hf.space";

   useEffect(() => {
      console.log("Fetching wardrobe...");
      fetch(`${API_URL}/wardrobe`, {
         mode: "cors",
         headers: { "Content-Type": "application/json" },
      })
         .then((res) => res.json())
         .then((data) => {
            const wardrobe = (data.wardrobe || []).map((item) => ({
               colour: item.colour,
               date_added: item.date_added,
               image_path: item.image_path,
               material: item.material,
               type: item.type,
               style: item.style,
            }));

            console.log("Normalized wardrobe:", wardrobe);
            setWardrobeData(wardrobe);
         })
         .catch((err) => console.error("Fetch failed:", err));
   }, []);

   const handleSelect = (uniqueKey, e) => {
      e.stopPropagation();
      setSelectedItems((prev) =>
         prev.includes(uniqueKey)
            ? prev.filter((id) => id !== uniqueKey)
            : [...prev, uniqueKey]
      );
   };

   const scrollToSection = (ref) =>
      ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });

   // Categorize items
   const categorized = {
      Tops: wardrobeData.filter((item) =>
         ["shirt", "t-shirt", "blouse", "hoodie", "sweater", "top"].some((t) =>
            item.type?.toLowerCase().includes(t)
         )
      ),
      Bottoms: wardrobeData.filter((item) =>
         ["jeans", "trousers", "shorts", "skirt", "pants"].some((t) =>
            item.type?.toLowerCase().includes(t)
         )
      ),
      Dresses: wardrobeData.filter((item) =>
         ["dress", "gown", "jumpsuit"].some((t) =>
            item.type?.toLowerCase().includes(t)
         )
      ),
      Outerwear: wardrobeData.filter((item) =>
         ["jacket", "coat", "blazer"].some((t) =>
            item.type?.toLowerCase().includes(t)
         )
      ),
      Shoes: wardrobeData.filter((item) =>
         ["shoes", "sneakers", "boots"].some((t) =>
            item.type?.toLowerCase().includes(t)
         )
      ),
      Accessories: wardrobeData.filter((item) =>
         ["scarf", "hat", "belt", "bag", "watch"].some((t) =>
            item.type?.toLowerCase().includes(t)
         )
      ),
   };

   const handleAddToCalendar = () => {
      if (selectedItems.length === 0) {
         alert("Please select at least one item to add to the calendar.");
         return;
      }

      const itemsToAdd = wardrobeData.filter((i) =>
         selectedItems.includes(i.image_path)
      );

      // Navigate to calendar with MULTIPLE outfits encoded in URL
      navigate(
         `/calendar?items=${encodeURIComponent(JSON.stringify(itemsToAdd))}`
      );
   };

   const handleDeleteClothes = async () => {
      if (selectedItems.length === 0) {
         alert("Please select at least one item to delete.");
         return;
      }

      if (!window.confirm("Are you sure you want to delete them?")) return;

      try {
         const res = await fetch(`${API_URL}/delete_clothes`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items: selectedItems }), // List of image_path values
         });

         const data = await res.json();
         console.log("Delete response:", data);

         // Remove deleted items from UI
         setWardrobeData((prev) =>
            prev.filter((item) => !selectedItems.includes(item.image_path))
         );
         setSelectedItems([]);

      } catch (err) {
         console.error("Delete failed:", err);
      }
   };

   const capitalizeWords = (text) =>
      text
         ? text
            .toLowerCase()
            .replace(/\b\w/g, (char) => char.toUpperCase())
            .replace(/\s+/g, " ")
         : "";

   const formatDate = (dateStr) => {
      if (!dateStr) return "N/A";
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-GB", {
         day: "2-digit",
         month: "short",
         year: "numeric",
      });
   };

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
            {/* Header */}
            <div className="container mb-5">
               <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4">
                  <h1
                     className="fw-bold mb-3 mb-md-0"
                     style={{ color: colors.primary, fontSize: "2.5rem" }}
                  >
                     My Wardrobe 👕
                  </h1>
                  <motion.button
                     className="btn px-5 py-3 fw-semibold"
                     style={{
                        backgroundColor: colors.primary,
                        border: "none",
                        borderRadius: "16px",
                        color: colors.surface,
                        fontSize: "1rem",
                        boxShadow: `0 4px 15px ${colors.shadow}`,
                     }}
                     whileHover={{
                        scale: 1.05,
                        backgroundColor: colors.accent1,
                     }}
                     transition={{ duration: 0.3 }}
                     onClick={handleAddToCalendar}
                  >
                     Add Selected to Calendar{" "}
                     {selectedItems.length > 0 && (
                        <span>({selectedItems.length})</span>
                     )}
                  </motion.button>

                  <motion.button
                     className="btn px-5 py-3 fw-semibold ms-2"
                     style={{
                        backgroundColor: "#ff4d4d",
                        border: "none",
                        borderRadius: "16px",
                        color: "white",
                        fontSize: "1rem",
                        boxShadow: "0 4px 15px rgba(255, 0, 0, 0.3)",
                     }}
                     whileHover={{ scale: 1.05, backgroundColor: "#e60000" }}
                     transition={{ duration: 0.3 }}
                     onClick={handleDeleteClothes}
                  >
                     Delete Selected {selectedItems.length > 0 && <span>({selectedItems.length})</span>}
                  </motion.button>


               </div>

               <div
                  className="d-flex flex-wrap justify-content-center gap-3 mb-5"
                  style={{ color: "white" }}
               >
                  {[
                     { name: "Tops", ref: topsRef },
                     { name: "Bottoms", ref: bottomsRef },
                     { name: "Dresses", ref: dressesRef },
                     { name: "Outerwear", ref: outerwearRef },
                     { name: "Shoes", ref: shoesRef },
                     { name: "Accessories", ref: accessoriesRef },
                  ].map((cat) => (
                     <motion.button
                        key={cat.name}
                        onClick={() => scrollToSection(cat.ref)}
                        className="px-4 py-2 fw-semibold"
                        style={{
                           backgroundColor: colors.primary,
                           border: "none",
                           borderRadius: "25px",
                           color: "white",
                           transition: "all 0.3s ease",
                        }}
                        whileHover={{
                           scale: 1.05,
                           backgroundColor: colors.accent1,
                        }}
                     >
                        {cat.name}
                     </motion.button>
                  ))}
               </div>
            </div>

            <div className="container">
               {Object.entries(categorized).map(([category, items], i) => {
                  if (!items.length) return null;

                  const ref =
                     category === "Tops"
                        ? topsRef
                        : category === "Bottoms"
                           ? bottomsRef
                           : category === "Dresses"
                              ? dressesRef
                              : category === "Outerwear"
                                 ? outerwearRef
                                 : category === "Shoes"
                                    ? shoesRef
                                    : accessoriesRef;

                  return (
                     <motion.div
                        key={category}
                        ref={ref}
                        className="mb-5"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + i * 0.1 }}
                     >
                        <h2
                           className="fw-bold mb-4"
                           style={{
                              color: colors.primary,
                              fontSize: "1.8rem",
                              textAlign: "left",
                           }}
                        >
                           {category}
                        </h2>

                        <div
                           className="d-grid"
                           style={{
                              gridTemplateColumns:
                                 "repeat(auto-fill, minmax(250px, 1fr))",
                              gap: "30px",
                           }}
                        >
                           {items.map((item) => {
                              const uniqueKey = item.image_path;
                              const isSelected =
                                 selectedItems.includes(uniqueKey);

                              return (
                                 <motion.div
                                    key={uniqueKey}
                                    onClick={(e) => handleSelect(uniqueKey, e)}
                                    className="p-3 rounded-4"
                                    style={{
                                       backgroundColor: "white",
                                       boxShadow: isSelected
                                          ? "0 8px 24px rgba(0,172,193,0.35)"
                                          : "0 8px 20px rgba(0,0,0,0.1)",
                                       cursor: "pointer",
                                       transform: isSelected
                                          ? "scale(1.03)"
                                          : "scale(1)",
                                       transition: "all 0.3s ease",
                                       position: "relative",
                                    }}
                                    whileHover={{ scale: 1.04 }}
                                 >
                                    <div
                                       style={{
                                          position: "absolute",
                                          top: "14px",
                                          right: "18px",
                                          width: "20px",
                                          height: "20px",
                                          borderRadius: "50%",
                                          border: "2px solid rgba(0,0,0,0.6)",
                                          backgroundColor: isSelected
                                             ? colors.primary
                                             : "transparent",
                                          transition:
                                             "background-color 0.3s ease",
                                       }}
                                    ></div>

                                    <motion.img
                                       src={item.image_path}
                                       alt={item.type}
                                       className="img-fluid rounded-4 mb-3"
                                       style={{
                                          width: "100%",
                                          height: "200px",
                                          objectFit: "contain",
                                          backgroundColor: "#f8f9fa",
                                          borderRadius: "12px",
                                          padding: "10px",
                                       }}
                                       whileHover={{ scale: 1.02 }}
                                    />

                                    <h5
                                       className="fw-bold mb-2"
                                       style={{
                                          color: colors.primary,
                                          textTransform: "capitalize",
                                       }}
                                    >
                                       {capitalizeWords(item.type)}
                                    </h5>
                                    <p
                                       className="mb-1"
                                       style={{
                                          color: "#555",
                                          textTransform: "capitalize",
                                       }}
                                    >
                                       {capitalizeWords(
                                          `${item.colour} ${item.material}`
                                       )}
                                    </p>
                                    <p
                                       className="mb-0"
                                       style={{
                                          fontSize: "0.9rem",
                                          color: "#888",
                                       }}
                                    >
                                       Date Added: {formatDate(item.date_added)}
                                    </p>
                                 </motion.div>
                              );
                           })}
                        </div>
                     </motion.div>
                  );
               })}
            </div>
         </div>
      </>
   );
}

export default Wardrobe;
