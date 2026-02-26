import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { authFetch } from "../utils/AuthFetch";
import "../assets/styles/ReviewRevise.css";

const ReviewRevise = () => {
  // 기존 데이터 (실제로는 API에서 불러옴)
  const existingReview = {
    id: 1,
    hospital: "강남메디컬센터",
    dept: "내과",
    doctor: "이서연",
    visitDate: "2026-02-15",
    rating: 5,
    title: "정말 친절하고 꼼꼼한 진료였어요",
    content:
      "대기 시간이 짧고 의사 선생님이 정말 친절하세요. 증상에 대해 자세히 설명해주시고 치료 방법도 여러 가지 제안해주셨어요. 시설도 깨끗하고 직원분들도 모두 친절하셔서 편안하게 진료받을 수 있었습니다.",
    tags: ["친절해요", "설명을 잘해줘요", "시설이 좋아요"],
    images: [
      "https://via.placeholder.com/400x300?text=Hospital+Image+1",
      "https://via.placeholder.com/400x300?text=Hospital+Image+2",
    ],
  };

  const [formData, setFormData] = useState(existingReview);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState(existingReview.tags);
  const [hasChanges, setHasChanges] = useState(false);

  const AVAILABLE_TAGS = [
    "친절해요",
    "시설이 좋아요",
    "대기시간이 짧아요",
    "설명을 잘해줘요",
    "청결해요",
    "주차가 편해요",
    "재방문 의사 있어요",
    "가격이 합리적이에요",
  ];

<<<<<<< HEAD
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
=======
>>>>>>> parent of 5f9d377 (Merge branch 'main' into hos_search)
  useEffect(() => {
    // 변경사항 감지
    const changed =
      JSON.stringify(formData) !== JSON.stringify(existingReview) ||
      JSON.stringify(selectedTags) !== JSON.stringify(existingReview.tags);
    setHasChanges(changed);
  }, [formData, selectedTags]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRatingClick = (rating) => {
    setFormData((prev) => ({ ...prev, rating }));
  };

  const handleTagToggle = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const imageUrls = files.map((file) => URL.createObjectURL(file));
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...imageUrls],
    }));
  };

  const handleRemoveImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("수정 데이터:", { ...formData, tags: selectedTags });
    alert("후기가 수정되었습니다!");
  };

  const handleCancel = () => {
    if (hasChanges) {
      if (
        window.confirm(
          "변경사항이 저장되지 않았습니다. 정말 취소하시겠습니까?"
        )
      ) {
        window.history.back();
      }
<<<<<<< HEAD
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
=======
    } else {
      window.history.back();
>>>>>>> parent of 5f9d377 (Merge branch 'main' into hos_search)
    }

    const result = await res.text();
    alert(result);
    navigate("/reviews");

  } catch (err) {
    alert(err.message || "수정에 실패했습니다.");
  }
};

  return (
    <div className="review-revise-container">
      <div className="review-revise-header">
        <div className="container-s2">
          <div className="breadcrumb">
            <a href="/">홈</a>
            <i className="fas fa-chevron-right" />
            <a href="/reviews">후기 게시판</a>
            <i className="fas fa-chevron-right" />
            <a href={`/reviews/${formData.id}`}>후기 상세</a>
            <i className="fas fa-chevron-right" />
            <span>후기 수정</span>
          </div>
          <h1 className="page-title">
            <i className="fas fa-pen" />
            후기 수정하기
          </h1>
          <p className="page-subtitle">
            작성하신 후기를 수정할 수 있습니다.
          </p>
        </div>
      </div>

      <div className="review-revise-body">
        <div className="container-s2">
          <form className="review-form" onSubmit={handleSubmit}>
            {/* 변경사항 알림 */}
            {hasChanges && (
              <div className="change-alert">
                <i className="fas fa-exclamation-circle" />
                <span>변경사항이 있습니다. 수정 완료 버튼을 눌러주세요.</span>
              </div>
            )}

            {/* 병원 정보 섹션 */}
            <div className="form-section">
              <h2 className="section-title">
                <span className="section-icon">
                  <i className="fas fa-hospital" />
                </span>
                병원 정보
              </h2>
              <div className="form-grid">
                <div className="form-group">
                  <label>
                    병원명 <span className="required">*</span>
                  </label>
                  <div className="input-with-icon">
                    <i className="fas fa-hospital-user" />
                    <input
                      type="text"
                      name="hospital"
                      placeholder="병원명을 입력하세요"
                      value={formData.hospital}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>
                    진료과 <span className="required">*</span>
                  </label>
                  <div className="input-with-icon">
                    <i className="fas fa-stethoscope" />
                    <select
                      name="dept"
                      value={formData.dept}
                      onChange={handleChange}
                      required
                    >
                      <option value="">진료과 선택</option>
                      <option value="소아청소년과">소아청소년과</option>
                      <option value="내과">내과</option>
                      <option value="외과">외과</option>
                      <option value="정형외과">정형외과</option>
                      <option value="안과">안과</option>
                      <option value="치과">치과</option>
                      <option value="피부과">피부과</option>
                      <option value="이비인후과">이비인후과</option>
                      <option value="신경과">신경과</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>담당 의사</label>
                  <div className="input-with-icon">
                    <i className="fas fa-user-doctor" />
                    <input
                      type="text"
                      name="doctor"
                      placeholder="담당 의사명 (선택)"
                      value={formData.doctor}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>
                    방문일 <span className="required">*</span>
                  </label>
                  <div className="input-with-icon">
                    <i className="fas fa-calendar-days" />
                    <input
                      type="date"
                      name="visitDate"
                      value={formData.visitDate}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 평점 섹션 */}
            <div className="form-section">
              <h2 className="section-title">
                <span className="section-icon">
                  <i className="fas fa-star" />
                </span>
                전체 평점
              </h2>
              <div className="rating-selector">
                <div className="rating-stars">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <i
                      key={star}
                      className={`fas fa-star ${
                        star <= (hoverRating || formData.rating)
                          ? "active"
                          : ""
                      }`}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => handleRatingClick(star)}
                    />
                  ))}
                </div>
                <span className="rating-text">
                  {formData.rating === 0
                    ? "별점을 선택해주세요"
                    : `${formData.rating}점`}
                </span>
              </div>
            </div>

            {/* 후기 내용 섹션 */}
            <div className="form-section">
              <h2 className="section-title">
                <span className="section-icon">
                  <i className="fas fa-file-lines" />
                </span>
                후기 내용
              </h2>
              <div className="form-group">
                <label>
                  제목 <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  className="full-input"
                  placeholder="후기 제목을 입력하세요"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>
                  내용 <span className="required">*</span>
                </label>
                <textarea
                  name="content"
                  className="full-textarea"
                  placeholder="진료 경험을 자세히 작성해주세요. (최소 50자 이상)"
                  rows="12"
                  value={formData.content}
                  onChange={handleChange}
                  required
                />
                <div className="char-count">
                  {formData.content.length} / 50자 이상
                </div>
              </div>
            </div>

            {/* 태그 섹션 */}
            <div className="form-section">
              <h2 className="section-title">
                <span className="section-icon">
                  <i className="fas fa-tags" />
                </span>
                태그 선택
              </h2>
              <p className="section-desc">
                방문 경험을 나타내는 태그를 선택해주세요 (최대 5개)
              </p>
              <div className="tag-selector">
                {AVAILABLE_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className={`tag-button ${
                      selectedTags.includes(tag) ? "active" : ""
                    }`}
                    onClick={() => handleTagToggle(tag)}
                    disabled={
                      selectedTags.length >= 5 && !selectedTags.includes(tag)
                    }
                  >
                    {tag}
                  </button>
                ))}
              </div>
              <div className="selected-tags-count">
                선택된 태그: {selectedTags.length} / 5
              </div>
            </div>

            {/* 사진 업로드 섹션 */}
            <div className="form-section">
              <h2 className="section-title">
                <span className="section-icon">
                  <i className="fas fa-images" />
                </span>
                사진 첨부
              </h2>
              <p className="section-desc">
                병원 시설이나 진료 관련 사진을 첨부해주세요 (최대 5장)
              </p>
              <div className="image-upload-area">
                <label className="upload-label">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    disabled={formData.images.length >= 5}
                  />
                  <div className="upload-placeholder">
                    <i className="fas fa-cloud-arrow-up" />
                    <span>
                      클릭하여 사진 업로드 ({formData.images.length}/5)
                    </span>
                  </div>
                </label>
                {formData.images.length > 0 && (
                  <div className="uploaded-images">
                    {formData.images.map((img, index) => (
                      <div key={index} className="uploaded-image">
                        <img src={img} alt={`업로드 ${index + 1}`} />
                        <button
                          type="button"
                          className="remove-image"
                          onClick={() => handleRemoveImage(index)}
                        >
                          <i className="fas fa-xmark" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 제출 버튼 */}
            <div className="form-actions">
              <button type="button" className="btn-cancel" onClick={handleCancel}>
                <i className="fas fa-xmark" />
                취소
              </button>
              <button type="submit" className="btn-submit" disabled={!hasChanges}>
                <i className="fas fa-check" />
                수정 완료
              </button>
            </div>
          </form>

          {/* 수정 안내 패널 */}
          <div className="info-panel">
            <div className="info-card">
              <div className="info-icon">
                <i className="fas fa-circle-info" />
              </div>
              <h3>수정 안내</h3>
              <ul>
                <li>후기 수정은 제한 없이 가능합니다</li>
                <li>수정 내역은 별도로 표시되지 않습니다</li>
                <li>악의적인 수정은 제재될 수 있습니다</li>
                <li>수정 후에도 기존 좋아요는 유지됩니다</li>
              </ul>
            </div>

            <div className="info-card warning">
              <div className="info-icon alert">
                <i className="fas fa-triangle-exclamation" />
              </div>
              <h3>주의사항</h3>
              <ul>
                <li>
                  <i className="fas fa-check-circle" />
                  허위 정보 수정 시 계정이 정지될 수 있습니다
                </li>
                <li>
                  <i className="fas fa-check-circle" />
                  타인을 비방하는 내용은 삭제됩니다
                </li>
                <li>
                  <i className="fas fa-check-circle" />
                  개인정보 노출에 주의해주세요
                </li>
              </ul>
            </div>

            <div className="original-info">
              <h4>
                <i className="fas fa-clock-rotate-left" />
                원본 후기 정보
              </h4>
              <div className="original-meta">
                <span>작성일: 2026-02-15</span>
                <span>조회수: 1,245회</span>
                <span>좋아요: 47개</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewRevise;
