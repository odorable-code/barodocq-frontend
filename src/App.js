import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";

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
import ReviewDetail from "./Review/ReviewDetail";
import ReviewRevise from "./Review/ReviewRevise";
import ReviewCreate from "./Review/ReviewCreate";
import MyPage from "./MyPage";
import PharmacySearch from "./pages/PhamacySearch";
import Chat from "./Chat/Chat";
import ChatList from "./Chat/ChatList";

import { AuthProvider } from "./AuthContext";

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
import KakaoCallback from "./pages/user/KakaoCallback";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function App() {
  const [showPopup, setShowPopup] = useState(false);
  const [showReservation, setShowReservation] = useState(false);

  // ✅ 자동 로그인 useEffect 완전 제거
  // → 새로고침해도 토큰이 유지되고 AuthContext가 알아서 /auth/me로 인증 처리

  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />

        {showReservation && (
          <ReservationDetail onClose={() => setShowReservation(false)} />
        )}
        {showPopup && (
          <ReservationDateSelect onClose={() => setShowPopup(false)} />
        )}

  

        <Routes>
          {/* ══ 사용자 영역 ══ */}
          <Route path="/kakao/callback" element={<KakaoCallback />} />
          <Route
            path="/"
            element={
              <Layout
                onOpenReservation={() => setShowReservation(true)}
                onOpenPopup={() => setShowPopup(true)}
              />
            }
          >
            <Route index element={<MainPage />} />
            <Route path="mainpage" element={<MainPage />} />
            <Route path="mypage" element={<MyPage />} />
            <Route path="details/:hospitalId" element={<HospitalDetail />} />
            <Route path="hospitals" element={<HospitalSearch />} />
            <Route path="pharmacy" element={<PharmacySearch />} />
            <Route path="reviews" element={<HospitalReviews />} />
            <Route path="reviews/create" element={<ReviewCreate />} />
            <Route path="reviews/revise/:rvNum" element={<ReviewRevise />} />
            <Route path="reviews/:rvNum" element={<ReviewDetail />} />
            <Route path="qna" element={<QnAPage />} />
            <Route path="qna/write" element={<QnAWritePage />} />
            <Route path="main" element={<Main />} />
            <Route path="chat" element={<Chat />} />
            <Route path="chat/list" element={<ChatList />} />
            <Route path="login" element={<Login />} />
            <Route path="signup" element={<Signup />} />
            <Route path="user/signup" element={<UserSignup />} />
            <Route path="admin/signup" element={<AdminSignup />} />
            <Route path="find/id" element={<FindId />} />
            <Route path="found/id" element={<FoundId />} />
            <Route path="resetPw" element={<ResetPassword />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>

          {/* ══ 관리자 영역 ══ */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminMain />} />
            <Route path="hospitals" element={<AdminHospitals />} />
            <Route path="reservations" element={<AdminReservation />} />
            <Route path="customers" element={<AdminCustomers />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />

        {/* ══════════════════════════
            관리자 영역
        ══════════════════════════ */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index                      element={<AdminMain />} />
          <Route path="hospitals"           element={<AdminHospitals />} />
          <Route path="reservations"        element={<AdminReservation />} />
          <Route path="customers"           element={<AdminCustomers />} />
        </Route>

        {/* 최종 fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
