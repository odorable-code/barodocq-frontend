// ═══════════════════════════════════════════════════
//  ReservationAndReview.jsx
//  역할 : 예약 등록(Step 1) → 후기 작성(Step 2) 2단계 폼
//  흐름 : 예약 등록 성공 시 step 상태가 2로 변경되며
//         후기 작성 화면으로 전환됨
// ═══════════════════════════════════════════════════

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authFetch } from "../utils/AuthFetch";
import "../assets/styles/ReviewCreate.css";

// 별점 숫자 → 한글 라벨 매핑 (인덱스 0은 미선택이므로 빈 문자열)
const RATING_LABELS = ["", "별로예요", "그저 그래요", "보통이에요", "좋았어요", "최고예요!"];

// ─────────────────────────────────────────────────────
function ReservationAndReview() {

  // ── [ Step 1 ] 예약 관련 상태 ──────────────────────
  const [redate,       setRedate]       = useState("");   // 예약 날짜
  const [retime,       setRetime]       = useState("");   // 예약 시간
  const [restatus,     setRestatus]     = useState("");   // 예약 상태 (예정/완료/취소)
  const [revisittype,  setRevisittype]  = useState("");   // 방문 유형 (초진/재진)
  const [rememo,       setRememo]       = useState("");   // 요청사항 메모
  const [usernum,      setUsernum]      = useState("");   // 사용자 번호
  const [honum,        setHonum]        = useState("");   // 병원 번호
  const [deptnum,      setDeptnum]      = useState("");   // 진료과 번호

  // ── [ Step 2 ] 후기 관련 상태 ──────────────────────
  const [renum,        setRenum]        = useState(null); // 예약 고유번호 (후기와 예약 연결 키)
  const [title,        setTitle]        = useState("");   // 후기 제목
  const [content,      setContent]      = useState("");   // 후기 본문
  const [rating,       setRating]       = useState(0);   // 선택된 별점 (1~5)
  const [hoverRating,  setHoverRating]  = useState(0);   // 마우스 올렸을 때 임시 별점
  const [files,        setFiles]        = useState([null, null, null]);    // 첨부 파일 (최대 3개)
  const [previews,     setPreviews]     = useState([null, null, null]);    // 파일 미리보기 URL

  // ── 공통 상태 ──────────────────────────────────────
  const [step, setStep] = useState(1);  // 현재 단계 (1: 예약, 2: 후기)
  const navigate = useNavigate();

  // ── 별점 표시값: hover 중이면 hover값, 아니면 선택값 ──
  const displayRating = hoverRating || rating;


  // ─────────────────────────────────────────────────
  //  이미지 파일 선택 핸들러
  //  - 선택한 파일을 files 배열에 저장
  //  - createObjectURL로 미리보기 URL 생성
  // ─────────────────────────────────────────────────
  const handleFileChange = (idx, file) => {
    const newFiles    = [...files];
    const newPreviews = [...previews];

    newFiles[idx]    = file;
    newPreviews[idx] = file ? URL.createObjectURL(file) : null;

    setFiles(newFiles);
    setPreviews(newPreviews);
  };

  // ─────────────────────────────────────────────────
  //  이미지 삭제 핸들러
  //  - 해당 인덱스의 파일과 미리보기를 null로 초기화
  // ─────────────────────────────────────────────────
  const removeFile = (idx) => {
    const newFiles    = [...files];
    const newPreviews = [...previews];

    newFiles[idx]    = null;
    newPreviews[idx] = null;

    setFiles(newFiles);
    setPreviews(newPreviews);
  };


  // ─────────────────────────────────────────────────
  //  [ Step 1 ] 예약 등록 API 호출
  //  - POST /api/v1/reservations
  //  - 성공 시 step을 2로 변경 → 후기 작성 화면으로 이동
  // ─────────────────────────────────────────────────
  const CreateReservation = async () => {
    try {
      const response = await authFetch("http://localhost:8080/api/v1/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reDate:      redate,
          reTime:      retime,
          reStatus:    restatus,
          reVisitType: revisittype,
          reMemo:      rememo,
          userNum:     usernum,
          hoNum:       honum,
          deptNum:     deptnum,
        }),
      });

      if (response.ok) {
        const text = await response.text();
        alert(text);
        setStep(2); // ✅ 예약 성공 → 후기 작성 단계로 전환
      } else {
        alert("예약 등록 실패");
      }
    } catch (err) {
      console.error("예약 등록 오류:", err);
      alert("서버 오류가 발생했습니다.");
    }
  };


  // ─────────────────────────────────────────────────
  //  [ Step 2 ] 후기 등록 API 호출
  //  - POST /api/v1/reviews (multipart/form-data)
  //  - review 객체는 JSON Blob으로, 이미지는 files[]로 전송
  //  - 성공 시 /reviews 목록 페이지로 이동
  // ─────────────────────────────────────────────────
  const CreateReview = async () => {
    // ── 필수값 유효성 검사 ──
    if (!renum)          { alert("예약 고유번호를 입력해주세요!"); return; }
    if (!title.trim())   { alert("제목을 입력해주세요!");           return; }
    if (!content.trim()) { alert("내용을 입력해주세요!");           return; }
    if (rating === 0)    { alert("별점을 선택해주세요!");           return; }

    // ── FormData 구성 ──
    const formData = new FormData();

    // review 데이터는 JSON Blob으로 묶어서 전송
    formData.append(
      "review",
      new Blob([JSON.stringify({
        reNum:       renum,
        userNum:     usernum,
        hoNum:       honum,
        rvTitle:     title,
        rvContent:   content,
        rvRating:    rating,
        rvDeletedYn: 0,
      })], { type: "application/json" })
    );

    // null이 아닌 파일만 추가
    files.forEach((file) => { if (file) formData.append("files", file); });

    try {
      const res  = await authFetch("http://localhost:8080/api/v1/reviews", {
        method: "POST",
        body: formData,
      });
      const text = await res.text();
      alert(text);
      navigate("/reviews"); // 등록 후 목록으로 이동
    } catch (err) {
      console.error("후기 등록 오류:", err);
      alert("후기 등록에 실패했습니다.");
    }
  };


  // ─────────────────────────────────────────────────
  //  렌더링
  // ─────────────────────────────────────────────────
  return (
    <div className="rc-page">

      {/* ════════════════════════════════
          히어로 헤더
          - 브레드크럼 네비게이션
          - 현재 step에 따라 제목/설명 변경
          - 스텝 인디케이터 (1→2)
      ════════════════════════════════ */}
      <section className="rc-hero">
        <div className="rc-hero__blob rc-hero__blob--a" />
        <div className="rc-hero__blob rc-hero__blob--b" />

        <div className="rc-hero__inner">

          {/* 브레드크럼 */}
          <div className="rc-breadcrumb">
            <Link to="/">홈</Link>
            <i className="fas fa-chevron-right" />
            <Link to="/reviews">병원 후기</Link>
            <i className="fas fa-chevron-right" />
            <span>후기 작성</span>
          </div>

          {/* step에 따라 제목 변경 */}
          <h1 className="rc-hero__title">
            <i className="fas fa-pen-to-square" />
            {step === 1 ? "예약 등록" : "후기 작성"}
          </h1>
          <p className="rc-hero__sub">
            {step === 1
              ? "병원 방문 예약을 먼저 등록해주세요"
              : "실제 경험을 솔직하게 공유해주세요"}
          </p>

          {/* 스텝 인디케이터 */}
          <div className="rc-steps">
            {/* Step 1: active(현재) / done(완료) 클래스로 상태 표시 */}
            <div className={`rc-step ${step >= 1 ? "active" : ""} ${step > 1 ? "done" : ""}`}>
              <div className="rc-step__circle">
                {step > 1 ? <i className="fas fa-check" /> : "1"}
              </div>
              <span>예약 등록</span>
            </div>
            <div className="rc-step__line" />
            {/* Step 2 */}
            <div className={`rc-step ${step >= 2 ? "active" : ""}`}>
              <div className="rc-step__circle">2</div>
              <span>후기 작성</span>
            </div>
          </div>

        </div>
      </section>


      {/* ════════════════════════════════
          바디 — 2컬럼 레이아웃
          좌: 메인 폼 / 우: 사이드 패널
      ════════════════════════════════ */}
      <div className="rc-body">
        <div className="rc-body__grid">

          {/* ── 메인 폼 영역 ── */}
          <main className="rc-form-wrap">

            {/* ────────────────────────────
                STEP 1 — 예약 등록 폼
            ──────────────────────────── */}
            {step === 1 && (
              <div className="rc-form">
                <div className="rc-section">
                  <div className="rc-section__title">
                    <div className="rc-section__icon">
                      <i className="fas fa-calendar-plus" />
                    </div>
                    예약 정보 입력
                  </div>
                  <p className="rc-section__desc">병원 방문 예약 정보를 입력해주세요</p>

                  {/* 2컬럼 입력 그리드 */}
                  <div className="rc-form-grid">

                    {/* 날짜 */}
                    <div className="rc-form-group">
                      <label>예약 날짜 <span className="rc-required">*</span></label>
                      <div className="rc-input-icon">
                        <i className="fas fa-calendar" />
                        <input
                          type="date"
                          value={redate}
                          onChange={(e) => setRedate(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* 시간 */}
                    <div className="rc-form-group">
                      <label>예약 시간 <span className="rc-required">*</span></label>
                      <div className="rc-input-icon">
                        <i className="fas fa-clock" />
                        <input
                          type="time"
                          value={retime}
                          onChange={(e) => setRetime(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* 예약 상태 드롭다운 */}
                    <div className="rc-form-group">
                      <label>예약 상태</label>
                      <div className="rc-input-icon">
                        <i className="fas fa-circle-info" />
                        <select value={restatus} onChange={(e) => setRestatus(e.target.value)}>
                          <option value="">상태 선택</option>
                          <option value="예정">예정</option>
                          <option value="완료">완료</option>
                          <option value="취소">취소</option>
                        </select>
                      </div>
                    </div>

                    {/* 초진/재진 */}
                    <div className="rc-form-group">
                      <label>방문 유형</label>
                      <div className="rc-input-icon">
                        <i className="fas fa-user-doctor" />
                        <select value={revisittype} onChange={(e) => setRevisittype(e.target.value)}>
                          <option value="">선택</option>
                          <option value="초진">초진</option>
                          <option value="재진">재진</option>
                        </select>
                      </div>
                    </div>

                    {/* 사용자 번호 */}
                    <div className="rc-form-group">
                      <label>사용자 번호</label>
                      <div className="rc-input-icon">
                        <i className="fas fa-user" />
                        <input
                          type="number"
                          value={usernum}
                          onChange={(e) => setUsernum(e.target.value)}
                          placeholder="사용자 번호"
                        />
                      </div>
                    </div>

                    {/* 병원 번호 */}
                    <div className="rc-form-group">
                      <label>병원 번호</label>
                      <div className="rc-input-icon">
                        <i className="fas fa-hospital" />
                        <input
                          type="number"
                          value={honum}
                          onChange={(e) => setHonum(e.target.value)}
                          placeholder="병원 번호"
                        />
                      </div>
                    </div>

                    {/* 진료과 번호 */}
                    <div className="rc-form-group">
                      <label>진료과 번호</label>
                      <div className="rc-input-icon">
                        <i className="fas fa-stethoscope" />
                        <input
                          type="number"
                          value={deptnum}
                          onChange={(e) => setDeptnum(e.target.value)}
                          placeholder="진료과 번호"
                        />
                      </div>
                    </div>

                  </div>

                  {/* 요청사항 — 전체 너비 textarea */}
                  <div className="rc-form-group" style={{ marginTop: "1.25rem" }}>
                    <label>요청사항</label>
                    <textarea
                      className="rc-textarea"
                      value={rememo}
                      onChange={(e) => setRememo(e.target.value)}
                      placeholder="진료 요청사항이나 전달사항을 입력해주세요"
                      rows={4}
                    />
                    <div className="rc-char-count">{rememo.length} / 300</div>
                  </div>
                </div>

                {/* 폼 하단 버튼 */}
                <div className="rc-actions">
                  <button className="rc-btn rc-btn--cancel" onClick={() => navigate("/reviews")}>
                    <i className="fas fa-arrow-left" /> 취소
                  </button>
                  <button className="rc-btn rc-btn--submit" onClick={CreateReservation}>
                    <i className="fas fa-calendar-check" /> 예약 등록하기
                  </button>
                </div>
              </div>
            )}


            {/* ────────────────────────────
                STEP 2 — 후기 작성 폼
            ──────────────────────────── */}
            {step === 2 && (
              <div className="rc-form">

                {/* 별점 선택 섹션 */}
                <div className="rc-section">
                  <div className="rc-section__title">
                    <div className="rc-section__icon">
                      <i className="fas fa-star" />
                    </div>
                    별점 선택
                  </div>
                  <div className="rc-rating">
                    <div className="rc-rating__stars">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <i
                          key={num}
                          className={`fas fa-star ${num <= displayRating ? "filled" : ""}`}
                          onClick={() => setRating(num)}
                          onMouseEnter={() => setHoverRating(num)}  // hover 시 임시 별점
                          onMouseLeave={() => setHoverRating(0)}    // hover 해제 시 원래 별점
                        />
                      ))}
                    </div>
                    {/* 별점에 해당하는 한글 라벨 표시 */}
                    <div className="rc-rating__label">
                      {displayRating > 0 ? RATING_LABELS[displayRating] : "별점을 선택해주세요"}
                    </div>
                  </div>
                </div>

                {/* 후기 내용 입력 섹션 */}
                <div className="rc-section">
                  <div className="rc-section__title">
                    <div className="rc-section__icon">
                      <i className="fas fa-pen" />
                    </div>
                    후기 내용
                  </div>

                  {/* 예약 고유번호 — 예약과 후기를 연결하는 FK */}
                  <div className="rc-form-group">
                    <label>예약 고유번호 <span className="rc-required">*</span></label>
                    <div className="rc-input-icon">
                      <i className="fas fa-hashtag" />
                      <input
                        type="number"
                        value={renum || ""}
                        onChange={(e) => setRenum(e.target.value)}
                        placeholder="예약 등록 후 발급된 번호"
                      />
                    </div>
                  </div>

                  {/* 제목 */}
                  <div className="rc-form-group" style={{ marginTop: "1.25rem" }}>
                    <label>제목 <span className="rc-required">*</span></label>
                    <div className="rc-input-icon">
                      <i className="fas fa-heading" />
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="후기 제목을 입력해주세요"
                        maxLength={50}
                      />
                    </div>
                    <div className="rc-char-count">{title.length} / 50</div>
                  </div>

                  {/* 본문 */}
                  <div className="rc-form-group" style={{ marginTop: "1.25rem" }}>
                    <label>내용 <span className="rc-required">*</span></label>
                    <textarea
                      className="rc-textarea"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="병원 이용 경험을 자세히 알려주세요&#10;(진료 태도, 대기 시간, 시설 등)"
                      rows={6}
                      maxLength={1000}
                    />
                    <div className="rc-char-count">{content.length} / 1000</div>
                  </div>
                </div>

                {/* 이미지 첨부 섹션 */}
                <div className="rc-section">
                  <div className="rc-section__title">
                    <div className="rc-section__icon">
                      <i className="fas fa-image" />
                    </div>
                    사진 첨부 <span className="rc-section__optional">(선택)</span>
                  </div>
                  <p className="rc-section__desc">최대 3장까지 첨부 가능합니다</p>

                  {/* 파일 슬롯 3개 — 미리보기 있으면 이미지 표시, 없으면 업로드 버튼 */}
                  <div className="rc-upload-grid">
                    {files.map((_, idx) => (
                      <div key={idx} className="rc-upload-slot">
                        {previews[idx] ? (
                          /* 미리보기 이미지 + 삭제 버튼 */
                          <div className="rc-upload-preview">
                            <img src={previews[idx]} alt={`preview-${idx}`} />
                            <button
                              className="rc-upload-remove"
                              onClick={() => removeFile(idx)}
                            >
                              <i className="fas fa-times" />
                            </button>
                          </div>
                        ) : (
                          /* 파일 선택 버튼 (input hidden, label 클릭으로 트리거) */
                          <label className="rc-upload-label">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileChange(idx, e.target.files[0])}
                            />
                            <div className="rc-upload-placeholder">
                              <i className="fas fa-plus" />
                              <span>사진 추가</span>
                            </div>
                          </label>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 폼 하단 버튼 */}
                <div className="rc-actions">
                  {/* 이전 버튼 — step을 1로 되돌림 */}
                  <button className="rc-btn rc-btn--cancel" onClick={() => setStep(1)}>
                    <i className="fas fa-arrow-left" /> 이전
                  </button>
                  <button className="rc-btn rc-btn--submit" onClick={CreateReview}>
                    <i className="fas fa-paper-plane" /> 후기 등록하기
                  </button>
                </div>
              </div>
            )}
          </main>


          {/* ── 사이드 패널 (sticky) ── */}
          <aside className="rc-side">

            {/* 작성 팁 카드 */}
            <div className="rc-info-card">
              <div className="rc-info-card__icon">
                <i className="fas fa-lightbulb" />
              </div>
              <h3>좋은 후기 작성 팁</h3>
              <ul>
                <li><i className="fas fa-check-circle" /> 진료 태도와 친절함을 구체적으로 적어주세요</li>
                <li><i className="fas fa-check-circle" /> 대기 시간과 예약 편의성도 중요해요</li>
                <li><i className="fas fa-check-circle" /> 시설 청결도와 접근성도 알려주세요</li>
                <li><i className="fas fa-check-circle" /> 실제 경험을 솔직하게 공유해주세요</li>
              </ul>
            </div>

            {/* 포인트 적립 안내 카드 */}
            <div className="rc-info-card rc-info-card--reward">
              <div className="rc-info-card__icon rc-info-card__icon--gold">
                <i className="fas fa-coins" />
              </div>
              <h3>포인트 적립 안내</h3>
              <ul>
                <li><i className="fas fa-star" /> 후기 작성 시 <strong>50P</strong> 적립</li>
                <li><i className="fas fa-image" /> 사진 첨부 시 <strong>+30P</strong> 추가</li>
                <li><i className="fas fa-thumbs-up" /> 추천 10개 달성 시 <strong>+100P</strong></li>
              </ul>
            </div>

            {/* 현재 진행 단계 카드 */}
            <div className="rc-info-card rc-info-card--progress">
              <div className="rc-info-card__icon">
                <i className="fas fa-list-check" />
              </div>
              <h3>작성 현황</h3>
              <div className="rc-progress-list">
                {/* done: 완료 / current: 현재 단계 */}
                <div className={`rc-progress-item ${step > 1 ? "done" : step === 1 ? "current" : ""}`}>
                  <i className={`fas ${step > 1 ? "fa-circle-check" : "fa-circle-dot"}`} />
                  <span>예약 등록</span>
                </div>
                <div className={`rc-progress-item ${step === 2 ? "current" : ""}`}>
                  <i className={`fas ${step === 2 ? "fa-circle-dot" : "fa-circle"}`} />
                  <span>후기 작성</span>
                </div>
              </div>
            </div>

          </aside>

        </div>
      </div>
    </div>
  );
}

export default ReservationAndReview;
