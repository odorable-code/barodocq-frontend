
import { useEffect, useMemo, useState } from "react";
import { authFetch } from "../utils/AuthFetch";

export default function AdminReviews() {
  const [dataList, setDataList] = useState([]);
  const [statusFilter, setStatusFilter] = useState("전체");
  const [activeSort, setActiveSort] = useState("latest"); // 정렬 상태 추가
  const [keyword, setKeyword] = useState("");
  const [limit, setLimit] = useState(10);

  // 1. 데이터 불러오기
  const loadReviews = async () => {
    try {
      const res = await authFetch("http://localhost:8080/api/v1/admin/reviews");
      const data = await res.json();
      setDataList(data);
    } catch (err) {
      console.error("후기 로드 실패", err);
    }
  };

  useEffect(() => { loadReviews(); }, []);

  // 2. 삭제/복구 처리
  const handleToggleDelete = async (rvNum, currentStatus) => {
    const action = currentStatus === 1 ? "복구" : "삭제";
    if (!window.confirm(`해당 후기를 ${action}하시겠습니까?`)) return;

    try {
      await authFetch(`http://localhost:8080/api/v1/admin/reviews/${rvNum}/status`, {
        method: "PUT"
      });
      loadReviews(); 
    } catch (err) {
      alert("처리 중 오류가 발생했습니다.");
    }
  };

  // 3. 필터링 + 검색 + 정렬 통합 로직
  const finalFiltered = useMemo(() => {
    // A. 상태 필터 및 검색
    let result = dataList.filter((row) => {
      const isMatchStatus = statusFilter === "전체" ? true : 
                            statusFilter === "삭제" ? row.rvDeletedYn === 1 : row.rvDeletedYn === 0;
      if (!isMatchStatus) return false;

      const kw = keyword.toLowerCase().trim();
      return row.hoName.toLowerCase().includes(kw) || 
             row.rvTitle.toLowerCase().includes(kw) || 
             row.userId.toLowerCase().includes(kw);
    });

    // B. 정렬 적용
    if (activeSort === "latest") {
      result.sort((a, b) => b.rvNum - a.rvNum); // 최신순 (PK 기준)
    } else if (activeSort === "popular") {
      result.sort((a, b) => b.rvViewCount - a.rvViewCount); // 조회수순
    }

    return result;
  }, [dataList, keyword, statusFilter, activeSort]);

  return (
    <div className="adm-page">
      {/* ── 상단 툴바 ── */}
      <div className="rv-toolbar">
        <div className="rv-toolbar__left">
          <div className="rv-tabs">
            {["전체", "정상", "삭제"].map(tab => (
              <button
                key={tab}
                className={`rv-sort__btn ${statusFilter === tab ? "active" : ""}`}
                onClick={() => { setStatusFilter(tab); setLimit(10); }}
              >
                {tab}
              </button>
            ))}
          </div>
          
          <div className="rv-search">
            <input 
              type="text" 
              placeholder="작성자, 제목, 병원명 검색..." 
              value={keyword}
              onChange={(e) => { setKeyword(e.target.value); setLimit(10); }}
            />
            <i className="fas fa-search" />
          </div>
        </div>

        <div className="rv-toolbar__right">
          <div className="rv-sort">
            <button 
              className={`rv-sort__btn ${activeSort === "latest" ? "active" : ""}`}
              onClick={() => setActiveSort("latest")}
            >
              <i className="fas fa-clock" /> 최신순
            </button>
            <button 
              className={`rv-sort__btn ${activeSort === "popular" ? "active" : ""}`}
              onClick={() => setActiveSort("popular")}
            >
              <i className="fas fa-fire" /> 조회수순
            </button>
          </div>
        </div>
      </div>

      <div className="rv-result-bar">
        <span className="rv-result-bar__count">
          검색 결과 <strong>{finalFiltered.length}</strong>건
        </span>
      </div>

      {/* ── 테이블 영역 ── */}
      <div className="adm-table-wrap">
        <table className="adm-table" style={{ width: '100%', minWidth: '1200px' }}>
          <thead>
            <tr>
              <th>NO.</th>
              <th>상태</th>
              <th>병원명</th>
              <th>작성자</th>
              <th>별점</th>
              <th>제목</th>
              <th>사진</th>
              <th>등록일</th>
              <th>조회</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {finalFiltered.slice(0, limit).map((r, idx) => (
              <tr key={r.rvNum} style={{ opacity: r.rvDeletedYn === 1 ? 0.6 : 1, backgroundColor: r.rvDeletedYn === 1 ? '#f8f9fa' : 'white' }}>
                <td>{idx + 1}</td>
                <td>
                  <span className={`adm-badge ${r.rvDeletedYn === 1 ? "adm-off" : "adm-on"}`}>
                    {r.rvDeletedYn === 1 ? "삭제됨" : "정상"}
                  </span>
                </td>
                <td style={{ fontWeight: 700 }}>{r.hoName}</td>
                <td>{r.userId}</td>
                <td style={{ color: '#f59e0b' }}>★{r.rvRating}</td>
                <td>{r.rvTitle}</td>
                <td>{r.fileCount > 0 ? <span><i className="fas fa-image" /> {r.fileCount}</span> : "-"}</td>
                <td>{r.rvCreatedAt?.substring(0, 10)}</td>
                <td>{r.rvViewCount}</td>
                <td>
                  <button 
                    className={r.rvDeletedYn === 1 ? "adm-btn-restore" : "adm-btn-delete"}
                    onClick={() => handleToggleDelete(r.rvNum, r.rvDeletedYn)}
                  >
                    {r.rvDeletedYn === 1 ? "복구" : "삭제"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* 더보기 버튼 */}
        {finalFiltered.length > limit && (
          <div className="adm-more-view">
            <button onClick={() => setLimit(limit + 10)}>더보기 (More)</button>
          </div>
        )}
      </div>
    </div>
  );
}