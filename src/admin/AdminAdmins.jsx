import { useMemo, useState } from "react";

// ✅ 라디오 필터
const STATUS = ["전체", "승인요청", "승인완료"];

// ✅ 더미데이터
const DUMMY = Array.from({ length: 18 }).map((_, i) => ({
  id: i + 1,
  bizNo: "245-34-34235",
  adminId: `admin${String(i + 1).padStart(2, "0")}`,
  hospitalName: i % 2 === 0 ? "바로닥큐 병원" : "클린페이 의원",
  department: i % 3 === 0 ? "내과" : i % 3 === 1 ? "피부과" : "정형외과",
  address: "서울특별시 종로구 어딘가 123",
  phone: "02-1234-5678",
  alertAllowed: i % 2 === 0,
  firstJoinedAt: "2020.03.04",
  lastUpdatedAt: "2020.04.01",
  approveStatus: i % 3 === 0 ? "승인완료" : "승인요청",
}));

export default function ClaimPage() {
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("전체");
  const [searchField, setSearchField] = useState("전체");

  // ✅ 검색필드별 매핑
  const fieldMap = useMemo(
    () => ({
      전체: (row) => [
        row.bizNo,
        row.adminId,
        row.hospitalName,
        row.department,
        row.address,
        row.phone,
      ],
      사업자번호: (row) => [row.bizNo],
      관리자아이디: (row) => [row.adminId],
      병원명: (row) => [row.hospitalName],
      진료과: (row) => [row.department],
      주소: (row) => [row.address],
      전화번호: (row) => [row.phone],
    }),
    []
  );

  const filtered = useMemo(() => {
    const kw = keyword.trim();

    return DUMMY.filter((row) => {
      const hitStatus = status === "전체" ? true : row.approveStatus === status;
      if (kw === "") return hitStatus;

      const candidates = (fieldMap[searchField] || fieldMap["전체"])(row);
      const hitKeyword = candidates.some((v) => String(v).includes(kw));

      return hitStatus && hitKeyword;
    });
  }, [keyword, status, searchField, fieldMap]);

  return (
    // ✅ 이 페이지 전용 부모 클래스 추가
    <div className="adm-page adm-hosp-page">
      {/* ✅ 이 페이지에서만 먹는 스타일 */}
      <style>{`
        /* ====== 병원관리 페이지 전용 스코프 ====== */
        .adm-hosp-page .adm-table {
          table-layout: fixed; /* ✅ 컬럼 많은 테이블은 fixed가 안정적 */
        }

        /* 기본은 한 줄 + ... (세로로 찢기는 거 방지) */
        .adm-hosp-page .adm-table th,
        .adm-hosp-page .adm-table td {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* ✅ 주소는 줄바꿈 허용 (너무 좁으면 세로로 찢기니까) */
        .adm-hosp-page .adm-table th:nth-child(6),
        .adm-hosp-page .adm-table td:nth-child(6) {
          white-space: normal;
          overflow: visible;
          text-overflow: clip;
          line-height: 1.35;
          word-break: keep-all;
        }

        /* ✅ 버튼/배지 칸은 가운데 정렬 유지 */
        .adm-hosp-page td.adm-cell-center {
          white-space: nowrap;
        }

        /* ====== 컬럼 폭(픽셀 노가다 최소) ======
           "짧아야 하는 애들"만 최소폭 지정하고
           나머지는 브라우저가 자동으로 배분하게 둠
        */
        .adm-hosp-page .adm-table th:nth-child(1),
        .adm-hosp-page .adm-table td:nth-child(1) { width: 50px; }   /* No. */

        .adm-hosp-page .adm-table th:nth-child(4),
        .adm-hosp-page .adm-table td:nth-child(4) { width: 140px; }  /* 병원명 */

        .adm-hosp-page .adm-table th:nth-child(5),
        .adm-hosp-page .adm-table td:nth-child(5) { width: 90px; }   /* 진료과 */

        .adm-hosp-page .adm-table th:nth-child(7),
        .adm-hosp-page .adm-table td:nth-child(7) { width: 120px; }  /* 전화 */

        .adm-hosp-page .adm-table th:nth-child(8),
        .adm-hosp-page .adm-table td:nth-child(8) { width: 140px; }  /* 알림 */

        .adm-hosp-page .adm-table th:nth-child(9),
        .adm-hosp-page .adm-table td:nth-child(9) { width: 110px; }  /* 가입일 */

        .adm-hosp-page .adm-table th:nth-child(10),
        .adm-hosp-page .adm-table td:nth-child(10) { width: 110px; } /* 수정일 */

        .adm-hosp-page .adm-table th:nth-child(11),
        .adm-hosp-page .adm-table td:nth-child(11) { width: 140px; } /* 승인 */

        /* ✅ 사업자번호/관리자아이디는 너무 길면 ... */
        .adm-hosp-page .adm-table th:nth-child(2),
        .adm-hosp-page .adm-table td:nth-child(2) { width: 140px; }

        .adm-hosp-page .adm-table th:nth-child(3),
        .adm-hosp-page .adm-table td:nth-child(3) { width: 120px; }
      `}</style>

      <div className="adm-page-head">
        <div>
          <div className="adm-breadcrumb">회원관리 &gt; 병원관리</div>
          <h1 className="adm-page-title">병원관리</h1>
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
              <option>사업자번호</option>
              <option>관리자아이디</option>
              <option>병원명</option>
              <option>진료과</option>
              <option>주소</option>
              <option>전화번호</option>
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

        {/* ✅ 테이블 클래스는 그대로 두고, 부모(adm-hosp-page)로만 제어 */}
        <table className="adm-table adm-table-hospitals">
          <thead>
            <tr>
              <th>No.</th>
              <th>사업자번호</th>
              <th>관리자아이디</th>
              <th>병원명</th>
              <th>진료과</th>
              <th>주소</th>
              <th>전화번호</th>
              <th>알림허용여부</th>
              <th>가입일</th>
              <th>정보수정일</th>
              <th>승인여부</th>
            </tr>
          </thead>

          <tbody>
            {filtered.slice(0, 10).map((r, idx) => (
              <tr key={r.id}>
                <td>{idx + 1}</td>
                <td>{r.bizNo}</td>
                <td>{r.adminId}</td>
                <td>{r.hospitalName}</td>
                <td>{r.department}</td>
                <td>{r.address}</td>
                <td>{r.phone}</td>

                <td className="adm-cell-center">
                  <span className={"adm-badge " + (r.alertAllowed ? "adm-on" : "adm-off")}>
                    {r.alertAllowed ? "허용" : "미허용"}
                  </span>
                </td>

                <td>{r.firstJoinedAt}</td>
                <td>{r.lastUpdatedAt}</td>

                <td className="adm-cell-center">
                  {r.approveStatus === "승인요청" ? (
                    <button className="adm-approve-btn adm-request" type="button">
                      승인요청
                    </button>
                  ) : (
                    <span className="adm-approve-done">승인완료</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="adm-more">∨ 더보기 (1/12)</div>
      </div>
    </div>
  );
}