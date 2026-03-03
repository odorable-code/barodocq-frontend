import { useMemo, useState } from "react";

// ✅ 라디오 필터 (원하면 바꿔도 됨)
const STATUS = ["전체", "영업중", "휴무"];

// ✅ 더미데이터 (운영시간/야간/공휴일 포함)
const DUMMY = Array.from({ length: 18 }).map((_, i) => {
  const night = i % 4 === 0; // 야간진료여부
  const holiday = i % 5 === 0; // 공휴일진료여부
  const closed = i % 6 === 0; // 휴무(예시)
  return {
    id: i + 1,
    hospitalName: i % 2 === 0 ? "바로닥큐 병원" : "클린페이 의원",
    department: i % 3 === 0 ? "내과" : i % 3 === 1 ? "피부과" : "정형외과",
    openTime: closed ? "-" : night ? "09:00" : "10:00",
    closeTime: closed ? "-" : night ? "22:00" : "18:00",
    lunchStart: closed ? "-" : "13:00",
    lunchEnd: closed ? "-" : "14:00",
    nightYn: night, // ✅ boolean
    holidayYn: holiday, // ✅ boolean
    lastUpdatedAt: "2026.03.03",
    openYn: !closed, // ✅ 영업 여부(예시)
  };
});

export default function AdminHospitals() {
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("전체");
  const [searchField, setSearchField] = useState("전체");

  // ✅ 검색필드별 매핑
  const fieldMap = useMemo(
    () => ({
      전체: (row) => [
        row.hospitalName,
        row.department,
        row.openTime,
        row.closeTime,
        row.lunchStart,
        row.lunchEnd,
        row.lastUpdatedAt,
      ],
      병원명: (row) => [row.hospitalName],
      진료과목: (row) => [row.department],
      오픈시간: (row) => [row.openTime],
      종료시간: (row) => [row.closeTime],
      점심시간: (row) => [row.lunchStart, row.lunchEnd],
      정보수정일: (row) => [row.lastUpdatedAt],
    }),
    []
  );

  const filtered = useMemo(() => {
    const kw = keyword.trim();

    return DUMMY.filter((row) => {
      const hitStatus =
        status === "전체"
          ? true
          : status === "영업중"
          ? row.openYn
          : !row.openYn;

      if (kw === "") return hitStatus;

      const candidates = (fieldMap[searchField] || fieldMap["전체"])(row);
      const hitKeyword = candidates.some((v) => String(v).includes(kw));

      return hitStatus && hitKeyword;
    });
  }, [keyword, status, searchField, fieldMap]);

  return (
    <div className="adm-page adm-hours-page">
      {/* ✅ 이 페이지에서만 먹는 스타일 */}
      <style>{`
        .adm-hours-page .adm-table { table-layout: fixed; }

        .adm-hours-page .adm-table th,
        .adm-hours-page .adm-table td {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .adm-hours-page .adm-table th:nth-child(1),
        .adm-hours-page .adm-table td:nth-child(1) { width: 50px; }
        .adm-hours-page .adm-table th:nth-child(2),
        .adm-hours-page .adm-table td:nth-child(2) { width: 180px; }

        /* 진료과목 */
        .adm-hours-page .adm-table th:nth-child(3),
        .adm-hours-page .adm-table td:nth-child(3) { width: 100px; }

        /* 시간 컬럼들 */
        .adm-hours-page .adm-table th:nth-child(4),
        .adm-hours-page .adm-table td:nth-child(4),
        .adm-hours-page .adm-table th:nth-child(5),
        .adm-hours-page .adm-table td:nth-child(5),
        .adm-hours-page .adm-table th:nth-child(6),
        .adm-hours-page .adm-table td:nth-child(6),
        .adm-hours-page .adm-table th:nth-child(7),
        .adm-hours-page .adm-table td:nth-child(7) { width: 110px; }

        /* 야간/공휴일 */
        .adm-hours-page .adm-table th:nth-child(8),
        .adm-hours-page .adm-table td:nth-child(8),
        .adm-hours-page .adm-table th:nth-child(9),
        .adm-hours-page .adm-table td:nth-child(9) { width: 120px; }

        /* 수정일 */
        .adm-hours-page .adm-table th:nth-child(10),
        .adm-hours-page .adm-table td:nth-child(10) { width: 120px; }

        .adm-hours-page td.adm-cell-center { text-align: center; white-space: nowrap; }
      `}</style>

      <div className="adm-page-head">
        <div>
          <div className="adm-breadcrumb">회원관리 &gt; 전체 병원 정보</div>
          <h1 className="adm-page-title">전체 병원 정보</h1>
        </div>
        <button className="adm-primary-btn">+ 신규등록</button>
      </div>

      <div className="adm-card">
        <div className="adm-filters">
          <div className="adm-filter-row">
            <span className="adm-label">검색옵션</span>
            <div className="adm-chips">
              {STATUS.map((s) => (
                <label key={s} className="adm-chip">
                  <input
                    type="radio"
                    name="status"
                    checked={status === s}
                    onChange={() => setStatus(s)}
                  />
                  <span>{s}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="adm-search-row">
            <span className="adm-label">검색명</span>
            <select
              className="adm-select"
              value={searchField}
              onChange={(e) => setSearchField(e.target.value)}
            >
              <option>전체</option>
              <option>병원명</option>
              <option>진료과목</option>
              <option>오픈시간</option>
              <option>종료시간</option>
              <option>점심시간</option>
              <option>정보수정일</option>
            </select>

            <input
              className="adm-input"
              placeholder="검색어를 입력해주세요."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />

            <button className="adm-ghost-btn" type="button">
              검색
            </button>
          </div>
        </div>
      </div>

      <div className="adm-table-wrap">
        <div className="adm-table-meta">전체 {filtered.length}건</div>

        <table className="adm-table adm-table-hours">
          <thead>
            <tr>
              <th>No.</th>
              <th>병원명</th>
              <th>진료과목</th>
              <th>오픈시간</th>
              <th>종료시간</th>
              <th>점심시간시작</th>
              <th>점심시간종료</th>
              <th>야간진료여부</th>
              <th>공휴일진료여부</th>
              <th>정보수정일</th>
            </tr>
          </thead>

          <tbody>
            {filtered.slice(0, 10).map((r, idx) => (
              <tr key={r.id}>
                <td>{idx + 1}</td>
                <td title={r.hospitalName}>{r.hospitalName}</td>
                <td>{r.department}</td>
                <td>{r.openTime}</td>
                <td>{r.closeTime}</td>
                <td>{r.lunchStart}</td>
                <td>{r.lunchEnd}</td>

                <td className="adm-cell-center">
                  <span className={"adm-badge " + (r.nightYn ? "adm-on" : "adm-off")}>
                    {r.nightYn ? "YES" : "NO"}
                  </span>
                </td>

                <td className="adm-cell-center">
                  <span className={"adm-badge " + (r.holidayYn ? "adm-on" : "adm-off")}>
                    {r.holidayYn ? "YES" : "NO"}
                  </span>
                </td>

                <td>{r.lastUpdatedAt}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="adm-more">∨ 더보기 (1/12)</div>
      </div>
    </div>
  );
}