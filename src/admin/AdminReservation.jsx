import { useMemo, useState } from "react";

/* ───────── 상수 ───────── */
const STATUS_OPTIONS = ["전체", "예약대기", "예약확정", "진료완료", "예약취소"];

const INITIAL_DATA = Array.from({ length: 25 }).map((_, i) => ({
  id: i + 1,
  hospitalName: i % 2 === 0 ? "바로닥큐 병원" : "클린페이 의원",
  department: i % 3 === 0 ? "내과" : i % 3 === 1 ? "피부과" : "정형외과",
  patientName: `환자${i + 1}`,
  visitType: i % 4 === 0 ? "재진" : "초진",
  reservedAt: `2026-03-05 1${i % 9}:30`,
  status: i === 0 ? "예약대기" : i % 4 === 1 ? "예약확정" : i % 4 === 2 ? "진료완료" : "예약취소",
  requestMemo: i % 3 === 0 ? "갑자기 열이 나고 오한이 있어요. 조심히 가겠습니다." : "기존 처방전 재발급 원합니다.",
  createdAt: "2026-03-03 10:00",
}));

/* ───────── 메모 모달 컴포넌트 ───────── */
function MemoModal({ open, memo, onClose }) {
  if (!open) return null;
  return (
    <div className="adm-modal-bg" onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.7)', 
      backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', 
      alignItems: 'center', justifyContent: 'center', animation: 'fadeIn 0.2s ease'
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: '#fff', width: 'min(450px, 90%)', borderRadius: 'var(--radius-xl)', 
        padding: '2rem', boxShadow: 'var(--shadow-xl)', border: '1px solid var(--border-color)'
      }}>
        <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary-teal)', fontSize: '1.2rem', fontWeight: 800 }}>
          <i className="fas fa-comment-medical" /> 예약 요청사항 상세
        </h3>
        <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--primary-mint)', marginTop: '1.5rem', lineHeight: 1.7, fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
          {memo || "요청사항이 없습니다."}
        </div>
        <div style={{ textAlign: 'right', marginTop: '2rem' }}>
          <button className="hdp-btn hdp-btn-primary" style={{ width: '100%' }} onClick={onClose}>닫기</button>
        </div>
      </div>
    </div>
  );
}

