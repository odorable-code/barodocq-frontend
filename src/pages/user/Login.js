// src/pages/user/Login.jsx
import "../../assets/styles/Login.css";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../AuthContext";

function Login() {
  const [userId,    setUserId]    = useState("");
  const [userPw,    setUserPw]    = useState("");
  const [keepLogin, setKeepLogin] = useState(false);
  const [showPw,    setShowPw]    = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { getMeAndSetUser } = useAuth();
  const navigate = useNavigate();

  /* ── 로그인 제출 ── */
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!userId.trim() || !userPw.trim()) {
      alert("아이디와 비밀번호를 모두 입력해주세요.");
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId, userPw, keepLogin }),
      });
      if (!response.ok) {
        alert("아이디 또는 비밀번호를 확인하세요.");
        return;
      }
      const data = await response.json();
      if (data.accessToken) localStorage.setItem("accessToken", data.accessToken);
      const me = await getMeAndSetUser();
      if (!me) {
        alert("사용자 정보를 불러오지 못했습니다. 다시 로그인해주세요.");
        localStorage.removeItem("accessToken");
        return;
      }
      navigate("/");
    } catch (error) {
      console.error("로그인 중 에러 발생:", error);
      alert("서버와 통신 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  /* ── 카카오 로그인 ── */
  const REST_API_KEY  = "8b93cc51be9307b47fbf3b5d6883de0d";
  const REDIRECT_URI  = "http://localhost:3000/kakao/callback";
  const handleKakaoLogin = () => {
    window.location.href =
      `https://kauth.kakao.com/oauth/authorize?client_id=${REST_API_KEY}` +
      `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code`;
  };

  return (
    <div className="login-page">
      {/* 배경 블롭 */}
      <div className="login-blob login-blob-1" />
      <div className="login-blob login-blob-2" />

      <div className="login-wrapper">
        <div className="login-card">

          {/* ── 카드 헤더 ── */}
          <div className="login-card-header">
            <h1 className="login-card-title">로그인</h1>
            <p className="login-card-subtitle">
              바로닥큐에 오신 것을 환영합니다 👋
            </p>
          </div>

          {/* ── 폼 ── */}
          <form className="login-form" onSubmit={handleLogin}>

            {/* 아이디 */}
            <div className="login-field">
              <label className="login-label">
                <i className="fas fa-user" /> 아이디
              </label>
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

            {/* 비밀번호 */}
            <div className="login-field">
              <label className="login-label">
                <i className="fas fa-lock" /> 비밀번호
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
                <button
                  type="button"
                  className="login-pw-toggle"
                  onClick={() => setShowPw(!showPw)}
                >
                  <i className={`fas ${showPw ? "fa-eye-slash" : "fa-eye"}`} />
                </button>
              </div>
            </div>

            {/* 로그인 상태 유지 */}
            <div className="login-options">
              <label className="login-keep-label">
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
              {isLoading
                ? <><i className="fas fa-spinner fa-spin" /> 로그인 중...</>
                : <><i className="fas fa-right-to-bracket" /> 로그인</>}
            </button>

            {/* ✅ 구분선 */}
            <div className="login-divider">
              <span>또는 소셜 계정으로 로그인</span>
            </div>

            {/* ✅ 카카오 로그인 버튼 (circle div 제거 → 정식 버튼으로 교체) */}
            <button
              type="button"
              className="login-kakao-btn"
              onClick={handleKakaoLogin}
            >
              <img
                src="/kakao_icon.png"
                alt=""
                className="login-kakao-icon"
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
              <span>카카오로 로그인</span>
            </button>

          </form>

          {/* ── 하단 링크 (아이디 찾기 | 회원가입) ── */}
          <div className="login-footer-links">
            <Link to="/find/id" className="login-link">아이디 찾기</Link>
            <span className="login-link-divider">|</span>
            <Link to="/signup"  className="login-link strong">
              회원가입 <i className="fas fa-arrow-right" />
            </Link>
          </div>

        </div>
        {/* // login-card */}

        {/* ✅ 카드 밖 회원가입 유도 CTA (UserSignup의 su-admin-cta와 동일 구조) */}
        <div className="login-signup-cta">
          <span>아직 계정이 없으신가요?</span>
          <Link to="/signup" className="login-signup-link">
            회원가입하기 <i className="fas fa-arrow-right" />
          </Link>
        </div>

      </div>
    </div>
  );
}

export default Login;
