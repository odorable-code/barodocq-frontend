import { useEffect, useMemo, useState } from "react";
import { authFetch } from "../utils/AuthFetch";

const STATUS_OPTIONS = ["전체", "승인요청", "승인완료"];



export default function AdminAdmins() {
  const [dataList, setDataList] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("전체");
  const [searchField, setSearchField] = useState("전체");
  const [limit, setLimit] = useState(10);

  const thBase = { textAlign: "center", verticalAlign: "middle" };
  const tdBase = { textAlign: "center", verticalAlign: "middle" };

  const left = { textAlign: "left" }; // 필요한 컬럼만 덮어쓰기

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const resp = await authFetch("/api/v1/admin/admins");
        if (!resp.ok) throw new Error("관리자 목록 조회 실패");

        const rows = await resp.json();

        // ✅ 백엔드 -> 프론트 화면용으로 매핑
        const mapped = rows.map((r, idx) => ({
          id: r.adminNum ?? idx + 1,
          hoNum: r.hoNum,
          bizNo: r.businessNum,
          adminId: r.adminId,
          hospitalName: r.hoName,
          departments: r.departments || [],

          phone: r.adminPhone, // ✅ 너 테이블의 "전화번호"는 admin_phone 쓰는 게 자연스러움
          firstJoinedAt: formatDate(r.adminCreatedAt), // ✅ 아래 formatDate 함수 추가
          updatedAt: formatDate(r.adminUpdatedAt),

          // 승인상태는 DB 컬럼 없으면 일단 고정/임시로 처리
          approveStatus: r.approveStatus ?? "승인완료",
        }));

        setDataList(mapped);
      } catch (e) {
        console.error(e);
        // 실패 시 더미로라도 보여주고 싶으면:
        // setDataList(INITIAL_DUMMY);
      }
    };

    fetchAdmins();
  }, []);

  const formatDate = (isoString) => {
    if (!isoString) return "-";
    const d = new Date(isoString);
    if (Number.isNaN(d.getTime())) return "-";

    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}.${mm}.${dd}`;
  };

  const handleApprove = (id) => {
    if (!window.confirm("해당 회원을 승인하시겠습니까?")) return;
    setDataList((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, approveStatus: "승인완료", updatedAt: "2026.03.05" } // ✅ 예시로 수정일 갱신
          : item
      )
    );
  };

  const handleLoadMore = () => setLimit((prev) => prev + 5);

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();

    return dataList.filter((row) => {
      const hitStatus = status === "전체" ? true : row.approveStatus === status;
      if (!hitStatus) return false;
      if (kw === "") return true;

      const searchValues = {
        전체: [
          row.bizNo,
          row.adminId,
          row.hospitalName,
          ...(row.departments || []),
          row.phone,
          row.hoNum,
        ],
        사업자번호: [row.bizNo],
        관리자아이디: [row.adminId],
        병원명: [row.hospitalName],
        진료과: [...(row.departments || [])],
        전화번호: [row.phone],
      };

      const targets = searchValues[searchField] || searchValues["전체"];
      return targets.some((v) => String(v).toLowerCase().includes(kw));
    });
  }, [dataList, keyword, status, searchField]);

  // ✅ 진료과 렌더링 유틸 (최대 2개 + 초과 시 +N)
  const renderDeptBadges = (departments = []) => {
    const shown = departments.slice(0, 2);
    const extra = Math.max(0, departments.length - shown.length);

    return (
      //진료과 뱃지정렬
     <div style={{ 
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "4px"
      }}>
        {shown.map((name) => (
          <span
            key={name}
            style={{
              padding: "0.2rem 0.6rem",
              background: "var(--bg-tertiary)",
              color: "var(--primary-dark-teal)",
              borderRadius: "999px",
              fontSize: "0.75rem",
              fontWeight: 800,
              border: "1px solid var(--border-color)",
              lineHeight: 1.2,
              whiteSpace: "nowrap",
            }}
          >
            {name}
          </span>
        ))}

        {extra > 0 && (
          <span
            style={{
              padding: "0.2rem 0.55rem",
              background: "#fff",
              color: "var(--text-muted)",
              borderRadius: "999px",
              fontSize: "0.75rem",
              fontWeight: 900,
              border: "1px dashed var(--border-color)",
              lineHeight: 1.2,
              whiteSpace: "nowrap",
            }}
            title={departments.join(", ")}
          >
            +{extra}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="adm-page adm-admins-page">
      <style>{`
          /* === UserMembersPage 전용 스코프 === */
          .um-scope .um-table-wrap {
            background: #fff;
            border: 1px solid var(--border-color);
            border-radius: 16px;
            overflow: hidden;
          }

          /* 가로 스크롤은 테이블만 생기게 */
          .um-scope .um-table-scroll {
            overflow-x: auto;
          }

          .um-scope table.um-table {
            width: 100%;
            min-width: 1200px; /* ✅ 1500 -> 1200 정도로 줄여서 덜 찢어짐 */
            border-collapse: collapse;
            table-layout: fixed; /* 고정 유지 */
          }

          .um-scope table.um-table th,
          .um-scope table.um-table td {
            padding: 14px 12px;
            border-bottom: 1px solid var(--border-color);
            font-size: 0.9rem;
            vertical-align: middle;
          }

          .um-scope table.um-table thead th {
            background: rgba(20,184,166,0.06);
            font-weight: 900;
            color: var(--primary-dark-teal);
            white-space: nowrap;  /* ✅ 헤더 줄바꿈 방지 */
          }

          /* ✅ 날짜/전화/아이디 같은 건 절대 줄바꿈 금지 */
          .um-scope .um-nowrap {
            white-space: nowrap;
            word-break: keep-all;
          }

          /* ✅ 주소/이메일은 길면 ... 처리 */
          .um-scope .um-ellipsis {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .um-scope tbody tr:hover {
            background: rgba(20,184,166,0.04);
          }
        `}</style>
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
            <i className="fas fa-home" style={{ marginRight: "4px" }} /> 회원관리{" "}
            <i className="fas fa-chevron-right" style={{ fontSize: ".6rem", margin: "0 6px" }} />{" "}
            <span style={{ color: "var(--primary-teal)" }}>관리자 회원관리</span>
          </div>
          <h1 className="adm-page-title" style={{ marginBottom: 0 }}>
            관리자 <span>회원관리</span>
          </h1>
        </div>

        <button
          className="adm-th-btn"
          style={{
            background: "linear-gradient(135deg, var(--primary-mint), var(--primary-teal))",
            color: "#fff",
            border: "none",
            padding: "0.8rem 1.5rem",
            borderRadius: "var(--radius-lg)",
            boxShadow: "var(--shadow-mint)",
            cursor: "pointer",
          }}
        >
          <i className="fas fa-plus-circle" style={{ marginRight: "8px" }} /> 신규 등록
        </button>
      </div>

      {/* 필터/검색 */}
      <div className="adm-card" style={{ padding: "1.5rem 2rem" }}>
        <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <span style={{ fontSize: "0.9rem", fontWeight: 800, color: "var(--text-secondary)" }}>
              상태필터
            </span>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              {STATUS_OPTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setStatus(s);
                    setLimit(10);
                  }}
                  style={{
                    padding: "0.5rem 1.25rem",
                    borderRadius: "var(--radius-full)",
                    border: "2px solid",
                    borderColor: status === s ? "transparent" : "var(--border-color)",
                    background:
                      status === s
                        ? "linear-gradient(135deg, var(--primary-mint), var(--primary-teal))"
                        : "#fff",
                    color: status === s ? "#fff" : "var(--text-secondary)",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "var(--bg-secondary)",
              padding: "0.4rem",
              borderRadius: "var(--radius-xl)",
              border: "2px solid var(--border-color)",
            }}
          >
            <select
              className="adm-select"
              value={searchField}
              onChange={(e) => setSearchField(e.target.value)}
              style={{
                border: "none",
                background: "transparent",
                padding: "0 1rem",
                fontWeight: 700,
                color: "var(--primary-dark-teal)",
                outline: "none",
              }}
            >
              <option>전체</option>
              <option>사업자번호</option>
              <option>관리자아이디</option>
              <option>병원명</option>
              <option>진료과</option>
              <option>전화번호</option>
            </select>

            <input
              className="adm-input"
              placeholder="검색어를 입력해주세요..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              style={{ flex: 1, border: "none", background: "transparent", height: "40px", outline: "none" }}
            />

            <button
              style={{
                background: "var(--primary-mint)",
                color: "#fff",
                border: "none",
                width: "40px",
                height: "40px",
                borderRadius: "var(--radius-lg)",
                cursor: "pointer",
              }}
            >
              <i className="fas fa-search" />
            </button>
          </div>
        </div>
      </div>

      {/* 테이블 */}
      <div className="um-scope"></div>
      <div className="adm-table-wrap">
        <div
          style={{
            padding: "1.25rem 1.5rem",
            background: "#fff",
            borderBottom: "1px solid var(--border-color)",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-secondary)" }}>
            검색 결과 <span style={{ color: "var(--primary-teal)" }}>{filtered.length}</span>건
          </span>
          <button
            style={{
              background: "none",
              border: "none",
              color: "var(--text-muted)",
              fontSize: "0.85rem",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            <i className="fas fa-download" style={{ marginRight: "4px" }} /> 엑셀 다운로드
          </button>
        </div>

        <table className="adm-table" style={{ tableLayout: "fixed", width: "100%", minWidth: "1350px" }}>
          <thead>
            <tr>
              <th style={{ width: "60px", textAlign: "center" }}>NO.</th>
              <th style={{ width: "140px", textAlign: "center" }}>사업자번호</th>
              <th style={{ width: "120px", textAlign: "center" }}>관리자 ID</th>
              <th style={{ width: "240px", textAlign: "center" }}>병원명</th>
              <th style={{ width: "160px", textAlign: "center" }}>진료과</th>
              <th style={{ width: "140px", textAlign: "center" }}>전화번호</th>
              <th style={{ width: "120px", textAlign: "center" }}>가입일</th>
              <th style={{ width: "120px", textAlign: "center" }}>수정일</th>
              <th style={{ width: "150px", textAlign: "center" }}>승인상태</th>
            </tr>
          </thead>

          <tbody>
            {filtered.slice(0, limit).map((r, idx) => (
              <tr key={r.id} style={{ height: "76px" }}>
                <td style={{ textAlign: "center", color: "var(--text-muted)" }}>{idx + 1}</td>

                <td style={{ textAlign: "center" }}>{r.bizNo}</td>

                <td style={{ textAlign: "center", fontWeight: 800, color: "var(--primary-teal)" }}>{r.adminId}</td>

                {/* ✅ 병원명 + hoNum 회색표시 */}
                <td style={{ textAlign: "left" }}>
                  <div
                    style={{
                      fontWeight: 800,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      lineHeight: 1.2,
                    }}
                    title={r.hospitalName}
                  >
                    {r.hospitalName}
                  </div>
                  <div style={{ marginTop: "6px", fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: 700 }}>
                    #{r.hoNum}
                  </div>
                </td>

                {/* ✅ 진료과 2개 +N */}
                <td style={{ textAlign: "center" }}>{renderDeptBadges(r.departments)}</td>

                <td style={{ textAlign: "center" }}>{r.phone}</td>

                <td style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                  {r.firstJoinedAt}
                </td>

                <td style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                  {r.updatedAt}
                </td>

                <td style={{ textAlign: "center", padding: 0 }}>
                  <div style={{ width: "100px", height: "34px", margin: "0 auto" }}>
                    {r.approveStatus === "승인요청" ? (
                      <button
                        onClick={() => handleApprove(r.id)}
                        style={{
                          width: "100%",
                          height: "100%",
                          background: "#fee2e2",
                          color: "#dc2626",
                          border: "1px solid #fca5a5",
                          borderRadius: "6px",
                          fontSize: "0.75rem",
                          fontWeight: 800,
                          cursor: "pointer",
                        }}
                      >
                        승인처리
                      </button>
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "var(--primary-teal)",
                          fontWeight: 800,
                          fontSize: "0.85rem",
                        }}
                      >
                        <i className="fas fa-check-circle" style={{ marginRight: "5px" }} /> 승인완료
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length > limit && (
          <div style={{ padding: "2rem", textAlign: "center", borderTop: "1px solid var(--border-color)", background: "#fff" }}>
            <button
              onClick={handleLoadMore}
              style={{
                background: "#fff",
                border: "2px solid var(--primary-mint)",
                padding: "0.75rem 3rem",
                borderRadius: "var(--radius-lg)",
                color: "var(--primary-teal)",
                fontWeight: 800,
                fontSize: "0.9rem",
                cursor: "pointer",
                transition: "all 0.3s",
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
              }}
              onMouseOver={(e) => {
                e.target.style.background = "var(--bg-secondary)";
                e.target.style.transform = "translateY(-2px)";
              }}
              onMouseOut={(e) => {
                e.target.style.background = "#fff";
                e.target.style.transform = "translateY(0)";
              }}
            >
              더보기 ({Math.min(limit, filtered.length)}/{filtered.length}) <i className="fas fa-chevron-down" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}