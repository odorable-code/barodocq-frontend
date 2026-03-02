import React, { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

/* ── 페이지 컴포넌트 ── */
import HospitalDetail        from "./pages/HospitalDetail";
import HospitalSearch        from "./pages/HospitalSearch";
import HospitalReviews       from "./Review/HospitalReviews";
import Layout                from "./components/Layout";
import Main                  from "./Main";
import MainPage              from "./pages/MainPage";
import QnAPage               from "./Qna/QnAPage";
import QnAWritePage          from "./Qna/QnAWritePage";
import ReservationDateSelect from "./pages/ReservationDateSelect";
import ReservationDetail     from "./pages/ReservationDetail";
import ReviewDetail          from "./Review/ReviewDetail";
import ReviewRevise          from "./Review/ReviewRevise";
import ReviewCreate          from "./Review/ReviewCreate";
import MyPage                from "./MyPage";
import PharmacySearch        from "./pages/PhamacySearch";
import Chat                  from "./Chat/Chat";
import ChatList              from "./Chat/ChatList";

/* ── 인증 / 소켓 Provider ── */
import { AuthProvider }      from "./AuthContext";
import { WebSocketProvider } from "./WebSocketContext";

/* ── 관리자 컴포넌트 ── */
import AdminUsers   from "./adminComponents/AdminUsers";
import AdminAdmins   from "./adminComponents/AdminAdmins";
import AdminLayout      from "./adminComponents/AdminLayout";
import AdminMain        from "./adminComponents/AdminMain";
import AdminReservation from "./adminComponents/AdminReservation";

/* ── 인증 관련 페이지 ── */
import AdminSignup   from "./pages/user/AdminSignup";
import FindId        from "./pages/user/FindId";
import FoundId       from "./pages/user/FoundId";
import Login         from "./pages/user/Login";
import ResetPassword from "./pages/user/ResetPassword";
import Signup        from "./pages/user/Signup";
import UserSignup    from "./pages/user/UserSignup";

/* ── 아이콘 ── */
import "@fortawesome/fontawesome-free/css/all.min.css";
import AdminHospitals from "./adminComponents/AdminHospitals";
import AdminReviews from "./adminComponents/AdminReviews";

/* ─────────────────────────────────────
   페이지 이동 시 스크롤 최상단으로
───────────────────────────────────── */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

/* ─────────────────────────────────────
   App
   Provider 순서: AuthProvider
               → WebSocketProvider  (useAuth 사용하므로 Auth 안쪽)
               → BrowserRouter
───────────────────────────────────── */
function App() {
  const [showPopup,       setShowPopup]       = useState(false);
  const [showReservation, setShowReservation] = useState(false);

  return (
    <AuthProvider>                   {/* ✅ 1) 인증 최상위 */}
      <WebSocketProvider>            {/* ✅ 2) 소켓 (useAuth 접근 가능) */}
        <BrowserRouter>              {/* ✅ 3) 라우터 */}
          <ScrollToTop />

          {/* 전역 모달 */}
          {showReservation && (
            <ReservationDetail onClose={() => setShowReservation(false)} />
          )}
          {showPopup && (
            <ReservationDateSelect onClose={() => setShowPopup(false)} />
          )}

          <Routes>

            {/* ══════════════════════════════════════
                인증 페이지 — Header/Footer 없이 단독
            ══════════════════════════════════════ */}
            <Route path="/login"        element={<Login />} />
            <Route path="/signup"       element={<Signup />} />
            <Route path="/user/signup"  element={<UserSignup />} />
            <Route path="/admin/signup" element={<AdminSignup />} />
            <Route path="/find/id"      element={<FindId />} />
            <Route path="/found/id"     element={<FoundId />} />
            <Route path="/resetPw"      element={<ResetPassword />} />

            {/* ══════════════════════════════════════
                사용자 영역 — Layout(Header+Footer) 포함
            ══════════════════════════════════════ */}
            <Route
              path="/"
              element={
                <Layout
                  onOpenReservation={() => setShowReservation(true)}
                  onOpenPopup={()       => setShowPopup(true)}
                />
              }
            >
              <Route index                        element={<MainPage />} />
              <Route path="mainpage"              element={<MainPage />} />
              <Route path="mypage"                element={<MyPage />} />
              <Route path="details/:hospitalId"   element={<HospitalDetail />} />
              <Route path="hospitals"             element={<HospitalSearch />} />
              <Route path="pharmacy"              element={<PharmacySearch />} />
              <Route path="reviews"               element={<HospitalReviews />} />
              <Route path="reviews/create"        element={<ReviewCreate />} />
              <Route path="reviews/revise/:rvNum" element={<ReviewRevise />} />
              <Route path="reviews/:rvNum"        element={<ReviewDetail />} />
              <Route path="qna"                   element={<QnAPage />} />
              <Route path="qna/write"             element={<QnAWritePage />} />
              <Route path="main"                  element={<Main />} />
              <Route path="chat"                  element={<Chat />} />
              <Route path="chat/list"             element={<ChatList />} />

              {/* Layout 안 나머지 → 메인으로 */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>

            {/* ══════════════════════════════════════
                관리자 영역 — AdminLayout 포함
            ══════════════════════════════════════ */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index               element={<AdminMain />} />
              <Route path="admins"    element={<AdminAdmins />} />
              <Route path="users"    element={<AdminUsers />} />
              <Route path="hospitals"    element={<AdminHospitals />} />
              <Route path="reservations" element={<AdminReservation />} />
              <Route path="posts/reviews"    element={<AdminReviews />} />
            </Route>

            {/* 최상위 매칭 실패 → 메인으로 */}
            <Route path="*" element={<Navigate to="/" replace />} />

          </Routes>
        </BrowserRouter>
      </WebSocketProvider>
    </AuthProvider>
  );
}

export default App;