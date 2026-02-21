import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/styles/UserLogin.css";

function UserLogin() {
  const [userLoginData, setUserLoginData] = useState({
    id: "",
    pw: "",
    keepLogin: false,
  });

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUserLoginData({
      ...userLoginData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const submitLogin = () => {
    alert(
      `아이디: ${userLoginData.id}\n비밀번호: ${userLoginData.pw}\n로그인 유지: ${userLoginData.keepLogin}`
    );
  };

  return (
    <div className="container">
      <div className="logo" onClick={() => navigate("/")}>
        LOGO
      </div>

      <div className="idDiv">
        <input
          className="id"
          name="id"
          placeholder="아이디 입력"
          value={userLoginData.id}
          onChange={handleInputChange}
        />
      </div>

      <div className="pwDiv">
        <input
          className="pw"
          type="password"
          name="pw"
          placeholder="비밀번호 입력"
          value={userLoginData.pw}
          onChange={handleInputChange}
        />
      </div>

      <div className="keepLoginDiv">
        <input
          id="keepLogin"
          className="keepLogin"
          type="checkbox"
          name="keepLogin"
          checked={userLoginData.keepLogin}
          onChange={handleInputChange}
        />
        <label htmlFor="keepLogin">로그인 상태 유지</label>
      </div>

      <button type="button" className="go" onClick={submitLogin}>
        로그인
      </button>

      <div className="divBox">
        <div onClick={() => navigate("/findId")}>아이디 찾기</div>
        <div onClick={() => navigate("/findPw")}>비밀번호 재설정</div>
        <div onClick={() => navigate("/signup")}>회원가입</div>
      </div>

      <div className="social">
        <div onClick={() => alert("카카오 로그인")}>K</div>
        <div onClick={() => alert("네이버 로그인")}>N</div>
        <div onClick={() => alert("구글 로그인")}>G</div>
      </div>

      <div
        className="adminLogin"
        onClick={() => navigate("/adminLogin")}
      >
        관리자로 로그인
      </div>
    </div>
  );
}

export default UserLogin;