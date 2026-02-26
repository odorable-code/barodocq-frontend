// ═══════════════════════════════════════════════════
//  ReviewRevise.jsx
//  역할 : 기존 후기 수정 페이지
//  흐름 : 마운트 시 기존 데이터 조회 → 수정 후 PUT 요청
// ═══════════════════════════════════════════════════

import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { authFetch } from "../utils/AuthFetch";
import "../assets/styles/ReviewRevise.css";

// 별점 숫자 → 한글 라벨 매핑 (인덱스 0은 미선택)
const RATING_LABELS = ["", "별로예요", "그저 그래요", "보통이에요", "좋았어요", "최고예요!"];

// ─────────────────────────────────────────────────
function ReviewRevise() {
  const { rvNum } = useParams();  // URL 파라미터에서 후기 번호 추출
  const navigate  = useNavigate();

  // ── 폼 상태 ───────────────────────────────────
  const [title,       setTitle]       = useState("");  // 수정할 제목
  const [content,     setContent]     = useState("");  // 수정할 본문
  const [rating,      setRating]      = useState(0);  // 수정할 별점
  const [hoverRating, setHoverRating] = useState(0);  // 별점 hover 시 임시값

  // ── 원본 정보 (사이드바 표시용) ──────────────
  const [originalTitle,     setOriginalTitle]     = useState("");
  const [originalCreatedAt, setOriginalCreatedAt] = useState("");

  // ── 변경 감지 (수정된 내용이 있을 때만 저장 버튼 활성화) ──
  const [isDirty, setIsDirty] = useState(false);

  const token = localStorage.getItem("token");
  console.log("현재 token:", token);

  // 별점 표시값: hover 중이면 hover값, 아니면 선택값
  const displayRating = hoverRating || rating;


  // ─────────────────────────────────────────────
  //  기존 후기 데이터 불러오기
  //  - GET /api/v1/reviews/revise/:rvNum
  //  - 불러온 데이터로 폼 초기값 세팅
  //  - originalTitle, originalCreatedAt은 사이드바 표시용으로만 사용
  // ─────────────────────────────────────────────
  useEffect(() => {
    const fetchReview = async () => {
      try {
        const response = await authFetch(
          `http://localhost:8080/api/v1/reviews/revise/${rvNum}`
        );
        const data = await response.json();

        // 폼 초기값 세팅
        setTitle(data.rvTitle);
        setContent(data.rvContent);
        setRating(data.rvRating);

        // 원본 정보 저장 (사이드바 표시용)
        setOriginalTitle(data.rvTitle);
        setOriginalCreatedAt(data.rvCreatedAt?.substring(0, 10) ?? "");
      } catch (err) {
        console.error("후기 불러오기 오류:", err);
        alert("후기를 불러오지 못했습니다.");
      }
    };
    fetchReview();
  }, [rvNum]);


  // ─────────────────────────────────────────────
  //  후기 수정 API 호출
  //  - PUT /api/v1/reviews/revise/:rvNum
  //  - 서버 응답: text (성공 메시지)
  //  - 성공 시 /reviews 목록으로 이동
  // ─────────────────────────────────────────────
  const updateReview = async () => {
  if (!title.trim()) { alert("제목을 입력해주세요."); return; }
  if (!content.trim()) { alert("내용을 입력해주세요."); return; }
  if (rating === 0) { alert("별점을 선택해주세요."); return; }

  try {
    const res = await authFetch(
      `http://localhost:8080/api/v1/reviews/revise/${rvNum}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rvTitle: title, rvContent: content, rvRating: rating }),
      }
    );

    if (!res.ok) {  // <- res로 바뀌어야 함
      if (res.status === 403) throw new Error("본인이 작성한 후기만 수정할 수 있습니다.");
      const errText = await res.text();
      throw new Error(errText || "수정에 실패했습니다.");
    }

    const result = await res.text();
    alert(result);
    navigate("/reviews");

  } catch (err) {
    alert(err.message || "수정에 실패했습니다.");
  }
};


  // ─────────────────────────────────────────────
  //  렌더링
  // ─────────────────────────────────────────────
  return (
    <div className="rr-page">

      {/* ════════════════════════════════
          히어로 헤더
          - 브레드크럼 + 제목 + 설명
      ════════════════════════════════ */}
      <section className="rr-hero">
        <div className="rr-hero__blob rr-hero__blob--a" />
        <div className="rr-hero__blob rr-hero__blob--b" />
        <div className="rr-hero__inner">

          {/* 브레드크럼 */}
          <nav className="rr-breadcrumb">
            <Link to="/">홈</Link>
            <i className="fas fa-chevron-right" />
            <Link to="/reviews">병원 후기</Link>
            <i className="fas fa-chevron-right" />
            <Link to={`/reviews/${rvNum}`}>후기 상세</Link>
            <i className="fas fa-chevron-right" />
            <span>후기 수정</span>
          </nav>

          <h1 className="rr-hero__title">
            <i className="fas fa-pen-to-square" /> 후기 수정
          </h1>
          <p className="rr-hero__sub">
            작성하신 후기를 수정합니다. 솔직한 내용을 유지해주세요.
          </p>
        </div>
      </section>


      {/* ════════════════════════════════
          바디 — 좌(폼) + 우(사이드바) 2컬럼
      ════════════════════════════════ */}
      <div className="rr-body">
        <div className="rr-body__grid">

          {/* ── 메인 폼 ── */}
          <main className="rr-form">

            {/* 수정 안내 배너 */}
            <div className="rr-alert">
              <i className="fas fa-circle-info" />
              <span>기존 내용이 자동으로 불러와졌습니다. 수정 후 저장해주세요.</span>
            </div>

            {/* ── 별점 섹션 ── */}
            <div className="rr-section">
              <div className="rr-section__title">
                <div className="rr-section__icon">
                  <i className="fas fa-star" />
                </div>
                별점 수정
              </div>

              <div className="rr-rating">
                <div className="rr-rating__stars">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <i
                      key={num}
                      className={`fas fa-star ${num <= displayRating ? "filled" : ""}`}
                      onClick={() => { setRating(num); setIsDirty(true); }}
                      onMouseEnter={() => setHoverRating(num)}   // hover 시 임시 별점
                      onMouseLeave={() => setHoverRating(0)}     // hover 해제
                    />
                  ))}
                </div>
                {/* 별점에 해당하는 한글 라벨 */}
                <div className="rr-rating__label">
                  {displayRating > 0 ? RATING_LABELS[displayRating] : "별점을 선택해주세요"}
                </div>
              </div>
            </div>

            {/* ── 제목 섹션 ── */}
            <div className="rr-section">
              <div className="rr-section__title">
                <div className="rr-section__icon">
                  <i className="fas fa-heading" />
                </div>
                제목 수정
              </div>

              <div className="rr-form-group">
                <label>제목 <span className="rr-required">*</span></label>
                <div className="rr-input-icon">
                  <i className="fas fa-pen" />
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => { setTitle(e.target.value); setIsDirty(true); }}
                    placeholder="후기 제목을 입력해주세요"
                    maxLength={50}
                  />
                </div>
                <div className="rr-char-count">{title.length} / 50</div>
              </div>
            </div>

            {/* ── 내용 섹션 ── */}
            <div className="rr-section">
              <div className="rr-section__title">
                <div className="rr-section__icon">
                  <i className="fas fa-align-left" />
                </div>
                내용 수정
              </div>

              <div className="rr-form-group">
                <label>내용 <span className="rr-required">*</span></label>
                <textarea
                  className="rr-textarea"
                  value={content}
                  onChange={(e) => { setContent(e.target.value); setIsDirty(true); }}
                  placeholder="병원 이용 경험을 자세히 작성해주세요"
                  rows={7}
                  maxLength={1000}
                />
                <div className="rr-char-count">{content.length} / 1000</div>
              </div>
            </div>

            {/* ── 액션 버튼 ── */}
            <div className="rr-actions">
              <button
                className="rr-btn rr-btn--cancel"
                onClick={() => navigate(`/reviews/${rvNum}`)}
              >
                <i className="fas fa-arrow-left" /> 취소
              </button>

              {/* isDirty: 변경사항 없으면 버튼 비활성화 */}
              <button
                className="rr-btn rr-btn--submit"
                onClick={updateReview}
                disabled={!isDirty}
              >
                <i className="fas fa-floppy-disk" /> 수정 완료
              </button>
            </div>
          </main>


          {/* ── 사이드 패널 ── */}
          <aside className="rr-side">

            {/* 수정 주의사항 카드 */}
            <div className="rr-info-card rr-info-card--warn">
              <div className="rr-info-card__icon rr-info-card__icon--warn">
                <i className="fas fa-triangle-exclamation" />
              </div>
              <h3>수정 시 주의사항</h3>
              <ul>
                <li><i className="fas fa-circle-dot" /> 수정 후에는 되돌릴 수 없습니다</li>
                <li><i className="fas fa-circle-dot" /> 허위 내용 작성 시 제재받을 수 있습니다</li>
                <li><i className="fas fa-circle-dot" /> 타인을 비방하는 내용은 삭제됩니다</li>
                <li><i className="fas fa-circle-dot" /> 실제 경험을 바탕으로 작성해주세요</li>
              </ul>
            </div>

            {/* 원본 정보 카드 — 수정 전 원래 내용 표시 */}
            <div className="rr-info-card">
              <div className="rr-info-card__icon">
                <i className="fas fa-clock-rotate-left" />
              </div>
              <h3>원본 정보</h3>
              <div className="rr-original-list">
                <div className="rr-original-item">
                  <span className="rr-original-label">원본 제목</span>
                  <span className="rr-original-value">{originalTitle || "불러오는 중..."}</span>
                </div>
                <div className="rr-original-item">
                  <span className="rr-original-label">원본 별점</span>
                  <span className="rr-original-value">
                    {rating > 0
                      ? `${"★".repeat(rating)}${"☆".repeat(5 - rating)} (${rating}.0)`
                      : "불러오는 중..."}
                  </span>
                </div>
                <div className="rr-original-item">
                  <span className="rr-original-label">작성일</span>
                  <span className="rr-original-value">{originalCreatedAt || "불러오는 중..."}</span>
                </div>
              </div>
            </div>

            {/* 수정 현황 카드 */}
            <div className="rr-info-card">
              <div className="rr-info-card__icon">
                <i className="fas fa-list-check" />
              </div>
              <h3>수정 현황</h3>
              <div className="rr-progress-list">
                {/* isDirty 상태에 따라 "수정 중" / "수정 없음" 표시 */}
                <div className={`rr-progress-item ${isDirty ? "changed" : ""}`}>
                  <i className={`fas ${isDirty ? "fa-circle-dot" : "fa-circle"}`} />
                  <span>{isDirty ? "수정 내용 있음" : "수정 내용 없음"}</span>
                </div>
                <div className="rr-progress-item">
                  <i className="fas fa-circle" />
                  <span>글자 수: {content.length}자</span>
                </div>
              </div>
            </div>

          </aside>
        </div>
      </div>
    </div>
  );
}

export default ReviewRevise;
