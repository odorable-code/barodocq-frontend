import "../../assets/styles/UserSignup.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function UserSignup() {
    // 1. 상태 선언
    const [formData, setFormData] = useState({
        userId: "", userPw: "", userPw2: "", userName: "", userPhone: "", userGender: "", email: "", userAddr: "", userBirth: ""
    });
    const [agreements, setAgreements] = useState({ termsAgreed: false, locationAgreed: false });
    const [errors, setErrors] = useState({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [isTimeActive, setIsTimeActive] = useState(false);

  // 중복 확인 여부 상태 추가
  const [isIdAvailable, setIsIdAvailable] = useState(false);
  const navigate = useNavigate();

  //ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ 카카오 로직
  // 1. 카카오 디벨로퍼스에서 복사한 REST API 키
  const REST_API_KEY = "7167ec309dc09273be6d7b09a108044c";

  // 2. 카카오 설정창에 방금 등록한 Redirect URI
  const REDIRECT_URI = "http://localhost:3000/api/v1/auth/kakao";

  // 3. 카카오 인증 서버 주소 구성
  const KAKAO_AUTH_URL = `https://kauth.kakao.com/oauth/authorize?client_id=${REST_API_KEY}&redirect_uri=${REDIRECT_URI}&response_type=code`;

  const handleKakaoLogin = () => {
    // 내부 페이지 이동이 아니라 외부(카카오)로 나가야 하므로 href 사용
    window.location.href = KAKAO_AUTH_URL;
  };

  //ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ네이버 로직
  // 1. 네이버 디벨로퍼스에서 발급받은 Client ID
  const NAVER_CLIENT_ID = "0GPWYHQbYuwrSJCSA068";

  // 2. 네이버 설정창(애플리케이션)에 등록한 Callback URL
  // 주의: 카카오와 마찬가지로 리액트에서 처리할 주소나 백엔드 주소를 정확히 적어야 합니다.
  const NAVER_REDIRECT_URI = "http://localhost:3000/api/v1/auth/naver";

  // 3. 상태 토큰 (CSRF 공격 방지용 랜덤 문자열 - 임의로 작성 가능)
  const STATE = "random_state_string";

  // 4. 네이버 인증 서버 주소 구성
  const NAVER_AUTH_URL = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${NAVER_CLIENT_ID}&redirect_uri=${encodeURIComponent(NAVER_REDIRECT_URI)}&state=${STATE}`;

  const handleNaverLogin = () => {
    // 네이버 인증 화면으로 이동
    window.location.href = NAVER_AUTH_URL;
  };

  //ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ구글 로직
  const handleGoogleLogin = () => {
    // 백엔드에서 설정한 구글 인증 URL로 이동합니다.
    // 보통 백엔드가 구글 API와 통신하여 로그인 페이지를 띄워줍니다.
    window.location.href = "http://localhost:8080/api/v1/auth/google";
  };

  //ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

  // 2. 입력값 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (name === "userId") setIsIdAvailable(false); // 아이디 고치면 다시 중복확인 해야 함
  };

  const handleNavigate = (path) => {
    navigate(path); //8개의 url 이동 담당
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
  const distinctId = async () => {
    const userId = formData.userId;

    if (userId.trim().length === 0) {
      alert("아이디를 입력해주세요.");
      return;
    }

    // const startWithAlpha = /^[a-z]/;
    // if (!startWithAlpha.test(userId)) {
    //     alert("아이디는 영문 소문자로 시작해야 합니다");
    //     return;
    // }

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
      // 2. 서버에 GET 요청 보내기 http://localhost:8080

      const response = await fetch(`/api/v1/check-id?userId=${userId}`);

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
  };

  function clickSend() {
    if (!isIdAvailable) {
      alert("먼저 아이디 중복 확인을 하세요.");
      return;
    }
    setIsTimeActive(true);
    setTimeLeft(180);
  }

  // 6. 가입하기 버튼 (유효성 검사 및 서버 전송)
  const signupButton = async (e) => {
    e.preventDefault();
    // formData에서 값 추출
    const { userPw, userPw2, userPhone, userId, userName, userGender } =
      formData;

    // 중복 확인 여부 먼저 체크
    if (!isIdAvailable) {
      alert("아이디 중복 확인을 해주세요.");
      return;
    }

    if (!userPw.trim()) {
      alert("비밀번호를 입력하세요.");
      return;
    }

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
      termAgreement: true,
    };

    //http://localhost:8080
    try {
      const response = await fetch("/api/v1/auth/signup", {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify(submitData),
      });

        if (userId.trim().length === 0) {
            alert("아이디를 입력해주세요.");
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
        // 2. 서버에 GET 요청 보내기 http://localhost:8080
        
        const response = await fetch(`/api/v1/check-id?userId=${userId}`);

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
      alert("네트워크 오류가 발생했습니다.");
    }
  };

    function clickSend(){
            if(!isIdAvailable){
                alert("먼저 아이디 중복 확인을 하세요.");
                return;
            }
            setIsTimeActive(true);
            setTimeLeft(180);
    }

    // 6. 가입하기 버튼 (유효성 검사 및 서버 전송)
    const signupButton = async (e) => {
        e.preventDefault();
        // formData에서 값 추출
        const { userPw, userPw2, userPhone, userId, userName, userGender, userBirth } = formData;

        // 중복 확인 여부 먼저 체크
        if (!isIdAvailable) {
        alert("아이디 중복 확인을 해주세요.");
        return;
        }

        if (!userPw.trim()) {
            alert("비밀번호를 입력하세요.");
            return; }
            
        const pwRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
        if (!pwRegex.test(userPw)) {
            alert("비밀번호는 8자 이상, 영문, 숫자, 특수문자를 포함해야 합니다.");
            return; }

        if (userPw !== userPw2) {
            alert("비밀번호가 일치하지 않습니다.");
            return; }

        const phoneRegex = /^010\d{7,8}$/;
        if (!phoneRegex.test(userPhone)) {
            alert("올바른 휴대폰 번호를 입력해주세요.");
            return; }

        if (!(agreements.termsAgreed && agreements.locationAgreed)) {
            alert("필수 약관에 모두 동의하셔야 가입이 가능합니다.");
            return; }

        // 서버 전송 로직
        const submitData = {
            userId: userId,
            userPw: userPw,
            userName: userName,
            userPhone: userPhone,
            userGender: userGender,
            termAgreement: true,
            userBirth: userBirth };

            //http://localhost:8080
        try {
            const response = await fetch("/api/v1/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(submitData),
            });

            if (response.ok) {
                alert("회원가입이 완료되었습니다!");
                navigate("/user/login");
            } else {
                alert("가입 실패");
            }
        } catch (error) {
            alert("네트워크 오류가 발생했습니다."); }};

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
            <div className="signup-distinctDiv">
              <button type="button" className="signup-distinct">
                중복 확인
              </button>
            </div>
            <div className="signup-line1"></div>
          </div>

          <div className="signup-pwLine">
            <input
              type="password"
              className="signup-input"
              name="userPw"
              placeholder="비밀번호"
              value={formData.userPw}
              onChange={handleChange}
            />
            <div className="signup-line1"></div>
          </div>

          <input
            type="password"
            className="signup-input"
            name="userPw2"
            placeholder="비밀번호 확인"
            value={formData.userPw2}
            onChange={handleChange}
          />
          <div className="signup-line1"></div>

          <div className="signup-nameLine">
            <input
              className="signup-input"
              name="userName"
              placeholder="이름"
              value={formData.userName}
              onChange={handleChange}
            />
            <div className="signup-line1"></div>
          </div>

          <div className="signup-phoneLine">
            <input
              className="signup-input"
              name="userPhone"
              placeholder="휴대폰번호"
              value={formData.userPhone}
              onChange={handleChange}
            />
            <div className="signup-line1"></div>
          </div>

          <div>
            <input
              className="signup-input"
              name="userBirth"
              placeholder="생년월일"
              value={formData.userBirth}
              onChange={handleChange}
            />
            <div className="signup-line1"></div>
          </div>

          <div>
            <input
              type="email"
              className="signup-input"
              name="userEmail"
              placeholder="이메일 주소"
              value={formData.userEmail}
              onChange={handleChange}
            />
            <div className="signup-line1"></div>
          </div>

          <div>
            <input
              className="signup-input"
              name="userAddr"
              placeholder="주소"
              value={formData.userAddr}
              onChange={handleChange}
            />
            <div className="signup-line1"></div>
          </div>

          <div className="signup-gender">성별</div>
          <div className="signup-checkbox">
            <input
              type="radio"
              name="userGender"
              checked={formData.userGender === "male"}
              onChange={() =>
                setFormData({ ...formData, userGender: "male" })
              }
            />
            <label>남성</label>

            <input
              type="radio"
              name="userGender"
              checked={formData.userGender === "female"}
              onChange={() =>
                setFormData({ ...formData, userGender: "female" })
              }
            />
            <label>여성</label>
          </div>

          <div className="signup-term">
            <input
              type="checkbox"
              checked={agreements.termsAgreed}
              onChange={(e) =>
                setAgreements({
                  ...agreements,
                  termsAgreed: e.target.checked,
                })
              }
            />
            <span>약관1 (필수)</span>
            <br />
            <input
              type="checkbox"
              checked={agreements.locationAgreed}
              onChange={(e) =>
                setAgreements({
                  ...agreements,
                  locationAgreed: e.target.checked,
                })
              }
            />
            <span>약관2 (필수)</span>
          </div>

          <button type="submit" className="signup-btn">
            가입하기
          </button>

        </form>

        <div className="signup-social">
          <a className="signup-kakao"></a>
          <a className="signup-naver"></a>
          <a className="signup-google"></a>
        </div>

      </div>
    </div>
  );
}

export default UserSignup;