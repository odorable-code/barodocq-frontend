import Main from "./Main";
import React, { useState } from "react";
import ReservationDateSelect from "./pages/ReservationDateSelect";
import { Navigate } from "react-router-dom";

// 예약 현황 조회 불러오기
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ReservationDetail from "./pages/ReservationDetail";

function App() {
  const [showPopup, setShowPopup] = useState(false);

  return (
    <Router>
      <div>
        <button onClick={() => setShowPopup(true)}>예약하기</button>

        {showPopup && (
          <ReservationDateSelect onClose={() => setShowPopup(false)} />
        )}

        <Routes>
          <Route path="/" element={<Navigate to="/ReservationDetail" />} />
          <Route
            path="/ReservationDetail"
            element={<ReservationDetail />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;