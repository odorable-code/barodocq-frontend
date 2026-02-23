// Header.jsx
import { Link } from "react-router-dom";
import "../assets/styles/Header.css";
import { useRef } from "react";

const Header = () => {
  const navRef = useRef(null);
  const hamburgerRef = useRef(null);
  const navMenuRef = useRef(null);
  const navButtonsRef = useRef(null);

  const toggleMobileMenu = () => {
    hamburgerRef.current?.classList.toggle("active");
    navMenuRef.current?.classList.toggle("active");
    navButtonsRef.current?.classList.toggle("active");
  };

  return (
    <nav className="navbar-s2" ref={navRef}>
      <div className="nav-inner">
        {/* 상단: 로고 + 검색 + 버튼 */}
        <div className="nav-top-s2">
          <Link to="/" className="logo-s2">
            <div className="logo-icon-s2">
              <i className="fas fa-heartbeat" />
            </div>
            <span>바로닥큐</span>
          </Link>

          <div className="nav-search-s2">
            <i className="fas fa-search search-icon-s2" />
            <input
              type="text"
              placeholder="병원명, 전문의, 진료과, 주소 검색"
            />
            <button className="nav-search-btn-s2">
              검색 <i className="fas fa-arrow-right" />
            </button>
          </div>

          <div className="nav-buttons-s2" ref={navButtonsRef}>
            <button className="btn-text-s2">로그인</button>
            <button className="btn-primary-s2">회원가입</button>
            <button className="btn-notification-s2">
              <i className="fas fa-bell" />
              <span className="notification-badge-s2">3</span>
            </button>
          </div>

          <button
            className="hamburger-s2"
            ref={hamburgerRef}
            onClick={toggleMobileMenu}
          >
            <span />
            <span />
            <span />
          </button>
        </div>

        {/* 하단: 메뉴 */}
        <div className="nav-bottom-s2">
          <ul className="nav-menu-s2" ref={navMenuRef}>
            <li>
              <Link to="/pharmacy">
                <i className="fas fa-pills" />
                약국
              </Link>
            </li>
            <li>
              <Link to="/hospitals" className="active">
                <i className="fas fa-hospital" />
                병원찾기
              </Link>
            </li>
            <li>
              <Link to="/appointments">
                <i className="fas fa-calendar-check" />
                나의 예약
              </Link>
            </li>
            <li>
              <Link to="/dashboard">
                <i className="fas fa-chart-pie" />내 건강 대시보드
              </Link>
            </li>
            <li>
              <Link to="/community">
                <i className="fas fa-comments" />
                커뮤니티
              </Link>
            </li>
            <li>
              <Link to="/qna">
                <i className="fas fa-question-circle" />
                문의하기
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Header;
