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
        <div className="title">아이디 찾기</div>

        <div className="lineWrapper">
            <div className="line"></div>
        </div>
        <form onSubmit={findId}>
            <div className="mergePhone">
                <input className="putPhone" placeholder='휴대전화번호 입력("-"제외)' value={phone} onChange={(e) => setPhone(e.target.value)}/>
            </div>
            <div className="line2"></div>
                <div className="mergeEmail">
                    <input className="putEmail" type="email" placeholder="이메일 입력" value={email} onChange={(e) => setEmail(e.target.value)}/>
                </div>
            <div className="line2"></div>
            <button type="submit" className="go" >아이디 찾기</button>
            {/* <Link to="/found/id"  */}
        </form>
            </div>
        
    );
}
export default FindId;