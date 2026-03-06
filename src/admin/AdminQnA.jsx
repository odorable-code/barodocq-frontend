import React, { useEffect, useMemo, useState } from "react";
import { authFetch } from "../utils/AuthFetch";
import { jwtDecode } from "jwt-decode";
import "../assets/styles/AdminQnA.css";

export default function AdminQnA() {
  const [dataList, setDataList] = useState([]);
  const [userRole, setUserRole] = useState("");
  const [replyTarget, setReplyTarget] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [statusFilter, setStatusFilter] = useState("전체");
  const [activeSort, setActiveSort] = useState("latest");
  const [keyword, setKeyword] = useState("");
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      try {
        setUserRole(jwtDecode(token).role);
      } catch {
        console.error("토큰 해석 실패");
      }
    }
    loadQnas();
  }, []);

  const loadQnas = async () => {
    try {
      setLoading(true);
      setLoadError("");

      const res = await authFetch("http://localhost:8080/api/v1/admin/qnas");
      const data = await res.json();

      const uniqueData = Array.isArray(data)
        ? data.filter((v, i, a) => a.findIndex((t) => t.qnNum === v.qnNum) === i)
        : [];

      setDataList(uniqueData);
    } catch (err) {
      console.error("데이터 로드 실패:", err);
      setLoadError("Q&A 목록을 불러오지 못했습니다.");
      setDataList([]);
    } finally {
      setLoading(false);
    }
  };

  const finalFiltered = useMemo(() => {
    let result = [...dataList];

    if (statusFilter === "대기중") {
      result = result.filter(
        (r) => r.qnDeletedYn !== 1 && r.qnStatus !== "답변완료"
      );
    } else if (statusFilter === "답변완료") {
      result = result.filter(
        (r) => r.qnDeletedYn !== 1 && r.qnStatus === "답변완료"
      );
    }
    if (keyword.trim()) {
      const kw = keyword.toLowerCase().trim();
      result = result.filter(
        (r) =>
          String(r.userName ?? "").toLowerCase().includes(kw) ||
          String(r.qnTitle ?? "").toLowerCase().includes(kw) ||
          String(r.hoName ?? "").toLowerCase().includes(kw)
      );
    }

    if (activeSort === "latest") {
      result.sort((a, b) => (b.qnNum ?? 0) - (a.qnNum ?? 0));
    }
    if (activeSort === "popular") {
      result.sort((a, b) => (b.qnViewCount ?? 0) - (a.qnViewCount ?? 0));
    }

    return result;
  }, [dataList, keyword, statusFilter, activeSort]);

  const toggleReplyBox = (q) => {
    if (replyTarget === q.qnNum) {
      setReplyTarget(null);
      setReplyContent("");
    } else {
      setReplyTarget(q.qnNum);
      setReplyContent(q.qaContent || "");
    }
  };

  const handleReplySubmit = async (qnNum) => {
    if (!replyContent.trim()) return alert("내용을 입력하세요.");

    try {
      await authFetch(`http://localhost:8080/api/v1/admin/qnas/${qnNum}/answer`, {
        method: "POST",
        body: JSON.stringify({ qaContent: replyContent }),
      });

      alert("저장되었습니다.");
      setReplyTarget(null);
      setReplyContent("");
      loadQnas();
    } catch (err) {
      console.error(err);
      alert("저장에 실패했습니다.");
    }
  };

  const statusBadge = (q) => {
    if (q.qnDeletedYn === 1) {
      return <span className="adm-badge adm-off">삭제됨</span>;
    }
    if (q.qnStatus === "답변완료") {
      return (
        <span
          className="adm-badge"
          style={{
            background: "#dcfce7",
            color: "#16a34a",
            border: "1px solid #86efac",
          }}
        >
          답변완료
        </span>
      );
    }
    return (
      <span
        className="adm-badge"
        style={{
          background: "#fef9c3",
          color: "#ca8a04",
          border: "1px solid #fde047",
        }}
      >
        대기중
      </span>
    );
  };

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
            <span style={{ color: "var(--primary-teal)" }}>Q&amp;A</span>
          </div>

          <h1 className="adm-page-title" style={{ marginBottom: 0 }}>
            Q&amp;A <span>관리</span>
          </h1>
        </div>

        <button
          onClick={loadQnas}
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
              {["전체", "대기중", "답변완료"].map((tab) => (
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
                      statusFilter === tab ? "transparent" : "var(--border-color)",
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
              <i className="fas fa-eye" style={{ marginRight: 6 }} />
              조회수순
            </button>
          </div>
        </div>
      </div>

      {/* 결과 + 테이블 */}
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

          <span
            style={{
              fontSize: "0.82rem",
              color: "var(--text-muted)",
              fontWeight: 700,
            }}
          >
            권한: {userRole || "-"}
          </span>
        </div>

        <table
          className="adm-table"
          style={{ tableLayout: "fixed", width: "100%", minWidth: "1200px" }}
        >
          <thead>
            <tr>
              <th style={{ width: "130px", textAlign: "center" }}>상태</th>
              <th style={{ width: "180px", textAlign: "center" }}>병원명</th>
              <th style={{ width: "130px", textAlign: "center" }}>작성자</th>
              <th style={{ width: "400px", textAlign: "center" }}>제목</th>
              <th style={{ width: "90px", textAlign: "center" }}>조회수</th>
              <th style={{ width: "130px", textAlign: "center" }}>등록일</th>
              <th style={{ width: "120px", textAlign: "center" }}>관리</th>
            </tr>
          </thead>

          <tbody>
            {!loading && finalFiltered.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  style={{
                    textAlign: "center",
                    padding: "2.5rem 1rem",
                    color: "var(--text-muted)",
                    fontWeight: 700,
                  }}
                >
                  표시할 문의가 없습니다.
                </td>
              </tr>
            ) : (
              finalFiltered.slice(0, limit).map((q) => (
                <React.Fragment key={`qna-${q.qnNum}`}>
                  <tr
                    style={{
                      background: replyTarget === q.qnNum ? "#f8fffe" : "#fff",
                    }}
                  >
                    <td style={{ textAlign: "center" }}>{statusBadge(q)}</td>

                    <td style={{ textAlign: "center", fontWeight: 700 }}>
                      {q.hoName || "병원정보없음"}
                    </td>

                    <td style={{ textAlign: "center" }}>{q.userName || "-"}</td>

                    <td
                      onClick={() => toggleReplyBox(q)}
                      style={{
                        cursor: "pointer",
                        textAlign: "left",
                        fontWeight: 700,
                        color: "var(--text-secondary)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: "12px",
                        }}
                      >
                        <span
                          style={{
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                          title={q.qnTitle}
                        >
                          {q.qnTitle || "-"}
                        </span>
                        <i
                          className={`fas fa-chevron-${
                            replyTarget === q.qnNum ? "up" : "down"
                          }`}
                          style={{
                            color: "var(--text-muted)",
                            fontSize: "0.8rem",
                            flexShrink: 0,
                          }}
                        />
                      </div>
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
                        {q.qnViewCount || 0}
                      </span>
                    </td>                 
                    <td
                      style={{
                        textAlign: "center",
                        color: "var(--text-muted)",
                        fontSize: "0.82rem",
                        fontWeight: 600,
                      }}
                    >
                      {String(q.qnCreatedAt ?? q.createdAt ?? "")
                        .replace("T", " ")
                        .slice(0, 10) || "-"}
                    </td>

                    <td style={{ textAlign: "center" }}>
                      <button
                        onClick={() => toggleReplyBox(q)}
                        style={{
                          minWidth: "78px",
                          height: "32px",
                          background:
                            q.qnStatus === "답변완료" ? "#eff6ff" : "#dcfce7",
                          color:
                            q.qnStatus === "답변완료" ? "#2563eb" : "#16a34a",
                          border:
                            q.qnStatus === "답변완료"
                              ? "1px solid #bfdbfe"
                              : "1px solid #86efac",
                          borderRadius: "6px",
                          fontWeight: 800,
                          cursor: "pointer",
                        }}
                      >
                        {q.qnStatus === "답변완료" ? "수정하기" : "답변하기"}
                      </button>
                    </td>
                  </tr>

                  {replyTarget === q.qnNum && (
                    <tr>
                      <td colSpan={6} style={{ padding: "0", background: "#f8fffe" }}>
                        <div
                          style={{
                            padding: "1.5rem",
                            borderTop: "1px solid #d1fae5",
                          }}
                        >
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "1fr 1.2fr",
                              gap: "1rem",
                            }}
                          >
                            <div
                              style={{
                                background: "#fff",
                                border: "1px solid var(--border-color)",
                                borderRadius: "var(--radius-lg)",
                                padding: "1.25rem",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px",
                                  fontSize: "0.9rem",
                                  fontWeight: 800,
                                  color: "var(--primary-teal)",
                                  marginBottom: "0.85rem",
                                }}
                              >
                                <i className="fas fa-circle-question" />
                                질문 내용
                              </div>

                              <div
                                style={{
                                  lineHeight: 1.7,
                                  color: "var(--text-secondary)",
                                  whiteSpace: "pre-wrap",
                                  minHeight: "120px",
                                }}
                              >
                                {q.qnContent || "내용이 없습니다."}
                              </div>
                            </div>

                            <div
                              style={{
                                background: "#fff",
                                border: "1px solid var(--border-color)",
                                borderRadius: "var(--radius-lg)",
                                padding: "1.25rem",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px",
                                  fontSize: "0.9rem",
                                  fontWeight: 800,
                                  color: "var(--primary-teal)",
                                  marginBottom: "0.85rem",
                                }}
                              >
                                <i className="fas fa-pen-to-square" />
                                답변 작성
                              </div>

                              <textarea
                                placeholder="환자에게 전달할 답변을 입력하세요..."
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                style={{
                                  width: "100%",
                                  minHeight: "140px",
                                  resize: "vertical",
                                  borderRadius: "12px",
                                  border: "2px solid var(--border-color)",
                                  padding: "0.9rem 1rem",
                                  outline: "none",
                                  fontSize: "0.95rem",
                                  lineHeight: 1.6,
                                  color: "var(--text-secondary)",
                                  background: "#fcfffe",
                                }}
                              />

                              <div
                                style={{
                                  marginTop: "1rem",
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  gap: "1rem",
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: "0.8rem",
                                    color: "var(--text-muted)",
                                    fontWeight: 700,
                                  }}
                                >
                                  {replyContent.length} 자
                                </span>

                                <div style={{ display: "flex", gap: "8px" }}>
                                  <button
                                    onClick={() => {
                                      setReplyTarget(null);
                                      setReplyContent("");
                                    }}
                                    style={{
                                      border: "none",
                                      background: "var(--bg-secondary)",
                                      color: "var(--text-secondary)",
                                      padding: "10px 14px",
                                      borderRadius: "10px",
                                      fontWeight: 800,
                                      cursor: "pointer",
                                    }}
                                  >
                                    취소
                                  </button>

                                  <button
                                    onClick={() => handleReplySubmit(q.qnNum)}
                                    disabled={!replyContent.trim()}
                                    style={{
                                      border: "none",
                                      background: !replyContent.trim()
                                        ? "#d1d5db"
                                        : "linear-gradient(135deg, var(--primary-mint), var(--primary-teal))",
                                      color: "#fff",
                                      padding: "10px 16px",
                                      borderRadius: "10px",
                                      fontWeight: 800,
                                      cursor: !replyContent.trim() ? "not-allowed" : "pointer",
                                    }}
                                  >
                                    <i
                                      className="fas fa-paper-plane"
                                      style={{ marginRight: 6 }}
                                    />
                                    저장
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
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