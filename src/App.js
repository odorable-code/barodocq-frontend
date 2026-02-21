import Main from './Main';

// 예약 현황 조회 불러오기
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import UserLogin from "./pages/UserLogin";
import UserSignup from "./pages/UserSignup";
import MainPage from "./pages/MainPage";
import MainPage2 from "./pages/MainPage2";
import MainPage3 from "./pages/MainPage3";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<UserLogin />} />
        <Route path="/MainPage" element={<MainPage />} />
        <Route path="/UserSignup" element={<UserSignup />} />
        <Route path="/MainPage2" element={<MainPage2 />} />
        <Route path="/MainPage3" element={<MainPage3 />} />
      </Routes>
    </Router>
  );
}

export default App;
