import React, { useEffect, useMemo, useState } from "react";
import { authFetch } from "../utils/AuthFetch";
import { jwtDecode } from "jwt-decode";

export default function AdminQnA() {
  const [dataList, setDataList] = useState([]);
  const [userRole, setUserRole] = useState("");
  const [replyTarget, setReplyTarget] = useState(null);
  const [replyContent, setReplyContent] = useState("");

  const [statusFilter, setStatusFilter] = useState("전체");
  const [activeSort, setActiveSort] = useState("latest");
  const [keyword, setKeyword] = useState("");
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      try {
        setUserRole(jwtDecode(token).role);
      } catch (e) {
        console.error("토큰 해석 실패");
      }
    }
    loadQnas();
  }, []);

  const loadQnas = async () => {
    try {
      const res = await authFetch("http://localhost:8080/api/v1/admin/qnas");
      const data = await res.json();
      const uniqueData = data.filter((v, i, a) => a.findIndex(t => t.qnNum === v.qnNum) === i);
      setDataList(uniqueData); 
    } catch (err) {
      console.error("데이터 로드 실패:", err);
    }
  };

  // [수정] 정렬 및 필터링된 데이터를 반환하는 useMemo
  const finalFiltered = useMemo(() => {
    let result = [...dataList]; // 원본 데이터 복사

    // 1. 상태 필터
    if (statusFilter === "정상") {
      result = result.filter(row => row.qnDeletedYn === 0);
    } else if (statusFilter === "삭제") {
      result = result.filter(row => row.qnDeletedYn === 1);
    }

    // 2. 검색 필터
    if (keyword.trim() !== "") {
      const kw = keyword.toLowerCase().trim();
      result = result.filter(row => 
        row.userName?.toLowerCase().includes(kw) || 
        row.qnTitle?.toLowerCase().includes(kw) || 
        row.hoName?.toLowerCase().includes(kw)
      );
    }

    // 3. 정렬 (실제 동작하도록 수정)
    if (activeSort === "latest") {
      result.sort((a, b) => b.qnNum - a.qnNum);
    } else if (activeSort === "popular") {
      // 조회수(qnViewCount) 기준 내림차순 정렬
      result.sort((a, b) => (b.qnViewCount || 0) - (a.qnViewCount || 0));
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
        body: JSON.stringify({ qaContent: replyContent })
      });
      alert("저장되었습니다.");
      setReplyTarget(null);
      setReplyContent("");
      loadQnas();
    } catch (err) {
      alert("실패");
    }
  };

  return (
    <div className="adm-page">
      <div className="rv-toolbar">
        <div className="rv-toolbar__left">
          <div className="rv-tabs">
            {["전체", "정상", "삭제"].map(tab => (
              <button 
                key={tab}
                className={`rv-sort__btn ${statusFilter === tab ? "active" : ""}`}
                onClick={() => { setStatusFilter(tab); }}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="rv-search">
            <input 
              type="text" placeholder="작성자, 제목, 병원명 검색..." 
              value={keyword} onChange={(e) => setKeyword(e.target.value)}
            />
          </div>
        </div>
        <div className="rv-toolbar__right">
          <div className="rv-sort">
            <button className={`rv-sort__btn ${activeSort === "latest" ? "active" : ""}`} onClick={() => setActiveSort("latest")}>최신순</button>
            <button className={`rv-sort__btn ${activeSort === "popular" ? "active" : ""}`} onClick={() => setActiveSort("popular")}>조회수순</button>
          </div>
        </div>
      </div>

      <div className="rv-result-bar">
        <span>검색 결과 <strong>{finalFiltered.length}</strong>건</span>
      </div>

      <table className="adm-table">
        <thead>
          <tr>
            <th>상태</th>
            <th>병원명</th>
            <th>작성자</th>
            <th>제목</th>
            <th>조회수</th> {/* 조회수 컬럼 추가 */}
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          {/* [핵심 수정] dataList가 아니라 필터링된 finalFiltered를 사용함 */}
          {finalFiltered.slice(0, limit).map((q) => (
            <React.Fragment key={`qna-${q.qnNum}`}>
              <tr>
                <td>{q.qnDeletedYn === 1 ? "삭제됨" : q.qnStatus}</td>
                <td>{q.hoName || "병원정보없음"}</td> {/* 병원명 출력 */}
                <td>{q.userName}</td>
                <td onClick={() => toggleReplyBox(q)} style={{ cursor: 'pointer', color: '#007bff' }}>
                  {q.qnTitle}
                </td>
                <td>{q.qnViewCount || 0}</td> {/* 조회수 출력 */}
                <td>
                  <button onClick={() => toggleReplyBox(q)}>
                    {q.qnStatus === "답변완료" ? "수정하기" : "답변하기"}
                  </button>
                </td>
              </tr>
              {replyTarget === q.qnNum && (
                <tr className="reply-row">
                  <td colSpan="6"> {/* colSpan을 6으로 확장 */}
                    <div style={{ padding: "20px", background: "#f8f9fa" }}>
                      <p><strong>질문 내용:</strong> {q.qnContent}</p>
                      <textarea 
                        style={{ width: "100%", height: "100px" }}
                        value={replyContent} 
                        onChange={(e) => setReplyContent(e.target.value)} 
                      />
                      <button onClick={() => handleReplySubmit(q.qnNum)}>저장</button>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}