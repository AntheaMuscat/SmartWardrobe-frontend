import { Link, useLocation } from "react-router-dom";
import { colors } from "../styles/theme";

function Navbar() {
   const location = useLocation();

   const links = [
      { path: "/", label: "Home" },
      { path: "/wardrobe", label: "Wardrobe" },
      {path: "/otifits", label: "Outfits" },
      { path: "/add", label: "Add Clothes" },
      { path: "/calendar", label: "Calendar" },
      { path: "/chatbot", label: "Chatbot" },
      {path: "/analytics", label: "Analytics" },
      {path: "/sensors", label: "Sensors" },
   ];

   return (
      <nav style={{
         backgroundColor: colors.primary,
         padding: "10px 20px",
         display: "flex",
         justifyContent: "space-around",
         alignItems: "center",
         color: "#fff",
         position: "sticky",
         top: 0,
         zIndex: 1000
      }}>
         {links.map(link => (
            <Link
               key={link.path}
               to={link.path}
               style={{
                  color: location.pathname === link.path ? colors.accent1 : "#fff",
                  textDecoration: "none",
                  fontWeight: location.pathname === link.path ? "bold" : "normal"
               }}
            >
               {link.label}
            </Link>
         ))}
      </nav>
   );
}

export default Navbar;
