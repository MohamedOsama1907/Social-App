import { createRoot } from "react-dom/client"; 
import { HelmetProvider } from "react-helmet-async";
import "@fontsource-variable/readex-pro/wght.css";
import "./index.css";
import App from "./App.jsx";
createRoot(document.getElementById("root")).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);
