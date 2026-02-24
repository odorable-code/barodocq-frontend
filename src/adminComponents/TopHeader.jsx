
export default function TopHeader() {
  return (
    <div className="th th-right-only">
      <div className="th-right">
        <div className="th-user">
          <div className="th-name">홍길동님</div>
          <div className="th-sub">사업자명: 2452342-342-34235</div>
        </div>
        <button className="th-btn">로그아웃</button>
        <button className="th-icon">⚙️</button>
        <button className="th-icon">🔔</button>
      </div>
    </div>
  );
}