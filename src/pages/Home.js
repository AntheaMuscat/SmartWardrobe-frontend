import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { colors } from "../styles/theme";
import Navbar from "../components/Navbar";
import "bootstrap/dist/css/bootstrap.min.css";

function Home() {
   const [weatherData, setWeatherData] = useState(null);
   const [allOutfits, setAllOutfits] = useState([]);
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
               temperature: Math.round(data.main.temp),
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

   const fetchAllOutfits = (weatherCondition) => {
      fetch(`https://antheamuscat-smart-wardrobe-backend.hf.space/wardrobe`)
         .then((res) => res.json())
         .then((data) => {
            const outfits = data.outfits || [];
            setAllOutfits(outfits);

            const styles = new Set(["all"]);
            outfits.forEach((pair) =>
               pair.forEach((item) => {
                  if (item?.style) styles.add(item.style.toLowerCase());
               })
            );

            setAvailableStyles([...styles]);
            pickWeatherAppropriateOutfit(outfits, weatherCondition, selectedStyle);
         })
         .catch((err) => {
            console.error("Outfit fetch error:", err);
            setAllOutfits([]);
            setOutfitData(null);
         });
   };

   // Select outfit based on weather and style
   const pickWeatherAppropriateOutfit = (outfits, weatherCondition, style) => {
      if (!outfits || outfits.length === 0) {
         setOutfitData(null);
         return;
      }

      const temp = weatherData?.temperature || 20;
      const isHot = temp >= 25;
      const isCold = temp <= 18;
      const isMild = temp > 18 && temp < 25;
      const isRainy = weatherCondition === "rainy";

      //match both weather and selected style
      let filtered = outfits.filter((pair) => {
         const items = pair.filter(Boolean);
         if (items.length === 0) return false;

         // Match selected style
         if (style !== "all") {
            const matches = items.some((i) => i.style?.toLowerCase() === style);
            if (!matches) return false;
         }

         // Weather rules
         const isDressOutfit = items.length === 1 && /dress|jumpsuit/i.test(items[0].type);
         if (isDressOutfit) return true;

         if (!isHot) {
            const tooLight = items.some((i) =>
               /(shorts|mini|tank|sleeveless|crop|halter)/i.test(i.type)
            );
            if (tooLight) return false;
         }

         if (!isCold) {
            const tooHeavy = items.some((i) =>
               /(hoodie|coat|puffer|fleece|thick)/i.test(i.type)
            );
            if (tooHeavy) return false;
         }

         if (isRainy) {
            const exposed = items.some((i) => /(shorts|mini skirt)/i.test(i.type));
            if (exposed) return false;
         }

         if (isMild) {
            const balanced = items.some((i) =>
               /(shirt|t-shirt|trousers|jeans|cargo|blouse|long-sleeve|light)/i.test(i.type)
            );
            if (!balanced) return false;
         }

         return true;
      });

      //if none match weather, just match color and style
      if (filtered.length === 0) {
         console.warn("No weather-appropriate outfit found. Using fallback...");

         filtered = outfits.filter((pair) => {
            const items = pair.filter(Boolean);
            if (items.length < 1) return false;

            // Match style if selected
            if (style !== "all") {
               const matches = items.some((i) => i.style?.toLowerCase() === style);
               if (!matches) return false;
            }

            //avoid identical or clashing pairs
            if (items.length === 2) {
               const c1 = items[0].colour?.toLowerCase() || "";
               const c2 = items[1].colour?.toLowerCase() || "";
               const same = c1 === c2;
               const clash = /red|green|purple/.test(c1) && /red|green|purple/.test(c2);
               if (same || clash) return false;
            }

            return true;
         });
      }

      //if still nothing, pick any random outfit
      const chosen =
         filtered.length > 0
            ? filtered[Math.floor(Math.random() * filtered.length)]
            : outfits[Math.floor(Math.random() * outfits.length)];

      setOutfitData(chosen);
   };


   useEffect(() => {
      if (allOutfits.length > 0 && weatherData) {
         pickWeatherAppropriateOutfit(allOutfits, weatherData.condition, selectedStyle);
      }
   }, [selectedStyle, allOutfits, weatherData]);

   //Weather suggestion
   const getWeatherSuggestion = (temp, condition) => {
      if (temp <= 18) return "❄️ A chilly day — grab a warm sweater or coat!";
      if (temp >= 25) return "☀️ Perfect sunny weather — light and breathable clothes!";
      if (condition === "rainy")
         return "🌧 Rain expected — a light jacket or umbrella is your best friend.";
      return "🌤 Comfortable and calm — a shirt or tee with trousers works great.";
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
                        <img
                           src={weatherData.icon}
                           alt="Weather"
                           className="img-fluid mb-3"
                           style={{ width: "100px" }}
                        />
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
               <label htmlFor="style" className="fw-semibold me-2">
                  Choose your style:
               </label>
               <select
                  id="style"
                  value={selectedStyle}
                  onChange={(e) => setSelectedStyle(e.target.value)}
                  className="form-select"
                  style={{
                     width: "200px",
                     display: "inline-block",
                     borderRadius: "10px",
                     border: `2px solid ${colors.primary}`,
                  }}
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
                  style={{
                     width: "100%",
                     maxWidth: "900px",
                     background: colors.surface,
                     boxShadow: `0 20px 60px rgba(0,0,0,0.12)`,
                  }}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 0.4 }}
               >
                  <h2 className="fw-bold mb-4" style={{ color: colors.primary }}>
                     Your Perfect Outfit Today 👕
                  </h2>
                  <div className="row align-items-center justify-content-center">
                     <div className="col-md-6 text-center mb-4 mb-md-0">
                        {outfitData.map(
                           (item, i) =>
                              item && (
                                 <motion.img
                                    key={i}
                                    src={item.image_path}
                                    alt={item.type}
                                    className="img-fluid"
                                    style={{
                                       maxWidth: "260px",
                                       borderRadius: "20px",
                                       objectFit: "cover",
                                    }}
                                    whileHover={{ scale: 1.05 }}
                                 />
                              )
                        )}
                     </div>
                     <div className="col-md-6 text-md-start text-center">
                        {outfitData.map(
                           (item, i) =>
                              item && (
                                 <div key={i}>
                                    <h5 className="fw-bold" style={{ color: colors.primary }}>
                                       {item.type}
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
               <motion.div
                  className="p-4 rounded-4 text-center"
                  style={{ background: "#fff3cd", border: "1px solid #ffeaa7" }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
               >
                  <p className="mb-2 fw-bold">No outfit found 😔</p>
                  <p className="mb-0 small">
                     Make sure your wardrobe includes <em>shirts</em>, <em>trousers</em>, or{" "}
                     <em>dresses</em> — perfect for daily combinations.
                  </p>
               </motion.div>
            )}
         </div>
      </>
   );
}

export default Home;
