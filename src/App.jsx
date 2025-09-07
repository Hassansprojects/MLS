// src/App.jsx
import MonasAirportLiveryTemplate from "./MonasAirportLiveryTemplate.jsx";
import Terms from "../pages/Terms.jsx";
import Privacy from "../pages/Privacy.jsx";
import Accessibility from "../pages/Accessibility.jsx";
import { Routes, Route, Navigate } from "react-router-dom";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MonasAirportLiveryTemplate />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/accessibility" element={<Accessibility />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
