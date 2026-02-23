import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";

import Layout from "./components/Layout";
import Main from "./Main";
import UserLogin from "./pages/UserLogin";

import MainPage from "./pages/MainPage";
import QnAPage from "./pages/QnAPage";
import QnAWritePage from "./pages/QnAWritePage";

import ReservationDateSelect from "./pages/ReservationDateSelect";
import HospitalReviews from "./Review/HospitalReviews";
import ReviewDetail from "./Review/ReviewDetail";
import ReviewRevise from "./Review/ReviewRevise";
import ReviewCreate from "./Review/ReviewCreate";

import "@fortawesome/fontawesome-free/css/all.min.css";

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
        <Link to="/reviews">{"후기"}</Link>
        <Link to="/main">{"메인"}</Link>
        <Routes>
          {/* 공통 레이아웃 적용 */}
          <Route path="/" element={<Layout />}>

            {/* 시작할 때 메인페이지가 보이도록 */}
            <Route index element={<MainPage />} />

            {/* 기존 경로들 */}
            <Route path="/MainPage" element={<MainPage />} />
            <Route path="/qna" element={<QnAPage />} />
            <Route path="/qna/write" element={<QnAWritePage />} />
            <Route path="/reviews" element={<HospitalReviews />} />
            <Route path="/reviews/create" element={<ReviewCreate />} />
            <Route path="/reviews/revise/:rvNum" element={<ReviewRevise />} />
            <Route path="/reviews/:rvNum" element={<ReviewDetail />} />
            <Route path="/main" element={<Main />} />

            {/* 잘못된 경로는 메인으로 리다이렉트 */}
          <Route path="*" element={<Navigate to="/" />} />

          </Route>
          {/* 로그인만 레이아웃 없이 */}
        <Route path="/login" element={<UserLogin />} />
        
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
