import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Studio from './pages/Studio';

/**
 * Основной компонент приложения с роутингом.
 * Позволяет переключаться между портфолио и админкой.
 */
export default function App() {
  return (
    <Router>
      <Routes>
        {/* Главная страница портфолио */}
        <Route path="/" element={<Home />} />

        {/* Панель управления (заглушка под CMS) */}
        <Route path="/studio/*" element={<Studio />} />
      </Routes>
    </Router>
  );
}
