import { Routes, Route } from "react-router-dom";
import Home from "./MonasAirportLiveryTemplate.jsx";
import Terms from "./pages/Terms.jsx";
import Privacy from "./pages/Privacy.jsx";
import Accessibility from "./pages/Accessibility.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/accessibility" element={<Accessibility />} />
    </Routes>
  );
}
