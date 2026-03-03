import { useEffect, useMemo, useState } from "react";

// ✅ 상태 필터(라디오)
const STATUS = ["전체", "예약대기", "예약확정", "진료완료", "예약취소"];
const PAGE_SIZES = [20, 50, 100];

// ✅ 상태 배지 클래스
const statusClass = (s) => {
  if (s === "예약대기") return "adm-st-wait";
  if (s === "예약확정") return "adm-st-ok";
  if (s === "진료완료") return "adm-st-done";
  if (s === "예약취소") return "adm-st-cancel";
  return "";
};

// ✅ 간단 모달
function MemoModal({ open, title = "예약 요청사항", memo, onClose }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="adm-modal__backdrop" onMouseDown={onClose}>
      <div className="adm-modal__panel" onMouseDown={(e) => e.stopPropagation()}>
        <div className="adm-modal__head">
          <div className="adm-modal__title">{title}</div>
          <button className="adm-modal__close" type="button" onClick={onClose} aria-label="닫기">
            ✕
          </button>
        </div>

        <div className="adm-modal__body">
          <div className="adm-modal__memo">{memo || "-"}</div>
        </div>

        <div className="adm-modal__foot">
          <button className="adm-modal__btn" type="button" onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ReservationManagePage() {
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("전체");
  const [searchField, setSearchField] = useState("전체");

  // ✅ 서버 페이징
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);
  const [total, setTotal] = useState(0);

  const [rows, setRows] = useState([]); // 서버 원본(list)
  const [loading, setLoading] = useState(false);

  // ✅ 요청사항 모달 상태
  const [memoOpen, setMemoOpen] = useState(false);
  const [memoText, setMemoText] = useState("");

  const openMemo = (memo) => {
    setMemoText(memo || "-");
    setMemoOpen(true);
  };

  const closeMemo = () => {
    setMemoOpen(false);
    setMemoText("");
  };

  // ✅ 검색필드별 매핑 (화면용 row 기준)
  const fieldMap = useMemo(
    () => ({
      전체: (row) => [
        row.hospitalName,
        row.department,
        row.patientName,
        row.visitType,
        row.reservedAt,
        row.status,
        row.requestMemo,
        row.createdAt,
        row.updatedAt,
      ],
      병원명: (row) => [row.hospitalName],
      진료과: (row) => [row.department],
      예약자성함: (row) => [row.patientName],
      초진재진: (row) => [row.visitType],
      예약시간: (row) => [row.reservedAt],
      예약상태: (row) => [row.status],
      예약요청사항: (row) => [row.requestMemo],
    }),
    []
  );

  // ✅ 서버 DTO → 화면 row로 변환
  const mappedRows = useMemo(() => {
    const padDT = (v) => (v ? String(v).slice(0, 16).replace("T", " ") : "-");
    const padDate = (v) => (v ? String(v).slice(0, 10) : "-");
    const padTime = (v) => (v ? String(v).slice(0, 5) : "-");

    return (rows ?? []).map((r) => {
      const memo = (r.reMemo ?? "").trim();
      return {
        id: r.reNum,
        hospitalName: r.hoName ?? "-",
        department: r.deptName ?? "-",
        patientName: r.userName ?? "-",

        // ✅ 초진/재진
        visitType: r.reVisitType ?? "-", // '초진' | '재진'

        reservedAt: `${padDate(r.reDate)} ${padTime(r.reTime)}`,
        status: r.reStatus ?? "-",
        requestMemo: memo || "-", // 화면 표기용

        // ✅ 클릭 가능 여부
        hasMemo: memo.length > 0,

        createdAt: padDT(r.reCreatedAt),
        updatedAt: padDT(r.reUpdatedAt),
      };
    });
  }, [rows]);

  // ✅ 목록 조회 (status/page/size 변경 시 자동)
  useEffect(() => {
    const controller = new AbortController();

    const fetchList = async () => {
      try {
        setLoading(true);

        const sp = new URLSearchParams();
        sp.set("page", String(page));
        sp.set("size", String(size));
        if (status !== "전체") sp.set("status", status);

        const res = await fetch(`/api/v1/admin/reservations?${sp.toString()}`, {
          signal: controller.signal,
          credentials: "include",
        });

        if (!res.ok) throw new Error(`list fetch failed: ${res.status}`);

        const payload = await res.json();
        setRows(payload?.list ?? []);
        setTotal(Number(payload?.total ?? 0));
      } catch (e) {
        if (e.name !== "AbortError") console.error(e);
        setRows([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };

    fetchList();
    return () => controller.abort();
  }, [page, size, status]);

  // ✅ 필터/검색/페이지크기 바뀌면 1페이지로
  useEffect(() => setPage(1), [keyword, status, searchField, size]);

  // ✅ 프론트 검색 (주의: 현재 페이지 데이터 기준)
  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();

    return mappedRows.filter((row) => {
      if (!kw) return true;
      const candidates = (fieldMap[searchField] || fieldMap["전체"])(row);
      return candidates.some((v) => String(v ?? "").toLowerCase().includes(kw));
    });
  }, [mappedRows, keyword, searchField, fieldMap]);

  const totalPages = Math.max(1, Math.ceil(total / size));

  // ✅ 예약 승인: 예약대기 -> 예약확정
  const handleApprove = async (id) => {
    try {
      const res = await fetch(`/api/v1/admin/reservations/${id}/approve`, {
        method: "PATCH",
        credentials: "include",
      });
      if (!res.ok) throw new Error(`approve failed: ${res.status}`);

      setRows((prev) =>
        prev.map((r) => (r.reNum === id ? { ...r, reStatus: "예약확정" } : r))
      );
    } catch (e) {
      console.error(e);
      alert("예약 승인 실패");
    }
  };

  // ✅ 예약 취소: 예약확정(또는 예약대기) -> 예약취소
  const handleCancel = async (id) => {
    try {
      const res = await fetch(`/api/v1/admin/reservations/${id}/cancel`, {
        method: "PATCH",
        credentials: "include",
      });
      if (!res.ok) throw new Error(`cancel failed: ${res.status}`);

      setRows((prev) =>
        prev.map((r) => (r.reNum === id ? { ...r, reStatus: "예약취소" } : r))
      );
    } catch (e) {
      console.error(e);
      alert("예약 취소 실패");
    }
  };

  return (
    <div className="adm-page adm-resv-page">
      <style>{`
        .adm-resv-page .adm-table {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
        }
        .adm-resv-page .adm-table th,
        .adm-resv-page .adm-table td {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          vertical-align: middle;
        }

        /* 요청사항은 2줄 클램프 */
        .adm-resv-page .adm-req {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          white-space: normal;
          line-height: 1.35;
          word-break: keep-all;
        }

        /* ✅ 요청사항 클릭 가능 스타일 */
        .adm-resv-page .adm-req-clickable {
          cursor: pointer;
          text-decoration: underline;
          text-underline-offset: 2px;
        }

        /* ===== 컬럼 폭 ===== */
        .adm-resv-page .adm-table th:nth-child(1),
        .adm-resv-page .adm-table td:nth-child(1) { width: 50px; }  /* No. */
        .adm-resv-page .adm-table th:nth-child(2),
        .adm-resv-page .adm-table td:nth-child(2) { width: 160px; } /* 예약병원 */
        .adm-resv-page .adm-table th:nth-child(3),
        .adm-resv-page .adm-table td:nth-child(3) { width: 90px; }  /* 진료과 */
        .adm-resv-page .adm-table th:nth-child(4),
        .adm-resv-page .adm-table td:nth-child(4) { width: 110px; } /* 예약자 */
        .adm-resv-page .adm-table th:nth-child(5),
        .adm-resv-page .adm-table td:nth-child(5) { width: 90px; }  /* 초진/재진 */
        .adm-resv-page .adm-table th:nth-child(6),
        .adm-resv-page .adm-table td:nth-child(6) { width: 160px; } /* 예약시간 */
        .adm-resv-page .adm-table th:nth-child(7),
        .adm-resv-page .adm-table td:nth-child(7) { width: 110px; } /* 예약상태 */
        .adm-resv-page .adm-table th:nth-child(8),
        .adm-resv-page .adm-table td:nth-child(8) { width: 260px; } /* 요청사항 */
        .adm-resv-page .adm-table th:nth-child(9),
        .adm-resv-page .adm-table td:nth-child(9) { width: 150px; } /* 신청 */
        .adm-resv-page .adm-table th:nth-child(10),
        .adm-resv-page .adm-table td:nth-child(10) { width: 150px; } /* 수정 */
        .adm-resv-page .adm-table th:nth-child(11),
        .adm-resv-page .adm-table td:nth-child(11) { width: 140px; } /* 처리 */

        .adm-resv-page td.adm-cell-center {
          display: table-cell;
          text-align: center;
          vertical-align: middle;
        }

        /* 테이블 위 size 토글 */
        .adm-resv-page .adm-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin: 10px 0;
        }
        .adm-resv-page .adm-size-toggle {
          display: inline-flex;
          border: 1px solid var(--adm-line);
          border-radius: 999px;
          overflow: hidden;
          background: #fff;
        }
        .adm-resv-page .adm-size-toggle button {
          border: 0;
          background: transparent;
          padding: 7px 12px;
          cursor: pointer;
          font-weight: 800;
          font-size: 13px;
          color: var(--adm-muted);
        }
        .adm-resv-page .adm-size-toggle button.is-active {
          background: var(--primary-mint, #14b8a6);
          color: #fff;
        }

        .adm-resv-page .adm-pager {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 10px;
          margin-top: 10px;
          color: var(--adm-muted);
          font-size: 13px;
        }
        .adm-resv-page .adm-pager button {
          border: 1px solid var(--adm-line);
          background: #fff;
          border-radius: 10px;
          padding: 6px 10px;
          cursor: pointer;
          font-weight: 700;
        }
        .adm-resv-page .adm-pager button:disabled {
          opacity: .5;
          cursor: not-allowed;
        }

        /* ===== 모달 ===== */
        .adm-modal__backdrop{
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,.45);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          z-index: 9999;
        }
        .adm-modal__panel{
          width: min(560px, 100%);
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0,0,0,.2);
          overflow: hidden;
        }
        .adm-modal__head{
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 16px;
          border-bottom: 1px solid var(--adm-line);
        }
        .adm-modal__title{
          font-weight: 900;
          font-size: 15px;
        }
        .adm-modal__close{
          border: 0;
          background: transparent;
          cursor: pointer;
          font-size: 18px;
          line-height: 1;
        }
        .adm-modal__body{
          padding: 16px;
        }
        .adm-modal__memo{
          white-space: pre-wrap;
          line-height: 1.5;
          color: #111;
        }
        .adm-modal__foot{
          padding: 12px 16px 16px;
          display: flex;
          justify-content: flex-end;
          gap: 8px;
        }
        .adm-modal__btn{
          border: 1px solid var(--adm-line);
          background: #fff;
          border-radius: 12px;
          padding: 8px 12px;
          cursor: pointer;
          font-weight: 800;
        }
      `}</style>

      <MemoModal open={memoOpen} memo={memoText} onClose={closeMemo} />

      <div className="adm-page-head">
        <div>
          <div className="adm-breadcrumb">예약관리</div>
          <h1 className="adm-page-title">예약관리</h1>
        </div>
      </div>

      {/* ✅ 필터 영역 */}
      <div className="adm-card">
        <div className="adm-filters">
          <div className="adm-filter-row">
            <span className="adm-label">상태</span>
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
            <span className="adm-label">검색</span>
            <select
              className="adm-select"
              value={searchField}
              onChange={(e) => setSearchField(e.target.value)}
            >
              <option>전체</option>
              <option>병원명</option>
              <option>진료과</option>
              <option>예약자성함</option>
              <option>초진재진</option>
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

      {/* ✅ 테이블 */}
      <div className="adm-table-wrap">
        <div className="adm-topbar">
          <div className="adm-table-meta">
            전체 {total}건 {loading ? "· 불러오는 중..." : ""}
          </div>

          <div className="adm-size-toggle" role="tablist" aria-label="페이지당 개수">
            {PAGE_SIZES.map((n) => (
              <button
                key={n}
                type="button"
                className={n === size ? "is-active" : ""}
                onClick={() => {
                  setSize(n);
                  setPage(1);
                }}
              >
                {n}개
              </button>
            ))}
          </div>
        </div>

        <table className="adm-table">
          <thead>
            <tr>
              <th>No.</th>
              <th>예약병원</th>
              <th>진료과</th>
              <th>예약자성함</th>
              <th>초진/재진</th>
              <th>예약시간</th>
              <th>예약상태</th>
              <th>예약요청사항</th>
              <th>예약신청일시</th>
              <th>예약수정일시</th>
              <th>처리</th>
            </tr>
          </thead>

          <tbody>
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={11} style={{ padding: 20, color: "var(--adm-muted)" }}>
                  조회 결과가 없습니다.
                </td>
              </tr>
            )}

            {filtered.map((r, idx) => (
              <tr key={r.id}>
                <td>{(page - 1) * size + idx + 1}</td>
                <td>{r.hospitalName}</td>
                <td>{r.department}</td>
                <td>{r.patientName}</td>
                <td className="adm-cell-center">{r.visitType}</td>
                <td>{r.reservedAt}</td>

                <td className="adm-cell-center">
                  <span className={"adm-badge " + statusClass(r.status)}>{r.status}</span>
                </td>

                <td>
                  <div
                    className={
                      "adm-req " + (r.hasMemo ? "adm-req-clickable" : "")
                    }
                    title={r.hasMemo ? "클릭해서 전체 보기" : ""}
                    role={r.hasMemo ? "button" : undefined}
                    tabIndex={r.hasMemo ? 0 : undefined}
                    onClick={() => r.hasMemo && openMemo(r.requestMemo)}
                    onKeyDown={(e) => {
                      if (!r.hasMemo) return;
                      if (e.key === "Enter" || e.key === " ") openMemo(r.requestMemo);
                    }}
                  >
                    {r.requestMemo}
                  </div>
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

        <div className="adm-pager">
          <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            이전
          </button>
          <span>
            {page} / {Math.max(1, Math.ceil(total / size))}
          </span>
          <button
            type="button"
            disabled={page >= Math.max(1, Math.ceil(total / size))}
            onClick={() => setPage((p) => p + 1)}
          >
            다음
          </button>
        </div>
      </div>

      {/* 참고: keyword 검색은 "현재 페이지 데이터" 기준 */}
    </div>
  );
}