import "../../assets/styles/UserSignup.css";
import "../../assets/images/kakao.png";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../AuthContext";

function UserSignup() {
  const [formData, setFormData] = useState({
    userId: "",
    userPw: "",
    userPw2: "",
    userName: "",
    userAddr: "",
    userEmail: "",
    userPhone: "",
    userBirth: "",
    userGender: "",
  });

  const [agreements, setAgreements] = useState({
    termsAgreed: false,
    locationAgreed: false,
  });

  const [userAlert, setUserAlert] = useState({ alertOk: 1 });
  const [isIdAvailable, setIsIdAvailable] = useState(null);
  const [pwMatch, setPwMatch] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { getMeAndSetUser } = useAuth(); 

  /* ── 입력값 변경 ── */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "userId") setIsIdAvailable(null);

    if (name === "userPw" || name === "userPw2") {
      const pw = name === "userPw" ? value : formData.userPw;
      const pw2 = name === "userPw2" ? value : formData.userPw2;
      if (pw && pw2) setPwMatch(pw === pw2);
      else setPwMatch(null);
    }
  };

  /* ── 아이디 중복 확인 ── */
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
      const response = await fetch(`http://3.38.49.151:8080/api/v1/check-id?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.isDuplicate) {
          alert("이미 사용중인 아이디입니다.");
          setIsIdAvailable(false);
        } else {
          setIsIdAvailable(true);
        }
      }
    } catch {
      alert("서버 통신 오류가 발생했습니다.");
    }
  };

  /* ── STEP 1 → 2 이동 ── */
  const goToStep2 = () => {
    const { userPw, userPw2 } = formData;
    if (!isIdAvailable) {
      alert("아이디 중복 확인을 해주세요.");
      return;
    }

    const pwRegex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    if (!pwRegex.test(userPw)) {
      alert("비밀번호는 8자 이상, 영문·숫자·특수문자를 포함해야 합니다.");
      return;
    }
    if (userPw !== userPw2) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ── 회원가입 제출 ── */
  const signupSubmit = async (e) => {
    e.preventDefault();
    const { userPhone, userName, userGender, userBirth, userAddr, userEmail } =
      formData;

    if (!userName.trim()) {
      alert("이름을 입력해주세요.");
      return;
    }
    const phoneRegex = /^010\d{7,8}$/;
    if (!phoneRegex.test(userPhone)) {
      alert("올바른 휴대폰 번호를 입력해주세요. (예: 01012345678)");
      return;
    }
    if (!userBirth) {
      alert("생년월일을 입력해주세요.");
      return;
    }
    if (!userEmail.trim()) {
      alert("이메일을 입력해주세요.");
      return;
    }
    if (!userGender) {
      alert("성별을 선택해주세요.");
      return;
    }
    if (!userAddr.trim()) {
      alert("주소를 입력해주세요.");
      return;
    }
    if (!(agreements.termsAgreed && agreements.locationAgreed)) {
      alert("필수 약관에 동의해야 합니다.");
      return;
    }

    setIsLoading(true);
    const submitData = {
      ...formData,
      termAgreement: true,
      userAlert: userAlert.alertOk,
    };

    try {
      const response = await fetch("http://3.38.49.151:8080/api/v1/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });
      // ✅ 변경 후
      if (response.ok) {
        const data = await response.json();

        if (data.accessToken) {
          // ✅ 자동 로그인 성공 → 메인으로
          localStorage.setItem("accessToken", data.accessToken);
          await getMeAndSetUser();
          alert("🎉 회원가입을 환영합니다!");
          navigate("/");
        } else {
          // ⚠️ 자동 로그인 실패했지만 회원가입은 됨 → 로그인 페이지로
          alert("회원가입이 완료되었습니다! 로그인해 주세요.");
          navigate("/user/login");
        }
      } else {
        alert("회원가입에 실패했습니다. 다시 시도해주세요.");
      }
    } catch {
      alert("네트워크 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  /* ── 카카오 회원가입 ── */
  const handleKakaoSignup = () => {
    const REST_API_KEY = "8b93cc51be9307b47fbf3b5d6883de0d";
    const REDIRECT_URI = "http://localhost:3000/kakao/signup/callback";
    window.location.href = `https://kauth.kakao.com/oauth/authorize?client_id=${REST_API_KEY}&redirect_uri=${REDIRECT_URI}&response_type=code`;
  };

  return (
    <div className="su-page">
      <div className="su-blob su-blob-1" />
      <div className="su-blob su-blob-2" />

      <div className="su-wrapper">
        {/* ── 스텝 인디케이터 ── */}
        <div className="su-step-indicator">
          <div
            className={`su-step-item ${currentStep >= 1 ? "active" : ""} ${currentStep > 1 ? "done" : ""}`}
          >
            <div className="su-step-circle">
              {currentStep > 1 ? <i className="fas fa-check" /> : "1"}
            </div>
            <span>계정 정보</span>
          </div>
          <div className={`su-step-line ${currentStep > 1 ? "done" : ""}`} />
          <div className={`su-step-item ${currentStep >= 2 ? "active" : ""}`}>
            <div className="su-step-circle">2</div>
            <span>개인 정보</span>
          </div>
        </div>

        {/* ── 메인 카드 ── */}
        <div className="su-card">
          <div className="su-card-header">
            <h1 className="su-card-title">
              {currentStep === 1 ? "계정 정보 입력" : "개인 정보 입력"}
            </h1>
            <p className="su-card-subtitle">
              {currentStep === 1
                ? "로그인에 사용할 아이디와 비밀번호를 설정해주세요"
                : "서비스 이용에 필요한 개인 정보를 입력해주세요"}
            </p>
          </div>

          <form className="su-form" onSubmit={signupSubmit}>
            {/* ════════ STEP 1 ════════ */}
            {currentStep === 1 && (
              <div className="su-step-body">
                {/* 아이디 */}
                <div className="su-field">
                  <label className="su-label">
                    <i className="fas fa-user" /> 아이디
                    <span className="su-required">*</span>
                  </label>
                  <div className="su-input-row">
                    <div
                      className={`su-input-wrap ${
                        isIdAvailable === true
                          ? "valid"
                          : isIdAvailable === false
                            ? "invalid"
                            : ""
                      }`}
                    >
                      <input
                        name="userId"
                        placeholder="영문 소문자 + 숫자, 5~10자"
                        value={formData.userId}
                        onChange={handleChange}
                        autoComplete="username"
                      />
                    </div>
                    <button
                      type="button"
                      className={`su-check-btn ${isIdAvailable === true ? "checked" : ""}`}
                      onClick={distinctId}
                    >
                      {isIdAvailable === true ? (
                        <>
                          <i className="fas fa-check" /> 확인완료
                        </>
                      ) : (
                        "중복확인"
                      )}
                    </button>
                  </div>
                  {isIdAvailable === true && (
                    <span className="su-hint valid">
                      <i className="fas fa-circle-check" /> 사용 가능한
                      아이디입니다.
                    </span>
                  )}
                  {isIdAvailable === false && (
                    <span className="su-hint invalid">
                      <i className="fas fa-circle-xmark" /> 이미 사용중인
                      아이디입니다.
                    </span>
                  )}
                </div>

                {/* 비밀번호 */}
                <div className="su-field">
                  <label className="su-label">
                    <i className="fas fa-lock" /> 비밀번호
                    <span className="su-required">*</span>
                  </label>
                  <div className="su-input-wrap">
                    <input
                      type="password"
                      name="userPw"
                      placeholder="8자 이상, 영문·숫자·특수문자 포함"
                      value={formData.userPw}
                      onChange={handleChange}
                      autoComplete="new-password"
                    />
                  </div>
                  <div className="su-pw-strength">
                    <PwStrengthBar pw={formData.userPw} />
                  </div>
                </div>

                {/* 비밀번호 확인 */}
                <div className="su-field">
                  <label className="su-label">
                    <i className="fas fa-lock" /> 비밀번호 확인
                    <span className="su-required">*</span>
                  </label>
                  <div
                    className={`su-input-wrap ${
                      pwMatch === true
                        ? "valid"
                        : pwMatch === false
                          ? "invalid"
                          : ""
                    }`}
                  >
                    <input
                      type="password"
                      name="userPw2"
                      placeholder="비밀번호를 다시 입력해주세요"
                      value={formData.userPw2}
                      onChange={handleChange}
                      autoComplete="new-password"
                    />
                    {pwMatch === true && (
                      <i className="fas fa-check su-input-icon valid" />
                    )}
                    {pwMatch === false && (
                      <i className="fas fa-xmark su-input-icon invalid" />
                    )}
                  </div>
                  {pwMatch === false && (
                    <span className="su-hint invalid">
                      <i className="fas fa-circle-xmark" /> 비밀번호가 일치하지
                      않습니다.
                    </span>
                  )}
                  {pwMatch === true && (
                    <span className="su-hint valid">
                      <i className="fas fa-circle-check" /> 비밀번호가
                      일치합니다.
                    </span>
                  )}
                </div>

                {/* 다음 단계 버튼 */}
                <button
                  type="button"
                  className="su-next-btn"
                  onClick={goToStep2}
                >
                  다음 단계 <i className="fas fa-arrow-right" />
                </button>

                {/* ✅ 카카오 버튼: step1 안으로 이동, <br> 제거 */}
                {/* ── 카카오 회원가입 버튼 ── */}
                <div className="su-divider">
                  <span>또는 소셜 계정으로 가입</span>
                </div>
                <button
                  type="button"
                  className="su-kakao-btn"
                  onClick={handleKakaoSignup}
                >
                  <img
                    src="/kakao_icon.png"
                    alt=""
                    className="su-kakao-icon"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      /* 이미지 없을 때 옆 텍스트로 처리 */
                    }}
                  />
                  {/* 이미지 없을 때를 대비한 이모지 폴백 */}
                  <span style={{ fontSize: "1.15rem", lineHeight: 1 }}>💬</span>
                  카카오로 시작하기
                </button>
              </div>
            )}

            <br />

            {/* <div className="circle" onClick={handleKakaoSignup}>
              <img src="" />
            </div> */}

            {/* ════════ STEP 2 ════════ */}
            {currentStep === 2 && (
              <div className="su-step-body">
                {/* 이름 */}
                <div className="su-field">
                  <label className="su-label">
                    <i className="fas fa-id-card" /> 이름
                    <span className="su-required">*</span>
                  </label>
                  <div className="su-input-wrap">
                    <input
                      name="userName"
                      placeholder="실명을 입력해주세요"
                      value={formData.userName}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* 휴대폰 + 생년월일 가로배치 */}
                <div className="su-field-row">
                  <div className="su-field">
                    <label className="su-label">
                      <i className="fas fa-phone" /> 휴대폰번호
                      <span className="su-required">*</span>
                    </label>
                    <div className="su-input-wrap">
                      <input
                        name="userPhone"
                        placeholder="01012345678"
                        value={formData.userPhone}
                        onChange={handleChange}
                        maxLength={11}
                        inputMode="numeric"
                      />
                    </div>
                  </div>

                  <div className="su-field">
                    <label className="su-label">
                      <i className="fas fa-cake-candles" /> 생년월일
                      <span className="su-required">*</span>
                    </label>
                    <div className="su-input-wrap">
                      <input
                        type="date"
                        name="userBirth"
                        value={formData.userBirth}
                        onChange={handleChange}
                        max={new Date().toISOString().split("T")[0]}
                      />
                    </div>
                  </div>
                </div>

                {/* 이메일 */}
                <div className="su-field">
                  <label className="su-label">
                    <i className="fas fa-envelope" /> 이메일
                    <span className="su-required">*</span>
                  </label>
                  <div className="su-input-wrap">
                    <input
                      type="email"
                      name="userEmail"
                      placeholder="example@email.com"
                      value={formData.userEmail}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* 성별 */}
                <div className="su-field">
                  <label className="su-label">
                    <i className="fas fa-venus-mars" /> 성별
                    <span className="su-required">*</span>
                  </label>
                  <div className="su-gender-group">
                    <label
                      className={`su-gender-btn ${formData.userGender === "male" ? "selected" : ""}`}
                    >
                      <input
                        type="radio"
                        name="userGender"
                        value="male"
                        onChange={handleChange}
                        hidden
                      />
                      <i className="fas fa-mars" /> 남성
                    </label>
                    <label
                      className={`su-gender-btn ${formData.userGender === "female" ? "selected" : ""}`}
                    >
                      <input
                        type="radio"
                        name="userGender"
                        value="female"
                        onChange={handleChange}
                        hidden
                      />
                      <i className="fas fa-venus" /> 여성
                    </label>
                  </div>
                </div>

                {/* 주소 */}
                <div className="su-field">
                  <label className="su-label">
                    <i className="fas fa-location-dot" /> 주소
                    <span className="su-required">*</span>
                  </label>
                  <div className="su-input-wrap">
                    <input
                      name="userAddr"
                      placeholder="거주 주소를 입력해주세요"
                      value={formData.userAddr}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* 알림 허용 */}
                <div className="su-field">
                  <label className="su-label">
                    <i className="fas fa-bell" /> 알림 허용
                    <span className="su-required">*</span>
                  </label>
                  <div className="su-gender-group">
                    <label
                      className={`su-gender-btn ${userAlert.alertOk === 1 ? "selected" : ""}`}
                    >
                      <input
                        type="radio"
                        name="userAlert"
                        checked={userAlert.alertOk === 1}
                        onChange={() =>
                          setUserAlert({ ...userAlert, alertOk: 1 })
                        }
                        hidden
                      />
                      <i className="fas fa-bell" /> 허용
                    </label>
                    <label
                      className={`su-gender-btn ${userAlert.alertOk === 0 ? "selected" : ""}`}
                    >
                      <input
                        type="radio"
                        name="userAlert"
                        checked={userAlert.alertOk === 0}
                        onChange={() =>
                          setUserAlert({ ...userAlert, alertOk: 0 })
                        }
                        hidden
                      />
                      <i className="fas fa-bell-slash" /> 비허용
                    </label>
                  </div>
                </div>

                {/* 약관 동의 */}
                <div className="su-terms">
                  <div className="su-terms-title">
                    <i className="fas fa-file-contract" /> 약관 동의
                  </div>
                  <label
                    className={`su-term-row all ${
                      agreements.termsAgreed && agreements.locationAgreed
                        ? "checked"
                        : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={
                        agreements.termsAgreed && agreements.locationAgreed
                      }
                      onChange={(e) =>
                        setAgreements({
                          termsAgreed: e.target.checked,
                          locationAgreed: e.target.checked,
                        })
                      }
                      hidden
                    />
                    <div className="su-term-check">
                      <i className="fas fa-check" />
                    </div>
                    <span>
                      <strong>전체 동의하기</strong>
                    </span>
                  </label>
                  <label
                    className={`su-term-row ${agreements.termsAgreed ? "checked" : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={agreements.termsAgreed}
                      onChange={(e) =>
                        setAgreements({
                          ...agreements,
                          termsAgreed: e.target.checked,
                        })
                      }
                      hidden
                    />
                    <div className="su-term-check">
                      <i className="fas fa-check" />
                    </div>
                    <span>
                      <strong>[필수]</strong> 서비스 이용약관 동의
                    </span>
                    <button type="button" className="su-term-view">
                      보기
                    </button>
                  </label>
                  <label
                    className={`su-term-row ${agreements.locationAgreed ? "checked" : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={agreements.locationAgreed}
                      onChange={(e) =>
                        setAgreements({
                          ...agreements,
                          locationAgreed: e.target.checked,
                        })
                      }
                      hidden
                    />
                    <div className="su-term-check">
                      <i className="fas fa-check" />
                    </div>
                    <span>
                      <strong>[필수]</strong> 위치정보 서비스 이용약관 동의
                    </span>
                    <button type="button" className="su-term-view">
                      보기
                    </button>
                  </label>
                </div>

                {/* 버튼 행 */}
                <div className="su-btn-row">
                  <button
                    type="button"
                    className="su-back-btn"
                    onClick={() => setCurrentStep(1)}
                  >
                    <i className="fas fa-arrow-left" /> 이전
                  </button>
                  <button
                    type="submit"
                    className="su-submit-btn"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <i className="fas fa-spinner fa-spin" /> 처리중...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-user-plus" /> 가입하기
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>

          {/* ── 로그인 링크 ── */}
          <div className="su-footer">
            <span>이미 계정이 있으신가요?</span>
            <Link to="/user/login" className="su-login-link">
              로그인하기 <i className="fas fa-arrow-right" />
            </Link>
          </div>
        </div>
        {/* ✅ su-card 닫힘 */}

        {/* ✅ 카드 밖으로 이동: 병원 관리자 가입 CTA */}
        <div className="su-admin-cta">
          <span>병원 관리자로 가입하시나요?</span>
          <Link to="/admin/signup" className="su-admin-link">
            병원 관리자 회원가입 <i className="fas fa-arrow-right" />
          </Link>
        </div>
      </div>
      {/* su-wrapper 닫힘 */}
    </div>
  );
}

/* =====================================================================
   AdminPwStrengthBar
   비밀번호 강도 표시 바 서브 컴포넌트
   UserSignup.js의 PwStrengthBar와 동일한 로직, 색상만 병원 테마
===================================================================== */
function PwStrengthBar({ pw }) {
  const getStrength = (pw) => {
    if (!pw) return { level: 0, label: "", color: "" };
    let score = 0;
    if (pw.length >= 8) score++; // 길이 조건
    if (/[A-Za-z]/.test(pw)) score++; // 영문 포함
    if (/\d/.test(pw)) score++; // 숫자 포함
    if (/[!@#$%^&*]/.test(pw)) score++; // 특수문자 포함

    if (score <= 1) return { level: 1, label: "매우 약함", color: "#ef4444" };
    if (score === 2) return { level: 2, label: "약함", color: "#f97316" };
    if (score === 3) return { level: 3, label: "보통", color: "#eab308" };
    return { level: 4, label: "강함", color: "#0d9488" }; // 병원 테마 색
  };

  const { level, label, color } = getStrength(pw);
  if (!pw) return null;

  return (
    <div className="as-pw-strength-wrap">
      <div className="as-pw-bars">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="as-pw-bar"
            style={{ background: i <= level ? color : "#e2e8f0" }}
          />
        ))}
      </div>
      <span className="as-pw-label" style={{ color }}>
        {label}
      </span>
    </div>
  );
}

export default UserSignup;
