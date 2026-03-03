import React, { useState } from "react";

export default function AdminMe() {
  const [phone, setPhone] = useState("010-1234-5678");
  const [isSaving, setIsSaving] = useState(false);

  // ✅ [기능] 저장 프로세스 시뮬레이션
  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      alert("개인정보가 성공적으로 업데이트되었습니다.");
      setIsSaving(false);
    }, 800);
  };

  return (
    <div className="adm-page">
      {/* 🟢 헤더 영역 (Breadcrumb 스타일 통일) */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
          <i className="fas fa-home" style={{marginRight: '4px'}}/> 설정 <i className="fas fa-chevron-right" style={{fontSize:'.6rem', margin:'0 6px'}}/> <span style={{color: 'var(--primary-teal)'}}>내 정보 관리</span>
        </div>
        <h1 className="adm-page-title" style={{marginBottom: 0}}>내 <span>정보 관리</span></h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '2rem', alignItems: 'start' }}>
        
        {/* 🟢 좌측: 프로필 요약 카드 (Visual Identity) */}
        <div className="adm-card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          <div style={{ 
            width: '120px', height: '120px', borderRadius: '50%', 
            background: 'var(--bg-secondary)', margin: '0 auto 1.5rem', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            border: '4px solid var(--primary-mint)',
            boxShadow: 'var(--shadow-md)',
            position: 'relative'
          }}>
            <i className="fas fa-user-tie" style={{ fontSize: '3.5rem', color: 'var(--primary-teal)' }} />
            <button style={{
              position: 'absolute', bottom: '0', right: '0', 
              width: '36px', height: '36px', borderRadius: '50%', 
              background: '#fff', border: '2px solid var(--border-color)',
              color: 'var(--primary-teal)', cursor: 'pointer'
            }}>
              <i className="fas fa-camera" style={{fontSize: '0.9rem'}} />
            </button>
          </div>
          
          <h2 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
            홍길동 관리자
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            master_admin@barodocq.com
          </p>
          
          <div style={{ 
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '8px 20px', borderRadius: 'var(--radius-full)',
            background: 'linear-gradient(135deg, var(--primary-mint), var(--primary-teal))',
            color: '#fff', fontSize: '0.85rem', fontWeight: 800,
            boxShadow: 'var(--shadow-mint)'
          }}>
            <i className="fas fa-shield-halved" /> 최고 관리자
          </div>

          <div style={{ marginTop: '2.5rem', paddingTop: '2rem', borderTop: '1px solid var(--border-color)', textAlign: 'left' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '10px', fontWeight: 700 }}>최근 접속 정보</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
              <span>2026-03-04 14:22</span>
              <span style={{color: 'var(--primary-teal)'}}>IP: 121.1xx.xxx</span>
            </div>
          </div>
        </div>

        {/* 🟢 우측: 상세 정보 수정 카드 (Form Layout) */}
        <div className="adm-card" style={{ padding: '2.5rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <i className="fas fa-user-gear" style={{color: 'var(--primary-mint)'}} /> 계정 기본 설정
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            {/* 이메일 (읽기 전용) */}
            <div className="adm-field">
              <label className="adm-label"><i className="fas fa-envelope" /> 이메일 주소 (ID)</label>
              <input type="text" className="adm-input" value="master_admin@barodocq.com" readOnly 
                style={{ background: 'var(--bg-secondary)', cursor: 'not-allowed', fontWeight: 600, color: 'var(--text-secondary)' }} />
              <p style={{fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '5px'}}>아이디는 변경할 수 없습니다.</p>
            </div>

            {/* 연락처 */}
            <div className="adm-field">
              <label className="adm-label"><i className="fas fa-phone" /> 연락처</label>
              <input 
                type="text" className="adm-input" 
                value={phone} onChange={(e) => setPhone(e.target.value)}
                placeholder="010-1234-5678" 
              />
            </div>

            {/* 비밀번호 변경 */}
            <div className="adm-field" style={{marginTop: '1rem'}}>
              <label className="adm-label"><i className="fas fa-lock" /> 새 비밀번호</label>
              <input type="password" className="adm-input" placeholder="변경할 비밀번호 입력" />
            </div>

            {/* 비밀번호 확인 */}
            <div className="adm-field" style={{marginTop: '1rem'}}>
              <label className="adm-label"><i className="fas fa-check-double" /> 비밀번호 확인</label>
              <input type="password" className="adm-input" placeholder="비밀번호 다시 입력" />
            </div>
          </div>

          <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '2rem' }}>
            <button className="adm-th-btn" style={{ background: '#fff', border: '2px solid var(--border-color)', color: 'var(--text-secondary)', padding: '0.8rem 2rem' }}>
              입력 취소
            </button>
            <button 
              onClick={handleSave}
              className="adm-th-btn" 
              style={{ 
                background: isSaving ? 'var(--text-muted)' : 'linear-gradient(135deg, var(--primary-mint), var(--primary-teal))', 
                color: '#fff', border: 'none', padding: '0.8rem 3rem',
                boxShadow: isSaving ? 'none' : 'var(--shadow-mint)',
                cursor: isSaving ? 'wait' : 'pointer',
                transition: 'all 0.3s'
              }}
            >
              {isSaving ? <i className="fas fa-spinner fa-spin" /> : <i className="fas fa-save" style={{marginRight: '8px'}} />}
              {isSaving ? "저장 중..." : "변경사항 저장"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}