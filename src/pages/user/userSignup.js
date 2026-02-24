import "./userSignup.css";
import axios from "axios";
import { useState, useEffect } from "react";

function UserSignup() {
    // 1. 상태 선언
    const [formData, setFormData] = useState({
        id: "", pw: "", pw2: "", name: "", phone: "", gender: ""
    });
    const [agreements, setAgreements] = useState({ term1: false, term2: false });
    const [errors, setErrors] = useState({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [isTimeActive, setIsTimeActive] = useState(false);

    // 2. 입력값 변경 핸들러
    const hanldleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // 3. 타이머 로직 (useEffect)
    useEffect(() => {
        let timer;
        if (isTimeActive && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsTimeActive(false);
            clearInterval(timer);
        }
        return () => clearInterval(timer);
    }, [isTimeActive, timeLeft]);

    // 4. 시간 포맷 함수
    const formatTime = (seconds) => {
        const min = Math.floor(seconds / 60);
        const sec = seconds % 60;
        return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
    };

    // 5. 아이디 중복 확인
    const distinctId = () => {
        const userId = formData.id;

        if (userId.trim().length === 0) {
            alert("아이디를 입력해주세요.");
            return;
        }

        const startWithAlpha = /^[a-z]/;
        if (!startWithAlpha.test(userId)) {
            alert("아이디는 영문 소문자로 시작해야 합니다");
            return;
        }

        const onlyAlphaNum = /^[a-z0-9]+$/;
        if (!onlyAlphaNum.test(userId)) {
            alert("아이디는 영문 소문자와 숫자만 포함할 수 있습니다.");
            return;
        }

        if (userId.length < 5 || userId.length > 10) {
            alert("아이디는 5자 이상 10자 이하로 입력해야 합니다.");
            return;
        }

        axios.get('/api/check-id', { params: { id: userId } })
            .then(response => {
                if (response.data.isDuplicate) {
                    alert("이미 중복된 아이디가 존재합니다.");
                    setErrors({ ...errors, id: "중복된 아이디입니다." });
                } else {
                    alert("사용 가능한 아이디입니다!");
                    setErrors({ ...errors, id: "" });
                }
            })
            .catch(error => alert("서버 통신 오류"));
    };

    // 6. 가입하기 버튼 (유효성 검사 및 서버 전송)
    const signupButton = async () => {
        // formData에서 값 추출
        const { pw, pw2, phone, id, name, gender } = formData;

        if (!pw.trim()) {
            alert("비밀번호를 입력하세요.");
            return; }
            
        const pwRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
        if (!pwRegex.test(pw)) {
            alert("비밀번호는 8자 이상, 영문, 숫자, 특수문자를 포함해야 합니다.");
            return; }

        if (pw !== pw2) {
            alert("비밀번호가 일치하지 않습니다.");
            return; }

        const phoneRegex = /^010\d{7,8}$/;
        if (!phoneRegex.test(phone)) {
            alert("올바른 휴대폰 번호를 입력해주세요.");
            return; }

        if (!(agreements.term1 && agreements.term2)) {
            alert("필수 약관에 모두 동의하셔야 가입이 가능합니다.");
            return; }

        // 서버 전송 로직
        const submitData = {
            userId: id,
            password: pw,
            userName: name,
            phoneNumber: phone,
            gender: gender,
            termAgreement: true };

        try {
            const response = await fetch("/api/userSignup", {
                method: "POST",
                headers: { "Content-type": "application/json" },
                body: JSON.stringify(submitData),
            });

            if (response.ok) {
                alert("회원가입이 완료되었습니다!");
            } else {
                alert("가입 실패");
            }
        } catch (error) {
            alert("네트워크 오류가 발생했습니다."); }};

    return (
        <div className="container">
            <div className="signup">회원가입</div>
            <div className="line"></div>
            <div className="container2">
                <div className="idLine">
                    <input className="id" name="id" placeholder="아이디" value={formData.id} onChange={hanldleChange} />
                    <div className="distinctDiv">
                        <button type="button" className="distinct" onClick={distinctId}>중복 확인</button>
                    </div>
                    <div className="line1"></div>
                </div>

                <div className="pwLine">
                    <input type="password" value={formData.pw} className="pw" name="pw" placeholder="비밀번호" onChange={hanldleChange} />
                    <div className="line1"></div>
                </div>

                <input type="password" value={formData.pw2} className="pw2" name="pw2" placeholder="비밀번호 확인" onChange={hanldleChange} />
                <div className="line1"></div>

                <div className="nameLine">
                    <input className="name" name="name" placeholder="이름" value={formData.name} onChange={hanldleChange} />
                    <div className="line1"></div>
                </div>

                <div className="phoneLine">
                    <input className="phone" name="phone" placeholder="휴대폰번호" value={formData.phone} onChange={hanldleChange} />
                    <div className="sendCodeDiv">
                        <button type="button" className="sendCode" onClick={() => { setIsTimeActive(true); setTimeLeft(180); }}>
                            {isTimeActive ? formatTime(timeLeft) : "인증번호 전송"}
                        </button>
                    </div>
                    <div className="line1"></div>
                </div>

                <div className="gender">성별</div>
                <div className="checkbox">
                    <input type="radio" name="gender" id="men" checked={formData.gender === "men"} onChange={() => setFormData({ ...formData, gender: "men" })} />
                    <label htmlFor="men">남성</label>
                    <input type="radio" name="gender" id="women" checked={formData.gender === "women"} onChange={() => setFormData({ ...formData, gender: "women" })} />
                    <label htmlFor="women">여성</label>
                </div>

                <div className="term">
                    <input type="checkbox" checked={agreements.term1 && agreements.term2} onChange={(e) => setAgreements({ term1: e.target.checked, term2: e.target.checked })} />
                    <span>전체 동의</span>
                    <br />
                    <input type="checkbox" checked={agreements.term1} onChange={(e) => setAgreements({ ...agreements, term1: e.target.checked })} />
                    <span>약관1 (필수)</span>
                    <br />
                    <input type="checkbox" checked={agreements.term2} onChange={(e) => setAgreements({ ...agreements, term2: e.target.checked })} />
                    <span>약관2 (필수)</span>
                </div>

                <button type="button" className="go" onClick={signupButton}>가입하기</button>
            </div>
        </div>
    );
}

export default UserSignup;