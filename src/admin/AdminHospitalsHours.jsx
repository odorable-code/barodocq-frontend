import React, { useState } from "react";

const DAYS = [
  { key: "mon", label: "월요일" },
  { key: "tue", label: "화요일" },
  { key: "wed", label: "수요일" },
  { key: "thu", label: "목요일" },
  { key: "fri", label: "금요일" },
  { key: "sat", label: "토요일" },
  { key: "sun", label: "일요일" },
];

export default function AdminHospitalsHours() {
  // ✅ [기능] 각 요일별 시간 상태 관리
  const [hours, setHours] = useState(
    DAYS.reduce((acc, day) => ({
      ...acc,
      [day.key]: { open: "09:00", close: "18:00", active: day.key !== "sun" }
    }), {})
  );

  const toggleDay = (key) => {
    setHours(prev => ({
      ...prev,
      [key]: { ...prev[key], active: !prev[key].active }
    }));
  };

  const handleSave = () => {
    alert("운영시간 정보가 성공적으로 저장되었습니다.");
  };

  return (
    <div className="adm-page">
      {/* 🟢 헤더 영역 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
        <div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            <i className="fas fa-home" style={{marginRight: '4px'}}/> 병원관리 <i className="fas fa-chevron-right" style={{fontSize:'.6rem', margin:'0 6px'}}/> <span style={{color: 'var(--primary-teal)'}}>운영시간/휴무변경</span>
          </div>
          <h1 className="adm-page-title" style={{marginBottom: 0}}>운영시간/휴무 <span>변경</span></h1>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="adm-th-btn" style={{ background: '#fff', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>취소</button>
          <button onClick={handleSave} className="adm-th-btn" style={{ background: 'linear-gradient(135deg, var(--primary-mint), var(--primary-teal))', color: '#fff', border: 'none', padding: '0.8rem 2rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-mint)', cursor: 'pointer' }}>저장하기</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem', alignItems: 'start' }}>
        {/* 🟢 왼쪽: 주간 진료 시간 설정 */}
        <div className="adm-card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <i className="fas fa-clock" style={{color: 'var(--primary-mint)'}}/> 주간 표준 운영시간
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {DAYS.map((day) => (
              <div key={day.key} style={{ 
                display: 'flex', alignItems: 'center', padding: '1.25rem', 
                background: hours[day.key].active ? 'var(--bg-secondary)' : '#f8fafc', 
                borderRadius: 'var(--radius-xl)', border: '1px solid',
                borderColor: hours[day.key].active ? 'var(--primary-mint)' : 'var(--border-color)',
                transition: 'all 0.3s'
              }}>
                <div style={{ width: '100px', fontWeight: 800, color: hours[day.key].active ? 'var(--primary-dark-teal)' : 'var(--text-muted)' }}>{day.label}</div>
                
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '15px' }}>
                  {hours[day.key].active ? (
                    <>
                      <input type="time" value={hours[day.key].open} className="adm-input" style={{ width: '140px', textAlign: 'center' }} />
                      <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>~</span>
                      <input type="time" value={hours[day.key].close} className="adm-input" style={{ width: '140px', textAlign: 'center' }} />
                    </>
                  ) : (
                    <span style={{ color: '#ef4444', fontWeight: 700, fontSize: '0.9rem' }}>정기 휴무일</span>
                  )}
                </div>

                <button 
                  onClick={() => toggleDay(day.key)}
                  style={{ 
                    padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', border: 'none', 
                    background: hours[day.key].active ? '#fee2e2' : 'var(--primary-mint)',
                    color: hours[day.key].active ? '#dc2626' : '#fff',
                    fontWeight: 800, fontSize: '0.75rem', cursor: 'pointer'
                  }}
                >
                  {hours[day.key].active ? "휴무로 변경" : "영업으로 변경"}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 🟢 오른쪽: 점심시간 및 기타 설정 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="adm-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
              <i className="fas fa-utensils" style={{marginRight: '8px', color: 'var(--primary-teal)'}}/> 점심시간 설정
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div className="adm-field">
                <label className="adm-label">시작 시간</label>
                <input type="time" defaultValue="13:00" className="adm-input" />
              </div>
              <div className="adm-field" style={{ marginBottom: 0 }}>
                <label className="adm-label">종료 시간</label>
                <input type="time" defaultValue="14:00" className="adm-input" />
              </div>
            </div>
          </div>

          <div className="adm-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
              <i className="fas fa-exclamation-triangle" style={{marginRight: '8px', color: '#f59e0b'}}/> 임시 휴무 안내
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: '1.5' }}>
              공휴일이나 병원 사정으로 인한 임시 휴무는 메인 대시보드의 '공지사항'에서도 설정 가능합니다.
            </p>
            <button className="adm-th-btn" style={{ width: '100%', background: 'var(--bg-tertiary)', color: 'var(--primary-dark-teal)', fontWeight: 800 }}>
              임시 휴무일 등록하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}