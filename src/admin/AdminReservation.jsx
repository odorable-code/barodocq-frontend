import { useEffect, useMemo, useState } from "react";
import axios from "axios";

/* ───────── 상수 ───────── */
const STATUS_OPTIONS = ["전체", "예약대기", "예약확정", "진료완료", "예약취소"];
const PAGE_SIZES = [10, 20, 50];

/* ✅ JWT 토큰을 axios 요청 헤더에 붙이기 */
function authHeaders() {
  const token = localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/* ───────── 유틸 ───────── */
function extractList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.list)) return data.list;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.content)) return data.content;
  return [];
}

// 백엔드 필드명이 다를 수 있어서 안전 매핑
function normalizeRow(r) {
  return {
    id: r.id ?? r.reNum ?? r.re_num ?? r.reservationId ?? r.reservation_id,
    hospitalName: r.hospitalName ?? r.hoName ?? r.ho_name ?? r.hoNm ?? "-",
    department: r.department ?? r.deptName ?? r.dept_name ?? r.deptNm ?? "-",
    patientName:
      r.patientName ?? r.userName ?? r.user_name ?? r.patientNm ?? "-",
    visitType: r.visitType ?? r.reVisitType ?? r.re_visit_type ?? "-",
    reservedAt:
      r.reservedAt ??
      r.reReservedAt ??
      r.re_datetime ??
      (r.reDate && r.reTime
        ? `${r.reDate} ${r.reTime}`
        : r.re_date && r.re_time
          ? `${r.re_date} ${r.re_time}`
          : "-"),
    status: r.status ?? r.reStatus ?? r.re_status ?? "-",
    requestMemo: r.requestMemo ?? r.reMemo ?? r.re_memo ?? "",
    createdAt: r.createdAt ?? r.reCreatedAt ?? r.re_created_at ?? "-",
  };
}

/* ───────── 메모 모달 ───────── */
function MemoModal({ open, memo, onClose }) {
  if (!open) return null;
  return (
    <div
      className="adm-modal-bg"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.7)",
        backdropFilter: "blur(4px)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        animation: "fadeIn 0.2s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          width: "min(450px, 90%)",
          borderRadius: "var(--radius-xl)",
          padding: "2rem",
          boxShadow: "var(--shadow-xl)",
          border: "1px solid var(--border-color)",
        }}
      >
        <h3
          style={{
            marginTop: 0,
            display: "flex",
            alignItems: "center",
            gap: "10px",
            color: "var(--primary-teal)",
            fontSize: "1.2rem",
            fontWeight: 800,
          }}
        >
          <i className="fas fa-comment-medical" /> 예약 요청사항 상세
        </h3>

        <div
          style={{
            background: "var(--bg-secondary)",
            padding: "1.5rem",
            borderRadius: "var(--radius-lg)",
            border: "1px dashed var(--primary-mint)",
            marginTop: "1.5rem",
            lineHeight: 1.7,
            fontSize: "0.95rem",
            color: "var(--text-secondary)",
            whiteSpace: "pre-wrap",
          }}
        >
          {memo || "요청사항이 없습니다."}
        </div>

        <div style={{ textAlign: "right", marginTop: "2rem" }}>
          <button
            className="hdp-btn hdp-btn-primary"
            style={{ width: "100%" }}
            onClick={onClose}
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}

