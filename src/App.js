import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Wardrobe from "./pages/Wardrobe";
import AddClothes from "./pages/AddClothes";
import CalendarPage from "./pages/CalendarPage";
import Chatbot from "./pages/Chatbot";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/wardrobe" element={<Wardrobe />} />
          <Route path="/add" element={<AddClothes />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/chat" element={<Chatbot />} />
        </Routes>

        <nav className="bottom-nav">
          <Link to="/"></Link>
          <Link to="/wardrobe"></Link>
          <Link to="/add"></Link>
          <Link to="/calendar"></Link>
          <Link to="/chat"></Link>
        </nav>
      </div>
    </Router>
  );
}

export default App;
