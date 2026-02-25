import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";

import HospitalDetail from "./pages/HospitalDetail";
import HospitalSearch from "./pages/HospitalSearch";
import Layout from "./components/Layout";
import Main from "./Main";
import UserLogin from "./pages/UserLogin";
import MainPage from "./pages/MainPage";
import QnAPage from "./Qna/QnAPage";
import QnAWritePage from "./Qna/QnAWritePage";
import HospitalSearchPage from "./pages/HospitalSearchPage";
import ReviewBoard from "./pages/ReviewBoard";
import ReservationDateSelect from "./pages/ReservationDateSelect";
import HospitalReviews from "./Review/HospitalReviews";
import ReviewDetail from "./Review/ReviewDetail";
import ReviewRevise from "./Review/ReviewRevise";
import ReviewCreate from "./Review/ReviewCreate";
import PharmacySearch from "./pages/PharmacySearch";

// 관리자 페이지

import ClaimPage from "./adminComponents/ClaimPage";
import AdminLayout from "./adminComponents/AdminLayout";

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
      {showPopup && <ReservationDateSelect onClose={() => setShowPopup(false)} />}

      <BrowserRouter>
        {/* 🔸 이 Link들은 관리자에서도 보이니까
            나중에 Layout 안으로 옮기는걸 추천!*/}
        <Link to="/reviews">{"후기"}</Link>{" "}
        <Link to="/main">{"메인"}</Link>{" "}
        <Link to="/admin">{"관리자"}</Link>

        <Routes>
          {/* ✅ 사용자 영역 (공통 레이아웃 적용) */}
          <Route path="/" element={<Layout />}>
            {/* 시작할 때 메인페이지가 보이도록 */}
            <Route index element={<MainPage />} />

            {/* 소문자로 통일한 경로 */}
            <Route path="/mainpage" element={<MainPage />} />
            <Route path="/qna" element={<QnAPage />} />
            <Route path="/qna/write" element={<QnAWritePage />} />
            <Route path="/hospitalsearchpage" element={<HospitalSearchPage />} />
            <Route path="/reviews" element={<HospitalReviews />} />
            <Route path="/reviews/create" element={<ReviewCreate />} />
            <Route path="/reviews/revise/:rvNum" element={<ReviewRevise />} />
            <Route path="/reviews/:rvNum" element={<ReviewDetail />} />
            <Route path="/main" element={<Main />} />
            <Route path="/hospitals" element={<HospitalSearch />} />
            <Route path="/hos_detail/:hospitalId" element={<HospitalDetail />} />
            <Route path="/pharmacy" element={<PharmacySearch />} />

            {/* 잘못된 경로는 메인으로 */}
            <Route path="*" element={<Navigate to="/" />} />
          </Route>

          {/* 로그인만 레이아웃 없이 */}
          <Route path="/login" element={<UserLogin />} />

          {/* ✅ 관리자 영역 (사용자 Layout과 완전 분리) */}
          <Route path="/admin" element={<AdminLayout />}>
            {/* /admin */}
            <Route index element={<ClaimPage />} />
            {/* /admin/claims */}
            <Route path="claims" element={<ClaimPage />} />
          </Route>

          {/* ✅ 최종 fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;