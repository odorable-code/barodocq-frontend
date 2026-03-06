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
import MyReservationsPage    from "./pages/MyReservationsPage";
import {DeptSearch2, DeptSearch4}            from "./pages/DeptSearch";

/* ── 인증 / 소켓 Provider ── */
import { AuthProvider }      from "./AuthContext";
import { WebSocketProvider } from "./WebSocketContext";

/* ── 관리자 컴포넌트 ── */
import AdminUsers   from "./admin/AdminUsers";
import AdminAdmins   from "./admin/AdminAdmins";
import AdminMe   from "./admin/AdminMe";
import AdminLayout      from "./admin/adminComponents/AdminLayout";
import AdminMainPage        from "./admin/AdminMainPage";
import AdminReservation from "./admin/AdminReservation";
import AdminHospitalsMe from "./admin/AdminHospitalsMe"
import AdminInquiryPage from "./admin/AdminInquiryPage";

/* ── 인증 관련 페이지 ── */
import AdminSignup   from "./pages/user/AdminSignup";
import FindId        from "./pages/user/FindId";
import FoundId       from "./pages/user/FoundId";
import Login         from "./pages/user/Login";
import ResetPassword from "./pages/user/ResetPassword";
import Signup from "./pages/user/Signup";
import UserSignup from "./pages/user/UserSignup";
import {KakaoCallback, KakaoSignupCallback} from "./pages/user/KakaoCallback";
import AuthLayout from "./pages/AuthLayout";


/* ── 아이콘 ── */
import "@fortawesome/fontawesome-free/css/all.min.css";
import AdminHospitals from "./admin/AdminHospitals";
import AdminReviews from "./admin/AdminReviews";
import AdminQnA from "./admin/AdminQnA";

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
    <AuthProvider>
      <WebSocketProvider>
        <BrowserRouter>
          <ScrollToTop />

          {showReservation && (
            <ReservationDetail onClose={() => setShowReservation(false)} />
          )}
          {showPopup && (
            <ReservationDateSelect onClose={() => setShowPopup(false)} />
          )}

          <Routes>

            {/* ══════════════════════════════════════
                ✅ 인증 페이지 — 로고만 있는 AuthLayout
            ══════════════════════════════════════ */}
            <Route element={<AuthLayout />}>
              <Route path="/login"         element={<Login />} />
              <Route path="/signup"        element={<Signup />} />
              <Route path="/user/signup"   element={<UserSignup />} />
              <Route path="/admin/signup"  element={<AdminSignup />} />
              <Route path="/find/id"       element={<FindId />} />
              <Route path="/found/id"      element={<FoundId />} />
              <Route path="/resetPw"       element={<ResetPassword />} />
            </Route>

            {/* ══════════════════════════════════════
                ✅ 카카오 콜백 — 헤더 불필요
            ══════════════════════════════════════ */}
            <Route path="/kakao/callback"         element={<KakaoCallback />} />
            <Route path="/kakao/signup/callback"  element={<KakaoSignupCallback />} />

            {/* ══════════════════════════════════════
                ✅ 사용자 영역 — Layout(Header+Footer)
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
              <Route index                          element={<MainPage />} />
              <Route path="mainpage"                element={<MainPage />} />
              <Route path="mypage"                  element={<MyPage />} />
              <Route path="mypage/reservations"     element={<MyReservationsPage />} />
              <Route path="details/:hospitalId"     element={<HospitalDetail />} />
              <Route path="hospitals"               element={<HospitalSearch />} />
              <Route path="pharmacy"                element={<PharmacySearch />} />
              <Route path="reviews"                 element={<HospitalReviews />} />
              <Route path="reviews/create"          element={<ReviewCreate />} />
              <Route path="reviews/revise/:rvNum"   element={<ReviewRevise />} />
              <Route path="reviews/:rvNum"          element={<ReviewDetail />} />
              <Route path="qna"                     element={<QnAPage />} />
              <Route path="qna/write"               element={<QnAWritePage />} />
              <Route path="main"                    element={<Main />} />
              <Route path="chat"                    element={<Chat />} />
              <Route path="chat/list"               element={<ChatList />} />
              <Route path="deptsearch"              element={<DeptSearch2 />} />
              <Route path="deptsearch"              element={<DeptSearch4 />} />
              {/* ❌ 여기서 auth 라우트 중복 제거됨 */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>

            {/* ══════════════════════════════════════
                ✅ 관리자 영역 — AdminLayout
            ══════════════════════════════════════ */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index               element={<AdminMainPage />} />
              <Route path="admins"    element={<AdminAdmins />} />
              <Route path="me"    element={<AdminMe />} />
              <Route path="users"    element={<AdminUsers />} />
              <Route path="hospitals"    element={<AdminHospitals />} />
              <Route path="hospitals/me"    element={<AdminHospitalsMe />} />
              <Route path="reservations" element={<AdminReservation />} />
              <Route path="posts/reviews"    element={<AdminReviews />} />
              <Route path="posts/qna"        element={<AdminQnA />} />
              <Route path="inquiry"          element={<AdminInquiryPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />

          </Routes>
        </BrowserRouter>
      </WebSocketProvider>
    </AuthProvider>
  );
}

export default App;