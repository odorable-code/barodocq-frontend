
export default function TopHeader() {
  return (
    <div className="adm-th th-right-only">
      <div className="adm-th-right">
        <div className="adm-th-user">
          <div className="adm-th-name">홍길동님</div>
          <div className="adm-th-sub">사업자명: 2452342-342-34235</div>
        </div>
        <button className="adm-th-btn">로그아웃</button>
        <button className="adm-th-icon">⚙️</button>
        <button className="adm-th-icon">🔔</button>
      </div>
    </div>
  );
}