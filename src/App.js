import Main from './Main';

// 예약 현황 조회 불러오기
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import ReservationDateSelect from "./pages/ReservationDateSelect";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/ReservationDateSelect" element={<ReservationDateSelect />} />
      </Routes>
    </Router>
  );
}

export default App;
