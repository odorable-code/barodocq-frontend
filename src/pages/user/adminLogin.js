import "./adminLogin.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminLogin(){

    const [userId, setUserId] = useState("");
    const [userPw, setUserPw] = useState("");
    const [keepLogin, setKeepLogin] = useState(false);
    const navigate = useNavigate();

const handleNavigate = (path) => {
    navigate(path); //8개의 url 이동 담당
}

//서버로 데이터 전송
async function handleLogin (e){
    e.preventDefault();
    
    const loginData = {
        userId : userId,
        userpPw : userPw,
        keepLogin : keepLogin //true 또는 false가 서버로 전송됨
    };
    console.log("서버로 보낼 데이터:", loginData);

    try{
        const response = await fetch("/api/adminLogin", {
            method : "post",
            headers : {
                "Content-Type" : "application/json"
            },
            body : JSON.stringify(loginData),
        });

        if(response.ok){
            alert("로그인 성공");
            navigate("/"); //성공할 시 이동할 페이지
        }else{
            alert("아이디 또는 비밀번호를 확인하세요");
        }}catch(error){
            console.error("로그인 중 에러 발생", error);
            alert("서버와 통신 중 오류가 발생했습니다.");
    }
};

    return (
    <div className="container">
        <div className="logo" onClick={() => handleNavigate("/main")}>logo</div>
        <br />
        <br />
            <div className="idDiv">
                <input className="id" name="id" placeholder="아이디 입력" value={userId} onChange={(e)=> setUserId(e.target.value)}/>
            </div>
            <div className="pwDiv">
                <input className="pw" type="password" name="pw" placeholder="비밀번호 입력" value={userPw} onChange={(e)=>{setUserPw(e.target.value)}}/>
                <img className="show" alt="비번" src="img/visibility_24dp_1F1F1F_FILL0_wght400_GRAD0_opsz24.png" />
            </div>
            <div className="keepLoginDiv">
                <input className="keepLogin" type="checkbox" name="keepLoginCheck" checked={keepLogin} onChange={(e) =>{ setKeepLogin(e.target.checked)}}/>로그인 상태 유지
            </div>
        <div className="goDiv">
            <button type="submit" className="go" onClick={handleLogin}>로그인</button>
        </div>
        <div className="divBox">
            <a className="findId" onClick={() => handleNavigate("/find/id")}>아이디 찾기</a>
            <a className="resetPw" onClick={() => handleNavigate("/resetPassword")}>비밀번호 재설정</a>
            <a className="signup" onClick={() => handleNavigate("/signup")}>회원가입</a>
        </div>
        <div className="social">
            <a className="kakao" onClick={() => handleNavigate("/api/kakao")}></a>
            <a className="naver" onClick={() => handleNavigate("/api/naver")}></a>
            <a className="google" onClick={() => handleNavigate("/main")}></a>
        </div>
        <a className="userLogin" onClick={() => handleNavigate("/userLogin")}>일반 회원으로 로그인</a>
    </div>
    );
}
export default AdminLogin;
    