import Main from './Main';

// 예약 현황 조회 불러오기
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import MainPage from "./pages/MainPage";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/MainPage" element={<MainPage />} />
      </Routes>
    </Router>
  );
}

export default App;
