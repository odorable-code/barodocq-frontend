import "../assets/styles/Navibar.css";
import logo from "../assets/images/logo.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-regular-svg-icons"

export const Navibar = () => (
  <header className="header">
    <div className="header-top container">
      <a href="/" className="logo-link">
        <img className="logo" src={logo} alt="바로닥큐 로고" />
      </a>
      <div className="search-bar">
        <input type="text" placeholder="병원, 진료과, 지역 검색" />
      </div>
      <div className="user-menu">
        <FontAwesomeIcon icon={faBell} size="xl"/>
        <button>로그인</button>
        <button>회원가입/알림</button>
      </div>
    </div>
    <nav className="main-nav">
      <div className="container nav-wrapper">
        <div className="nav-item">약국</div>
        <div className="nav-item">병원찾기</div>
        <div className="nav-item">나의 예약 현황</div>
        <div className="nav-item">커뮤니티</div>
      </div>
    </nav>
  </header>
);
