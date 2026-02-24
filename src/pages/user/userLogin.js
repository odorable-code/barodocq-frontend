import { useState } from "react";
import "./userLogin.css"
import { useNavigate } from "react-router-dom";

function UserLogin(){

    const [userLoginData, setUserLoginData] = useState({ id : "", pw : "", keepLogin : false})
    const navigate = useNavigate();

    // 입력값을 처리하는 함수 (e.target을 여기 안으로 옮겼어요)
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setUserLoginData({ ...userLoginData, [name]: type === "checkbox" ? checked : value });
    };

    async function submitLogin(){
        try{
        const response = await fetch("/api/userLogin", {
            method : "POST",
            headers : {
                "Content-Type" : "application/json",
            },
            body : JSON.stringify(userLoginData),
        });

    if(response.ok){
        alert("로그인 성공")
    }
    else{
        alert("로그인 실패");
    }
    }catch(error){
        console.error("error :", error);
        alert("네트워크에서 오류가 발생했습니다.");
    }
    }

    return (
        <div className="container">
        <div className="logo" onClick={()=> {navigate("/main")}}>logo</div>
        <br />
        <br />
            <div className="idDiv">
                <input className="id" name="id" placeholder="아이디 입력" value={userLoginData.id} onChange={handleInputChange}/>
            </div>
            <div className="pwDiv">
                <input className="pw" type="password" name="pw" placeholder="비밀번호 입력" value={userLoginData.pw} onChange={handleInputChange}/>
            </div>
            <br />
            <div className="keepLoginDiv">
                <input className="keepLogin" type="checkbox" name="keepLogin" checked={userLoginData.keepLogin} onChange={handleInputChange}/>
                <div className="keepLoginTextDiv"> 
                    <label htmlFor="keepLoginText">로그인 상태 유지</label>
                </div>
            </div>

        <button type="button" className="go" onClick={submitLogin}>로그인</button>
        <div className="divBox">
            <div className="findId" onClick={()=> {navigate("/findId")}}>아이디 찾기</div>
            <div className="resetPw" onClick={()=> {navigate("/findPw")}}>비밀번호 재설정</div>
            <div className="signup" onClick={()=> {navigate("/userSignup")}}>회원가입</div>
        </div>
        <div className="social">
            <div className="kakao" onClick={()=> {navigate("/api/kakao")}}></div>
            <div className="naver" onClick={()=> {navigate("/api/naver")}}></div>
            <div className="google" onClick={()=> {navigate("/api/google")}}></div>
        </div>
        <div className="adminLogin" onClick={()=> {navigate("/adminLogin")}}>관리자로 로그인</div>
    </div>
    );
}
export default UserLogin;