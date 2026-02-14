import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter, Route, Routes } from "react-router";

import Home from "./pages/Home.tsx";
import Play from "./pages/Play.tsx";
import Leaderboard from "./pages/Leaderboard.tsx";
import HowToPlay from "./pages/HowToPlay.tsx";
import NotFound from "./pages/NotFound.tsx";

if (import.meta.hot) {
  import.meta.hot.on("vite:beforeUpdate", () => console.clear());
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Home />} />
          <Route path="play" element={<Play />} />
          <Route path="leaderboard" element={<Leaderboard />} />
          <Route path="how-to-play" element={<HowToPlay />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
