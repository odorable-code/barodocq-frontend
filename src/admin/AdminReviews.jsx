import { useEffect, useMemo, useState } from "react";
import { authFetch } from "../utils/AuthFetch";
import "../assets/styles/AdminReviews.css";

/* ── 별점 컴포넌트 ── */
const StarRating = ({ rating }) => {
  const r = Number(rating) || 0;
  return (
    <div className="rv-star">
      {[1, 2, 3, 4, 5].map(i => (
        <i key={i} className={`fas fa-star ${i <= r ? "rv-star--on" : "rv-star--off"}`} />
      ))}
      <span className="rv-star__label">{r.toFixed(1)}</span>
    </div>
  );
};

export default function AdminReviews() {
  const [dataList, setDataList]         = useState([]);
  const [statusFilter, setStatusFilter] = useState("전체");
  const [activeSort, setActiveSort]     = useState("latest");
  const [keyword, setKeyword]           = useState("");
  const [limit, setLimit]               = useState(10);

  const loadReviews = async () => {
    try {
      const res  = await authFetch("http://localhost:8080/api/v1/admin/reviews");
      const data = await res.json();
      setDataList(data);
    } catch (err) {
      console.error("후기 로드 실패", err);
    }
  };

  useEffect(() => { loadReviews(); }, []);

  const handleToggleDelete = async (rvNum, currentStatus) => {
    const action = currentStatus === 1 ? "복구" : "삭제";
    if (!window.confirm(`해당 후기를 ${action}하시겠습니까?`)) return;
    try {
      await authFetch(
        `http://localhost:8080/api/v1/admin/reviews/${rvNum}/status`,
        { method: "PUT" }
      );
      loadReviews();
    } catch {
      alert("처리 중 오류가 발생했습니다.");
    }
  };

  const finalFiltered = useMemo(() => {
    let result = dataList.filter(row => {
      const matchStatus =
        statusFilter === "전체" ? true :
        statusFilter === "삭제" ? row.rvDeletedYn === 1 :
                                  row.rvDeletedYn === 0;
      if (!matchStatus) return false;

      const kw = keyword.toLowerCase().trim();
      if (!kw) return true;
      return (
        row.hoName?.toLowerCase().includes(kw)  ||
        row.rvTitle?.toLowerCase().includes(kw) ||
        row.userId?.toLowerCase().includes(kw)
      );
    });

    if (activeSort === "latest")  result.sort((a, b) => b.rvNum - a.rvNum);
    if (activeSort === "popular") result.sort((a, b) => b.rvViewCount - a.rvViewCount);
    return result;
  }, [dataList, keyword, statusFilter, activeSort]);

  return (
    <div className="adm-page">

      {/* ── 툴바 ── */}
      <div className="rv-toolbar">
        <div className="rv-toolbar__left">
          <div className="rv-tabs">
            {["전체", "정상", "삭제"].map(tab => (
              <button
                key={tab}
                className={`rv-tab-btn ${statusFilter === tab ? "active" : ""}`}
                onClick={() => { setStatusFilter(tab); setLimit(10); }}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="rv-search">
            <i className="fas fa-search rv-search__icon" />
            <input
              type="text"
              placeholder="작성자, 제목, 병원명 검색..."
              value={keyword}
              onChange={e => { setKeyword(e.target.value); setLimit(10); }}
            />
            {keyword && (
              <button className="rv-search__clear" onClick={() => { setKeyword(""); setLimit(10); }}>
                <i className="fas fa-xmark" />
              </button>
            )}
          </div>
        </div>
        <div className="rv-toolbar__right">
          <div className="rv-sort">
            <button className={`rv-sort-btn ${activeSort === "latest"  ? "active" : ""}`} onClick={() => setActiveSort("latest")}>
              <i className="fas fa-clock" /> 최신순
            </button>
            <button className={`rv-sort-btn ${activeSort === "popular" ? "active" : ""}`} onClick={() => setActiveSort("popular")}>
              <i className="fas fa-fire" /> 조회수순
            </button>
          </div>
        </div>
      </div>

      {/* ── 결과 바 ── */}
      <div className="rv-result-bar">
        <span>검색 결과 <strong>{finalFiltered.length}</strong>건</span>
        {keyword && (
          <span className="rv-result-keyword">
            "<strong>{keyword}</strong>" 검색 중
          </span>
        )}
      </div>

      {/* ── 테이블 ── */}
      {/* 글로벌 .adm-table-wrap 유지, 가로스크롤만 .rv-table-scroll로 분리 */}
      <div className="adm-table-wrap">
        <div className="rv-table-scroll">
          <table className="adm-table rv-table">
            <thead>
              <tr>
                <th style={{ width: "52px"  }}>NO.</th>
                <th style={{ width: "80px"  }}>상태</th>
                <th>병원명</th>
                <th style={{ width: "110px" }}>작성자</th>
                <th style={{ width: "120px" }}>별점</th>
                <th>제목</th>
                <th style={{ width: "70px"  }}>사진</th>
                <th style={{ width: "100px" }}>등록일</th>
                <th style={{ width: "70px"  }}>조회</th>
                <th style={{ width: "90px"  }}>관리</th>
              </tr>
            </thead>
            <tbody>
              {finalFiltered.slice(0, limit).map((r, idx) => (
                <tr key={r.rvNum} className={r.rvDeletedYn === 1 ? "rv-row--deleted" : ""}>
                  <td className="td-muted td-center">{idx + 1}</td>
                  <td>
                    {/* 글로벌 .adm-badge + .adm-on/.adm-off 그대로 사용 */}
                    <span className={`adm-badge ${r.rvDeletedYn === 1 ? "adm-off" : "adm-on"}`}>
                      {r.rvDeletedYn === 1 ? "삭제됨" : "정상"}
                    </span>
                  </td>
                  <td className="td-bold">{r.hoName}</td>
                  <td>{r.userId}</td>
                  <td><StarRating rating={r.rvRating} /></td>
                  <td className="td-ellipsis">{r.rvTitle}</td>
                  <td className="td-center">
                    {r.fileCount > 0
                      ? <span className="rv-file-chip"><i className="fas fa-image" /> {r.fileCount}</span>
                      : <span className="td-dash">—</span>
                    }
                  </td>
                  <td className="td-muted">{r.rvCreatedAt?.substring(0, 10)}</td>
                  <td className="td-center">
                    <span className="rv-view-count"><i className="fas fa-eye" /> {r.rvViewCount}</span>
                  </td>
                  <td className="td-center">
                    <button
                      className={`rv-action-btn ${r.rvDeletedYn === 1 ? "restore" : "delete"}`}
                      onClick={() => handleToggleDelete(r.rvNum, r.rvDeletedYn)}
                    >
                      {r.rvDeletedYn === 1
                        ? <><i className="fas fa-rotate-left" /> 복구</>
                        : <><i className="fas fa-trash" /> 삭제</>
                      }
                    </button>
                  </td>
                </tr>
              ))}

              {finalFiltered.length === 0 && (
                <tr>
                  <td colSpan="10" className="rv-td-empty">
                    <i className="fas fa-inbox" />
                    <p>검색 결과가 없습니다</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {finalFiltered.length > limit && (
          <div className="rv-load-more">
            <button className="rv-btn-ghost" onClick={() => setLimit(l => l + 10)}>
              <i className="fas fa-chevron-down" /> 더보기 ({finalFiltered.length - limit}건 남음)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
