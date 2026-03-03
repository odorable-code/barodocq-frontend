import { useMemo, useState } from "react";

// ✅ 상태 필터(라디오)
const STATUS = ["전체", "예약대기", "예약확정", "진료완료", "예약취소"];

// ✅ 더미데이터
const DUMMY = Array.from({ length: 18 }).map((_, i) => {
  const baseStatus =
    i % 5 === 0
      ? "예약대기"
      : i % 5 === 1
      ? "예약확정"
      : i % 5 === 2
      ? "진료완료"
      : i % 5 === 3
      ? "예약취소"
      : "예약대기";

  return {
    id: i + 1,
    hospitalName: i % 2 === 0 ? "바로닥큐 병원" : "클린페이 의원",
    department: i % 3 === 0 ? "내과" : i % 3 === 1 ? "피부과" : "정형외과",
    patientName: i % 2 === 0 ? "홍길동" : "김철수",
    reservedAt: `2026-02-${String((i % 9) + 20).padStart(2, "0")} ${
      ["09:00", "10:30", "13:00", "15:30", "17:00"][i % 5]
    }`,
    status: baseStatus,
    requestMemo:
      i % 3 === 0
        ? "기침/발열 있어요"
        : i % 3 === 1
        ? "처방전 재발급"
        : "초진 상담 원해요",
    createdAt: `2026-02-${String((i % 9) + 18).padStart(2, "0")} 11:12`,
    updatedAt: `2026-02-${String((i % 9) + 19).padStart(2, "0")} 14:30`,
  };
});

