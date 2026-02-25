import "../../assets/styles/UserSignup.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function UserSignup() {

  const [formData, setFormData] = useState({
    userId: "",
    userPw: "",
    userPw2: "",
    userName: "",
    userPhone: "",
    userGender: "",
    userAddr: "",
    userBirth: "",
    userEmail: ""
  });

  const [agreements, setAgreements] = useState({
    termsAgreed: false,
    locationAgreed: false
  });

  const [isIdAvailable, setIsIdAvailable] = useState(false);
  const navigate = useNavigate();

  // 입력값 변경
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === "userId") {
      setIsIdAvailable(false);
    }
  };

  // 아이디 중복 확인
  const distinctId = async () => {
    const { userId } = formData;

    if (!userId.trim()) {
      alert("아이디를 입력해주세요.");
      return;
    }

    const onlyAlphaNum = /^[a-z0-9]+$/;
    if (!onlyAlphaNum.test(userId)) {
      alert("아이디는 영문 소문자와 숫자만 포함해야 합니다.");
      return;
    }

    if (userId.length < 5 || userId.length > 10) {
      alert("아이디는 5~10자 사이여야 합니다.");
      return;
    }

    try {
      const response = await fetch(`/api/v1/check-id?userId=${userId}`);

      if (response.ok) {
        const data = await response.json();

        if (data.isDuplicate) {
          alert("이미 사용중인 아이디입니다.");
          setIsIdAvailable(false);
        } else {
          alert("사용 가능한 아이디입니다.");
          setIsIdAvailable(true);
        }
      }
    } catch (error) {
      alert("서버 통신 오류");
    }
  };

  // 회원가입
  const signupButton = async (e) => {
    e.preventDefault();

    const {
      userId,
      userPw,
      userPw2,
      userPhone,
      userName,
      userGender,
      userBirth,
      userAddr,
      userEmail
    } = formData;

    if (!isIdAvailable) {
      alert("아이디 중복 확인을 해주세요.");
      return;
    }

    // 6. 가입하기 버튼 (유효성 검사 및 서버 전송)
    const signupButton = async (e) => {
        e.preventDefault();
        // formData에서 값 추출
        const { userPw, userPw2, userPhone, userId, userName, userEmail, userGender, userBirth, userAddr } = formData;

    const pwRegex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

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
      alert("필수 약관에 동의해야 합니다.");
      return;
    }

        // 서버 전송 로직
        const submitData =
            {...formData, termAgreement: true};
        

    try {
      const response = await fetch("/api/v1/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData)
      });

      if (response.ok) {
        alert("회원가입 완료!");
        navigate("/user/login");
      } else {
        alert("회원가입 실패");
      }
    } catch (error) {
      alert("네트워크 오류");
    }
  };

  return (
    <div className="signup-wrapper">
      <div className="signup-container">

        <div className="signup-title">회원가입</div>
        <div className="signup-line"></div>

        <form onSubmit={signupButton} className="signup-form">

          <div className="signup-idLine">
            <input
              className="signup-input"
              name="userId"
              placeholder="아이디"
              value={formData.userId}
              onChange={handleChange}
            />
            <button
              type="button"
              className="signup-distinct"
              onClick={distinctId}
            >
              중복 확인
            </button>
          </div>

          <input
            type="password"
            className="signup-input"
            name="userPw"
            placeholder="비밀번호"
            value={formData.userPw}
            onChange={handleChange}
          />

          <input
            type="password"
            className="signup-input"
            name="userPw2"
            placeholder="비밀번호 확인"
            value={formData.userPw2}
            onChange={handleChange}
          />

          <input
            className="signup-input"
            name="userName"
            placeholder="이름"
            value={formData.userName}
            onChange={handleChange}
          />

          <input
            className="signup-input"
            name="userPhone"
            placeholder="휴대폰번호"
            value={formData.userPhone}
            onChange={handleChange}
          />

          <input
            className="signup-input"
            name="userBirth"
            placeholder="생년월일"
            value={formData.userBirth}
            onChange={handleChange}
          />

          <input
            type="email"
            className="signup-input"
            name="userEmail"
            placeholder="이메일"
            value={formData.userEmail}
            onChange={handleChange}
          />

          <input
            className="signup-input"
            name="userAddr"
            placeholder="주소"
            value={formData.userAddr}
            onChange={handleChange}
          />

          <div className="signup-gender">
            <label>
              <input
                type="radio"
                name="userGender"
                value="male"
                onChange={handleChange}
              /> 남성
            </label>
            <label>
              <input
                type="radio"
                name="userGender"
                value="female"
                onChange={handleChange}
              /> 여성
            </label>
          </div>

          <div className="signup-term">
            <label>
              <input
                type="checkbox"
                checked={agreements.termsAgreed}
                onChange={(e) =>
                  setAgreements({ ...agreements, termsAgreed: e.target.checked })
                }
              />
              약관1 (필수)
            </label>

            <label>
              <input
                type="checkbox"
                checked={agreements.locationAgreed}
                onChange={(e) =>
                  setAgreements({ ...agreements, locationAgreed: e.target.checked })
                }
              />
              약관2 (필수)
            </label>
          </div>

          <button type="submit" className="signup-btn">
            가입하기
          </button>

        </form>

      </div>
    </div>
  );
}

export default UserSignup;