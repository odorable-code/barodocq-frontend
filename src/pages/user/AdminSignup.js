import "../../assets/styles/AdminSignup.css";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 

function AdminSignup() {
  
    const navigate = useNavigate();

  
    const [formData, setFormData] = useState({
        hospitalName: "",
        userId: "",
        userPw: "",
        userPw2: "",
        userEmail: "",
        userPhone: "",
        bizNumber: "",
        userAddr: "",
        bizFile: ""
    });

    const [agreements, setAgreements] = useState({ termsAgreed: false, locationAgreed: false });
    const [isIdAvailable, setIsIdAvailable] = useState(false);
    const [errors, setErrors] = useState({});
    
    const [bizFile, setBizFile] = useState(null);

    
    const handleFileChange = (e) => {
        // 사용자가 선택한 파일들 중 첫 번째 파일
        const file = e.target.files[0];
        
        //   if (file) {
        //       // 파일 용량 제한 (예: 5MB)
        //       if (file.size > 5 * 1024 * 1024) {
        //           alert("파일 크기는 5MB를 초과할 수 없습니다.");
        //           e.target.value = ""; // 추가: input창 초기화
        //           return;
        //       }
            
            // 상태 업데이트
            setBizFile(file);
            console.log("선택된 파일:", file.name);
        //}
    };

    // 2. 입력값 변경 핸들러
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (name === "userId") setIsIdAvailable(false); // 아이디 고치면 다시 중복확인 해야 함
        // 추가: 사업자번호(bizNumber)일 경우 숫자만 추출하고 10자까지만 제한
        if (name === "bizNumber") {
            const onlyNumber = value.replace(/[^0-9]/g, ""); // 숫자가 아닌 문자 제거
            if (onlyNumber.length == 10) {
                setFormData({ ...formData, [name]: onlyNumber });
            }
            if (formData.bizNumber.length !== 10) {
                alert("사업자등록번호는 반드시 10자여야 합니다. 현재: " + formData.bizNumber.length + "자");
                return;
            }
        }
    };

    const handleNavigate = (path) => {
        navigate(path); //url 이동 담당
    }

    const distinctId = async () => {
        const userId = formData.userId;

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

        try {
            // 2. 서버에 GET 요청 보내기
            
            const response = await fetch(`/api/v1/auth/check-id?userId=${userId}`);

            // 3. 응답이 정상인지 확인
            if (response.ok) {
                const data = await response.json(); // JSON 파싱 기다리기

                if (data.isDuplicate) {
                    alert("이미 중복된 아이디가 존재합니다.");
                    setErrors({ ...errors, userId: "중복된 아이디입니다." });
                    setIsIdAvailable(false);
                } else {
                    alert("사용 가능한 아이디입니다");
                    setErrors({ ...errors, userId: "" });
                    setIsIdAvailable(true);
                }
            } else {
                alert("서버 응답에 문제가 있습니다.");
            }
        } catch (error) {
            // 4. 네트워크 에러 처리
            console.error(error);
            alert("서버 통신 오류가 발생했습니다.");
        }
    }

    // 6. 가입하기 버튼 (유효성 검사 및 서버 전송)
    const signupButton = async (e) => {
        e.preventDefault();
        // formData에서 값 추출
        const { userPw, userPw2, userPhone, userId, userName, userGender } = formData;

        // 중복 확인 여부 먼저 체크
        if (!isIdAvailable) {
            alert("아이디 중복 확인을 해주세요.");
            return;
        }

        if (!userPw.trim()) {
            alert("비밀번호를 입력하세요.");
            return; 
        }
            
        const pwRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
        if (!pwRegex.test(userPw)) {
            alert("비밀번호는 8자 이상, 영문, 숫자, 특수문자를 포함해야 합니다.");
            return; 
        }

        if (userPw !== userPw2) {
            alert("비밀번호가 일치하지 않습니다.");
            return; 
        }

        const phoneRegex = /^010\d{7,8}$/;
        if (!phoneRegex.test(userPhone)) {
            alert("올바른 휴대폰 번호를 입력해주세요.");
            return; 
        }

        if (!(agreements.termsAgreed && agreements.locationAgreed)) {
            alert("필수 약관에 모두 동의하셔야 가입이 가능합니다.");
            return; 
        }

        // 서버 전송 로직
        const submitData = {
            userId: userId,
            userPw: userPw,
            userName: userName,
            userPhone: userPhone,
            userGender: userGender,
            termAgreement: true 
        };

        try {
            const response = await fetch("http://localhost:8080/api/v1/auth/signup", {
                method: "POST",
                headers: { "Content-type": "application/json" },
                body: JSON.stringify(submitData),
            });

            if (response.ok) {
                alert("회원가입이 완료되었습니다!");
                navigate("/user/login");
            } else {
                alert("가입 실패");
            }
        } catch (error) {
            alert("네트워크 오류가 발생했습니다."); }
    };

  return(

    <div className="signup-container">
        <h1 className="main-title">관리자 회원가입</h1>

        <div className="logo-area">
            <span className="logo-badge">바로닥터</span>
        </div>

        {/* ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ 가입정보 섹션 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ */}
            <h3 className="section-title">가입정보</h3>
            <div className="line"></div>
        <form onSubmit={signupButton}>
            <div className="inputGroup">
            <input className="input-field" name="hospitalName" placeholder="병원 이름" value={formData.hospitalName} onChange={handleChange} />
            <div className="line1"></div>
            </div>

            <div className="idLine">
            <input className="id" name="userId" placeholder="아이디" value={formData.userId} onChange={handleChange} />
            <div className="distinctDiv">
                <button type="button" className="distinct" onClick={distinctId}>중복 확인</button>
            </div>
            <div className="line1"></div>
            </div>

            <div className="pwLine">
            <input type="password" name="userPw" className="pw" placeholder="비밀번호" value={formData.userPw} onChange={handleChange} />
            <div className="line1"></div>
            </div>

            <div className="pw2Line">
            <input type="password" name="userPw2" className="pw2" placeholder="비밀번호 확인" value={formData.userPw2} onChange={handleChange} />
            <div className="line1"></div>
            </div>

            <div className="emailLine">
            <input type="email" name="userEmail" className="email" placeholder="병원 이메일" value={formData.userEmail} onChange={handleChange} />
            <div className="line1"></div>
            </div>

            <div className="phoneLine">
            <input className="phone" name="userPhone" placeholder="병원 연락처" value={formData.userPhone} onChange={handleChange} />
            <div className="line1"></div>
            </div>

        {/* ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ 사업자 정보 섹션 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ */}
            <h3 className="section-title">사업자 정보</h3>
            <div className="line"></div>

            <div className="inputGroup">
            <input className="input-field" name="bizNumber" placeholder="사업자등록번호" value={formData.bizNumber} onChange={handleChange} />
            <div className="line1"></div>
            </div>

            <div className="inputGroup">
            <input className="input-field" name="hospitalName" placeholder="병원명" value={formData.hospitalName} onChange={handleChange} />
            <div className="line1"></div>
            </div>

            <div className="addressLine">
            <div className="line1"></div>
            <input className="address" name="userAddr" placeholder="주소 입력" value={formData.userAddr} onChange={handleChange} style={{ marginTop: '10px' }} />
            <div className="line1"></div>
            </div>

            {/* 사업자등록증 첨부 (파일) */}
            <div className="fileLine" style={{ marginTop: '20px' }}>
            <div className="label-text" style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>사업자등록증 첨부</div>
            <input type="file" name="bizFile" className="file-input" onChange={handleFileChange} />
            <div className="line1"></div>
            </div>

            <div className="term">
            <input type="checkbox" checked={agreements.termsAgreed && agreements.locationAgreed} onChange={(e) => setAgreements({ termsAgreed: e.target.checked, locationAgreed: e.target.checked })} />
            <span>전체 동의</span>
            <br />
            <input type="checkbox" checked={agreements.termsAgreed} onChange={(e) => setAgreements({ ...agreements, termsAgreed: e.target.checked })} />
            <span>약관1 (필수)</span>
            <br />
            <input type="checkbox" checked={agreements.locationAgreed} onChange={(e) => setAgreements({ ...agreements, locationAgreed: e.target.checked })} />
            <span>약관2 (필수)</span>
            </div>
            <button type="submit" className="go" >가입하기</button>
        </form>
    </div>
    )
}
export default AdminSignup;