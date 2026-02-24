import "./find.css";

function Find(){


    
    return (
        <div className="entireContainer">
        <div className="title">아이디 / 비밀번호 찾기</div>
        <div className="mergeFind">
            <div className="findId">아이디 찾기</div>
            <div className="findPw">비밀번호 찾기</div>
        </div>

        <div className="lineWrapper">
            <div className="line"></div> 
            <div className="line1"></div> 
        </div>

        {/* <div className="line "></div>
        <div className="line line1"></div>
        <div className="find1"> */}

            <div className="mergePhone">
                <input className="putPhone" placeholder='휴대전화번호 입력("-"제외)' />
                <div className="sendCode">인증번호 전송</div>
            </div>
            <div className="line2"></div>
            <div className="mergeCode">
                <input className="putCode" placeholder="인증번호 입력" />
                <div className="ok">확인</div>
            </div>
            <div className="line2"></div>
            <div className="go">아이디 찾기</div>
        </div>
    );
}
export default Find;
    