export default function ReservationManagePage() {
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("전체");
  const [searchField, setSearchField] = useState("전체");

  // ✅ 실제로 상태가 바뀌어야 하니까 state로 관리
  const [rows, setRows] = useState(DUMMY);

  // ✅ 검색필드별 매핑
  const fieldMap = useMemo(
    () => ({
      전체: (row) => [
        row.hospitalName,
        row.department,
        row.patientName,
        row.reservedAt,
        row.status,
        row.requestMemo,
        row.createdAt,
        row.updatedAt,
      ],
      병원명: (row) => [row.hospitalName],
      진료과: (row) => [row.department],
      예약자성함: (row) => [row.patientName],
      예약시간: (row) => [row.reservedAt],
      예약상태: (row) => [row.status],
      예약요청사항: (row) => [row.requestMemo],
    }),
    []
  );

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();

    return rows.filter((row) => {
      const hitStatus = status === "전체" ? true : row.status === status;
      if (kw === "") return hitStatus;

      const candidates = (fieldMap[searchField] || fieldMap["전체"])(row);
      const hitKeyword = candidates.some((v) =>
        String(v ?? "").toLowerCase().includes(kw)
      );

      return hitStatus && hitKeyword;
    });
  }, [rows, keyword, status, searchField, fieldMap]);

  // ✅ 예약 승인: 예약대기 -> 예약확정
  const handleApprove = (id) => {
    setRows((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: "예약확정",
              updatedAt: new Date().toISOString().slice(0, 16).replace("T", " "),
            }
          : r
      )
    );
  };

  // ✅ 예약 취소: 예약확정(또는 예약대기) -> 예약취소
  const handleCancel = (id) => {
    setRows((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: "예약취소",
              updatedAt: new Date().toISOString().slice(0, 16).replace("T", " "),
            }
          : r
      )
    );
  };

  // ✅ 상태 배지 클래스
  const statusClass = (s) => {
    if (s === "예약대기") return "adm-st-wait";
    if (s === "예약확정") return "adm-st-ok";
    if (s === "진료완료") return "adm-st-done";
    if (s === "예약취소") return "adm-st-cancel";
    return "";
  };

  return (
    // ✅ 예약관리 페이지 전용 스코프
    <div className="adm-page adm-resv-page">
      <style>{`
        /* ===== 예약관리 페이지 전용 스코프 ===== */
        .adm-resv-page .adm-table {
          table-layout: fixed; /* ✅ 테이블 안정화 */
        }

        /* 기본: 한줄 ... (세로찢김 방지) */
        .adm-resv-page .adm-table th,
        .adm-resv-page .adm-table td {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* ✅ 예약요청사항은 두 줄까지 보여주고 싶으면 (선택) */
        .adm-resv-page .adm-req {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          white-space: normal;
          line-height: 1.35;
          word-break: keep-all;
        }

        /* ===== 컬럼 폭: 꼭 필요한 애들만 최소 지정 ===== */
        .adm-resv-page .adm-table th:nth-child(1),
        .adm-resv-page .adm-table td:nth-child(1) { width: 50px; }  /* No. */

        .adm-resv-page .adm-table th:nth-child(2),
        .adm-resv-page .adm-table td:nth-child(2) { width: 160px; } /* 예약병원 */

        .adm-resv-page .adm-table th:nth-child(3),
        .adm-resv-page .adm-table td:nth-child(3) { width: 90px; }  /* 진료과 */

        .adm-resv-page .adm-table th:nth-child(4),
        .adm-resv-page .adm-table td:nth-child(4) { width: 110px; } /* 예약자 */

        .adm-resv-page .adm-table th:nth-child(5),
        .adm-resv-page .adm-table td:nth-child(5) { width: 160px; } /* 예약시간 */

        .adm-resv-page .adm-table th:nth-child(6),
        .adm-resv-page .adm-table td:nth-child(6) { width: 110px; } /* 예약상태 */

        .adm-resv-page .adm-table th:nth-child(7),
        .adm-resv-page .adm-table td:nth-child(7) { width: 260px; } /* 요청사항 */

        .adm-resv-page .adm-table th:nth-child(8),
        .adm-resv-page .adm-table td:nth-child(8) { width: 150px; } /* 신청 */

        .adm-resv-page .adm-table th:nth-child(9),
        .adm-resv-page .adm-table td:nth-child(9) { width: 150px; } /* 수정 */

        .adm-resv-page .adm-table th:nth-child(10),
        .adm-resv-page .adm-table td:nth-child(10) { width: 140px; } /* 처리 */

        /* td flex 금지 + 가운데 정렬 유지 */
        .adm-resv-page td.adm-cell-center {
          display: table-cell;
          text-align: center;
          vertical-align: middle;
        }
      `}</style>

      <div className="adm-page-head">
        <div>
          <div className="adm-breadcrumb">예약관리</div>
          <h1 className="adm-page-title">예약관리</h1>
        </div>
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
              <option>진료과</option>
              <option>예약자성함</option>
              <option>예약시간</option>
              <option>예약상태</option>
              <option>예약요청사항</option>
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

        <table className="adm-table">
          <thead>
            <tr>
              <th>No.</th>
              <th>예약병원</th>
              <th>진료과</th>
              <th>예약자성함</th>
              <th>예약시간</th>
              <th>예약상태</th>
              <th>예약요청사항</th>
              <th>예약신청일시</th>
              <th>예약수정일시</th>
              <th>처리</th>
            </tr>
          </thead>

          <tbody>
            {filtered.slice(0, 10).map((r, idx) => (
              <tr key={r.id}>
                <td>{idx + 1}</td>
                <td>{r.hospitalName}</td>
                <td>{r.department}</td>
                <td>{r.patientName}</td>
                <td>{r.reservedAt}</td>

                <td className="adm-cell-center">
                  <span className={"adm-badge " + statusClass(r.status)}>
                    {r.status}
                  </span>
                </td>

                {/* ✅ 요청사항은 2줄 클램프(너무 길면 보기 좋게) */}
                <td>
                  <div className="adm-req">{r.requestMemo}</div>
                </td>

                <td>{r.createdAt}</td>
                <td>{r.updatedAt}</td>

                <td className="adm-cell-center">
                  {r.status === "예약대기" ? (
                    <button
                      className="adm-approve-btn adm-request"
                      type="button"
                      onClick={() => handleApprove(r.id)}
                    >
                      예약승인
                    </button>
                  ) : r.status === "예약확정" ? (
                    <button
                      className="adm-approve-btn"
                      type="button"
                      onClick={() => handleCancel(r.id)}
                    >
                      예약취소
                    </button>
                  ) : (
                    <span className="adm-approve-done">-</span>
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