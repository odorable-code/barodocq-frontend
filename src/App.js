import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";

import HospitalDetail from "./pages/HospitalDetail";
import HospitalSearch from "./pages/HospitalSearch";
import HospitalReviews from "./Review/HospitalReviews";
import Layout from "./components/Layout";
import Main from "./Main";
import MainPage from "./pages/MainPage";
import QnAPage from "./Qna/QnAPage";
import QnAWritePage from "./Qna/QnAWritePage";
import ReservationDateSelect from "./pages/ReservationDateSelect";
import ReservationDetail from "./pages/ReservationDetail";
import ReservationPage from "./pages/ReservationPage";
import ReviewDetail from "./Review/ReviewDetail";
import ReviewRevise from "./Review/ReviewRevise";
import ReviewCreate from "./Review/ReviewCreate";
import MyPage from "./MyPage";
import PharmacySearch from "./pages/PhamacySearch";
import Chat from "./Chat/Chat";
import ChatList from "./Chat/ChatList";

// 관리자 페이지
import AdminCustomers from "./adminComponents/AdminCustomers";
import AdminHospitals from "./adminComponents/AdminHospitals";
import AdminLayout from "./adminComponents/AdminLayout";
import AdminMain from "./adminComponents/AdminMain";
import AdminReservation from "./adminComponents/AdminReservation";

import "@fortawesome/fontawesome-free/css/all.min.css";
import AdminSignup from "./pages/user/AdminSignup";
import FindId from "./pages/user/FindId";
import FoundId from "./pages/user/FoundId";
import Login from "./pages/user/Login";
import ResetPassword from "./pages/user/ResetPassword";
import Signup from "./pages/user/Signup";
import UserSignup from "./pages/user/UserSignup";

function App() {
  const [showPopup, setShowPopup] = useState(false); // 예약 날짜 선택 팝업
  const [showReservation, setShowReservation] = useState(false); // 나의 예약 현황 팝업
  const [loading, setLoading] = useState(true); // 자동 로그인 완료 여부

  /* ── 자동 로그인 (개발용) ── */
  useEffect(() => {
    localStorage.removeItem("accessToken");
    fetch("http://localhost:8080/api/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: "admintest", userPw: "admintest" }),
    })
      .then((res) => res.json()) // ← 중복 제거, 한 번만
      .then((data) => {
        if (data.accessToken) {
          localStorage.setItem("accessToken", data.accessToken);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("자동 로그인 실패", err);
        setLoading(false);
      });
  }, []);

  if (loading)
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>로딩 중...</div>
    );

  return (
    <BrowserRouter>
      {/* ── 전역 팝업 (라우트 외부, BrowserRouter 내부) ── */}
      {showReservation && (
        <ReservationDetail onClose={() => setShowReservation(false)} />
      )}
      {showPopup && (
        <ReservationDateSelect onClose={() => setShowPopup(false)} />
      )}

      <Routes>
        {/* ══════════════════════════
            사용자 영역 (Layout 포함)
        ══════════════════════════ */}
        <Route
          path="/"
          element={
            <Layout
              onOpenReservation={() => setShowReservation(true)}
              onOpenPopup={() => setShowPopup(true)}
            />
          }
        >
          {/* 기본 진입 → 메인 */}
          <Route index element={<MainPage />} />
          <Route path="mainpage" element={<MainPage />} />

          {/* 마이페이지 */}
          <Route path="mypage" element={<MyPage />} />

          {/* 예약하기 */}
          <Route path="/reservation/:hoNum" element={<ReservationPage />} />

          {/* 병원 */}
          <Route path="details/:hospitalId" element={<HospitalDetail />} />
          <Route path="hospitals" element={<HospitalSearch />} />

          {/* 잘못된 경로는 메인으로 리다이렉트 */}
          <Route path="*" element={<Navigate to="/" />} />
          {/* 채팅방 */}
          <Route path="/chat" element={<Chat />} />
          <Route path="/chat/list" element={<ChatList />} />

          {/* 잘못된 경로는 메인으로 리다이렉트
            <Route path="*" element={<Navigate to="/" />} /> */}

          {/* 약국 */}
          <Route path="pharmacy" element={<PharmacySearch />} />

          {/* 후기 */}
          <Route path="reviews" element={<HospitalReviews />} />
          <Route path="reviews/create" element={<ReviewCreate />} />
          <Route path="reviews/revise/:rvNum" element={<ReviewRevise />} />
          <Route path="reviews/:rvNum" element={<ReviewDetail />} />

          {/* Q&A */}
          <Route path="qna" element={<QnAPage />} />
          <Route path="qna/write" element={<QnAWritePage />} />

          {/* 기타 */}
          <Route path="main" element={<Main />} />
          <Route path="chat" element={<Chat />} />

          {/* 인증 */}
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
          <Route path="user/signup" element={<UserSignup />} />
          <Route path="admin/signup" element={<AdminSignup />} />
          <Route path="find/id" element={<FindId />} />
          <Route path="found/id" element={<FoundId />} />
          <Route path="resetPw" element={<ResetPassword />} />

          {/* 잘못된 경로 → 메인으로 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>

        {/* ══════════════════════════
            관리자 영역
        ══════════════════════════ */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminMain />} />
          <Route path="hospitals" element={<AdminHospitals />} />
          <Route path="reservations" element={<AdminReservation />} />
          <Route path="customers" element={<AdminCustomers />} />
        </Route>

        {/* 최종 fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
