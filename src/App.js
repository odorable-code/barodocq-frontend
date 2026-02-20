import React, { useEffect, useState } from "react";
import ReservationDateSelect from "./pages/ReservationDateSelect";
import HospitalReviews from "./HospitalReviews";
import ReviewDetail from "./ReviewDetail";
import ReviewRevise from "./ReviewRevise";
import ReviewCreate from "./ReviewCreate";
import Main from "./Main";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";

function App() {
  const [showPopup, setShowPopup] = useState(false);
// ----------------------------------------------
  const [loading, setLoading] = useState(true); // 자동 로그인 완료 여부

  useEffect(() => {
  // 항상 최신 토큰 발급
  localStorage.removeItem("accessToken");

  fetch("http://localhost:8080/api/v1/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId: "test", userPw: "test" }),
  })
    .then((res) => res.json())
    .then((data) => {
      localStorage.setItem("accessToken", data.accessToken);
      setLoading(false);
    })
    .catch((err) => {
      console.error("자동 로그인 실패", err);
      setLoading(false);
    });
}, []);

  if (loading) return <p>자동 로그인 중...</p>;

// -------------------------------
  return (
    <div>
      <button onClick={() => setShowPopup(true)}>예약하기</button>
      {showPopup && (
        <ReservationDateSelect onClose={() => setShowPopup(false)} />
      )}
      <BrowserRouter>
      <Link to='/reviews'>{'후기'}</Link>
      <Link to='/main'>{'메인'}</Link>
      <Routes>
        <Route path="/reviews" element={<HospitalReviews />} />
        <Route path="/reviews/create" element={<ReviewCreate />} />
        <Route path="/reviews/revise/:rvNum" element={<ReviewRevise />} />
        <Route path="/reviews/:rvNum" element={<ReviewDetail />} />
        <Route path="/main" element={<Main />} />
      </Routes>
    </BrowserRouter>
    </div>

    
  );
}

export default App;
