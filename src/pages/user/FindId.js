import { useNavigate } from "react-router-dom";
import "./FindId.css";
import { useState } from "react";

function FindId(){
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const navigate = useNavigate();
    
    const findIdData = { userPhone : phone, userEmail : email }

    const findId = async() => {
        if(!phone){
            alert("휴대폰 번호를 입력해주세요.");
            return;
        }
        if(!email){
            alert("이메일을 입력해주세요.");
            return;
        }
        try {
            const response = await fetch("/api/v1/users/findId", {
                method: "POST",
                headers: { "Content-Type": "application/json" }, 
                body: JSON.stringify(findIdData)
            });
            if (response.ok) {
                const foundId = await response.text();
                alert("일치하는 아이디를 찾았습니다." + foundId);
                //navigate("/main", { state: { userId: findIdData.userId } });
                console.log(findIdData);
            } else {
                alert("일치하는 아이디가 없습니다.");
            }
        }catch (error) {
            console.error(error);
            alert("서버 통신 오류");
        }
    }
    
    return (
        <div className="entireContainer">
            <div className="upperBar"></div>
            <div className="title">아이디 찾기</div>
            <div className="welcome">바로닥큐에 오신 것을 환영합니다.</div>

            {/* <div className="lineWrapper"></div> */}
                <div className="line"></div>
            <form onSubmit={findId}>
                <div className="mergePhone">휴대전화번호
                    <div>
                        <input className="putPhone" placeholder='휴대전화번호를 입력해주세요.("-"제외)' value={phone} onChange={(e) => setPhone(e.target.value)}/>
                    </div>
                </div>
                <div className="line2"></div>
                    <div className="mergeEmail">
                        <div className="email">이메일</div>
                            <input className="putEmail" type="email" placeholder="이메일을 입력해주세요." value={email} onChange={(e) => setEmail(e.target.value)}/>
                    </div>
                <div className="line2"></div>
                <button type="submit" className="go" >아이디 찾기</button>
            </form>
        </div>
        
    );
}
export default FindId;