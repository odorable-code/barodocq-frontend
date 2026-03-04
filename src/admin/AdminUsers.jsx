import { useMemo, useState } from "react";

const GENDER_OPTIONS = ["전체", "남", "여"];
const PAGE_SIZES = [20, 50, 100];

// 🟢 실제 작동 테스트를 위한 더미 데이터 생성
const INITIAL_USERS = Array.from({ length: 105 }).map((_, i) => ({
  userNum: i + 1,
  userId: `tester${String(i + 1).padStart(2, "0")}`,
  name: i % 3 === 0 ? "김철수" : i % 3 === 1 ? "이영희" : "박지성",
  birth: "1990-01-01",
  gender: i % 2 === 0 ? "남" : "여",
  address: "서울 강남구 테헤란로 123 바로닥큐 빌딩",
  phone: "010-1234-5678",
  email: `test${i + 1}@barodocq.com`,
  joinedAt: "2026-03-01",
  updatedAt: "2026-03-03",
  alertAllowed: i % 4 !== 0,
  kakaoLinked: i % 3 === 0
}));

export default function UserMembersPage() {
  const [usersRaw] = useState(INITIAL_USERS);
  const [keyword, setKeyword] = useState("");
  const [genderFilter, setGenderFilter] = useState("전체");
  const [searchField, setSearchField] = useState("전체");
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);

  // ✅ [기능] 검색 및 필터링 로직
  const filteredData = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return usersRaw.filter((row) => {
      const hitGender = genderFilter === "전체" ? true : row.gender === genderFilter;
      if (!hitGender) return false;
      if (!kw) return true;

      const searchValues = {
        전체: [row.userId, row.name, row.phone, row.email, row.address],
        아이디: [row.userId], 성함: [row.name], 전화번호: [row.phone],
        이메일: [row.email], 주소: [row.address],
      };
      const targets = searchValues[searchField] || searchValues["전체"];
      return targets.some(v => String(v ?? "").toLowerCase().includes(kw));
    });
  }, [usersRaw, keyword, genderFilter, searchField]);

  // ✅ [기능] 페이지네이션 데이터 슬라이싱
  const total = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(total / size));
  const pagedData = filteredData.slice((page - 1) * size, page * size);

  return (
    <div className="adm-page">
      {/* 🟢 헤더 영역 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
        <div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            <i className="fas fa-home" style={{marginRight: '4px'}}/> 회원관리 <i className="fas fa-chevron-right" style={{fontSize:'.6rem', margin:'0 6px'}}/> <span style={{color: 'var(--primary-teal)'}}>사용자 회원관리</span>
          </div>
          <h1 className="adm-page-title" style={{marginBottom: 0}}>사용자 <span>회원관리</span></h1>
        </div>
      </div>

      {/* 🟢 검색 및 필터 카드 */}
      <div className="adm-card" style={{ padding: '1.5rem 2rem' }}>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-secondary)' }}>성별필터</span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {GENDER_OPTIONS.map((g) => (
                <button
                  key={g}
                  onClick={() => { setGenderFilter(g); setPage(1); }}
                  style={{
                    width: '80px', height: '38px', borderRadius: 'var(--radius-full)', border: '2px solid',
                    borderColor: genderFilter === g ? 'transparent' : 'var(--border-color)',
                    background: genderFilter === g ? 'linear-gradient(135deg, var(--primary-mint), var(--primary-teal))' : '#fff',
                    color: genderFilter === g ? '#fff' : 'var(--text-secondary)',
                    fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s'
                  }}
                >{g}</button>
              ))}
            </div>
          </div>

          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-secondary)', padding: '0.4rem', borderRadius: 'var(--radius-xl)', border: '2px solid var(--border-color)' }}>
            <select className="adm-select" value={searchField} onChange={(e) => setSearchField(e.target.value)} style={{ border: 'none', background: 'transparent', padding: '0 1rem', fontWeight: 700, color: 'var(--primary-dark-teal)', outline: 'none' }}>
              <option>전체</option><option>아이디</option><option>성함</option><option>전화번호</option><option>이메일</option><option>주소</option>
            </select>
            <input className="adm-input" placeholder="검색어를 입력해주세요..." value={keyword} onChange={(e) => { setKeyword(e.target.value); setPage(1); }} style={{ flex: 1, border: 'none', background: 'transparent', height: '40px', outline:'none' }} />
            <button style={{ background: 'var(--primary-mint)', color: '#fff', border: 'none', width: '40px', height: '40px', borderRadius: 'var(--radius-lg)', cursor: 'pointer' }}><i className="fas fa-search" /></button>
          </div>
        </div>
      </div>

      {/* 🟢 데이터 테이블 영역 */}
      <div className="adm-table-wrap">
        <div style={{ padding: '1.25rem 1.5rem', background: '#fff', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
            검색 결과 <span style={{ color: 'var(--primary-teal)' }}>{total}</span>건
          </span>
          <div style={{ display: 'flex', gap: '6px' }}>
            {PAGE_SIZES.map((n) => (
              <button key={n} onClick={() => { setSize(n); setPage(1); }} style={{
                border: 'none', background: n === size ? 'var(--primary-mint)' : 'var(--bg-secondary)', color: n === size ? '#fff' : 'var(--text-secondary)',
                padding: '5px 14px', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s'
              }}>{n}개씩</button>
            ))}
          </div>
        </div>

        <table className="adm-table" style={{ tableLayout: 'fixed', width: '100%', minWidth: '1500px' }}>
          <thead>
            <tr>
              <th style={{width: '60px', textAlign: 'center'}}>NO.</th>
              <th style={{width: '130px', textAlign: 'left'}}>아이디</th>
              <th style={{width: '100px', textAlign: 'left'}}>성함</th>
              <th style={{width: '110px', textAlign: 'center'}}>생년월일</th>
              <th style={{width: '80px', textAlign: 'center'}}>성별</th>
              <th style={{textAlign: 'left'}}>주소</th>
              <th style={{width: '140px', textAlign: 'left'}}>전화번호</th>
              <th style={{width: '180px', textAlign: 'left'}}>이메일</th>
              <th style={{width: '110px', textAlign: 'center'}}>가입일</th>
              <th style={{width: '90px', textAlign: 'center'}}>알림</th>
              <th style={{width: '80px', textAlign: 'center'}}>소셜</th>
            </tr>
          </thead>
          <tbody>
            {pagedData.map((r, idx) => (
              <tr key={r.userNum} style={{ height: '64px' }}>
                <td style={{textAlign: 'center', color: 'var(--text-muted)'}}>{(page - 1) * size + idx + 1}</td>
                <td style={{textAlign: 'left', fontWeight: 800, color: 'var(--primary-teal)'}}>{r.userId}</td>
                <td style={{textAlign: 'left', fontWeight: 700}}>{r.name}</td>
                <td style={{textAlign: 'center'}}>{r.birth}</td>
                <td style={{textAlign: 'center'}}>{r.gender}</td>
                <td style={{textAlign: 'left', fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{r.address}</td>
                <td style={{textAlign: 'left'}}>{r.phone}</td>
                <td style={{textAlign: 'left', fontSize: '0.85rem'}}>{r.email}</td>
                <td style={{textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-muted)'}}>{r.joinedAt}</td>
                <td style={{textAlign: 'center'}}>
                  <span className={`adm-badge ${r.alertAllowed ? "adm-on" : "adm-off"}`} style={{width: '55px'}}>{r.alertAllowed ? "ON" : "OFF"}</span>
                </td>
                <td style={{textAlign: 'center'}}>
                  {r.kakaoLinked ? <i className="fa-solid fa-comment" style={{color:'#FEE500', fontSize:'1.3rem', filter:'drop-shadow(0 1px 2px rgba(0,0,0,0.15))'}} title="Kakao"/> : <span style={{color:'var(--border-color)'}}>-</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* 🟢 세련된 페이지네이션 (Pagination) */}
        <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1.5rem', background: '#fff', borderTop: '1px solid var(--border-color)' }}>
          <button 
            disabled={page === 1} onClick={() => setPage(p => p - 1)}
            style={{ 
              width: '40px', height: '40px', borderRadius: 'var(--radius-md)', border: '2px solid var(--border-color)', 
              background: '#fff', color: 'var(--text-secondary)', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.4 : 1
            }}
          ><i className="fas fa-chevron-left"/></button>
          
          <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            <span style={{color: 'var(--primary-teal)'}}>{page}</span> / {totalPages}
          </span>

          <button 
            disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
            style={{ 
              width: '40px', height: '40px', borderRadius: 'var(--radius-md)', border: '2px solid var(--border-color)', 
              background: '#fff', color: 'var(--text-secondary)', cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.4 : 1
            }}
          ><i className="fas fa-chevron-right"/></button>
        </div>
      </div>
    </div>
  );
}