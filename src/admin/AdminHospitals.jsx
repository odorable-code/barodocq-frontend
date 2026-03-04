import { useMemo, useState } from "react";

const STATUS_OPTIONS = ["전체", "영업중", "휴무"];

// 초기 더미 데이터
const INITIAL_DUMMY = Array.from({ length: 25 }).map((_, i) => ({
  id: i + 1, 
  hospitalName: i % 2 === 0 ? "바로닥큐 병원" : "클린페이 의원", 
  department: i % 3 === 0 ? "내과" : i % 3 === 1 ? "피부과" : "정형외과",
  openTime: i % 6 === 0 ? "-" : i % 4 === 0 ? "09:00" : "10:00", 
  closeTime: i % 6 === 0 ? "-" : i % 4 === 0 ? "22:00" : "18:00",
  lunchStart: i % 6 === 0 ? "-" : "13:00", 
  lunchEnd: i % 6 === 0 ? "-" : "14:00", 
  nightYn: i % 4 === 0, 
  holidayYn: i % 5 === 0,
  lastUpdatedAt: "2026.03.03", 
  openYn: !(i % 6 === 0),
}));

export default function AdminHospitals() {
  const [dataList] = useState(INITIAL_DUMMY);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("전체");
  const [searchField, setSearchField] = useState("전체");
  const [limit, setLimit] = useState(10); // 더보기 기능을 위한 상태

  // ✅ [기능] 더보기 함수
  const handleLoadMore = () => {
    setLimit(prev => prev + 5);
  };

  // ✅ 검색 및 필터링 로직
  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return dataList.filter((row) => {
      // 상태 필터 (영업중/휴무)
      const hitStatus = status === "전체" ? true : status === "영업중" ? row.openYn : !row.openYn;
      if (!hitStatus) return false;
      if (kw === "") return true;

      const searchValues = {
        전체: [row.hospitalName, row.department, row.openTime, row.closeTime],
        병원명: [row.hospitalName], 
        진료과목: [row.department], 
        오픈시간: [row.openTime],
      };
      
      const targets = searchValues[searchField] || searchValues["전체"];
      return targets.some(v => String(v).toLowerCase().includes(kw));
    });
  }, [dataList, keyword, status, searchField]);

  return (
    <div className="adm-page">
      {/* 🟢 상단 헤더 영역 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
        <div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            <i className="fas fa-home" style={{marginRight: '4px'}}/> 병원관리 <i className="fas fa-chevron-right" style={{fontSize:'.6rem', margin:'0 6px'}}/> <span style={{color: 'var(--primary-teal)'}}>전체 병원 정보</span>
          </div>
          <h1 className="adm-page-title" style={{marginBottom: 0}}>전체 병원 <span>정보</span></h1>
        </div>
        <button className="adm-th-btn" style={{ background: 'linear-gradient(135deg, var(--primary-mint), var(--primary-teal))', color: '#fff', border:'none', padding: '0.8rem 1.5rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-mint)', cursor:'pointer' }}>
          <i className="fas fa-plus-circle" style={{marginRight: '8px'}}/> 신규 병원 등록
        </button>
      </div>

      {/* 🟢 검색 및 필터 카드 */}
      <div className="adm-card" style={{ padding: '1.5rem 2rem' }}>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-secondary)' }}>영업상태</span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {STATUS_OPTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => { setStatus(s); setLimit(10); }}
                  style={{
                    width: '90px', height: '38px', borderRadius: 'var(--radius-full)', border: '2px solid',
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
              <option>전체</option><option>병원명</option><option>진료과목</option><option>오픈시간</option>
            </select>
            <input className="adm-input" placeholder="병원명 또는 진료과목을 검색하세요..." value={keyword} onChange={(e) => setKeyword(e.target.value)} style={{ flex: 1, border: 'none', background: 'transparent', height: '40px', outline:'none' }} />
            <button style={{ background: 'var(--primary-mint)', color: '#fff', border: 'none', width: '40px', height: '40px', borderRadius: 'var(--radius-lg)', cursor: 'pointer' }}><i className="fas fa-search" /></button>
          </div>
        </div>
      </div>

      {/* 🟢 데이터 테이블 (너비/정렬 최적화) */}
      <div className="adm-table-wrap" style={{ overflowX: 'auto' }}>
        <div style={{ padding: '1.25rem 1.5rem', background: '#fff', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-secondary)' }}>전체 병원 리스트 <span style={{ color: 'var(--primary-teal)' }}>{filtered.length}</span>건</span>
          <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600 }}><i className="fas fa-file-excel" style={{marginRight: '4px'}}/> 엑셀 내보내기</button>
        </div>
        
        <table className="adm-table" style={{ tableLayout: 'fixed', width: '100%', minWidth: '1400px' }}>
          <thead>
            <tr>
              <th style={{width: '60px', textAlign: 'center'}}>NO.</th>
              <th style={{width: '180px', textAlign: 'left'}}>병원명</th>
              <th style={{width: '110px', textAlign: 'center'}}>진료과목</th>
              <th style={{width: '100px', textAlign: 'center'}}>오픈</th>
              <th style={{width: '100px', textAlign: 'center'}}>종료</th>
              <th style={{width: '100px', textAlign: 'center'}}>점심(시작)</th>
              <th style={{width: '100px', textAlign: 'center'}}>점심(종료)</th>
              <th style={{width: '100px', textAlign: 'center'}}>야간진료</th>
              <th style={{width: '100px', textAlign: 'center'}}>공휴일진료</th>
              <th style={{width: '130px', textAlign: 'center'}}>정보수정일</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, limit).map((r, idx) => (
              <tr key={r.id} style={{ height: '68px' }}>
                <td style={{textAlign: 'center', color: 'var(--text-muted)'}}>{idx + 1}</td>
                <td style={{textAlign: 'left', fontWeight: 800, color: 'var(--primary-teal)'}}>{r.hospitalName}</td>
                <td style={{textAlign: 'center'}}>
                  <span style={{ padding: '0.2rem 0.6rem', background: 'var(--bg-tertiary)', color: 'var(--primary-dark-teal)', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>{r.department}</span>
                </td>
                <td style={{textAlign: 'center', fontWeight: 600}}>{r.openTime}</td>
                <td style={{textAlign: 'center', fontWeight: 600}}>{r.closeTime}</td>
                <td style={{textAlign: 'center', color: 'var(--text-muted)'}}>{r.lunchStart}</td>
                <td style={{textAlign: 'center', color: 'var(--text-muted)'}}>{r.lunchEnd}</td>
                <td style={{textAlign: 'center'}}>
                  <span className={`adm-badge ${r.nightYn ? "adm-on" : "adm-off"}`} style={{ width: '45px', display: 'inline-block' }}>{r.nightYn ? "YES" : "NO"}</span>
                </td>
                <td style={{textAlign: 'center'}}>
                  <span className={`adm-badge ${r.holidayYn ? "adm-on" : "adm-off"}`} style={{ width: '45px', display: 'inline-block' }}>{r.holidayYn ? "YES" : "NO"}</span>
                </td>
                <td style={{textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem'}}>{r.lastUpdatedAt}</td>
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
                background: '#fff', border: '2px solid var(--primary-mint)', padding: '0.8rem 3.5rem', borderRadius: 'var(--radius-lg)', 
                color: 'var(--primary-teal)', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.3s',
                display: 'inline-flex', alignItems: 'center', gap: '10px'
              }}
              onMouseOver={(e) => { e.currentTarget.style.background = 'var(--bg-secondary)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseOut={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              병원 정보 더보기 ({Math.min(limit, filtered.length)}/{filtered.length}) <i className="fas fa-chevron-down"/>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}