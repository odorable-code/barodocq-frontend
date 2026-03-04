import { useMemo, useState } from "react";

/* ───────── 상수 ───────── */
const STATUS_OPTIONS = ["전체", "정상", "삭제"];

const INITIAL_DATA = Array.from({ length: 25 }).map((_, i) => ({
  rv_num: i + 1,
  rv_rating: (4 + Math.random()).toFixed(1),
  rv_title: i % 3 === 0 ? "의사선생님이 정말 친절하시고 설명도 자세해요" : "시설이 깔끔해서 좋았습니다.",
  rv_content: "상세 내용이 여기에 표시됩니다. 관리자는 모든 내용을 확인할 수 있습니다.",
  rv_created_at: "2026.03.04",
  rv_deleted_yn: i % 5 === 0 ? 1 : 0, // 1은 삭제, 0은 정상
  user_id: `user_${Math.floor(Math.random() * 1000)}`,
  hospital_name: i % 2 === 0 ? "메디움강남요양병원" : "바로닥큐 의원",
  fileCount: i % 4 === 0 ? 2 : 0,
  rv_view_count: Math.floor(Math.random() * 100),
  rv_likes_count: Math.floor(Math.random() * 20),
}));

export default function AdminReviews() {
  const [dataList, setDataList] = useState(INITIAL_DATA);
  const [statusFilter, setStatusFilter] = useState("전체");
  const [keyword, setKeyword] = useState("");
  const [limit, setLimit] = useState(10);

  // ✅ [기능] 삭제/복구 처리
  const handleToggleDelete = (num, currentStatus) => {
    const action = currentStatus === 1 ? "복구" : "삭제";
    if (!window.confirm(`해당 후기를 ${action}하시겠습니까?`)) return;
    
    setDataList(prev => prev.map(item => 
      item.rv_num === num ? { ...item, rv_deleted_yn: currentStatus === 1 ? 0 : 1 } : item
    ));
  };

  // ✅ [기능] 필터링 로직
  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return dataList.filter((row) => {
      const hitStatus = statusFilter === "전체" ? true : 
                        statusFilter === "삭제" ? row.rv_deleted_yn === 1 : row.rv_deleted_yn === 0;
      if (!hitStatus) return false;
      return row.hospital_name.toLowerCase().includes(kw) || 
             row.rv_title.toLowerCase().includes(kw) || 
             row.user_id.toLowerCase().includes(kw);
    });
  }, [dataList, keyword, statusFilter]);

  return (
    <div className="adm-page">
      {/* 🟢 헤더 영역 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
        <div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            <i className="fas fa-paste" style={{marginRight: '4px'}}/> 게시글관리 <i className="fas fa-chevron-right" style={{fontSize:'.6rem', margin:'0 6px'}}/> <span style={{color: 'var(--primary-teal)'}}>후기관리</span>
          </div>
          <h1 className="adm-page-title" style={{marginBottom: 0}}>후기 <span>관리</span></h1>
        </div>
      </div>

      {/* 🟢 필터 및 검색 카드 */}
      <div className="adm-card" style={{ padding: '1.5rem 2rem' }}>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-secondary)' }}>게시글 상태</span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {STATUS_OPTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => { setStatusFilter(s); setLimit(10); }}
                  style={{
                    width: '90px', height: '38px', borderRadius: 'var(--radius-full)', border: '2px solid',
                    borderColor: statusFilter === s ? 'transparent' : 'var(--border-color)',
                    background: statusFilter === s ? 'linear-gradient(135deg, var(--primary-mint), var(--primary-teal))' : '#fff',
                    color: statusFilter === s ? '#fff' : 'var(--text-secondary)',
                    fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s'
                  }}
                >{s}</button>
              ))}
            </div>
          </div>

          <div style={{ flex: 1, display: 'flex', background: 'var(--bg-secondary)', padding: '0.4rem', borderRadius: 'var(--radius-xl)', border: '2px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', padding: '0 1rem', color: 'var(--primary-teal)' }}><i className="fas fa-search" /></div>
            <input 
              className="adm-input" placeholder="병원명, 작성자 또는 제목으로 검색..." 
              value={keyword} onChange={(e) => setKeyword(e.target.value)} 
              style={{ flex: 1, border: 'none', background: 'transparent', height: '40px', outline:'none' }} 
            />
          </div>
        </div>
      </div>

      {/* 🟢 데이터 테이블 (고정 너비/정렬 최적화) */}
      <div className="adm-table-wrap" style={{ overflowX: 'auto' }}>
        <div style={{ padding: '1.25rem 1.5rem', background: '#fff', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-secondary)' }}>전체 후기 리스트 <span style={{ color: 'var(--primary-teal)' }}>{filtered.length}</span>건</span>
        </div>
        
        <table className="adm-table" style={{ tableLayout: 'fixed', width: '100%', minWidth: '1500px' }}>
          <thead>
            <tr>
              <th style={{width: '60px', textAlign: 'center'}}>NO.</th>
              <th style={{width: '90px', textAlign: 'center'}}>상태</th>
              <th style={{width: '180px', textAlign: 'left'}}>병원명</th>
              <th style={{width: '120px', textAlign: 'left'}}>작성자 ID</th>
              <th style={{width: '90px', textAlign: 'center'}}>별점</th>
              <th style={{width: '320px', textAlign: 'left'}}>제목</th>
              <th style={{width: '80px', textAlign: 'center'}}>사진</th>
              <th style={{width: '120px', textAlign: 'center'}}>등록일</th>
              <th style={{width: '80px', textAlign: 'center'}}>조회</th>
              <th style={{width: '80px', textAlign: 'center'}}>좋아요</th>
              <th style={{width: '100px', textAlign: 'center'}}>관리</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, limit).map((r, idx) => {
              const isDeleted = r.rv_deleted_yn === 1;
              return (
                <tr key={r.rv_num} style={{ height: '68px', opacity: isDeleted ? 0.6 : 1, background: isDeleted ? '#f8fafc' : '#fff' }}>
                  <td style={{textAlign: 'center', color: 'var(--text-muted)'}}>{idx + 1}</td>
                  <td style={{textAlign: 'center'}}>
                    <span className={`adm-badge ${isDeleted ? "adm-off" : "adm-on"}`} style={{width: '55px'}}>
                      {isDeleted ? "삭제" : "정상"}
                    </span>
                  </td>
                  <td style={{textAlign: 'left', fontWeight: 700, color: isDeleted ? 'var(--text-muted)' : 'var(--primary-teal)', cursor: 'pointer'}}>
                    {r.hospital_name}
                  </td>
                  <td style={{textAlign: 'left', fontWeight: 600}}>{r.user_id}</td>
                  <td style={{textAlign: 'center', color: '#f59e0b', fontWeight: 800}}>
                    <i className="fas fa-star" style={{marginRight: '4px'}}/>{r.rv_rating}
                  </td>
                  <td style={{textAlign: 'left'}}>
                    <div style={{ fontWeight: 600, color: isDeleted ? 'var(--text-muted)' : 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', cursor: 'pointer' }}>
                      {r.rv_title}
                    </div>
                  </td>
                  <td style={{textAlign: 'center', color: 'var(--primary-mint)'}}>
                    {r.fileCount > 0 ? <><i className="fas fa-image" style={{marginRight: '4px'}}/>{r.fileCount}</> : "-"}
                  </td>
                  <td style={{textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem'}}>{r.rv_created_at}</td>
                  <td style={{textAlign: 'center', fontWeight: 600}}>{r.rv_view_count}</td>
                  <td style={{textAlign: 'center', fontWeight: 600, color: '#ef4444'}}>{r.rv_likes_count}</td>
                  <td style={{textAlign: 'center'}}>
                    <button 
                      onClick={() => handleToggleDelete(r.rv_num, r.rv_deleted_yn)}
                      style={{ 
                        padding: '5px 12px', borderRadius: '6px', border: '1px solid',
                        borderColor: isDeleted ? 'var(--primary-mint)' : '#fca5a5',
                        background: isDeleted ? 'var(--bg-secondary)' : '#fee2e2',
                        color: isDeleted ? 'var(--primary-teal)' : '#dc2626',
                        fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer'
                      }}
                    >
                      {isDeleted ? "복구" : "삭제"}
                    </button>
                  </td>
                </tr>
              );
            })}
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
              onMouseOver={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
              onMouseOut={(e) => e.currentTarget.style.background = '#fff'}
            >
              후기 더보기 ({Math.min(limit, filtered.length)}/{filtered.length}) <i className="fas fa-chevron-down" style={{marginLeft: '8px'}}/>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}