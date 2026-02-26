// =====================================================================
// Signup.js
// 파일 경로: src/pages/Signup.js
// =====================================================================

import { Link } from "react-router-dom";
import "./Signup.css";

function Signup() {
  return (
    <div className="signup-page">

      {/* 배경 블롭 */}
      <div className="signup-blob signup-blob-1" />
      <div className="signup-blob signup-blob-2" />

      <div className="signup-wrapper">

        {/* 헤더 */}
        <div className="signup-header">
          <h1 className="signup-title">회원가입</h1>
          <p className="signup-subtitle">
            가입 유형을 선택해주세요.<br />
            선택에 따라 서로 다른 서비스가 제공됩니다.
          </p>
        </div>

        {/* 카드 영역 */}
        <div className="signup-card-grid">

          {/* 사용자 카드 */}
          <Link to="/user/signup" className="signup-type-card user">
            <div className="signup-card-badge user">일반 회원</div>

            <div className="signup-card-icon-wrap user">
              <i className="fas fa-user-circle" />
            </div>

            <h2 className="signup-card-title">사용자</h2>
            <p className="signup-card-desc">
              병원을 찾고, 예약하고,<br />
              진료 후기를 남기는<br />
              <strong>일반 사용자</strong>로 가입합니다.
            </p>

            <ul className="signup-card-features">
              <li><i className="fas fa-circle-check" /> AI 맞춤 병원 추천</li>
              <li><i className="fas fa-circle-check" /> 실시간 예약 및 대기 확인</li>
              <li><i className="fas fa-circle-check" /> 진료 기록 & 후기 관리</li>
              <li><i className="fas fa-circle-check" /> 예방접종 일정 알림</li>
            </ul>

            <div className="signup-card-cta user">
              사용자로 가입하기 <i className="fas fa-arrow-right" />
            </div>
          </Link>

          {/* 병원 카드 */}
          <Link to="/admin/signup" className="signup-type-card hospital">
            <div className="signup-card-badge hospital">의료기관</div>

            <div className="signup-card-icon-wrap hospital">
              <i className="fas fa-hospital" />
            </div>

            <h2 className="signup-card-title">병원</h2>
            <p className="signup-card-desc">
              병원 정보를 등록하고,<br />
              환자 예약을 관리하는<br />
              <strong>의료기관</strong>으로 가입합니다.
            </p>

            <ul className="signup-card-features">
              <li><i className="fas fa-circle-check" /> 병원 프로필 등록 및 관리</li>
              <li><i className="fas fa-circle-check" /> 온라인 예약 접수 시스템</li>
              <li><i className="fas fa-circle-check" /> 진료 스케줄 관리</li>
              <li><i className="fas fa-circle-check" /> 이벤트 & 공지 등록</li>
            </ul>

            <div className="signup-card-cta hospital">
              병원으로 가입하기 <i className="fas fa-arrow-right" />
            </div>
          </Link>

        </div>

        {/* 로그인 링크 */}
        <div className="signup-login-cta">
          <span>이미 계정이 있으신가요?</span>
          <Link to="/user/login" className="signup-login-link">
            로그인하기 <i className="fas fa-arrow-right" />
          </Link>
        </div>

        {/* 메인으로 */}
        <Link to="/" className="signup-back-main">
          <i className="fas fa-house" />
          메인으로 돌아가기
        </Link>

        {/* 🔥 추가한 테스트 링크들 */}
        <div style={{ marginTop: "40px", textAlign: "center" }}>
          <Link to="/chat">채팅</Link>
          <br />
          <Link to="/chat/list">채팅목록</Link>
        </div>

      </div>
    </div>
  );
}

export default Signup;