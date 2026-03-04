import React from "react";

export default function TopHeader() {
  return (
    <div className="adm-th">
      {/* 🟢 좌측 공간 (필요 시 검색창 등을 넣을 수 있게 비워둠) */}
      <div style={{ flex: 1 }}></div>

      {/* 🟢 우측 정보 영역 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div className="adm-th-user">
          <div className="adm-th-name">홍길동 관리자님</div>
          <div className="adm-th-sub">사업자: 245-34-34235</div>
        </div>
        
        <button className="adm-th-btn">로그아웃</button>
        
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="adm-th-icon" title="설정">
            <i className="fas fa-cog" />
          </button>
          <button className="adm-th-icon" title="새 알림" style={{ position: 'relative' }}>
            <i className="fas fa-bell" />
            <span style={{ 
              position: 'absolute', top: '8px', right: '8px', 
              width: '8px', height: '8px', background: '#ef4444', 
              borderRadius: '50%', border: '2px solid #fff' 
            }} />
          </button>
        </div>
      </div>
    </div>
  );
}