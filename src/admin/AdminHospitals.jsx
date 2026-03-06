import { useEffect, useMemo, useState } from "react";
import axios from "axios";

const STATUS_OPTIONS = ["전체", "영업중", "휴무"];

const PAGE_SIZE = 20;
const PAGE_GROUP = 5;

function getTodayKey() {
  const d = new Date().getDay();
  const map = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
  return map[d];
}

function pickTodayHour(hours) {
  if (!Array.isArray(hours)) return null;
  const today = getTodayKey();
  return hours.find((x) => x?.day === today) || null;
}

function formatTimeOrDash(v) {
  if (v == null) return "-";
  const s = String(v).trim();
  return s === "" ? "-" : s;
}

function formatDate(v) {
  if (!v) return "-";
  return String(v).slice(0, 10).replaceAll("-", ".");
}

function mapDtoToRow(dto) {
  const todayHour = pickTodayHour(dto?.hours);

  const openYn =
    typeof todayHour?.yn === "boolean"
      ? todayHour.yn
      : !!(todayHour?.open && todayHour?.close);

  // ✅ 진료과목 배열화 (문자열로 오든/배열로 오든 대응)
  const depts =
    Array.isArray(dto?.depts) ? dto.depts.filter(Boolean)
    : Array.isArray(dto?.departments) ? dto.departments.filter(Boolean)
    : dto?.deptName ? [dto.deptName]
    : [];

  return {
    id: dto.hoNum,
    hospitalName: dto.hoName ?? "-",
    
    departments: depts,
    openTime: openYn ? formatTimeOrDash(todayHour?.open) : "-",
    closeTime: openYn ? formatTimeOrDash(todayHour?.close) : "-",
    lunchStart: openYn ? formatTimeOrDash(todayHour?.lunchS) : "-",
    lunchEnd: openYn ? formatTimeOrDash(todayHour?.lunchE) : "-",

    nightYn: !!dto.hoNightYn,
    holidayYn: !!dto.hoHolidayYn,

    lastUpdatedAt: formatDate(dto.hoUpdatedAt),
    openYn,
  };
}

