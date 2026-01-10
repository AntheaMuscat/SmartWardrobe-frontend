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

   const TOP_TYPES = [
      "t-shirt",
      "long-sleeve t-shirt",
      "sleeveless tank top",
      "hoodie",
      "blouse",
      "button-up shirt",
      "denim jacket",
      "leather jacket",
      "sweater",
      "cardigan",
      "polo shirt",
      "v-neck shirt",
      "crew neck t-shirt",
      "turtleneck",
      "off-shoulder top",
      "cropped top",
      "fitted shirt",
      "loose hoodie"
   ];

   const BOTTOM_TYPES = [
      "trousers",
      "jeans",
      "shorts",
      "cargo pants",
      "sweatpants",
      "mini skirt",
      "midi skirt",
      "maxi skirt",
      "pencil skirt",
      "pleated skirt"
   ];

   const DRESS_TYPES = [
      "dress",
      "summer dress",
      "cocktail dress",
      "maxi dress",
      "jumpsuit",
      "overalls"
   ];

   const TOP_HEAVINESS = {
      "t-shirt": "light",
      "long-sleeve t-shirt": "medium",
      "sleeveless tank top": "light",
      "hoodie": "heavy",
      "blouse": "light",
      "button-up shirt": "medium",
      "sweater": "heavy",
      "cardigan": "medium",
      "polo shirt": "light",
      "v-neck shirt": "light",
      "crew neck t-shirt": "light",
      "turtleneck": "heavy",
      "off-shoulder top": "light",
      "cropped top": "light",
      "fitted shirt": "medium",
      "loose hoodie": "heavy",
      "denim jacket": "medium",
      "leather jacket": "medium",
   };

   const normalize = (t) => t?.toLowerCase().trim();

   const isTop = (t) => TOP_TYPES.includes(normalize(t));
   const isBottom = (t) => BOTTOM_TYPES.includes(normalize(t));
   const isDress = (t) => DRESS_TYPES.includes(normalize(t));

   // Jackets are tops but treated as optional layers
   const isJacket = (t) =>
      ["denim jacket", "leather jacket", "cardigan"].includes(normalize(t));


   const isRealTop = (t) =>
      isTop(t) && !isJacket(t);


   const BOTTOM_HEAVINESS = {
      "shorts": "light",
      "mini skirt": "light",
      "midi skirt": "light",
      "maxi skirt": "medium",
      "jeans": "medium",
      "trousers": "medium",
      "cargo pants": "medium",
      "pencil skirt": "medium",
      "pleated skirt": "light",
      "sweatpants": "heavy",
   };

   const DRESS_HEAVINESS = {
      "dress": "medium",
      "summer dress": "light",
      "cocktail dress": "medium",
      "maxi dress": "medium",
      "jumpsuit": "medium",
      "overalls": "heavy",
   };

   const COLD_FORBIDDEN = [
      "cropped top",
      "sleeveless tank top",
      "off-shoulder top",
      "shorts",
      "mini skirt"
   ];

   const HOT_FORBIDDEN = [
      "hoodie",
      "sweater",
      "turtleneck",
      "jacket",
      "denim jacket",
      "leather jacket",
      "cardigan"
   ];


   const pickWeatherAppropriateOutfit = (outfits, weatherCondition, style) => {
      if (!outfits || outfits.length === 0) {
         setOutfitData(null);
         return;
      }

      const temp = weatherData?.temperature ?? 20;
      const isCold = temp <= 18;
      const isHot = temp >= 25;

      const getHeaviness = (item) => {
         const type = normalize(item.type);
         return (
            TOP_HEAVINESS[type] ||
            BOTTOM_HEAVINESS[type] ||
            DRESS_HEAVINESS[type] ||
            "medium"
         );
      };

      const getRandomItem = (list) =>
         list[Math.floor(Math.random() * list.length)];

      const getItemsByStyle = (targetStyle) =>
         outfits.flat().filter((item) => item?.style?.toLowerCase() === targetStyle);

      let styleItems = style === "all" ? [] : getItemsByStyle(style);
      let forcedItem = styleItems.length === 1 ? styleItems[0] : null;

      // Filter outfits that meet weather rules
      const weatherFiltered = outfits.filter((pair) => {
         const items = pair.filter(Boolean);

         // Dress-only outfits
         if (items.length === 1 && isDress(items[0].type)) {
            const heaviness = getHeaviness(items[0]);
            if ((isCold && heaviness === "light") || (isHot && heaviness === "heavy"))
               return false;
            return true;
         }

         const tops = items.filter((i) => isRealTop(i.type));
         const bottoms = items.filter((i) => isBottom(i.type));
         const jackets = items.filter((i) => isJacket(i.type));

         if (tops.length === 0 && bottoms.length === 0) return false;
         if (jackets.length > 1) return false;

         for (const item of items) {
            const type = normalize(item.type);
            const heaviness = getHeaviness(item);

            if (isCold) {
               if (COLD_FORBIDDEN.includes(type)) return false;
               if (isBottom(type) && heaviness === "light") return false;
               if (isRealTop(type) && heaviness === "light") return false;
            }

            if (isHot) {
               if (HOT_FORBIDDEN.includes(type)) return false;
               if (heaviness === "heavy") return false;
            }

            if (!isCold && !isHot) {
               if (heaviness === "heavy" && !isJacket(type)) return false;
            }
         }

         return true;
      });

      let chosenBase =
         weatherFiltered.length > 0
            ? getRandomItem(weatherFiltered)
            : getRandomItem(outfits);

      chosenBase = chosenBase.filter(Boolean);

      if (forcedItem) {
         const included = chosenBase.some((i) => i === forcedItem);
         if (!included) {
            let replaceableIndex = chosenBase.findIndex(
               (i) => isRealTop(i.type) || isBottom(i.type)
            );
            if (replaceableIndex === -1) replaceableIndex = 0;
            chosenBase[replaceableIndex] = forcedItem;
         }
      }

      const jackets = chosenBase.filter((i) => isJacket(i.type));
      if (jackets.length > 1) {
         const jacketToKeep = getRandomItem(jackets);
         chosenBase = chosenBase.filter((i) => !isJacket(i.type) || i === jacketToKeep);
      }

      // ⚡ Normalize the outfit to always have top, bottom, jacket
      const top = chosenBase.find((i) => isRealTop(i.type)) || null;
      const bottom = chosenBase.find((i) => isBottom(i.type)) || null;
      const jacket = chosenBase.find((i) => isJacket(i.type)) || null;

      setOutfitData({ top, bottom, jacket });

      console.log("Outfits fetched:", outfits);
      console.log("Weather filtered:", weatherFiltered);
      console.log("Chosen base:", chosenBase);

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
                        {(() => {
                           const { top, bottom, jacket } = outfitData;
                           const slots = [top, bottom, jacket];


                           return slots.map((item, i) =>
                              item ? (
                                 <motion.img
                                    key={i}
                                    src={item.image_path}
                                    alt={item.type}
                                    className="img-fluid mb-3"
                                    style={{
                                       maxWidth: "260px",
                                       borderRadius: "20px",
                                       objectFit: "cover",
                                    }}
                                    whileHover={{ scale: 1.05 }}
                                 />
                              ) : (
                                 <div
                                    key={i}
                                    style={{
                                       display: "inline-block",
                                       width: "260px",
                                       height: "350px",
                                       marginBottom: "1rem",
                                    }}
                                 />
                              )
                           );
                        })()}
                     </div>
                     <div className="col-md-6 text-md-start text-center">
                        {(() => {
                           const { top, bottom, jacket } = outfitData;
                           const slots = [top, bottom, jacket];

                           return slots.map((item, i) =>
                              item ? (
                                 <div key={i}>
                                    <h5 className="fw-bold" style={{ color: colors.primary }}>
                                       {item.type}
                                    </h5>
                                    <p style={{ color: colors.textMuted }}>
                                       Style: <strong>{item.style}</strong> | Colour: {item.colour}
                                    </p>
                                 </div>
                              ) : null
                           );
                        })()}
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