/* ───────── 메인 ───────── */
export default function AdminReservation() {
  const [dataList, setDataList] = useState([]);

  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("전체");

  const [memoOpen, setMemoOpen] = useState(false);
  const [memoText, setMemoText] = useState("");

  // 서버 페이징
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  const fetchReservations = async () => {
    try {
      setLoading(true);
      setLoadError("");

      const res = await axios.get("/api/v1/admin/reservations", {
        params: { page, size },
        withCredentials: true, // refresh 쿠키 쓰면 유지
        headers: authHeaders(), // ✅ 여기 핵심
      });

      const list = extractList(res.data).map(normalizeRow);

      setDataList(list);
      setTotal(res.data?.total ?? list.length);
      setTotalPages(res.data?.totalPages ?? 1);
    } catch (e) {
      // ✅ 401이면 로그인 유도(선택)
      if (e?.response?.status === 401) {
        setLoadError("로그인이 필요합니다. 다시 로그인해주세요.");
      } else {
        setLoadError(
          e?.response?.data?.message ||
            e?.message ||
            "예약 목록을 불러오지 못했습니다.",
        );
      }
      setDataList([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, size]);

  // ✅ 필터/검색 변경 시 1페이지로
  useEffect(() => {
    setPage(1);
  }, [keyword, statusFilter]);

  useEffect(() => {
    const interval = setInterval(
      () => {
        fetchReservations(); // ✅ 목록 다시 불러오기
      },
      10 * 60 * 1000,
    ); // 10분

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ 프론트 필터/검색 (현재 페이지 데이터 기준)
  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return dataList.filter((row) => {
      const hitStatus =
        statusFilter === "전체" ? true : row.status === statusFilter;
      if (!hitStatus) return false;
      if (!kw) return true;

      return (
        String(row.patientName ?? "")
          .toLowerCase()
          .includes(kw) ||
        String(row.hospitalName ?? "")
          .toLowerCase()
          .includes(kw)
      );
    });
  }, [dataList, keyword, statusFilter]);

  // ✅ 상태 변경 API (승인/취소)
  const handleStatusChange = async (id, newStatus) => {
    const msg =
       newStatus === "예약확정"
      ? "예약을 승인하시겠습니까?"
      : "예약을 취소하시겠습니까?"; 
      
    if (!window.confirm(msg)) return;

    const isApprove = newStatus === "예약확정";
    const url = isApprove
      ? `/api/v1/admin/reservations/${id}/approve`
      : `/api/v1/admin/reservations/${id}/cancel`;

    try {
      await axios.post(url, null, {
        withCredentials: true,
        headers: authHeaders(),
      });

      setDataList((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: newStatus } : item,
        ),
      );
    } catch (e) {
      alert(
        e?.response?.data?.message || e?.message || "상태 변경에 실패했습니다.",
      );
    }
  };

  return (
    <div className="adm-page">
      <MemoModal
        open={memoOpen}
        memo={memoText}
        onClose={() => setMemoOpen(false)}
      />

      {/* 🟢 헤더 */}
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
            <i className="fas fa-home" style={{ marginRight: "4px" }} />{" "}
            예약관리{" "}
            <i
              className="fas fa-chevron-right"
              style={{ fontSize: ".6rem", margin: "0 6px" }}
            />{" "}
            <span style={{ color: "var(--primary-teal)" }}>전체 예약 내역</span>
          </div>
          <h1 className="adm-page-title" style={{ marginBottom: 0 }}>
            예약 <span>관리</span>
          </h1>
        </div>

        <button
          onClick={fetchReservations}
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

      {/* 🟢 필터 카드 */}
      <div className="adm-card" style={{ padding: "1.5rem 2rem" }}>
        <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <span
              style={{
                fontSize: "0.9rem",
                fontWeight: 800,
                color: "var(--text-secondary)",
              }}
            >
              예약상태
            </span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {STATUS_OPTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  style={{
                    padding: "0.5rem 1.1rem",
                    borderRadius: "var(--radius-full)",
                    border: "2px solid",
                    borderColor:
                      statusFilter === s
                        ? "transparent"
                        : "var(--border-color)",
                    background:
                      statusFilter === s
                        ? "linear-gradient(135deg, var(--primary-mint), var(--primary-teal))"
                        : "#fff",
                    color:
                      statusFilter === s ? "#fff" : "var(--text-secondary)",
                    fontWeight: 700,
                    fontSize: "0.82rem",
                    cursor: "pointer",
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
              placeholder="병원명 또는 예약자 성함을 입력하세요..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              style={{
                flex: 1,
                border: "none",
                background: "transparent",
                height: "40px",
                outline: "none",
              }}
            />
          </div>

          <div style={{ display: "flex", gap: "6px" }}>
            {PAGE_SIZES.map((n) => (
              <button
                key={n}
                onClick={() => {
                  setSize(n);
                  setPage(1);
                }}
                style={{
                  border: "none",
                  background:
                    n === size ? "var(--primary-mint)" : "var(--bg-secondary)",
                  color: n === size ? "#fff" : "var(--text-secondary)",
                  padding: "8px 12px",
                  borderRadius: "var(--radius-full)",
                  fontSize: "0.75rem",
                  fontWeight: 800,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                {n}개씩
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 🟢 테이블 */}
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
            검색 내역{" "}
            <span style={{ color: "var(--primary-teal)" }}>{total}</span>건
            {keyword || statusFilter !== "전체" ? (
              <span
                style={{
                  marginLeft: 10,
                  fontSize: "0.8rem",
                  color: "var(--text-muted)",
                }}
              >
                (현재 페이지 기준 필터 {filtered.length}건)
              </span>
            ) : null}
          </span>

          <span
            style={{
              fontSize: "0.82rem",
              color: "var(--text-muted)",
              fontWeight: 700,
            }}
          >
            {page} / {totalPages}
          </span>
        </div>

        <table
          className="adm-table"
          style={{ tableLayout: "fixed", width: "100%", minWidth: "1400px" }}
        >
          <thead>
            <tr>
              <th style={{ width: "60px", textAlign: "center" }}>NO.</th>
              <th style={{ width: "180px", textAlign: "center" }}>예약병원</th>
              <th style={{ width: "110px", textAlign: "center" }}>예약자성함</th>
              <th style={{ width: "90px", textAlign: "center" }}>유형</th>
              <th style={{ width: "150px", textAlign: "center" }}>예약시간</th>
              <th style={{ width: "110px", textAlign: "center" }}>상태</th>
              <th style={{ width: "240px", textAlign: "center" }}>요청사항</th>
              <th style={{ width: "150px", textAlign: "center" }}>신청일시</th>
              <th style={{ width: "160px", textAlign: "center" }}>처리</th>
            </tr>
          </thead>

          <tbody>
            {!loading && filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  style={{
                    textAlign: "center",
                    padding: "2.5rem 1rem",
                    color: "var(--text-muted)",
                    fontWeight: 700,
                  }}
                >
                  표시할 예약이 없습니다.
                </td>
              </tr>
            ) : (
              filtered.map((r, idx) => (
                <tr key={r.id ?? idx} style={{ height: "70px" }}>
                  <td
                    style={{ textAlign: "center", color: "var(--text-muted)" }}
                  >
                    {(page - 1) * size + idx + 1}
                  </td>
                  <td style={{ textAlign: "center", fontWeight: 700 }}>
                    {r.hospitalName}
                  </td>
                  <td style={{ textAlign: "center", fontWeight: 700 }}>
                    {r.patientName}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "4px 10px",
                        borderRadius: "999px",
                        fontSize: "0.75rem",
                        fontWeight: 800,
                        background:
                          r.visitType === "초진"
                            ? "#dcfce7"     // 연한 초록
                            : "#fef9c3",    // 연한 노랑
                        color:
                          r.visitType === "초진"
                            ? "#16a34a"     // 초록 글자
                            : "#ca8a04",    // 노랑 글자
                        border:
                          r.visitType === "초진"
                            ? "1px solid #86efac"
                            : "1px solid #fde047",
                      }}
                    >
                      {r.visitType}
                    </span>
                  </td>
                <td style={{ textAlign: "center", fontWeight: 600, color: "var(--text-secondary)" }}>
                  {(() => {
                    const v = String(r.reservedAt ?? "").replace("T", " ");
                    const [date, time] = v.split(" ");
                    const hhmm = time ? time.slice(0, 5) : "";

                    return (
                      <div style={{ lineHeight: 1.4 }}>
                        <div>{date || "-"}</div>
                        <div style={{ fontSize: "0.85rem", color: "var(--primary-teal)", fontWeight: 700 }}>
                          {hhmm}
                        </div>
                      </div>
                    );
                  })()}
                </td>
                  <td style={{ textAlign: "center" }}>
                    <span
                      className={`adm-badge ${r.status === "예약대기" ? "adm-st-wait" : r.status === "예약확정" ? "adm-on" : ""}`}
                      style={{
                        width: "75px",
                        background: r.status === "예약취소" ? "#f1f5f9" : "",
                        color: r.status === "예약취소" ? "#94a3b8" : "",
                      }}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td style={{ textAlign: "left" }}>
                    <div
                      onClick={() => {
                        setMemoText(r.requestMemo);
                        setMemoOpen(true);
                      }}
                      style={{
                        cursor: "pointer",
                        color: "var(--primary-teal)",
                        fontWeight: 600,
                        fontSize: "0.85rem",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                      title="클릭해서 전체 보기"
                    >
                      <i
                        className="far fa-comment-dots"
                        style={{ marginRight: "6px" }}
                      />{" "}
                      {r.requestMemo || "요청사항 없음"}
                    </div>
                  </td>

                  {/* ✅ ISO → "YYYY-MM-DD HH:mm" */}
                  <td
                    style={{
                      textAlign: "center",
                      color: "var(--text-muted)",
                      fontSize: "0.82rem",
                    }}
                  >
                    {String(r.createdAt ?? "")
                      .replace("T", " ")
                      .slice(0, 16) || "-"}
                  </td>

                  <td style={{ textAlign: "center", padding: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        gap: "6px",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "100%",
                      }}
                    >
                      {(() => {
                        if (r.status === "예약대기") {
                          return (
                            <>
                              <button
                                onClick={() =>
                                  handleStatusChange(r.id, "예약확정")
                                }
                                style={{
                                  width: "55px",
                                  height: "32px",
                                  background: "#dcfce7",
                                  color: "#16a34a",
                                  border: "1px solid #86efac",
                                  borderRadius: "6px",
                                  fontWeight: 800,
                                  cursor: "pointer",
                                }}
                              >
                                승인
                              </button>
                              <button
                                onClick={() =>
                                  handleStatusChange(r.id, "예약취소")
                                }
                                style={{
                                  width: "55px",
                                  height: "32px",
                                  background: "#fee2e2",
                                  color: "#dc2626",
                                  border: "1px solid #fca5a5",
                                  borderRadius: "6px",
                                  fontWeight: 800,
                                  cursor: "pointer",
                                }}
                              >
                                취소
                              </button>
                            </>
                          );
                        }
                        if (r.status === "예약확정") {
                          return (
                            <button
                              onClick={() =>
                                handleStatusChange(r.id, "예약취소")
                              }
                              style={{
                                width: "70px",
                                height: "32px",
                                background: "#fee2e2",
                                color: "#dc2626",
                                border: "1px solid #fca5a5",
                                borderRadius: "6px",
                                fontWeight: 800,
                                cursor: "pointer",
                              }}
                            >
                              예약취소
                            </button>
                          );
                        }
                        return (
                          <span
                            style={{
                              fontSize: "0.8rem",
                              color: "var(--text-muted)",
                              fontWeight: 600,
                            }}
                          >
                            처리완료
                          </span>
                        );
                      })()}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* 페이지네이션 */}
        <div
          style={{
            padding: "1.5rem",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "1.25rem",
            background: "#fff",
            borderTop: "1px solid var(--border-color)",
          }}
        >
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "var(--radius-md)",
              border: "2px solid var(--border-color)",
              background: "#fff",
              cursor: page === 1 ? "not-allowed" : "pointer",
              opacity: page === 1 ? 0.4 : 1,
            }}
            title="이전"
          >
            <i className="fas fa-chevron-left" />
          </button>

          <span
            style={{
              fontSize: "0.95rem",
              fontWeight: 800,
              color: "var(--text-primary)",
            }}
          >
            <span style={{ color: "var(--primary-teal)" }}>{page}</span> /{" "}
            {totalPages}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "var(--radius-md)",
              border: "2px solid var(--border-color)",
              background: "#fff",
              cursor: page === totalPages ? "not-allowed" : "pointer",
              opacity: page === totalPages ? 0.4 : 1,
            }}
            title="다음"
          >
            <i className="fas fa-chevron-right" />
          </button>
        </div>
      </div>
    </div>
  );
}
