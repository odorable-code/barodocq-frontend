import "../assets/styles/Navibar.css";
import logo from "../assets/images/logo.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-regular-svg-icons";
import { NavLink } from "react-router-dom";

export const Navibar = () => {
  return (
    <header className="header">
      <div className="header-top container">
        
        {/* a → NavLink */}
        <NavLink to="/" className="logo-link">
          <img className="logo" src={logo} alt="바로닥큐 로고" />
        </NavLink>

        <div className="search-bar">
          <input type="text" placeholder="병원, 진료과, 지역 검색" />
        </div>

        <div className="user-menu">
          <FontAwesomeIcon icon={faBell} size="xl" />
          <NavLink to="/login" className="menu-btn">로그인</NavLink>
          <NavLink to="/signup" className="menu-btn">회원가입</NavLink>
        </div>
      </div>

      <nav className="main-nav">
        <div className="container nav-wrapper">

          <NavLink
            to="/pharmacy"
            className={({ isActive }) =>
              isActive ? "nav-item active" : "nav-item"
            }
          >
            약국
          </NavLink>

          <NavLink
            to="/hospitals"
            className={({ isActive }) =>
              isActive ? "nav-item active" : "nav-item"
            }
          >
            병원찾기
          </NavLink>

          <NavLink
            to="/reservation"
            className={({ isActive }) =>
              isActive ? "nav-item active" : "nav-item"
            }
          >
            나의 예약 현황
          </NavLink>

          <NavLink
            to="/reviews"
            className={({ isActive }) =>
              isActive ? "nav-item active" : "nav-item"
            }
          >
            병원 후기
          </NavLink>

          <NavLink
            to="/community"
            className={({ isActive }) =>
              isActive ? "nav-item active" : "nav-item"
            }
          >
            커뮤니티
          </NavLink>

        </div>
      </nav>
    </header>
  );
};