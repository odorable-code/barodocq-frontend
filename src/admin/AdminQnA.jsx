import React, { useEffect, useMemo, useState } from "react";
import { authFetch } from "../utils/AuthFetch";
import { jwtDecode } from "jwt-decode";
import "../assets/styles/AdminQnA.css";

export default function AdminQnA() {
  const [dataList, setDataList]           = useState([]);
  const [userRole, setUserRole]           = useState("");
  const [replyTarget, setReplyTarget]     = useState(null);
  const [replyContent, setReplyContent]   = useState("");
  const [statusFilter, setStatusFilter]   = useState("전체");
  const [activeSort, setActiveSort]       = useState("latest");
  const [keyword, setKeyword]             = useState("");
  const [limit, setLimit]                 = useState(10);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      try { setUserRole(jwtDecode(token).role); }
      catch { console.error("토큰 해석 실패"); }
    }
    loadQnas();
  }, []);

  const loadQnas = async () => {
    try {
      const res  = await authFetch("http://localhost:8080/api/v1/admin/qnas");
      const data = await res.json();
      setDataList(data.filter((v, i, a) => a.findIndex(t => t.qnNum === v.qnNum) === i));
    } catch (err) { console.error("데이터 로드 실패:", err); }
  };

  const finalFiltered = useMemo(() => {
    let result = [...dataList];
    if (statusFilter === "정상") result = result.filter(r => r.qnDeletedYn === 0);
    else if (statusFilter === "삭제") result = result.filter(r => r.qnDeletedYn === 1);

    if (keyword.trim()) {
      const kw = keyword.toLowerCase().trim();
      result = result.filter(r =>
        r.userName?.toLowerCase().includes(kw) ||
        r.qnTitle?.toLowerCase().includes(kw)  ||
        r.hoName?.toLowerCase().includes(kw)
      );
    }
    if (activeSort === "latest")  result.sort((a, b) => b.qnNum - a.qnNum);
    if (activeSort === "popular") result.sort((a, b) => (b.qnViewCount || 0) - (a.qnViewCount || 0));
    return result;
  }, [dataList, keyword, statusFilter, activeSort]);

  const toggleReplyBox = (q) => {
    if (replyTarget === q.qnNum) { setReplyTarget(null); setReplyContent(""); }
    else { setReplyTarget(q.qnNum); setReplyContent(q.qaContent || ""); }
  };

  const handleReplySubmit = async (qnNum) => {
    if (!replyContent.trim()) return alert("내용을 입력하세요.");
    try {
      await authFetch(`http://localhost:8080/api/v1/admin/qnas/${qnNum}/answer`, {
        method: "POST",
        body: JSON.stringify({ qaContent: replyContent })
      });
      alert("저장되었습니다.");
      setReplyTarget(null);
      setReplyContent("");
      loadQnas();
    } catch { alert("저장에 실패했습니다."); }
  };

  /* 글로벌 .adm-badge + .adm-on/.adm-off 재사용 */
  const statusBadge = (q) => {
    if (q.qnDeletedYn === 1)       return <span className="adm-badge adm-off">삭제됨</span>;
    if (q.qnStatus === "답변완료") return <span className="adm-badge qna-done">답변완료</span>;
    return <span className="adm-badge qna-pending">대기중</span>;
  };

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
                onClick={() => setStatusFilter(tab)}
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
              onChange={e => setKeyword(e.target.value)}
            />
            {keyword && (
              <button className="rv-search__clear" onClick={() => setKeyword("")}>
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
              <i className="fas fa-eye" /> 조회수순
            </button>
          </div>
        </div>
      </div>

      {/* ── 결과 바 ── */}
      <div className="rv-result-bar">
        <span>검색 결과 <strong>{finalFiltered.length}</strong>건</span>
        {keyword && (
          <span className="rv-result-keyword">"<strong>{keyword}</strong>" 검색 중</span>
        )}
      </div>

      {/* ── 테이블 ── */}
      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead>
            <tr>
              <th style={{ width: "100px" }}>상태</th>
              <th>병원명</th>
              <th style={{ width: "100px" }}>작성자</th>
              <th>제목</th>
              <th style={{ width: "80px"  }}>조회수</th>
              <th style={{ width: "110px" }}>관리</th>
            </tr>
          </thead>
          <tbody>
            {finalFiltered.slice(0, limit).map(q => (
              <React.Fragment key={`qna-${q.qnNum}`}>
                <tr className={replyTarget === q.qnNum ? "qna-row--active" : ""}>
                  <td>{statusBadge(q)}</td>
                  <td className="td-bold">{q.hoName || "병원정보없음"}</td>
                  <td>{q.userName}</td>
                  <td className="qna-td-title" onClick={() => toggleReplyBox(q)}>
                    {q.qnTitle}
                    <i className={`fas fa-chevron-${replyTarget === q.qnNum ? "up" : "down"} qna-td-title__arrow`} />
                  </td>
                  <td className="td-center">
                    <span className="rv-view-count"><i className="fas fa-eye" /> {q.qnViewCount || 0}</span>
                  </td>
                  <td className="td-center">
                    <button
                      className={`rv-action-btn ${q.qnStatus === "답변완료" ? "edit" : "reply"}`}
                      onClick={() => toggleReplyBox(q)}
                    >
                      {q.qnStatus === "답변완료" ? "수정하기" : "답변하기"}
                    </button>
                  </td>
                </tr>

                {replyTarget === q.qnNum && (
                  <tr className="qna-reply-row">
                    <td colSpan="6">
                      <div className="qna-reply-box">
                        <div className="qna-reply-box__question">
                          <span className="qna-reply-box__label">
                            <i className="fas fa-circle-question" /> 질문 내용
                          </span>
                          <p className="qna-reply-box__qcontent">{q.qnContent}</p>
                        </div>
                        <div className="qna-reply-box__answer">
                          <span className="qna-reply-box__label">
                            <i className="fas fa-pen-to-square" /> 답변 작성
                          </span>
                          <textarea
                            className="qna-reply-box__textarea"
                            placeholder="환자에게 전달할 답변을 입력하세요..."
                            value={replyContent}
                            onChange={e => setReplyContent(e.target.value)}
                          />
                          <div className="qna-reply-box__footer">
                            <span className="qna-reply-box__charcount">{replyContent.length} 자</span>
                            <div className="qna-reply-box__btns">
                              <button className="rv-btn-ghost" onClick={() => { setReplyTarget(null); setReplyContent(""); }}>
                                취소
                              </button>
                              <button className="rv-btn-primary" onClick={() => handleReplySubmit(q.qnNum)} disabled={!replyContent.trim()}>
                                <i className="fas fa-paper-plane" /> 저장
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}

            {finalFiltered.length === 0 && (
              <tr>
                <td colSpan="6" className="rv-td-empty">
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
  );
}