/* ───────── 메인 페이지 ───────── */
export default function ReservationManagePage() {
  const [dataList, setDataList] = useState(INITIAL_DATA);
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("전체");
  const [memoOpen, setMemoOpen] = useState(false);
  const [memoText, setMemoText] = useState("");
  const [limit, setLimit] = useState(10);

  // ✅ [기능] 상태 변경 (승인/취소)
  const handleStatusChange = (id, newStatus) => {
    const msg = newStatus === "예약확정" ? "예약을 승인하시겠습니까?" : "예약을 취소하시겠습니까?";
    if (!window.confirm(msg)) return;
    setDataList(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
  };

  // ✅ [기능] 필터링
  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return dataList.filter((row) => {
      const hitStatus = statusFilter === "전체" ? true : row.status === statusFilter;
      if (!hitStatus) return false;
      return row.patientName.toLowerCase().includes(kw) || row.hospitalName.toLowerCase().includes(kw);
    });
  }, [dataList, keyword, statusFilter]);

  return (
    <div className="adm-page">
      <MemoModal open={memoOpen} memo={memoText} onClose={() => setMemoOpen(false)} />

      {/* 🟢 헤더 영역 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
        <div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            <i className="fas fa-home" style={{marginRight: '4px'}}/> 예약관리 <i className="fas fa-chevron-right" style={{fontSize:'.6rem', margin:'0 6px'}}/> <span style={{color: 'var(--primary-teal)'}}>전체 예약 내역</span>
          </div>
          <h1 className="adm-page-title" style={{marginBottom: 0}}>예약 <span>관리</span></h1>
        </div>
      </div>

      {/* 🟢 필터 카드 */}
      <div className="adm-card" style={{ padding: '1.5rem 2rem' }}>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-secondary)' }}>예약상태</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {STATUS_OPTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => { setStatusFilter(s); setLimit(10); }}
                  style={{
                    padding: '0.5rem 1.1rem', borderRadius: 'var(--radius-full)', border: '2px solid',
                    borderColor: statusFilter === s ? 'transparent' : 'var(--border-color)',
                    background: statusFilter === s ? 'linear-gradient(135deg, var(--primary-mint), var(--primary-teal))' : '#fff',
                    color: statusFilter === s ? '#fff' : 'var(--text-secondary)',
                    fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', transition: 'all 0.2s'
                  }}
                >{s}</button>
              ))}
            </div>
          </div>
          <div style={{ flex: 1, display: 'flex', background: 'var(--bg-secondary)', padding: '0.4rem', borderRadius: 'var(--radius-xl)', border: '2px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', padding: '0 1rem', color: 'var(--primary-teal)' }}><i className="fas fa-search" /></div>
            <input 
              className="adm-input" placeholder="병원명 또는 예약자 성함을 입력하세요..." 
              value={keyword} onChange={(e) => setKeyword(e.target.value)} 
              style={{ flex: 1, border: 'none', background: 'transparent', height: '40px', outline:'none' }} 
            />
          </div>
        </div>
      </div>

      {/* 🟢 데이터 테이블 (고정 레이아웃) */}
      <div className="adm-table-wrap" style={{ overflowX: 'auto' }}>
        <div style={{ padding: '1.25rem 1.5rem', background: '#fff', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-secondary)' }}>검색 내역 <span style={{ color: 'var(--primary-teal)' }}>{filtered.length}</span>건</span>
        </div>
        
        <table className="adm-table" style={{ tableLayout: 'fixed', width: '100%', minWidth: '1400px' }}>
          <thead>
            <tr>
              <th style={{width: '60px', textAlign: 'center'}}>NO.</th>
              <th style={{width: '180px', textAlign: 'left'}}>예약병원</th>
              <th style={{width: '100px', textAlign: 'center'}}>진료과</th>
              <th style={{width: '110px', textAlign: 'left'}}>예약자성함</th>
              <th style={{width: '90px', textAlign: 'center'}}>유형</th>
              <th style={{width: '150px', textAlign: 'center'}}>예약시간</th>
              <th style={{width: '110px', textAlign: 'center'}}>상태</th>
              <th style={{width: '240px', textAlign: 'left'}}>요청사항</th>
              <th style={{width: '150px', textAlign: 'center'}}>신청일시</th>
              <th style={{width: '160px', textAlign: 'center'}}>처리</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, limit).map((r, idx) => (
              <tr key={r.id} style={{ height: '70px' }}>
                <td style={{textAlign: 'center', color: 'var(--text-muted)'}}>{idx + 1}</td>
                <td style={{textAlign: 'left', fontWeight: 700}}>{r.hospitalName}</td>
                <td style={{textAlign: 'center'}}><span style={{ padding: '0.2rem 0.5rem', background: 'var(--bg-tertiary)', color: 'var(--primary-dark-teal)', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>{r.department}</span></td>
                <td style={{textAlign: 'left', fontWeight: 700}}>{r.patientName}</td>
                <td style={{textAlign: 'center'}}>{r.visitType}</td>
                <td style={{textAlign: 'center', fontWeight: 600, color: 'var(--text-secondary)'}}>{r.reservedAt}</td>
                <td style={{textAlign: 'center'}}>
                  <span className={`adm-badge ${r.status === "예약대기" ? "adm-st-wait" : r.status === "예약확정" ? "adm-on" : ""}`} style={{width: '75px', background: r.status === "예약취소" ? "#f1f5f9" : "", color: r.status === "예약취소" ? "#94a3b8" : ""}}>
                    {r.status}
                  </span>
                </td>
                <td style={{textAlign: 'left'}}>
                  <div 
                    onClick={() => { setMemoText(r.requestMemo); setMemoOpen(true); }}
                    style={{ cursor: 'pointer', color: 'var(--primary-teal)', fontWeight: 600, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                  >
                    <i className="far fa-comment-dots" style={{marginRight: '6px'}}/> {r.requestMemo}
                  </div>
                </td>
                <td style={{textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem'}}>{r.createdAt}</td>
                <td style={{textAlign: 'center', padding: '0'}}>
                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    {r.status === "예약대기" ? (
                      <>
                        <button onClick={() => handleStatusChange(r.id, "예약확정")} className="btn-act ok" style={{width: '55px', height: '32px', background: 'var(--bg3)', color: 'var(--pdt)', border: '1px solid var(--pm)', borderRadius: '6px', fontWeight: 800, cursor: 'pointer'}}>승인</button>
                        <button onClick={() => handleStatusChange(r.id, "예약취소")} className="btn-act no" style={{width: '55px', height: '32px', background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: '6px', fontWeight: 800, cursor: 'pointer'}}>취소</button>
                      </>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>처리완료</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* 🟢 세련된 더보기 버튼 */}
        {filtered.length > limit && (
          <div style={{ padding: '2rem', textAlign: 'center', borderTop: '1px solid var(--border-color)', background: '#fff' }}>
            <button 
              onClick={() => setLimit(prev => prev + 5)}
              style={{ 
                background: '#fff', border: '2px solid var(--primary-mint)', padding: '0.8rem 3.5rem', borderRadius: 'var(--radius-lg)', 
                color: 'var(--primary-teal)', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.3s'
              }}
              onMouseOver={(e) => { e.currentTarget.style.background = 'var(--bg-secondary)'; }}
              onMouseOut={(e) => { e.currentTarget.style.background = '#fff'; }}
            >
              예약 내역 더보기 ({Math.min(limit, filtered.length)}/{filtered.length}) <i className="fas fa-chevron-down" style={{marginLeft: '8px'}}/>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}