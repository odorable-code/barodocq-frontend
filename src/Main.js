import './Main.css';


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