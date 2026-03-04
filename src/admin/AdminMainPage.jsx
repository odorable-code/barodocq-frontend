import React from "react";

export default function AdminMainPage() {
  return (
    <div className="adm-page">
      {/* 🟢 헤더 영역 (Breadcrumb 추가) */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
          <i className="fas fa-home" style={{marginRight: '4px'}}/> 관리자 홈 <i className="fas fa-chevron-right" style={{fontSize:'.6rem', margin:'0 6px'}}/> <span style={{color: 'var(--primary-teal)'}}>대시보드 요약</span>
        </div>
        <h1 className="adm-page-title" style={{marginBottom: 0}}>관리자 <span>대시보드</span></h1>
      </div>

      {/* 🟢 상단 통계 (4열 그리드) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <DashboardStat icon="fa-users" label="전체 회원" val="1,245" unit="명" color="#14b8a6" />
        <DashboardStat icon="fa-hospital" label="제휴 병원" val="128" unit="개" color="#0d9488" />
        <DashboardStat icon="fa-calendar-check" label="오늘 예약" val="42" unit="건" color="#0f766e" />
        <DashboardStat icon="fa-star" label="신규 후기" val="15" unit="건" color="#14b8a6" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '2rem' }}>
        
        {/* 🟢 좌측: 최근 예약 현황 (Table Layout Fixed 적용) */}
        <div className="adm-card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <i className="fas fa-clock" style={{color: 'var(--primary-mint)'}} /> 최근 예약 현황
            </h3>
            <button style={{ background: 'none', border: 'none', color: 'var(--primary-teal)', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
              전체보기 <i className="fas fa-chevron-right" style={{fontSize: '0.7rem'}}/>
            </button>
          </div>
          
          <div className="adm-table-wrap" style={{ border: 'none', borderRadius: 0 }}>
            <table className="adm-table" style={{ tableLayout: 'fixed' }}>
              <thead>
                <tr>
                  <th style={{ width: '100px', textAlign: 'center' }}>상태</th>
                  <th style={{ width: '120px', textAlign: 'left' }}>예약자</th>
                  <th style={{ textAlign: 'left' }}>병원명</th>
                  <th style={{ width: '100px', textAlign: 'center' }}>시간</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ height: '60px' }}>
                  <td style={{ textAlign: 'center' }}><span className="adm-badge adm-on" style={{width: '70px', display: 'inline-block'}}>진료대기</span></td>
                  <td style={{ fontWeight: 700, textAlign: 'left' }}>김민수</td>
                  <td style={{ textAlign: 'left' }}>서울아동병원</td>
                  <td style={{ textAlign: 'center', color: 'var(--text-muted)' }}>10:30</td>
                </tr>
                <tr style={{ height: '60px' }}>
                  <td style={{ textAlign: 'center' }}><span className="adm-badge" style={{background:'#e2e8f0', color: '#64748b', width: '70px', display: 'inline-block'}}>진료완료</span></td>
                  <td style={{ fontWeight: 700, textAlign: 'left' }}>이영희</td>
                  <td style={{ textAlign: 'left' }}>강남메디컬센터</td>
                  <td style={{ textAlign: 'center', color: 'var(--text-muted)' }}>09:15</td>
                </tr>
                <tr style={{ height: '60px' }}>
                  <td style={{ textAlign: 'center' }}><span className="adm-badge adm-on" style={{width: '70px', display: 'inline-block'}}>진료대기</span></td>
                  <td style={{ fontWeight: 700, textAlign: 'left' }}>박지성</td>
                  <td style={{ textAlign: 'left' }}>연세세브란스</td>
                  <td style={{ textAlign: 'center', color: 'var(--text-muted)' }}>11:45</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 🟢 우측: 주요 관리 링크 (Quick Link 디자인 강화) */}
        <div className="adm-card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fas fa-thumbtack" style={{color: 'var(--primary-teal)'}} /> 주요 관리 항목
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <QuickLink icon="fa-user-plus" label="신규 병원 승인 대기" count="3" highlight />
            <QuickLink icon="fa-exclamation-circle" label="미답변 1:1 문의" count="5" />
            <QuickLink icon="fa-flag" label="신고된 게시글" count="2" />
          </div>
          
          <div style={{ marginTop: '2rem', padding: '1.25rem', background: 'linear-gradient(135deg, var(--bg-tertiary), var(--bg-secondary))', borderRadius: '1rem', border: '1.5px dashed var(--primary-mint)' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary-dark-teal)', marginBottom: '5px' }}>시스템 알림</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>오늘 오후 2시부터 4시까지 서버 정기 점검이 예정되어 있습니다.</div>
          </div>
        </div>

      </div>
    </div>
  );
}

// ── 통계 카드 컴포넌트 ──
function DashboardStat({ icon, label, val, unit, color }) {
  return (
    <div className="adm-card" style={{ 
      marginBottom: 0, padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem',
      transition: 'transform 0.3s ease', cursor: 'default'
    }}
    onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <div style={{ 
        width: '56px', height: '56px', borderRadius: '14px', 
        background: `${color}15`, color: color, 
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' 
      }}>
        <i className={`fas ${icon}`} />
      </div>
      <div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '2px' }}>{label}</div>
        <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-primary)' }}>{val}<span style={{fontSize: '0.9rem', marginLeft: '2px', fontWeight: 600}}>{unit}</span></div>
      </div>
    </div>
  );
}

// ── 퀵 링크 컴포넌트 ──
function QuickLink({ icon, label, count, highlight }) {
  return (
    <div 
      style={{ 
        padding: '1.1rem 1.25rem', 
        background: highlight ? 'var(--bg-tertiary)' : 'var(--bg-secondary)', 
        borderRadius: '1rem', 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
        cursor: 'pointer', transition: 'all 0.2s ease',
        border: highlight ? '1.5px solid var(--primary-mint)' : '1.5px solid transparent'
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'translateX(5px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'translateX(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <i className={`fas ${icon}`} style={{color: 'var(--primary-teal)', fontSize: '0.9rem'}} />
        </div>
        {label}
      </div>
      <span style={{ 
        background: highlight ? 'var(--primary-teal)' : 'var(--primary-mint)', 
        color: '#fff', 
        minWidth: '24px', height: '24px', padding: '0 8px',
        borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800,
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>{count}</span>
    </div>
  );
}