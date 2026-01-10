import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { colors } from "../styles/theme";
import Navbar from "../components/Navbar";
import "bootstrap/dist/css/bootstrap.min.css";

function Home() {
   const [weatherData, setWeatherData] = useState(null);
   const [allOutfits, setAllOutfits] = useState([]);
   const [allItems, setAllItems] = useState([]);
   const [outfitData, setOutfitData] = useState(null);
   const [selectedStyle, setSelectedStyle] = useState("all");
   const [availableStyles, setAvailableStyles] = useState(["all"]);
   const [greeting, setGreeting] = useState("Hello");

   // Greeting based on time
   useEffect(() => {
      const hour = new Date().getHours();
      if (hour < 12) setGreeting("Good Morning");
      else if (hour < 18) setGreeting("Good Afternoon");
      else setGreeting("Good Evening");
   }, []);

   // Fetch weather and outfits
   useEffect(() => {
      const apiKey = "152ed82b5242e33c5906ac1fd3372c22";
      const cacheKey = "weatherCache";
      const cacheDuration = 10 * 60 * 1000;

      const cached = localStorage.getItem(cacheKey);
      if (cached) {
         const parsed = JSON.parse(cached);
         const isFresh = Date.now() - parsed.timestamp < cacheDuration;
         if (isFresh) {
            setWeatherData(parsed.data);
            fetchAllOutfits(parsed.data.condition);
            return;
         }
      }

      const url = `https://api.openweathermap.org/data/2.5/weather?q=Malta,MT&units=metric&appid=${apiKey}`;
      fetch(url)
         .then((res) => res.json())
         .then((data) => {
            const weatherMain = data.weather[0].main.toLowerCase();
            const temp = data.main.temp;

            let condition = "mild";
            if (weatherMain.includes("rain")) condition = "rainy";
            else if (temp <= 18) condition = "cold";
            else if (temp >= 25) condition = "hot";
            else condition = "mild";

            const formatted = {
               location: "Malta 🇲🇹",
               temperature: Math.round(temp),
               feelsLike: Math.round(data.main.feels_like),
               description: data.weather[0].description.replace(/\b\w/g, (c) => c.toUpperCase()),
               humidity: `${data.main.humidity}%`,
               wind: `${Math.round(data.wind.speed * 3.6)} km/h`,
               icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
               condition,
            };

            localStorage.setItem(
               cacheKey,
               JSON.stringify({ data: formatted, timestamp: Date.now() })
            );

            setWeatherData(formatted);
            fetchAllOutfits(condition);
         })
         .catch((err) => {
            console.error("Weather fetch error:", err);
            const fallback = {
               location: "Malta 🇲🇹",
               temperature: 20,
               feelsLike: 20,
               description: "Partly Cloudy",
               humidity: "60%",
               wind: "10 km/h",
               icon: "https://openweathermap.org/img/wn/02d@2x.png",
               condition: "mild",
            };
            setWeatherData(fallback);
            fetchAllOutfits(fallback.condition);
         });
   }, []);

   // Fetch all outfits from backend
   const fetchAllOutfits = (weatherCondition) => {
      fetch(`https://antheamuscat-smart-wardrobe-backend.hf.space/wardrobe`)
         .then((res) => res.json())
         .then((data) => {
            const outfits = data.outfits || [];
            setAllOutfits(outfits);

            const flatItems = outfits.flat().filter(Boolean);
            const uniqueMap = new Map();
            flatItems.forEach((item) => {
               const key = item.image_path;
               if (!uniqueMap.has(key)) uniqueMap.set(key, item);
            });
            const uniqueItems = Array.from(uniqueMap.values());
            setAllItems(uniqueItems);

            const styles = new Set(["all"]);
            uniqueItems.forEach((item) => {
               if (item?.style) styles.add(item.style.toLowerCase());
            });
            setAvailableStyles([...styles]);
         })
         .catch((err) => {
            console.error("Outfit fetch error:", err);
            setAllOutfits([]);
            setAllItems([]);
            setOutfitData(null);
         });
   };

   // ──────────────
   // Clothing Categories & Heaviness
   // ──────────────
   const TOP_TYPES = [
      "t-shirt", "long-sleeve t-shirt", "sleeveless tank top", "blouse",
      "button-up shirt", "polo shirt", "v-neck shirt", "crew neck t-shirt",
      "turtleneck", "off-shoulder top", "cropped top", "fitted shirt", "loose hoodie"
   ];
   const OUTERWEAR_TYPES = ["denim jacket", "leather jacket", "cardigan"];
   const BOTTOM_TYPES = ["trousers", "jeans", "shorts", "cargo pants", "sweatpants",
      "mini skirt", "midi skirt", "maxi skirt", "pencil skirt", "pleated skirt"];
   const DRESS_TYPES = ["dress", "summer dress", "cocktail dress", "maxi dress", "jumpsuit", "overalls"];

   const TOP_HEAVINESS = {
      "t-shirt": "light", "long-sleeve t-shirt": "medium", "sleeveless tank top": "light",
      "blouse": "light", "button-up shirt": "medium", "polo shirt": "light", "v-neck shirt": "light",
      "crew neck t-shirt": "light", "turtleneck": "heavy", "off-shoulder top": "light",
      "cropped top": "light", "fitted shirt": "medium", "loose hoodie": "heavy",
   };
   const OUTERWEAR_HEAVINESS = { "denim jacket": "medium", "leather jacket": "medium", "cardigan": "medium" };
   const BOTTOM_HEAVINESS = {
      "shorts": "light", "mini skirt": "light", "midi skirt": "light", "maxi skirt": "medium", "jeans": "medium",
      "trousers": "medium", "cargo pants": "medium", "pencil skirt": "medium", "pleated skirt": "light", "sweatpants": "heavy"
   };
   const DRESS_HEAVINESS = {
      "dress": "medium", "summer dress": "light", "cocktail dress": "medium", "maxi dress": "medium",
      "jumpsuit": "medium", "overalls": "heavy"
   };

   const COLD_FORBIDDEN = ["cropped top", "sleeveless tank top", "off-shoulder top", "shorts", "mini skirt"];
   const HOT_FORBIDDEN = ["hoodie", "sweater", "turtleneck", "loose hoodie"];

   const normalize = (t) => t?.toLowerCase().trim();
   const isTop = (t) => TOP_TYPES.includes(normalize(t));
   const isOuterwear = (t) => OUTERWEAR_TYPES.includes(normalize(t));
   const isBottom = (t) => BOTTOM_TYPES.includes(normalize(t));
   const isDress = (t) => DRESS_TYPES.includes(normalize(t));
   const isRealTop = (t) => isTop(t) && !isOuterwear(t);

   const getHeaviness = (item) => {
      const type = normalize(item.type);
      return TOP_HEAVINESS[type] || OUTERWEAR_HEAVINESS[type] || BOTTOM_HEAVINESS[type] || DRESS_HEAVINESS[type] || "medium";
   };

   const isItemAppropriate = (item, isCold, isHot) => {
      const type = normalize(item.type);
      const heaviness = getHeaviness(item);
      if (isCold) {
         if (COLD_FORBIDDEN.includes(type)) return false;
         if (isBottom(type) && heaviness === "light") return false;
         if (isRealTop(type) && heaviness === "light") return false;
      }
      if (isHot) {
         if (HOT_FORBIDDEN.includes(type)) return false;
         if (heaviness === "heavy" && !isOuterwear(type)) return false;
      }
      if (!isCold && !isHot) {
         if (heaviness === "heavy" && !isOuterwear(type)) return false;
      }
      return true;
   };

   const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

   // ──────────────
   // Pick outfit based on style and weather
   // ──────────────
   const pickWeatherAppropriateOutfit = useCallback((items, weatherCondition, style) => {
      if (!items || items.length === 0) { setOutfitData(null); return; }

      const temp = weatherData?.temperature ?? 20;
      const isCold = temp <= 18;
      const isHot = temp >= 25;
      const styleLower = style.toLowerCase();

      const appropriateItems = items.filter((item) => isItemAppropriate(item, isCold, isHot));
      if (appropriateItems.length === 0) { setOutfitData(null); return; }

      // Dresses
      const dresses = appropriateItems.filter((i) => isDress(i.type));
      const styledDresses = dresses.filter((i) => normalize(i.style) === styleLower);
      const useDresses = style !== "all" && styledDresses.length > 0 ? styledDresses : dresses;
      const dressOutfit = useDresses.length > 0 ? [pickRandom(useDresses)] : null;

      // Base: Top + Bottom
      const realTops = appropriateItems.filter((i) => isRealTop(i.type));
      const styledRealTops = realTops.filter((i) => normalize(i.style) === styleLower);
      const useRealTops = style !== "all" && styledRealTops.length > 0 ? styledRealTops : realTops;

      const bottoms = appropriateItems.filter((i) => isBottom(i.type));
      const styledBottoms = bottoms.filter((i) => normalize(i.style) === styleLower);
      const useBottoms = style !== "all" && styledBottoms.length > 0 ? styledBottoms : bottoms;

      let baseOutfit = [];
      if (useRealTops.length > 0 && useBottoms.length > 0) {
         baseOutfit = [pickRandom(useRealTops), pickRandom(useBottoms)];
      }

      // Optional outerwear
      let finalOutfit = baseOutfit.length > 0 ? [...baseOutfit] : dressOutfit || [];
      const outerwearItems = appropriateItems.filter((i) => isOuterwear(i.type));
      const styledOuterwear = outerwearItems.filter((i) => normalize(i.style) === styleLower);
      const useOuterwear = style !== "all" && styledOuterwear.length > 0 ? styledOuterwear : outerwearItems;
      if (useOuterwear.length > 0 && finalOutfit.length > 0) {
         const shouldAdd = isCold || (!isHot && Math.random() > 0.5);
         if (shouldAdd) finalOutfit.push(pickRandom(useOuterwear));
      }

      setOutfitData(finalOutfit.length > 0 ? finalOutfit : null);
   }, [weatherData]);

   // Recompute outfit whenever style, items, or weather changes
   useEffect(() => {
      if (allItems.length > 0 && weatherData) {
         pickWeatherAppropriateOutfit(allItems, weatherData.condition, selectedStyle);
      }
   }, [selectedStyle, allItems, weatherData, pickWeatherAppropriateOutfit]);

   const getWeatherSuggestion = (temp, condition) => {
      if (temp <= 18) return "❄️ Chilly day — layer up with a jacket or coat!";
      if (temp >= 25) return "☀️ Sunny & hot — keep it light and breathable!";
      if (condition === "rainy") return "🌧 Rainy — bring an umbrella and consider a light jacket.";
      return "🌤 Mild & comfortable — shirt + trousers is perfect.";
   };


   return (
      <>
         <Navbar />
         <div
            className="d-flex flex-column align-items-center justify-content-center text-center"
            style={{
               minHeight: "100vh",
               background: `linear-gradient(135deg, ${colors.secondary}, ${colors.accent2})`,
               color: colors.black,
               fontFamily: "'Inter', sans-serif",
               overflow: "hidden",
               padding: "2rem",
            }}
         >
            {weatherData && (
               <motion.div
                  className="rounded-5 shadow-lg p-5 mb-5"
                  style={{
                     width: "100%",
                     maxWidth: "900px",
                     background: `linear-gradient(145deg, ${colors.surface}, ${colors.secondary})`,
                     boxShadow: `0 20px 50px rgba(0,0,0,0.1)`,
                  }}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
               >
                  <h1 className="fw-bold mb-3" style={{ color: colors.primary, fontSize: "3rem" }}>
                     {greeting}, Anthea 🌤️
                  </h1>
                  <p className="lead mb-4" style={{ color: colors.textMuted }}>
                     Here’s what the sky looks like today.
                  </p>
                  <div className="d-flex flex-column flex-md-row justify-content-around align-items-center">
                     <div className="text-center mb-4 mb-md-0">
                        <img src={weatherData.icon} alt="Weather" className="img-fluid mb-3" style={{ width: "100px" }} />
                        <h1 className="fw-bold" style={{ color: colors.primary, fontSize: "4rem" }}>
                           {weatherData.temperature}°C
                        </h1>
                        <p style={{ color: colors.textMuted }}>{weatherData.description}</p>
                        <p style={{ color: colors.primary, marginTop: "10px" }}>
                           {getWeatherSuggestion(weatherData.temperature, weatherData.condition)}
                        </p>
                     </div>
                     <div className="text-md-start text-center">
                        <h4 style={{ color: colors.primary }}>{weatherData.location}</h4>
                        <p>Feels like {weatherData.feelsLike}°</p>
                        <p>💧 {weatherData.humidity} humidity</p>
                        <p>💨 {weatherData.wind} wind speed</p>
                     </div>
                  </div>
               </motion.div>
            )}

            <div className="mb-4">
               <label htmlFor="style" className="fw-semibold me-2">Choose your style:</label>
               <select
                  id="style"
                  value={selectedStyle}
                  onChange={(e) => setSelectedStyle(e.target.value)}
                  className="form-select"
                  style={{ width: "200px", display: "inline-block", borderRadius: "10px", border: `2px solid ${colors.primary}` }}
               >
                  {availableStyles.map((style) => (
                     <option key={style} value={style}>
                        {style.charAt(0).toUpperCase() + style.slice(1)}
                     </option>
                  ))}
               </select>
            </div>

            {outfitData ? (
               <motion.div
                  className="rounded-5 shadow-lg p-5 position-relative"
                  style={{ width: "100%", maxWidth: "900px", background: colors.surface, boxShadow: `0 20px 60px rgba(0,0,0,0.12)` }}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 0.4 }}
               >
                  <h2 className="fw-bold mb-4" style={{ color: colors.primary }}>
                     Your Perfect Outfit Today 👕
                  </h2>
                  <div className="row align-items-center justify-content-center">
                     <div className="col-md-6 text-center mb-4 mb-md-0">
                        <div className="d-flex flex-wrap justify-content-center gap-3">
                           {outfitData.map((item, i) =>
                              item && (
                                 <motion.div key={i} className="text-center" whileHover={{ scale: 1.05 }}>
                                    <img src={item.image_path} alt={item.type} className="img-fluid rounded-4 mb-2"
                                       style={{ maxWidth: "220px", maxHeight: "280px", objectFit: "contain", backgroundColor: "#f8f9fa" }} />
                                    <p className="mb-1 fw-bold" style={{ fontSize: "1rem" }}>{item.type}</p>
                                    {isOuterwear(item.type) && <small className="text-muted">Layer</small>}
                                 </motion.div>
                              )
                           )}
                        </div>
                     </div>
                     <div className="col-md-6 text-md-start text-center">
                        {outfitData.map((item, i) =>
                           item && (
                              <div key={i} className="mb-3">
                                 <h5 className="fw-bold" style={{ color: colors.primary }}>
                                    {item.type}{isOuterwear(item.type) && <small className="text-muted ms-2">(Layer)</small>}
                                 </h5>
                                 <p style={{ color: colors.textMuted }}>
                                    Style: <strong>{item.style}</strong> | Colour: {item.colour}
                                 </p>
                              </div>
                           )
                        )}
                     </div>
                  </div>
               </motion.div>
            ) : (
               <motion.div className="p-4 rounded-4 text-center" style={{ background: "#fff3cd", border: "1px solid #ffeaa7" }}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <p className="mb-2 fw-bold">No outfit found 😔</p>
                  <p className="mb-0 small">Make sure your wardrobe includes <em>shirts</em>, <em>trousers</em>, or <em>dresses</em> — perfect for daily combinations.</p>
               </motion.div>
            )}
         </div>
      </>
   );
}

export default Home;
