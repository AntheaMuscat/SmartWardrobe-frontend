import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Wardrobe from "./pages/Wardrobe";
import AddClothes from "./pages/AddClothes";
import CalendarPage from "./pages/CalendarPage";
import Chatbot from "./pages/Chatbot";
import "./App.css";
import Analytics from "./pages/Analytics";

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/wardrobe" element={<Wardrobe />} />
          <Route path="/outfits" element={<Outfits />} />
          <Route path="/add" element={<AddClothes />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/chat" element={<Chatbot />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/sensors" element={<SensorsInfo />} />
        </Routes>

        <nav className="bottom-nav">
          <Link to="/"></Link>
          <Link to="/wardrobe"></Link>
          <Link to="/outfits"></Link>
          <Link to="/add"></Link>
          <Link to="/calendar"></Link>
          <Link to="/chat"></Link>
          <Link to="/analytics"></Link>
          <Link to="/sensors"></Link>
        </nav>
      </div>
    </Router>
  );
}

export default App;
