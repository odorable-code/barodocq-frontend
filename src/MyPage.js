import './MyPage.css';

const MyPage = () => {
  // 리스트 메뉴 데이터
  const menuItems = [
    { id: 1, title: '알림' },
    { id: 2, title: '내 Q&A' },
    { id: 3, title: '나의 후기' },
    { id: 4, title: '채팅' },
  ];

  return (
    <div className="mypage-container">
      {/* 상단 헤더 영역 */}
      <header className="mypage-header">
        <button className="btn-logo">바로닥큐</button>
        <button className="btn-search">돋보기</button>
      </header>

      {/* 사용자 환영 문구 */}
      <section className="welcome-section">
        <h2>
          WELCOME <span className="user-name">은유진님</span> 
          <span className="breadcrumb"> &gt; 내 정보 관리</span>
        </h2>
      </section>

      {/* 주요 현황 탭 (예약, 내역, 찜) */}
      <section className="status-tabs">
        <div className="tab-item">예약현황</div>
        <div className="tab-item">병원내역</div>
        <div className="tab-item icon-tab">
            <span role="img" aria-label="heart">❤️</span>
        </div>
      </section>

      {/* 세로 리스트 메뉴 */}
      <nav className="menu-list">
        {menuItems.map((item) => (
          <div key={item.id} className="menu-row">
            <span>{item.title}</span>
            <span className="arrow">&gt;</span>
          </div>
        ))}
      </nav>
    </div>
  );
};

export default MyPage;