import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./ResetPassword.css"


function ResetPassword(){

    const location = useLocation();
    const navigate = useNavigate();
    const [resetPassword, setResetPassword] = useState({ pw : "", pw2 : ""});

    // 이전 페이지에서 넘어온 토큰 받기
    const token = location.state?.token;
    // 토큰이 없으면 비정상 접근으로 간주하고 내쫓기
    useEffect(() => {
        if (!token) {
            alert("인증 정보가 없습니다. 본인 인증을 다시 진행해주세요.");
            navigate("/find"); // 비번 찾기 페이지로 이동
        }
    }, [token, navigate]);

    async function resetPwButton(){

        if (!resetPassword.pw.trim()) {
            alert("비밀번호를 입력하세요.");
            return;
        }

        const pwRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
        if (!pwRegex.test(resetPassword.pw)) {
            alert("비밀번호는 8자 이상, 영문, 숫자, 특수문자를 포함해야 합니다.");
            return;
        }

        if (resetPassword.pw !== resetPassword.pw2) {
            alert("비밀번호가 일치하지 않습니다.");
            return;
        }

        try{
            const response = await fetch("/api/v1/resetPw", {
            method : "POST",
            headers : {
                "Content-Type" : "application/json",
                "Authorization": `Bearer ${token}`
            },
            body : JSON.stringify({password : resetPassword.pw}),
        });

        if(response.ok){
            alert("성공");
            navigate("/login"); // 성공 후 로그인 페이지로 이동
        }
        }catch(error){
            console.error("error :", error);
            alert("네트워크에 오류가 발생했습니다.")
        }
    };

    // 토큰이 없으면 렌더링하지 않음
    if (!token) return null;

    return(
        <div className="container">
            <div className="line">
                <div className="reset" >비밀번호 재설정</div>
                <div className="newInput">새 비밀번호를 입력하세요.</div>
                <div className="box">
                <label className="newPassword" htmlFor="password" >New Password</label>
                </div>
                <div className="box">
                <input className="inputPassword" type="password" id="password" name="pw" value={resetPassword.pw} onChange={(e)=>setResetPassword({...resetPassword, pw : e.target.value})}/>
                </div>
                <div className="box">
                <label className="reEnterPassword" htmlFor="reEnter">Re-enter Password</label>
                </div>
                <div className="box">
                <input className="inputPassword reEnter" type="password" id="reEnter" name="pw2" value={resetPassword.pw2} onChange={(e)=>setResetPassword({...resetPassword, pw2 : e.target.value})}/>
                </div>
                <button type="button" className="go" onClick={resetPwButton}>비밀번호 재설정</button>
            </div>
        </div>
    );
}
export default ResetPassword;    
