import "../../assets/styles/Login.css";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import FindId from "./FindId";



function Login() {

    const [userId, setUserId] = useState("");
    const [userPw, setUserPw] = useState("");
    const [keepLogin, setKeepLogin] = useState(false);
    const [showPw, setShowPw] = useState(false);
    const navigate = useNavigate();

    const handleNavigate = (path) => {
        navigate(path); //8개의 url 이동 담당
    }

    const KakaoLogin = () => {
        // 1. 카카오 디벨로퍼스에서 복사한 REST API 키
        const REST_API_KEY = "7167ec309dc09273be6d7b09a108044c";

        // 2. 카카오 설정창에 방금 등록한 Redirect URI (글자 하나 안 틀리고 똑같아야 함!)
        const REDIRECT_URI = "http://localhost:3000/api/v1/auth/kakao";

        // 3. 카카오 인증 서버 주소 구성
        const KAKAO_AUTH_URL = `https://kauth.kakao.com/oauth/authorize?client_id=${REST_API_KEY}&redirect_uri=${REDIRECT_URI}&response_type=code`;
        
            // 내부 페이지 이동이 아니라 외부(카카오)로 나가야 하므로 href 사용
            window.location.href = KAKAO_AUTH_URL;
        
    }

        const NaverLogin = () => {
        // 1. 네이버 디벨로퍼스에서 복사한 Client ID
        const NAVER_CLIENT_ID = "0GPWYHQbYuwrSJCSA068"; 

        // 2. 네이버 설정창에 등록한 Callback URL (정확히 일치해야 함)
        const REDIRECT_URI = "http://localhost:3000/api/v1/auth/naver"; 

        // 3. 상태 토큰 (보안용 랜덤 문자열 - 임의의 값을 넣어도 무방함)
        const STATE = "naver_signup_state";

        // 4. 네이버 인증 서버 주소 구성
        const NAVER_AUTH_URL = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${NAVER_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&state=${STATE}`;

        // 네이버 인증 페이지로 이동
        window.location.href = NAVER_AUTH_URL;
    }

    //서버로 데이터 전송
    async function handleLogin(e) {
        e.preventDefault();

        if (!userId.trim() || !userPw.trim()) { //트림했을 때 값이 없으면
            alert("아이디와 비밀번호를 모두 입력해주세요.");
            return;
        }

        const loginData = {
            userId: userId,
            userPw: userPw,
            keepLogin: keepLogin //true 또는 false가 서버로 전송됨
        };
        console.log("서버로 보낼 데이터:", loginData);

        try {
            const response = await fetch("/api/v1/auth/login", {
                method: "post",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(loginData),
            });

            if (response.ok) {
                alert("로그인 성공");
                const data = await response.json();
                localStorage.setItem("accessToken", data.accessToken)
                navigate("/"); //성공할 시 이동할 페이지
            } else {
                alert("아이디 또는 비밀번호를 확인하세요");
            }
        } catch (error) {
            console.error("로그인 중 에러 발생", error);
            alert("서버와 통신 중 오류가 발생했습니다.");
        }
    };

    return (
    <div className="login-container">

      <div
        style={{ cursor: "pointer", marginBottom: "30px" }}
        onClick={() => handleNavigate("/main")}
      >
        logo
      </div>

      <div className="login-idDiv">
        <input
          className="login-id"
          placeholder="아이디 입력"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        />
      </div>

      <div className="login-pwDiv">
        <input
          className="login-pw"
          type={showPw ? "text" : "password"}
          placeholder="비밀번호 입력"
          value={userPw}
          onChange={(e) => setUserPw(e.target.value)}
        />
        <img
          className="login-showIcon"
          alt="비번"
          src="/img/visibility_24dp_1F1F1F_FILL0_wght400_GRAD0_opsz24.png"
          onClick={() => setShowPw(!showPw)}
        />
      </div>

      <div className="login-keepDiv">
        <input
          className="login-keepCheck"
          type="checkbox"
          checked={keepLogin}
          onChange={(e) => setKeepLogin(e.target.checked)}
        />
        <label style={{ marginLeft: "8px" }}>로그인 상태 유지</label>
      </div>

      <div className="login-goDiv">
        <button
          type="button"
          className="login-submitBtn"
          onClick={handleLogin}
        >
          로그인
        </button>
      </div>

      <div className="login-linkBox">
        <Link to="/find/id" className="login-findId">
          아이디 찾기
        </Link>
        <Link to="/resetPassword" className="login-resetPw">
          비밀번호 재설정
        </Link>
        <Link to="/signup" className="login-signupLink">
          회원가입
        </Link>
      </div>

      <div className="login-social">
        <a onClick={KakaoLogin}>카카오</a>
        <a onClick={NaverLogin}>네이버</a>
        <a onClick={() => handleNavigate("/main")}>구글</a>
      </div>

      <div
        style={{ marginTop: "20px", cursor: "pointer", fontSize: "13px" }}
        onClick={() => handleNavigate("/adminLogin")}
      >
        관리자로 로그인
      </div>

    </div>
  );
}

export default Login;
