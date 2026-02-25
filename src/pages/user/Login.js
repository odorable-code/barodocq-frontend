import "../../assets/styles/Login.css";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import FindId from "./FindId";


function Login(){

    const [userId, setUserId] = useState("");
    const [userPw, setUserPw] = useState("");
    const [keepLogin, setKeepLogin] = useState(false);
    const [showPw, setShowPw] = useState(false);
    const navigate = useNavigate();

    const handleNavigate = (path) => {
        navigate(path); //8개의 url 이동 담당
    }

    //서버로 데이터 전송
    async function handleLogin (e){
        e.preventDefault();
        
        if (!userId.trim() || !userPw.trim()) { //트림했을 때 값이 없으면
                alert("아이디와 비밀번호를 모두 입력해주세요.");
                return;
            }

        const loginData = {
            userId : userId,
            userPw : userPw,
            keepLogin : keepLogin //true 또는 false가 서버로 전송됨
        };
        console.log("서버로 보낼 데이터:", loginData);

        try{
            const response = await fetch("/api/v1/auth/login", {
                method : "post",
                headers : {
                    "Content-Type" : "application/json"
                },
                body : JSON.stringify(loginData),
            });

            if(response.ok){
                alert("로그인 성공");
                const data = await response.json();
                localStorage.setItem("accessToken", data.accessToken)
                navigate("/"); //성공할 시 이동할 페이지
            }else{
                alert("아이디 또는 비밀번호를 확인하세요");
            }
        }catch(error){
                console.error("로그인 중 에러 발생", error);
                alert("서버와 통신 중 오류가 발생했습니다.");
        }
    };

     return (
    <div className="login-container">

      <div
        className="login-logo"
        onClick={() => handleNavigate("/main")}
        style={{ cursor: "pointer", marginBottom: "30px" }}
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
        <a onClick={() => handleNavigate("/api/kakao")}>카카오</a>
        <a onClick={() => handleNavigate("/api/naver")}>네이버</a>
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