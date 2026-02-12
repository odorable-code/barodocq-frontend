import React from 'react';
import './Main.css';

// 개별 컴포넌트들
const Header = () => (
  <header className="header">
    <div className="header-top container">
      <div className="logo">바로닥큐</div>
      <div className="search-bar">
        <input type="text" placeholder="병원, 진료과, 지역 검색" />
      </div>
      <div className="user-menu">
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

const CategoryGrid = () => {
  const categories = ["전체", "소아청소년과", "내과", ...Array(5).fill(""), "더 보기"];
  return (
    <div className="category-section">
      <div className="category-header">진료과로 병원 찾기</div>
      <div className="grid-container">
        {categories.map((cat, idx) => (
          <div key={idx} className="grid-item">{cat}</div>
        ))}
      </div>
    </div>
  );
};

const QuickSearch = () => (
  <section className="quick-search container">
    <div className="quick-title">quick search</div>
    <div className="quick-bar">
      {["응급실진료", "일요일진료", "야간진료", "지금진료중", "여의사"].map(text => (
        <button key={text}>{text}</button>
      ))}
    </div>
  </section>
);

function Main() {
  return (
    <div>
      <Header />
      <main className="container main-content">
        {/* 히어로 섹션 */}
        <section className="hero">
          <div className="main-banner">배너</div>
          <CategoryGrid />
        </section>

        <QuickSearch />

        {/* 하단 정보 섹션 */}
        <section className="info-grid">
          <div className="left-cards">
            <div className="info-card">지금 뜨는 핫한 병원후기</div>
            <div className="info-card">병원 이벤트 오픈</div>
          </div>
          <div className="right-menu">
            <div className="menu-box">주변 병원</div>
            <div className="menu-box">스크랩 병원</div>
            <div className="menu-box">내 병원 기록</div>
            <div className="menu-box">예방접종/백신</div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container">사이트 소개</div>
      </footer>
    </div>
  );
}

export default Main;