import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Wardrobe from "./pages/Wardrobe";
import AddClothes from "./pages/AddClothes";
import Outfits from "./pages/Outfits"; 
import CalendarPage from "./pages/CalendarPage";
import Chatbot from "./pages/Chatbot";
import Analytics from "./pages/Analytics";
import SensorsInfo from "./pages/SensorsInfo";
import 'bootstrap/dist/css/bootstrap.min.css';



const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/wardrobe" element={<Wardrobe />} />
      <Route path="/otifits" element={<Outfits />} />
      <Route path="/add" element={<AddClothes />} />
      <Route path="/calendar" element={<CalendarPage />} />
      <Route path="/chatbot" element={<Chatbot />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/sensors" element={<SensorsInfo />} />
    </Routes>
  </BrowserRouter>
);
