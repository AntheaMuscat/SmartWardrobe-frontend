import React from "react";
import Navbar from "./components/Navbar";
import "./App.css";

function App({ children }) {
  return (
    <div className="app-container">
      {/* Navbar is always visible */}
      <Navbar />

      {/* Page content will be rendered here via Routes in index.js */}
      <div className="page-content">
        {children}
      </div>
    </div>
  );
}

export default App;
