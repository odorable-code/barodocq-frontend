// =====================================================================
// Login.js
// =====================================================================

import "../../assets/styles/Login.css";
import { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../AuthContext"; // 🔥 경로 유지

function Login() {
  const [userId, setUserId] = useState("");
  const [userPw, setUserPw] = useState("");
  const [keepLogin, setKeepLogin] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { setUser } = useAuth(); // 🔥 핵심 추가
  const navigate = useNavigate();

  const handleNavigate = (path) => navigate(path);
  
  // ── 로그인 처리 ─────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!userId.trim() || !userPw.trim()) {
      alert("아이디와 비밀번호를 모두 입력해주세요.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, userPw, keepLogin }),
      });

      if (!response.ok) {
        alert("아이디 또는 비밀번호를 확인하세요.");
        return;
      }

      const data = await response.json();

      // ✅ 1️⃣ 토큰 저장
      localStorage.setItem("accessToken", data.accessToken);

      // ✅ userNum 저장
      localStorage.setItem("userNum", data.userNum);

      // ✅ 2️⃣ Context 상태 변경 (🔥 헤더 즉시 변경됨)
      setUser({
        isLoggedIn: true,
        userId: userId,
      });

      // ✅ 3️⃣ 메인으로 이동
      navigate("/");
    } catch (error) {
      console.error("로그인 중 에러 발생:", error);
      alert("서버와 통신 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };
  //http://localhost:8080/api/v1/auth/kakao
  //http://localhost:3000/kakao/callback
  //http://localhost:3000/api/v1/auth/kakao
  const REST_API_KEY = '7167ec309dc09273be6d7b09a108044c';
  const REDIRECT_URI = 'http://localhost:3000/kakao/callback';
  const KAKAO_AUTH_URL =`https://kauth.kakao.com/oauth/authorize?client_id=${REST_API_KEY}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code`;

  const handleKakaoLogin = () => { 
    window.location.href = KAKAO_AUTH_URL; //사용자를 카카오 로그인 창으로 보내는 코드
  }; 

  return (
    <div className="login-page">
      <div className="login-blob login-blob-1" />
      <div className="login-blob login-blob-2" />

      <div className="login-wrapper">
        <div className="login-card">
          <div className="login-card-header">
            <h1 className="login-card-title">로그인</h1>
            <p className="login-card-subtitle">
              바로닥큐에 오신 것을 환영합니다 👋
            </p>
          </div>

          <form className="login-form" onSubmit={handleLogin}>
            <div className="login-field">
              <label className="login-label">
                <i className="fas fa-user" />
                아이디
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
                <button
                  type="button"
                  className="login-pw-toggle"
                  onClick={() => setShowPw(!showPw)}
                >
                  <i className={`fas ${showPw ? "fa-eye-slash" : "fa-eye"}`} />
                </button>
              </div>
            </div>

            <div className="login-options">
              <label className="login-keep-label">
                <input
                  type="checkbox"
                  checked={keepLogin}
                  onChange={(e) => setKeepLogin(e.target.checked)}
                  hidden
                />
                <div
                  className={`login-keep-check ${keepLogin ? "checked" : ""}`}
                >
                  <i className="fas fa-check" />
                </div>
                <span>로그인 상태 유지</span>
              </label>
            </div>

            <div className="circle" onClick={handleKakaoLogin}></div>

            <button
              type="submit"
              className="login-submit-btn"
              disabled={isLoading}
            >
              {isLoading ? "로그인 중..." : "로그인"}
            </button>
          </form>

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
        </div>

        <div className="login-signup-cta">
          <span>아직 계정이 없으신가요?</span>
          <Link to="/signup" className="login-signup-link">
            회원가입하기
          </Link>
        </div>
      </div>
    </div>
  );
}
export default Login;
