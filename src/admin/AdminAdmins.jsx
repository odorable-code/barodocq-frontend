import { useMemo, useState } from "react";

const STATUS_OPTIONS = ["전체", "승인요청", "승인완료"];

// 초기 더미 데이터
const INITIAL_DUMMY = Array.from({ length: 25 }).map((_, i) => ({
  id: i + 1, 
  bizNo: "245-34-34235", 
  adminId: `admin${String(i + 1).padStart(2, "0")}`,
  hospitalName: i % 2 === 0 ? "바로닥큐 병원" : "클린페이 의원", 
  department: i % 3 === 0 ? "내과" : i % 3 === 1 ? "피부과" : "정형외과",
  address: "서울특별시 종로구 어딘가 123", 
  phone: "02-1234-5678", 
  alertAllowed: i % 2 === 0,
  firstJoinedAt: "2020.03.04", 
  approveStatus: i % 3 === 0 ? "승인완료" : "승인요청",
}));

export default function AdminAdmins() {
  const [dataList, setDataList] = useState(INITIAL_DUMMY); // 실제 가공될 데이터 상태
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("전체");
  const [searchField, setSearchField] = useState("전체");
  const [limit, setLimit] = useState(10); // 더보기 기능을 위한 노출 개수

  // ✅ [기능] 승인 처리 함수
  const handleApprove = (id) => {
    if(!window.confirm("해당 회원을 승인하시겠습니까?")) return;
    setDataList(prev => prev.map(item => 
      item.id === id ? { ...item, approveStatus: "승인완료" } : item
    ));
  };

  // ✅ [기능] 더보기 함수
  const handleLoadMore = () => {
    setLimit(prev => prev + 5);
  };

  // ✅ 검색 및 필터링 로직
  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return dataList.filter((row) => {
      const hitStatus = status === "전체" ? true : row.approveStatus === status;
      if (!hitStatus) return false;
      if (kw === "") return true;

      const searchValues = {
        전체: [row.bizNo, row.adminId, row.hospitalName, row.department, row.phone],
        사업자번호: [row.bizNo], 관리자아이디: [row.adminId], 병원명: [row.hospitalName],
        진료과: [row.department], 전화번호: [row.phone],
      };
      
      const targets = searchValues[searchField] || searchValues["전체"];
      return targets.some(v => String(v).toLowerCase().includes(kw));
    });
  }, [dataList, keyword, status, searchField]);

  return (
    <div className="adm-page">
      {/* 🟢 헤더 영역 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
        <div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            <i className="fas fa-home" style={{marginRight: '4px'}}/> 회원관리 <i className="fas fa-chevron-right" style={{fontSize:'.6rem', margin:'0 6px'}}/> <span style={{color: 'var(--primary-teal)'}}>관리자 회원관리</span>
          </div>
          <h1 className="adm-page-title" style={{marginBottom: 0}}>관리자 <span>회원관리</span></h1>
        </div>
        <button className="adm-th-btn" style={{ background: 'linear-gradient(135deg, var(--primary-mint), var(--primary-teal))', color: '#fff', border:'none', padding: '0.8rem 1.5rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-mint)', cursor:'pointer' }}>
          <i className="fas fa-plus-circle" style={{marginRight: '8px'}}/> 신규 등록
        </button>
      </div>

      {/* 🟢 필터 및 검색 카드 */}
      <div className="adm-card" style={{ padding: '1.5rem 2rem' }}>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-secondary)' }}>상태필터</span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {STATUS_OPTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => { setStatus(s); setLimit(10); }}
                  style={{
                    padding: '0.5rem 1.25rem', borderRadius: 'var(--radius-full)', border: '2px solid',
                    borderColor: status === s ? 'transparent' : 'var(--border-color)',
                    background: status === s ? 'linear-gradient(135deg, var(--primary-mint), var(--primary-teal))' : '#fff',
                    color: status === s ? '#fff' : 'var(--text-secondary)',
                    fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s'
                  }}
                >{s}</button>
              ))}
            </div>
          </div>

          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-secondary)', padding: '0.4rem', borderRadius: 'var(--radius-xl)', border: '2px solid var(--border-color)' }}>
            <select className="adm-select" value={searchField} onChange={(e) => setSearchField(e.target.value)} style={{ border: 'none', background: 'transparent', padding: '0 1rem', fontWeight: 700, color: 'var(--primary-dark-teal)', outline: 'none' }}>
              <option>전체</option><option>사업자번호</option><option>관리자아이디</option><option>병원명</option><option>진료과</option><option>전화번호</option>
            </select>
            <input className="adm-input" placeholder="검색어를 입력해주세요..." value={keyword} onChange={(e) => setKeyword(e.target.value)} style={{ flex: 1, border: 'none', background: 'transparent', height: '40px', outline:'none' }} />
            <button style={{ background: 'var(--primary-mint)', color: '#fff', border: 'none', width: '40px', height: '40px', borderRadius: 'var(--radius-lg)', cursor: 'pointer' }}><i className="fas fa-search" /></button>
          </div>
        </div>
      </div>

      {/* 🟢 데이터 테이블 */}
      <div className="adm-table-wrap">
        <div style={{ padding: '1.25rem 1.5rem', background: '#fff', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-secondary)' }}>검색 결과 <span style={{ color: 'var(--primary-teal)' }}>{filtered.length}</span>건</span>
          <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600 }}><i className="fas fa-download" style={{marginRight: '4px'}}/> 엑셀 다운로드</button>
        </div>
        
        <table className="adm-table" style={{ tableLayout: 'fixed', width: '100%', minWidth: '1300px' }}>
          <thead>
            <tr>
              <th style={{width: '60px', textAlign: 'center'}}>NO.</th>
              <th style={{width: '140px', textAlign: 'left'}}>사업자번호</th>
              <th style={{width: '120px', textAlign: 'left'}}>관리자 ID</th>
              <th style={{width: '200px', textAlign: 'left'}}>병원명</th>
              <th style={{width: '100px', textAlign: 'center'}}>진료과</th>
              <th style={{width: '140px', textAlign: 'left'}}>전화번호</th>
              <th style={{width: '80px', textAlign: 'center'}}>알림</th>
              <th style={{width: '120px', textAlign: 'center'}}>가입일</th>
              <th style={{width: '150px', textAlign: 'center'}}>승인상태</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, limit).map((r, idx) => (
              <tr key={r.id} style={{ height: '72px' }}>
                <td style={{textAlign: 'center', color: 'var(--text-muted)'}}>{idx + 1}</td>
                <td style={{textAlign: 'left'}}>{r.bizNo}</td>
                <td style={{textAlign: 'left', fontWeight: 800, color: 'var(--primary-teal)'}}>{r.adminId}</td>
                <td style={{textAlign: 'left', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{r.hospitalName}</td>
                <td style={{textAlign: 'center'}}><span style={{ padding: '0.2rem 0.6rem', background: 'var(--bg-tertiary)', color: 'var(--primary-dark-teal)', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>{r.department}</span></td>
                <td style={{textAlign: 'left'}}>{r.phone}</td>
                <td style={{textAlign: 'center'}}>
                  <span className={`adm-badge ${r.alertAllowed ? "adm-on" : "adm-off"}`} style={{ width: '45px', display: 'inline-block' }}>{r.alertAllowed ? "ON" : "OFF"}</span>
                </td>
                <td style={{textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem'}}>{r.firstJoinedAt}</td>
                <td style={{textAlign: 'center', padding: '0'}}>
                  <div style={{ width: '100px', height: '34px', margin: '0 auto' }}>
                    {r.approveStatus === "승인요청" ? (
                      <button 
                        onClick={() => handleApprove(r.id)}
                        style={{ width: '100%', height: '100%', background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}
                      >승인처리</button>
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-teal)', fontWeight: 800, fontSize: '0.85rem' }}>
                        <i className="fas fa-check-circle" style={{marginRight: '5px'}}/> 승인완료
                      </div>
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
              onClick={handleLoadMore}
              style={{ 
                background: '#fff', border: '2px solid var(--primary-mint)', padding: '0.75rem 3rem', borderRadius: 'var(--radius-lg)', 
                color: 'var(--primary-teal)', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.3s',
                display: 'inline-flex', alignItems: 'center', gap: '10px'
              }}
              onMouseOver={(e) => { e.target.style.background = 'var(--bg-secondary)'; e.target.style.transform = 'translateY(-2px)'; }}
              onMouseOut={(e) => { e.target.style.background = '#fff'; e.target.style.transform = 'translateY(0)'; }}
            >
              더보기 ({Math.min(limit, filtered.length)}/{filtered.length}) <i className="fas fa-chevron-down"/>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}