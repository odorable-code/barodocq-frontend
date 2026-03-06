import { useEffect, useMemo, useState } from "react";
import { authFetch } from "../utils/AuthFetch";
import "../assets/styles/AdminReviews.css";

/* ── 별점 컴포넌트 ── */
const StarRating = ({ rating }) => {
  const r = Number(rating) || 0;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        justifyContent: "center",
      }}
    >
      <div style={{ display: "flex", gap: "2px" }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <i
            key={i}
            className="fas fa-star"
            style={{
              color: i <= Math.round(r) ? "#f59e0b" : "#e5e7eb",
              fontSize: "0.85rem",
            }}
          />
        ))}
      </div>
      <span
        style={{
          fontSize: "0.82rem",
          fontWeight: 700,
          color: "var(--text-secondary)",
        }}
      >
        {r.toFixed(1)}
      </span>
    </div>
  );
};

export default function AdminReviews() {
  const [dataList, setDataList] = useState([]);
  const [statusFilter, setStatusFilter] = useState("전체");
  const [activeSort, setActiveSort] = useState("latest");
  const [keyword, setKeyword] = useState("");
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  const loadReviews = async () => {
    try {
      setLoading(true);
      setLoadError("");

      const res = await authFetch("http://localhost:8080/api/v1/admin/reviews");
      const data = await res.json();
      setDataList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("후기 로드 실패", err);
      setLoadError("후기 목록을 불러오지 못했습니다.");
      setDataList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleToggleDelete = async (rvNum, currentStatus) => {
    const action = currentStatus === 1 ? "복구" : "삭제";
    if (!window.confirm(`해당 후기를 ${action}하시겠습니까?`)) return;

    try {
      await authFetch(
        `http://localhost:8080/api/v1/admin/reviews/${rvNum}/status`,
        { method: "PUT" }
      );
      loadReviews();
    } catch (err) {
      console.error(err);
      alert("처리 중 오류가 발생했습니다.");
    }
  };

  const finalFiltered = useMemo(() => {
    let result = dataList.filter((row) => {
      const matchStatus =
        statusFilter === "전체"
          ? true
          : statusFilter === "삭제"
            ? row.rvDeletedYn === 1
            : row.rvDeletedYn === 0;

      if (!matchStatus) return false;

      const kw = keyword.toLowerCase().trim();
      if (!kw) return true;

      return (
        String(row.hoName ?? "").toLowerCase().includes(kw) ||
        String(row.rvTitle ?? "").toLowerCase().includes(kw) ||
        String(row.userId ?? "").toLowerCase().includes(kw)
      );
    });

    if (activeSort === "latest") {
      result.sort((a, b) => (b.rvNum ?? 0) - (a.rvNum ?? 0));
    }
    if (activeSort === "popular") {
      result.sort((a, b) => (b.rvViewCount ?? 0) - (a.rvViewCount ?? 0));
    }

    return result;
  }, [dataList, keyword, statusFilter, activeSort]);

  return (
    <div className="adm-page">
      {/* 헤더 */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: "2.5rem",
        }}
      >
        <div>
          <div
            style={{
              color: "var(--text-muted)",
              fontSize: "0.85rem",
              fontWeight: 600,
              marginBottom: "0.5rem",
            }}
          >
            <i className="fas fa-home" style={{ marginRight: "4px" }} />
            게시글관리
            <i
              className="fas fa-chevron-right"
              style={{ fontSize: ".6rem", margin: "0 6px" }}
            />
            <span style={{ color: "var(--primary-teal)" }}>병원 후기</span>
          </div>

          <h1 className="adm-page-title" style={{ marginBottom: 0 }}>
            후기 <span>관리</span>
          </h1>
        </div>

        <button
          onClick={loadReviews}
          disabled={loading}
          style={{
            border: "none",
            padding: "10px 14px",
            borderRadius: "var(--radius-lg)",
            cursor: loading ? "not-allowed" : "pointer",
            background: loading ? "var(--bg-secondary)" : "var(--primary-mint)",
            color: loading ? "var(--text-muted)" : "#fff",
            fontWeight: 800,
          }}
        >
          <i className="fas fa-rotate-right" style={{ marginRight: 8 }} />
          {loading ? "불러오는 중..." : "새로고침"}
        </button>
      </div>

      {/* 에러 */}
      {loadError && (
        <div
          className="adm-card"
          style={{
            padding: "1rem 1.25rem",
            marginBottom: "1rem",
            borderLeft: "5px solid #ef4444",
            color: "#b91c1c",
            fontWeight: 700,
          }}
        >
          {loadError}
        </div>
      )}

      {/* 필터 카드 */}
      <div className="adm-card" style={{ padding: "1.5rem 2rem", marginBottom: "1.5rem" }}>
        <div
          style={{
            display: "flex",
            gap: "1rem",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span
              style={{
                fontSize: "0.9rem",
                fontWeight: 800,
                color: "var(--text-secondary)",
              }}
            >
              상태
            </span>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {["전체", "정상", "삭제"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setStatusFilter(tab);
                    setLimit(10);
                  }}
                  style={{
                    padding: "0.5rem 1.1rem",
                    borderRadius: "var(--radius-full)",
                    border: "2px solid",
                    borderColor:
                      statusFilter === tab
                        ? "transparent"
                        : "var(--border-color)",
                    background:
                      statusFilter === tab
                        ? "linear-gradient(135deg, var(--primary-mint), var(--primary-teal))"
                        : "#fff",
                    color:
                      statusFilter === tab ? "#fff" : "var(--text-secondary)",
                    fontWeight: 700,
                    fontSize: "0.82rem",
                    cursor: "pointer",
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div
            style={{
              flex: 1,
              minWidth: "280px",
              display: "flex",
              background: "var(--bg-secondary)",
              padding: "0.4rem",
              borderRadius: "var(--radius-xl)",
              border: "2px solid var(--border-color)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "0 1rem",
                color: "var(--primary-teal)",
              }}
            >
              <i className="fas fa-search" />
            </div>

            <input
              className="adm-input"
              type="text"
              placeholder="작성자, 제목, 병원명 검색..."
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
                setLimit(10);
              }}
              style={{
                flex: 1,
                border: "none",
                background: "transparent",
                height: "40px",
                outline: "none",
              }}
            />

            {keyword && (
              <button
                onClick={() => {
                  setKeyword("");
                  setLimit(10);
                }}
                style={{
                  border: "none",
                  background: "transparent",
                  width: "40px",
                  cursor: "pointer",
                  color: "var(--text-muted)",
                }}
              >
                <i className="fas fa-xmark" />
              </button>
            )}
          </div>

          <div style={{ display: "flex", gap: "6px" }}>
            <button
              onClick={() => setActiveSort("latest")}
              style={{
                border: "none",
                background:
                  activeSort === "latest"
                    ? "var(--primary-mint)"
                    : "var(--bg-secondary)",
                color: activeSort === "latest" ? "#fff" : "var(--text-secondary)",
                padding: "8px 12px",
                borderRadius: "var(--radius-full)",
                fontSize: "0.75rem",
                fontWeight: 800,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              <i className="fas fa-clock" style={{ marginRight: 6 }} />
              최신순
            </button>

            <button
              onClick={() => setActiveSort("popular")}
              style={{
                border: "none",
                background:
                  activeSort === "popular"
                    ? "var(--primary-mint)"
                    : "var(--bg-secondary)",
                color: activeSort === "popular" ? "#fff" : "var(--text-secondary)",
                padding: "8px 12px",
                borderRadius: "var(--radius-full)",
                fontSize: "0.75rem",
                fontWeight: 800,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              <i className="fas fa-fire" style={{ marginRight: 6 }} />
              조회수순
            </button>
          </div>
        </div>
      </div>

      {/* 테이블 */}
      <div className="adm-table-wrap" style={{ overflowX: "auto" }}>
        <div
          style={{
            padding: "1.25rem 1.5rem",
            background: "#fff",
            borderBottom: "1px solid var(--border-color)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontSize: "0.9rem",
              fontWeight: 700,
              color: "var(--text-secondary)",
            }}
          >
            검색 결과{" "}
            <span style={{ color: "var(--primary-teal)" }}>{finalFiltered.length}</span>건
            {keyword ? (
              <span
                style={{
                  marginLeft: 10,
                  fontSize: "0.8rem",
                  color: "var(--text-muted)",
                }}
              >
                "{keyword}" 검색 중
              </span>
            ) : null}
          </span>
        </div>

        <table
          className="adm-table"
          style={{ tableLayout: "fixed", width: "100%", minWidth: "1280px" }}
        >
          <thead>
            <tr>
              <th style={{ width: "60px", textAlign: "center" }}>NO.</th>
              <th style={{ width: "90px", textAlign: "center" }}>상태</th>
              <th style={{ width: "180px", textAlign: "center" }}>병원명</th>
              <th style={{ width: "110px", textAlign: "center" }}>작성자</th>
              <th style={{ width: "150px", textAlign: "center" }}>별점</th>
              <th style={{ width: "400px", textAlign: "center" }}>제목</th>
              <th style={{ width: "80px", textAlign: "center" }}>사진</th>
              <th style={{ width: "130px", textAlign: "center" }}>등록일</th>
              <th style={{ width: "80px", textAlign: "center" }}>조회</th>
              <th style={{ width: "100px", textAlign: "center" }}>관리</th>
            </tr>
          </thead>

          <tbody>
            {!loading && finalFiltered.length === 0 ? (
              <tr>
                <td
                  colSpan={10}
                  style={{
                    textAlign: "center",
                    padding: "2.5rem 1rem",
                    color: "var(--text-muted)",
                    fontWeight: 700,
                  }}
                >
                  표시할 후기가 없습니다.
                </td>
              </tr>
            ) : (
              finalFiltered.slice(0, limit).map((r, idx) => (
                <tr key={r.rvNum} style={{ height: "70px" }}>
                  <td style={{ textAlign: "center", color: "var(--text-muted)" }}>
                    {idx + 1}
                  </td>

                  <td style={{ textAlign: "center" }}>
                    <span className={`adm-badge ${r.rvDeletedYn === 1 ? "adm-off" : "adm-on"}`}>
                      {r.rvDeletedYn === 1 ? "삭제됨" : "정상"}
                    </span>
                  </td>

                  <td style={{ textAlign: "center", fontWeight: 700 }}>
                    {r.hoName || "-"}
                  </td>

                  <td style={{ textAlign: "center" }}>
                    {r.userId || "-"}
                  </td>

                  <td style={{ textAlign: "center" }}>
                    <StarRating rating={r.rvRating} />
                  </td>

                  <td
                    style={{
                      textAlign: "left",
                      fontWeight: 600,
                      color: "var(--text-secondary)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                    title={r.rvTitle}
                  >
                    {r.rvTitle || "-"}
                  </td>

                  <td style={{ textAlign: "center" }}>
                    {r.fileCount > 0 ? (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          padding: "4px 10px",
                          borderRadius: "999px",
                          background: "#eff6ff",
                          color: "#2563eb",
                          fontWeight: 700,
                          fontSize: "0.75rem",
                          border: "1px solid #bfdbfe",
                        }}
                      >
                        <i className="fas fa-image" />
                        {r.fileCount}
                      </span>
                    ) : (
                      <span style={{ color: "var(--text-muted)" }}>—</span>
                    )}
                  </td>

                  <td
                    style={{
                      textAlign: "center",
                      color: "var(--text-muted)",
                      fontSize: "0.82rem",
                    }}
                  >
                    {String(r.rvCreatedAt ?? "").slice(0, 10) || "-"}
                  </td>

                  <td style={{ textAlign: "center" }}>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        color: "var(--text-secondary)",
                        fontWeight: 700,
                        fontSize: "0.82rem",
                      }}
                    >
                      <i className="fas fa-eye" />
                      {r.rvViewCount ?? 0}
                    </span>
                  </td>

                  <td style={{ textAlign: "center" }}>
                    <button
                      onClick={() => handleToggleDelete(r.rvNum, r.rvDeletedYn)}
                      style={{
                        minWidth: "70px",
                        height: "32px",
                        background: r.rvDeletedYn === 1 ? "#dcfce7" : "#fee2e2",
                        color: r.rvDeletedYn === 1 ? "#16a34a" : "#dc2626",
                        border: r.rvDeletedYn === 1
                          ? "1px solid #86efac"
                          : "1px solid #fca5a5",
                        borderRadius: "6px",
                        fontWeight: 800,
                        cursor: "pointer",
                      }}
                    >
                      {r.rvDeletedYn === 1 ? "복구" : "삭제"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {finalFiltered.length > limit && (
          <div
            style={{
              padding: "1.5rem",
              display: "flex",
              justifyContent: "center",
              background: "#fff",
              borderTop: "1px solid var(--border-color)",
            }}
          >
            <button
              onClick={() => setLimit((l) => l + 10)}
              style={{
                border: "none",
                background: "var(--bg-secondary)",
                color: "var(--text-secondary)",
                padding: "10px 16px",
                borderRadius: "var(--radius-full)",
                fontSize: "0.82rem",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              <i className="fas fa-chevron-down" style={{ marginRight: 6 }} />
              더보기 ({finalFiltered.length - limit}건 남음)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}