export default function AdminHospitals() {
  const [dataList, setDataList] = useState([]);
  const [totalCount, setTotalCount] = useState(0); // ✅ 전체 건수(백엔드에서 내려줘야 함)

  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("전체");
  const [searchField, setSearchField] = useState("전체");

  const [page, setPage] = useState(1);
  const size = PAGE_SIZE;

  const totalPages = Math.max(1, Math.ceil(totalCount / size));

  // 1~5 / 6~10 묶음 계산
  const groupStart = Math.floor((page - 1) / PAGE_GROUP) * PAGE_GROUP + 1;
  const groupEnd = Math.min(groupStart + PAGE_GROUP - 1, totalPages);

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        // ✅ params로 보내면 스프링에서 @RequestParam("page") 처럼 받기 쉬움
        const res = await axios.get("/api/v1/admin/hospitals", {
          params: { page, size },
        });

        /**
         * ✅ 추천 응답 형태:
         * { items: [...], totalCount: 123 }
         *
         * 만약 지금 서버가 List만 주면 items만 잡히고 totalCount는 0이라
         * totalPages=1만 나올거야 (페이지네이션 버튼 1만 보임)
         */
        const items = Array.isArray(res.data?.items)
          ? res.data.items
          : Array.isArray(res.data?.data)
            ? res.data.data
            : Array.isArray(res.data)
              ? res.data
              : [];

        const tc =
          typeof res.data?.totalCount === "number"
            ? res.data.totalCount
            : typeof res.data?.total === "number"
              ? res.data.total
              : 0;

        setDataList(items.map(mapDtoToRow));
        setTotalCount(tc);
      } catch (e) {
        console.error("병원 목록 조회 실패:", e);
        setDataList([]);
        setTotalCount(0);
      }
    };

    fetchHospitals();
  }, [page]);

  // ✅ 프론트 필터는 "현재 페이지 20개" 안에서만 적용됨
  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();

    return dataList.filter((row) => {
      const hitStatus =
        status === "전체" ? true : status === "영업중" ? row.openYn : !row.openYn;

      if (!hitStatus) return false;
      if (kw === "") return true;
      
    
    const deptText = Array.isArray(row.departments) ? row.departments.join(" ") : "";
      const searchValues = {
        전체: [row.hospitalName, deptText, row.openTime, row.closeTime],
        병원명: [row.hospitalName],
        진료과목: [deptText],
        오픈시간: [row.openTime],
      };

      const targets = searchValues[searchField] || searchValues["전체"];
      return targets.some((v) => String(v).toLowerCase().includes(kw));
    });
  }, [dataList, keyword, status, searchField]);

  // ✅ 검색/필터 바뀌면 1페이지로
  useEffect(() => {
    setPage(1);
  }, [keyword, status, searchField]);

  return (
    <div className="adm-page">
      {/* 🟢 상단 헤더 영역 */}
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
            <i className="fas fa-home" style={{ marginRight: "4px" }} /> 병원관리{" "}
            <i className="fas fa-chevron-right" style={{ fontSize: ".6rem", margin: "0 6px" }} />{" "}
            <span style={{ color: "var(--primary-teal)" }}>전체 병원 정보</span>
          </div>
          <h1 className="adm-page-title" style={{ marginBottom: 0 }}>
            전체 병원 <span>정보</span>
          </h1>
        </div>
      </div>

      {/* 🟢 검색 및 필터 카드 */}
      <div className="adm-card" style={{ padding: "1.5rem 2rem" }}>
        <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <span style={{ fontSize: "0.9rem", fontWeight: 800, color: "var(--text-secondary)" }}>
              영업상태
            </span>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              {STATUS_OPTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  style={{
                    width: "90px",
                    height: "38px",
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
              <option>병원명</option>
              <option>진료과목</option>
              <option>오픈시간</option>
            </select>

            <input
              className="adm-input"
              placeholder="병원명 또는 진료과목을 검색하세요..."
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

      {/* 🟢 데이터 테이블 */}
      <div className="adm-table-wrap" style={{ overflowX: "auto" }}>
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
            전체 병원 리스트{" "}
            <span style={{ color: "var(--primary-teal)" }}>
              {totalCount || filtered.length}
            </span>
            건
          </span>
        </div>

        <table className="adm-table" style={{ tableLayout: "fixed", width: "100%", minWidth: "1400px" }}>
          <thead>
            <tr>
              <th style={{ width: "60px", textAlign: "center" }}>NO.</th>
              <th style={{ width: "180px", textAlign: "left" }}>병원명</th>
              <th style={{ width: "110px", textAlign: "center" }}>진료과목</th>
              <th style={{ width: "100px", textAlign: "center" }}>오픈</th>
              <th style={{ width: "100px", textAlign: "center" }}>종료</th>
              <th style={{ width: "100px", textAlign: "center" }}>점심(시작)</th>
              <th style={{ width: "100px", textAlign: "center" }}>점심(종료)</th>
              <th style={{ width: "100px", textAlign: "center" }}>야간진료</th>
              <th style={{ width: "100px", textAlign: "center" }}>공휴일진료</th>
              <th style={{ width: "130px", textAlign: "center" }}>정보수정일</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((r, idx) => (
              <tr key={r.id ?? idx} style={{ height: "68px" }}>
                {/* ✅ 페이지 기준 NO */}
                <td style={{ textAlign: "center", color: "var(--text-muted)" }}>
                  {(page - 1) * size + (idx + 1)}
                </td>

                <td style={{ textAlign: "left", fontWeight: 800, color: "var(--primary-teal)" }}>
                  {r.hospitalName}
                </td>

               <td style={{ textAlign: "center" }}>
                  {(() => {
                    const list = Array.isArray(r.departments) ? r.departments : [];
                    const show = list.slice(0, 2);
                    const more = Math.max(0, list.length - 2);

                    return (
                      <div
                        style={{
                          display: "inline-flex",
                          flexDirection: "column",
                          gap: "6px",
                          alignItems: "center",
                          justifyContent: "center",
                          width: "100%",
                        }}
                      >
                        {show.length === 0 ? (
                          <span
                            style={{
                              padding: "0.2rem 0.6rem",
                              background: "var(--bg-tertiary)",
                              color: "var(--text-muted)",
                              borderRadius: "6px",
                              fontSize: "0.75rem",
                              fontWeight: 700,
                            }}
                          >
                            -
                          </span>
                        ) : (
                          <>
                            {show.map((dept, i) => (
                              <span
                                key={`${r.id}-dept-${i}`}
                                style={{
                                  padding: "0.2rem 0.6rem",
                                  background: "var(--bg-tertiary)",
                                  color: "var(--primary-dark-teal)",
                                  borderRadius: "6px",
                                  fontSize: "0.75rem",
                                  fontWeight: 800,
                                  maxWidth: "100%",
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                                title={dept}
                              >
                                {dept}
                              </span>
                            ))}

                            {more > 0 && (
                              <span
                                style={{
                                  padding: "0.15rem 0.5rem",
                                  border: "1px dashed var(--border-color)",
                                  color: "var(--text-secondary)",
                                  borderRadius: "999px",
                                  fontSize: "0.72rem",
                                  fontWeight: 900,
                                  background: "#fff",
                                }}
                                title={list.slice(2).join(", ")}
                              >
                                +{more}
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })()}
                </td>

                <td style={{ textAlign: "center", fontWeight: 600 }}>{r.openTime}</td>
                <td style={{ textAlign: "center", fontWeight: 600 }}>{r.closeTime}</td>
                <td style={{ textAlign: "center", color: "var(--text-muted)" }}>{r.lunchStart}</td>
                <td style={{ textAlign: "center", color: "var(--text-muted)" }}>{r.lunchEnd}</td>

                <td style={{ textAlign: "center" }}>
                  <span className={`adm-badge ${r.nightYn ? "adm-on" : "adm-off"}`} style={{ width: "45px", display: "inline-block" }}>
                    {r.nightYn ? "YES" : "NO"}
                  </span>
                </td>

                <td style={{ textAlign: "center" }}>
                  <span className={`adm-badge ${r.holidayYn ? "adm-on" : "adm-off"}`} style={{ width: "45px", display: "inline-block" }}>
                    {r.holidayYn ? "YES" : "NO"}
                  </span>
                </td>

                <td style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                  {r.lastUpdatedAt}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ✅ 페이지네이션 */}
        <div style={{ padding: "1.5rem", textAlign: "center", borderTop: "1px solid var(--border-color)", background: "#fff" }}>
          <div style={{ display: "inline-flex", gap: "8px", alignItems: "center" }}>
            <button
              onClick={() => setPage(1)}
              disabled={page === 1}
              style={{
                padding: "8px 10px",
                borderRadius: 10,
                border: "1px solid var(--border-color)",
                background: "#fff",
                cursor: page === 1 ? "not-allowed" : "pointer",
              }}
            >
              «
            </button>

            <button
              onClick={() => setPage(Math.max(1, groupStart - 1))}
              disabled={groupStart === 1}
              style={{
                padding: "8px 12px",
                borderRadius: 10,
                border: "1px solid var(--border-color)",
                background: "#fff",
                cursor: groupStart === 1 ? "not-allowed" : "pointer",
                fontWeight: 700,
              }}
            >
              이전
            </button>

            {Array.from({ length: groupEnd - groupStart + 1 }, (_, i) => groupStart + i).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                style={{
                  minWidth: 42,
                  padding: "8px 12px",
                  borderRadius: 12,
                  border: "1px solid var(--border-color)",
                  background: p === page ? "linear-gradient(135deg, var(--primary-mint), var(--primary-teal))" : "#fff",
                  color: p === page ? "#fff" : "var(--text-secondary)",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() => setPage(Math.min(totalPages, groupEnd + 1))}
              disabled={groupEnd >= totalPages}
              style={{
                padding: "8px 12px",
                borderRadius: 10,
                border: "1px solid var(--border-color)",
                background: "#fff",
                cursor: groupEnd >= totalPages ? "not-allowed" : "pointer",
                fontWeight: 700,
              }}
            >
              다음
            </button>

            <button
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
              style={{
                padding: "8px 10px",
                borderRadius: 10,
                border: "1px solid var(--border-color)",
                background: "#fff",
                cursor: page === totalPages ? "not-allowed" : "pointer",
              }}
            >
              »
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}