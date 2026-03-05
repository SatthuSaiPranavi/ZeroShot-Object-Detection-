import React from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Detection from "./pages/Detection";
import Home from "./pages/Home";
import SceneUnderstanding from "./pages/SceneUnderstanding";
import Tracking from "./pages/Tracking";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/detection" element={<Detection />} />
        <Route path="/tracking" element={<Tracking />} />
        <Route path="/scene" element={<SceneUnderstanding />} />
      </Routes>
    </Router>
  );
}

export default App;
