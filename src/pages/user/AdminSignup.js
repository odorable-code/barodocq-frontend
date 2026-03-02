import "../../assets/styles/AdminSignup.css";
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function AdminSignup() {
  const navigate = useNavigate();

  // ── 폼 입력값 상태 ──────────────────────────────────────────────
  const [formData, setFormData] = useState({
    businessNum: "",    // 사업자등록번호 (숫자 10자)
    adminId: "",        // 관리자 아이디
    adminPw: "",        // 비밀번호
    adminPw2: "",       // 비밀번호 확인
    adminName: "",      // 담당자명
    adminPhone: "",     // 병원 연락처
    adminEmail: "",     // 병원 이메일
    adminAddr: "",      // 병원 주소
    hoName: ""          // 병원 이름
  });

  // ── UI 상태 ──────────────────────────────────────────────────────
  const [agreements, setAgreements] = useState({
    termsAgreed: false,
    locationAgreed: false,
  });
  const [isIdAvailable, setIsIdAvailable]   = useState(null);  // null | true | false
  const [isEmailAvailable, setIsEmailAvailable]   = useState(null);
  const [isHoNameAvailable, setIsHoNameAvailable]   = useState(null);
  const [isBusinessNumAvailable, setBusinessNumIdAvailable]   = useState(null);
  const [pwMatch, setPwMatch]               = useState(null);  // null | true | false
  const [showPw, setShowPw]                 = useState(false); // 비밀번호 보기 토글
  const [showPw2, setShowPw2]               = useState(false); // 비밀번호 확인 보기 토글
  const [currentStep, setCurrentStep]       = useState(1);     // 1 | 2
  const [isLoading, setIsLoading]           = useState(false); // 제출 로딩 상태

  // ── 입력값 변경 핸들러 ────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;

    // 사업자등록번호: 숫자만 입력, 10자 초과 방지
    if (name === "businessNum") {
      const onlyNum = value.replace(/[^0-9]/g, "");
      if (onlyNum.length > 10) return; // 10자 초과 입력 차단
      setFormData((prev) => ({ ...prev, [name]: onlyNum }));
      return;
    }

    // 아이디 수정 시 중복확인 초기화
    if (name === "adminId") setIsIdAvailable(null);

    // 비밀번호 일치 여부 실시간 체크
    if (name === "adminPw" || name === "adminPw2") {
      const pw  = name === "adminPw"  ? value : formData.adminPw;
      const pw2 = name === "adminPw2" ? value : formData.adminPw2;
      if (pw && pw2) setPwMatch(pw === pw2);
      else setPwMatch(null);
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ── UNIQUE 값 검사 ───────────────────────────────────────────────
  // ㅡㅡ아이디 중복 확인

  
  const distinctAdminId = async () => {
    const { adminId } = formData;
    if (!adminId.trim()) { alert("아이디를 입력해주세요."); return; }

    const onlyAlphaNum = /^[a-z0-9]+$/;
    if (!onlyAlphaNum.test(adminId)) {
      alert("아이디는 영문 소문자와 숫자만 포함해야 합니다.");
      return;
    }
    if (adminId.length < 5 || adminId.length > 10) {
      alert("아이디는 5~10자 사이여야 합니다.");
      return;
    }

    try {
      const response = await fetch(`/api/v1/check-AdminId?adminId=${adminId}`);
      if (response.ok) {
        const data = await response.json();
        
        if (data.isDuplicate) {
          alert("이미 사용중인 아이디입니다.");
          setIsIdAvailable(false);
        } else {
          setIsIdAvailable(true);
        }
      } else {
        alert("서버 응답 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error(error);
      alert("서버 통신 오류가 발생했습니다.");
    }
  };

  // ㅡㅡ이메일 중복 확인
  const distinctEmail = async () => {
  const { adminEmail } = formData;

  if (!adminEmail.trim()) {
    alert("이메일을 입력해주세요.");
    return;
  }

  try {
    const response = await fetch(
      `/api/v1/check-email?adminEmail=${adminEmail}`
    );

    // 서버 응답 자체가 실패했을 때
    if (!response.ok) {
      alert("서버 응답 오류가 발생했습니다.");
      return;
    }

    const data = await response.json();

    // 중복 여부 체크
    if (data.isDuplicate) {
      alert("이미 사용중인 이메일입니다.");
      setIsEmailAvailable(false);
      return true;
    } else {
      alert("사용 가능한 이메일입니다.");
      setIsEmailAvailable(true);
      return false;
    }

  } catch (error) {
    console.error(error);
    alert("서버 통신 오류가 발생했습니다.");
  }
};

  // ㅡㅡ사업자번호 중복 확인

const distinctBusinessNum = async () => {
    const { businessNum } = formData;
    //if (!businessNum.trim()) { alert("사업자번호를 입력해주세요."); return; }

    try {
      const response = await fetch(`/api/v1/check-businessNum?businessNum=${businessNum}`);
      if (response.ok) {
        const data = await response.json();
        if (data.isDuplicate) {
          alert("이미 사용중인 사업자번호입니다.");
          setIsIdAvailable(false);
        } else {
          setIsIdAvailable(true);
        }
      } else {
        alert("서버 응답 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error(error);
      alert("서버 통신 오류가 발생했습니다.");
    }
  };

  // ㅡㅡ병원이름 중복 확인

  const distinctHoName = async () => {
    const { hoName } = formData;
    //if (!hoName.trim()) { alert("병원이름을 입력해주세요."); return; }

    try {
      const response = await fetch(`/api/v1/check-hoNum?hoName=${hoName}`);
      if (response.ok) {
        const data = await response.json();
        if (data.isDuplicate) {
          alert("이미 사용중인 병원이름입니다.");
          setIsIdAvailable(false);
        } else {
          setIsIdAvailable(true);
        }
      } else {
        alert("서버 응답 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error(error);
      alert("서버 통신 오류가 발생했습니다.");
    }
  };

  // ── STEP 1 → STEP 2 이동 유효성 검사 ────────────────────────────
  const goToStep2 = () => {
    const { adminId, adminPw, adminPw2 } = formData;

    if (!isIdAvailable) { alert("아이디 중복 확인을 해주세요."); return; }

    const pwRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    if (!pwRegex.test(adminPw)) {
      alert("비밀번호는 8자 이상, 영문·숫자·특수문자를 포함해야 합니다.");
      return;
    }
    if (adminPw !== adminPw2) { alert("비밀번호가 일치하지 않습니다."); return; }

    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── 최종 제출 ─────────────────────────────────────────────────────
  // /api/v1/auth/signup 으로 POST 요청 (UserSignup과 동일한 엔드포인트)
  const signupButton = async (e) => {
    e.preventDefault();
    const { adminPhone, adminName, adminAddr, adminEmail, hoName, businessNum } = formData;

    // 필수 항목 검사
    if (!adminName.trim())      { alert("담당자명을 입력해주세요."); return; }
    if (!hoName.trim())         { alert("병원명을 입력해주세요."); return; }
    if (businessNum.length !== 10) { alert("사업자등록번호는 10자리 숫자여야 합니다."); return; }
    if (!adminEmail.trim())     { alert("병원 이메일을 입력해주세요."); return; }
    if (!adminAddr.trim())      { alert("병원 주소를 입력해주세요."); return; }

    const phoneRegex = /^010\d{7,8}$/;
    if (!phoneRegex.test(adminPhone)) {
      alert("올바른 휴대폰 번호를 입력해주세요. (예: 01012345678)");
      return;
    }

    // 약관 동의 체크
    if (!(agreements.termsAgreed && agreements.locationAgreed)) {
      alert("필수 약관에 모두 동의하셔야 합니다.");
      return;
    }

    if (await distinctAdminId()) return;
    if (await distinctEmail()) return;
    if (await distinctBusinessNum()) return;
    if (await distinctHoName()) return;

    //alert("회원가입 진행!");
  
    
    setIsLoading(true);
    const submitData = { ...formData, termAgreement: true };
    console.log(submitData);
    try {
      const response = await fetch("/api/v1/auth/admin/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        alert("회원가입이 완료되었습니다! 로그인해 주세요.");
        navigate("/user/login");
      } else {
        alert("회원가입에 실패했습니다. 다시 시도해주세요.");
      }
    } catch (error) {
      alert("네트워크 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // ── 렌더링 ────────────────────────────────────────────────────────
  return (
    // as-page: AdminSignup 전용 페이지 래퍼
    <div className="as-page">

      {/* 배경 블롭 (Login / UserSignup과 동일한 구조) */}
      <div className="as-blob as-blob-1" />
      <div className="as-blob as-blob-2" />

      <div className="as-wrapper">

        {/* ── 스텝 인디케이터 (UserSignup과 동일한 구조) ────── */}
        <div className="as-step-indicator">
          {/* STEP 1: 계정 정보 */}
          <div className={`as-step-item ${currentStep >= 1 ? "active" : ""} ${currentStep > 1 ? "done" : ""}`}>
            <div className="as-step-circle">
              {currentStep > 1 ? <i className="fas fa-check" /> : "1"}
            </div>
            <span>계정 정보</span>
          </div>

          {/* 스텝 연결선 */}
          <div className={`as-step-line ${currentStep > 1 ? "done" : ""}`} />

          {/* STEP 2: 병원 정보 */}
          <div className={`as-step-item ${currentStep >= 2 ? "active" : ""}`}>
            <div className="as-step-circle">2</div>
            <span>병원 정보</span>
          </div>
        </div>

        {/* ── 메인 카드 ──────────────────────────────────────── */}
        <div className="as-card">

          {/* 카드 헤더 */}
          <div className="as-card-header">
            <h1 className="as-card-title">
              {currentStep === 1 ? "계정 정보 입력" : "병원 사업자 정보"}
            </h1>
            <p className="as-card-subtitle">
              {currentStep === 1
                ? "로그인에 사용할 아이디와 비밀번호를 설정해주세요"
                : "병원 등록에 필요한 사업자 정보를 입력해주세요"}
            </p>
          </div>

          <form className="as-form" onSubmit={signupButton}
          >

            {/* ════════ STEP 1: 계정 정보 ════════ */}
            {currentStep === 1 && (
              <div className="as-step-body">

                {/* 담당자명 */}
                <div className="as-field">
                  <label className="as-label">
                    <i className="fas fa-id-badge" />
                    담당자명
                    <span className="as-required">*</span>
                  </label>
                  <div className="as-input-wrap">
                    <input
                      name="adminName"
                      placeholder="담당자 실명을 입력해주세요"
                      value={formData.adminName}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* 아이디 + 중복확인 버튼 */}
                <div className="as-field">
                  <label className="as-label">
                    <i className="fas fa-user" />
                    아이디
                    <span className="as-required">*</span>
                  </label>
                  <div className="as-input-row">
                    {/* 아이디 입력창: 중복확인 결과에 따라 테두리 색상 변경 */}
                    <div className={`as-input-wrap ${
                      isIdAvailable === true  ? "valid"   :
                      isIdAvailable === false ? "invalid" : ""
                    }`}>
                      <input
                        name="adminId"
                        placeholder="영문 소문자 + 숫자, 5~10자"
                        value={formData.adminId}
                        onChange={handleChange}
                        autoComplete="username"
                      />
                    </div>
                    {/* 중복확인 버튼 */}
                    <button
                      type="button"
                      className={`as-check-btn ${isIdAvailable === true ? "checked" : ""}`}
                      onClick={distinctAdminId}
                    >
                      {isIdAvailable === true
                        ? <><i className="fas fa-check" />확인완료</>
                        : "중복확인"}
                    </button>
                  </div>
                  {/* 중복확인 결과 힌트 메시지 */}
                  {isIdAvailable === true && (
                    <span className="as-hint valid">
                      <i className="fas fa-circle-check" />사용 가능한 아이디입니다.
                    </span>
                  )}
                  {isIdAvailable === false && (
                    <span className="as-hint invalid">
                      <i className="fas fa-circle-xmark" />이미 사용중인 아이디입니다.
                    </span>
                  )}
                </div>

                {/* 비밀번호 */}
                <div className="as-field">
                  <label className="as-label">
                    <i className="fas fa-lock" />
                    비밀번호
                    <span className="as-required">*</span>
                  </label>
                  <div className="as-input-wrap">
                    <input
                      type={showPw ? "text" : "password"}
                      name="adminPw"
                      placeholder="8자 이상, 영문·숫자·특수문자 포함"
                      value={formData.adminPw}
                      onChange={handleChange}
                      autoComplete="new-password"
                    />
                    {/* 비밀번호 보기/숨기기 */}
                    <button
                      type="button"
                      className="as-pw-toggle"
                      onClick={() => setShowPw(!showPw)}
                    >
                      <i className={`fas ${showPw ? "fa-eye-slash" : "fa-eye"}`} />
                    </button>
                  </div>
                  {/* 비밀번호 강도 바 (UserSignup의 PwStrengthBar와 동일) */}
                  <div className="as-pw-strength">
                    <AdminPwStrengthBar pw={formData.adminPw} />
                  </div>
                </div>

                {/* 비밀번호 확인 */}
                <div className="as-field">
                  <label className="as-label">
                    <i className="fas fa-lock" />
                    비밀번호 확인
                    <span className="as-required">*</span>
                  </label>
                  <div className={`as-input-wrap ${
                    pwMatch === true  ? "valid"   :
                    pwMatch === false ? "invalid" : ""
                  }`}>
                    <input
                      type={showPw2 ? "text" : "password"}
                      name="adminPw2"
                      placeholder="비밀번호를 다시 입력해주세요"
                      value={formData.adminPw2}
                      onChange={handleChange}
                      autoComplete="new-password"
                    />
                    {/* 일치 여부 아이콘 */}
                    {pwMatch === true  && <i className="fas fa-check as-input-icon valid" />}
                    {pwMatch === false && <i className="fas fa-xmark as-input-icon invalid" />}
                    {/* 보기 토글 */}
                    <button
                      type="button"
                      className="as-pw-toggle"
                      onClick={() => setShowPw2(!showPw2)}
                    >
                      <i className={`fas ${showPw2 ? "fa-eye-slash" : "fa-eye"}`} />
                    </button>
                  </div>
                  {pwMatch === false && (
                    <span className="as-hint invalid">
                      <i className="fas fa-circle-xmark" />비밀번호가 일치하지 않습니다.
                    </span>
                  )}
                  {pwMatch === true && (
                    <span className="as-hint valid">
                      <i className="fas fa-circle-check" />비밀번호가 일치합니다.
                    </span>
                  )}
                </div>

                {/* 다음 단계 버튼 */}
                <button type="button" className="as-next-btn" onClick={goToStep2}>
                  다음 단계 <i className="fas fa-arrow-right" />
                </button>
              </div>
            )}

            {/* ════════ STEP 2: 병원 사업자 정보 ════════ */}
            {currentStep === 2 && (
              <div className="as-step-body">

                {/* 병원명 + 사업자등록번호 가로 배치 */}
                <div className="as-field-row">

                  {/* 병원명 */}
                  <div className="as-field">
                    <label className="as-label">
                      <i className="fas fa-hospital" />
                      병원명
                      <span className="as-required">*</span>
                    </label>
                    <div className="as-input-wrap">
                      <input
                        name="hoName"
                        placeholder="병원명을 입력해주세요"
                        value={formData.hoName}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  {/* 사업자등록번호: 숫자만 입력, 10자 고정 */}
                  <div className="as-field">
                    <label className="as-label">
                      <i className="fas fa-file-invoice" />
                      사업자등록번호
                      <span className="as-required">*</span>
                    </label>
                    <div className="as-input-wrap">
                      <input
                        name="businessNum"
                        placeholder="숫자 10자리"
                        value={formData.businessNum}
                        onChange={handleChange}
                        maxLength={10}
                        inputMode="numeric" /* 모바일 숫자 키패드 */
                      />
                      {/* 10자리 완성 여부 표시 */}
                      <span className={`as-biz-count ${
                        formData.businessNum.length === 10 ? "done" : ""
                      }`}>
                        {formData.businessNum.length}/10
                      </span>
                    </div>
                    {formData.businessNum.length === 10 && (
                      <span className="as-hint valid">
                        <i className="fas fa-circle-check" />올바른 자릿수입니다.
                      </span>
                    )}
                  </div>
                </div>

                {/* 병원 이메일 */}
                <div className="as-field">
                  <label className="as-label">
                    <i className="fas fa-envelope" />
                    병원 이메일
                    <span className="as-required">*</span>
                  </label>
                  <div className="as-input-wrap">
                    <input
                      type="email"
                      name="adminEmail"
                      placeholder="hospital@example.com"
                      value={formData.adminEmail}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* 병원 연락처 */}
                <div className="as-field">
                  <label className="as-label">
                    <i className="fas fa-phone" />
                    병원 연락처
                    <span className="as-required">*</span>
                  </label>
                  <div className="as-input-wrap">
                    <input
                      name="adminPhone"
                      placeholder="01012345678"
                      value={formData.adminPhone}
                      onChange={handleChange}
                      maxLength={11}
                      inputMode="numeric"
                    />
                  </div>
                </div>

                {/* 병원 주소 */}
                <div className="as-field">
                  <label className="as-label">
                    <i className="fas fa-location-dot" />
                    병원 주소
                    <span className="as-required">*</span>
                  </label>
                  <div className="as-input-wrap">
                    <input
                      name="adminAddr"
                      placeholder="병원 주소를 입력해주세요"
                      value={formData.adminAddr}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* ── 약관 동의 영역 ── */}
                {/* UserSignup의 .su-terms와 동일한 커스텀 체크박스 구조 */}
                <div className="as-terms">
                  <div className="as-terms-title">
                    <i className="fas fa-file-contract" />
                    약관 동의
                  </div>

                  {/* 전체 동의 */}
                  <label className={`as-term-row all ${
                    agreements.termsAgreed && agreements.locationAgreed ? "checked" : ""
                  }`}>
                    <input
                      type="checkbox"
                      checked={agreements.termsAgreed && agreements.locationAgreed}
                      onChange={(e) =>
                        setAgreements({
                          termsAgreed: e.target.checked,
                          locationAgreed: e.target.checked,
                        })
                      }
                      hidden
                    />
                    <div className="as-term-check">
                      <i className="fas fa-check" />
                    </div>
                    <span><strong>전체 동의하기</strong></span>
                  </label>

                  {/* 서비스 이용약관 (필수) */}
                  <label className={`as-term-row ${agreements.termsAgreed ? "checked" : ""}`}>
                    <input
                      type="checkbox"
                      checked={agreements.termsAgreed}
                      onChange={(e) =>
                        setAgreements({ ...agreements, termsAgreed: e.target.checked })
                      }
                      hidden
                    />
                    <div className="as-term-check">
                      <i className="fas fa-check" />
                    </div>
                    <span><strong>[필수]</strong> 의료기관 서비스 이용약관 동의</span>
                    <button type="button" className="as-term-view">보기</button>
                  </label>

                  {/* 위치정보 이용약관 (필수) */}
                  <label className={`as-term-row ${agreements.locationAgreed ? "checked" : ""}`}>
                    <input
                      type="checkbox"
                      checked={agreements.locationAgreed}
                      onChange={(e) =>
                        setAgreements({ ...agreements, locationAgreed: e.target.checked })
                      }
                      hidden
                    />
                    <div className="as-term-check">
                      <i className="fas fa-check" />
                    </div>
                    <span><strong>[필수]</strong> 위치정보 서비스 이용약관 동의</span>
                    <button type="button" className="as-term-view">보기</button>
                  </label>
                </div>

                {/* ── 이전 / 가입하기 버튼 행 ── */}
                <div className="as-btn-row">
                  {/* 이전 단계로 */}
                  <button
                    type="button"
                    className="as-back-btn"
                    onClick={() => setCurrentStep(1)}
                  >
                    <i className="fas fa-arrow-left" />이전
                  </button>

                  {/* 최종 제출 */}
                  <button
                    type="submit"
                    className="as-submit-btn"
                    disabled={isLoading}
                  >
                    {isLoading
                      ? <><i className="fas fa-spinner fa-spin" />처리중...</>
                      : <><i className="fas fa-hospital-user" />병원 등록하기</>}
                  </button>
                </div>
              </div>
            )}
          </form>

          {/* ── 카드 하단: 로그인 링크 ── */}
          <div className="as-footer">
            <span>이미 계정이 있으신가요?</span>
            <Link to="/user/login" className="as-login-link">
              로그인하기 <i className="fas fa-arrow-right" />
            </Link>
          </div>
        </div>
        {/* // as-card */}

        {/* ── 일반 사용자 회원가입 안내 ── */}
        <div className="as-user-cta">
          <span>일반 사용자로 가입하시나요?</span>
          <Link to="/user/signup" className="as-user-link">
            사용자 회원가입 <i className="fas fa-arrow-right" />
          </Link>
        </div>

      </div>
      {/* // as-wrapper */}
    </div>
    // // as-page
  );
}

/* =====================================================================
   AdminPwStrengthBar
   비밀번호 강도 표시 바 서브 컴포넌트
   UserSignup.js의 PwStrengthBar와 동일한 로직, 색상만 병원 테마
===================================================================== */
function AdminPwStrengthBar({ pw }) {
  const getStrength = (pw) => {
    if (!pw) return { level: 0, label: "", color: "" };
    let score = 0;
    if (pw.length >= 8)          score++;  // 길이 조건
    if (/[A-Za-z]/.test(pw))     score++;  // 영문 포함
    if (/\d/.test(pw))           score++;  // 숫자 포함
    if (/[!@#$%^&*]/.test(pw))   score++;  // 특수문자 포함

    if (score <= 1) return { level: 1, label: "매우 약함", color: "#ef4444" };
    if (score === 2) return { level: 2, label: "약함",     color: "#f97316" };
    if (score === 3) return { level: 3, label: "보통",     color: "#eab308" };
    return              { level: 4, label: "강함",     color: "#0d9488" }; // 병원 테마 색
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
      <span className="as-pw-label" style={{ color }}>{label}</span>
    </div>
  );
}

export default AdminSignup;
