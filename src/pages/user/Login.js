// =====================================================================
// Login.js
// 파일 경로: src/pages/user/Login.js (또는 프로젝트 구조에 맞게)
//
// 📌 디자인: MainPage의 Mint Green + Teal Blue 테마와 동일
// 📌 UserSignup.js와 동일한 CSS 변수 체계 사용 (su-page 클래스 참고)
// 📌 주요 기능:
//   - 아이디 / 비밀번호 입력 및 유효성 검사
//   - 비밀번호 보기/숨기기 토글
//   - 로그인 상태 유지 체크박스
//   - 카카오 / 네이버 소셜 로그인
//   - 배경 블롭 애니메이션 (UserSignup과 동일)
// =====================================================================

import "../../assets/styles/Login.css";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  // ── 상태값 정의 ──────────────────────────────────────────────────
  const [userId, setUserId]       = useState("");         // 아이디 입력값
  const [userPw, setUserPw]       = useState("");         // 비밀번호 입력값
  const [keepLogin, setKeepLogin] = useState(false);      // 로그인 상태 유지 여부
  const [showPw, setShowPw]       = useState(false);      // 비밀번호 보이기 토글
  const [isLoading, setIsLoading] = useState(false);      // 로그인 버튼 로딩 상태
  const navigate = useNavigate();

  // ── 페이지 이동 헬퍼 ──────────────────────────────────────────────
  const handleNavigate = (path) => navigate(path);

  // ── 카카오 소셜 로그인 ────────────────────────────────────────────
  // 카카오 디벨로퍼스에서 발급받은 REST API KEY 사용
  const KakaoLogin = () => {
    const REST_API_KEY = "7167ec309dc09273be6d7b09a108044c";
    const REDIRECT_URI = "http://localhost:3000/api/v1/auth/kakao";
    const KAKAO_AUTH_URL = `https://kauth.kakao.com/oauth/authorize?client_id=${REST_API_KEY}&redirect_uri=${REDIRECT_URI}&response_type=code`;
    window.location.href = KAKAO_AUTH_URL;
  };

  // ── 네이버 소셜 로그인 ────────────────────────────────────────────
  // 네이버 디벨로퍼스에서 발급받은 Client ID 사용
  const NaverLogin = () => {
    const NAVER_CLIENT_ID = "0GPWYHQbYuwrSJCSA068";
    const REDIRECT_URI    = "http://localhost:3000/api/v1/auth/naver";
    const STATE           = "naver_signup_state";
    const NAVER_AUTH_URL  = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${NAVER_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&state=${STATE}`;
    window.location.href = NAVER_AUTH_URL;
  };

  // ── 로그인 폼 제출 ────────────────────────────────────────────────
  // /api/v1/auth/login 으로 POST 요청, 성공 시 accessToken을 localStorage에 저장
  const handleLogin = async (e) => {
    e.preventDefault();

    // 빈 값 검사
    if (!userId.trim() || !userPw.trim()) {
      alert("아이디와 비밀번호를 모두 입력해주세요.");
      return;
    }

    const loginData = { userId, userPw, keepLogin };
    setIsLoading(true);

    try {
      const response = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("accessToken", data.accessToken);
        navigate("/"); // 로그인 성공 시 메인으로 이동
      } else {
        alert("아이디 또는 비밀번호를 확인하세요.");
      }
    } catch (error) {
      console.error("로그인 중 에러 발생:", error);
      alert("서버와 통신 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // ── 렌더링 ────────────────────────────────────────────────────────
  return (
    // login-page: su-page와 동일한 페이지 래퍼 구조
    <div className="login-page">

      {/* 배경 블롭 (UserSignup의 su-blob과 동일한 구조) */}
      <div className="login-blob login-blob-1" />
      <div className="login-blob login-blob-2" />

      <div className="login-wrapper">
        
        {/* ── 카드 ──────────────────────────────────────────────── */}
        <div className="login-card">

          {/* 카드 헤더: 제목 + 부제목 */}
          <div className="login-card-header">
            <h1 className="login-card-title">로그인</h1>
            <p className="login-card-subtitle">
              바로닥큐에 오신 것을 환영합니다 👋
            </p>
          </div>

          {/* ── 소셜 로그인 버튼 영역 ─────────────────────────────── */}
          {/* 카카오 / 네이버 / 구글 순서 */}
          <div className="login-social-area">
            <p className="login-social-label">소셜 계정으로 간편 로그인</p>
            <div className="login-social-btns">

              {/* 카카오 로그인 */}
              <button
                type="button"
                className="login-social-btn kakao"
                onClick={KakaoLogin}
              >
                {/* 카카오 로고 색상: #3C1E1E (어두운 갈색) */}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#3C1E1E">
                  <path d="M12 3C6.477 3 2 6.477 2 10.8c0 2.7 1.7 5.08 4.27 6.52L5.2 21l4.6-2.4c.72.1 1.46.15 2.2.15 5.523 0 10-3.477 10-7.75S17.523 3 12 3z"/>
                </svg>
                카카오
              </button>

              {/* 네이버 로그인 */}
              <button
                type="button"
                className="login-social-btn naver"
                onClick={NaverLogin}
              >
                {/* 네이버 공식 초록 배경 + 흰색 N */}
                <span className="naver-icon">N</span>
                네이버
              </button>

              {/* 구글 로그인 (현재는 메인 페이지로 이동 - 추후 구현) */}
              <button
                type="button"
                className="login-social-btn google"
                onClick={() => handleNavigate("/")}
              >
                {/* 구글 컬러 아이콘 */}
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                구글
              </button>
            </div>
          </div>

          {/* ── 구분선 ──────────────────────────────────────────── */}
          <div className="login-divider">
            <span>또는 아이디로 로그인</span>
          </div>

          {/* ── 로그인 폼 ─────────────────────────────────────────── */}
          <form className="login-form" onSubmit={handleLogin}>

            {/* 아이디 입력 필드 */}
            <div className="login-field">
              <label className="login-label">
                <i className="fas fa-user" />
                아이디
              </label>
              {/* su-input-wrap과 동일한 구조 */}
              <div className="login-input-wrap">
                <i className="fas fa-user login-input-icon-left" />
                <input
                  type="text"
                  className="login-input"
                  placeholder="아이디를 입력해주세요"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  autoComplete="username"
                />
              </div>
            </div>

            {/* 비밀번호 입력 필드 */}
            <div className="login-field">
              <label className="login-label">
                <i className="fas fa-lock" />
                비밀번호
              </label>
              <div className="login-input-wrap">
                <i className="fas fa-lock login-input-icon-left" />
                <input
                  type={showPw ? "text" : "password"}
                  className="login-input"
                  placeholder="비밀번호를 입력해주세요"
                  value={userPw}
                  onChange={(e) => setUserPw(e.target.value)}
                  autoComplete="current-password"
                />
                {/* 비밀번호 보기/숨기기 토글 버튼 */}
                <button
                  type="button"
                  className="login-pw-toggle"
                  onClick={() => setShowPw(!showPw)}
                  aria-label={showPw ? "비밀번호 숨기기" : "비밀번호 보기"}
                >
                  <i className={`fas ${showPw ? "fa-eye-slash" : "fa-eye"}`} />
                </button>
              </div>
            </div>

            {/* 로그인 상태 유지 체크박스 */}
            <div className="login-options">
              <label className="login-keep-label">
                {/* 커스텀 체크박스 (su-term-check 방식과 동일) */}
                <input
                  type="checkbox"
                  checked={keepLogin}
                  onChange={(e) => setKeepLogin(e.target.checked)}
                  hidden
                />
                <div className={`login-keep-check ${keepLogin ? "checked" : ""}`}>
                  <i className="fas fa-check" />
                </div>
                <span>로그인 상태 유지</span>
              </label>
            </div>

            {/* 로그인 버튼 */}
            <button
              type="submit"
              className="login-submit-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin" />
                  로그인 중...
                </>
              ) : (
                <>
                  <i className="fas fa-right-to-bracket" />
                  로그인
                </>
              )}
            </button>
          </form>

          {/* ── 하단 링크 영역 ───────────────────────────────────── */}
          {/* 아이디 찾기 / 비밀번호 재설정 / 회원가입 */}
          <div className="login-footer-links">
            <Link to="/find/id" className="login-link">
              아이디 찾기
            </Link>
            <span className="login-link-divider">|</span>
            <Link to="/resetPassword" className="login-link">
              비밀번호 재설정
            </Link>
            <span className="login-link-divider">|</span>
            <Link to="/signup" className="login-link strong">
              회원가입
            </Link>
          </div>

          {/* ── 관리자 로그인 링크 ───────────────────────────────── */}
          {/* 하단에 작게 표시: 일반 사용자에게 눈에 띄지 않도록 */}
          <div className="login-admin-link">
            <button
              type="button"
              onClick={() => handleNavigate("/adminLogin")}
            >
              <i className="fas fa-shield-halved" />
              관리자로 로그인
            </button>
          </div>
        </div>
        {/* // login-card */}

        {/* ── 회원가입 유도 문구 ─────────────────────────────────── */}
        <div className="login-signup-cta">
          <span>아직 계정이 없으신가요?</span>
          <Link to="/signup" className="login-signup-link">
            회원가입하기 <i className="fas fa-arrow-right" />
          </Link>
        </div>

      </div>
      {/* // login-wrapper */}
    </div>
    // // login-page
  );
}

export default Login;
