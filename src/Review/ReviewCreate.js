import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authFetch } from "../utils/AuthFetch";
import "../assets/styles/ReviewCreate.css";

const ReviewCreate = () => {
  const [formData, setFormData] = useState({
    hospital: "",
    dept: "",
    doctor: "",
    visitDate: "",
    rating: 0,
    title: "",
    content: "",
    tags: [],
    images: [],
  });

  const [hoverRating, setHoverRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState([]);

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
    console.log("제출 데이터:", { ...formData, tags: selectedTags });
    alert("후기가 등록되었습니다!");
  };

  return (
    <div className="review-create-container">
      <div className="review-create-header">
        <div className="container-s2">
          <div className="breadcrumb">
            <a href="/">홈</a>
            <i className="fas fa-chevron-right" />
            <a href="/reviews">후기 게시판</a>
            <i className="fas fa-chevron-right" />
            <span>후기 작성</span>
          </div>
          <h1 className="page-title">
            <i className="fas fa-pen-to-square" />
            후기 작성하기
          </h1>
          <p className="page-subtitle">
            소중한 경험을 공유해주세요. 다른 환자분들께 큰 도움이 됩니다.
          </p>
        </div>
      </div>

      <div className="review-create-body">
        <div className="container-s2">
          <form className="review-form" onSubmit={handleSubmit}>
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
                  placeholder="진료 경험을 자세히 작성해주세요. (최소 50자 이상)&#10;&#10;예시:&#10;- 병원 시설 및 청결도&#10;- 의료진의 친절함과 전문성&#10;- 대기 시간 및 예약 편의성&#10;- 진료 과정 및 결과&#10;- 전반적인 만족도"
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
              <button type="button" className="btn-cancel">
                <i className="fas fa-xmark" />
                취소
              </button>
              <button type="submit" className="btn-submit">
                <i className="fas fa-check" />
                후기 등록
              </button>
            </div>
          </form>

          {/* 안내 패널 */}
          <div className="info-panel">
            <div className="info-card">
              <div className="info-icon">
                <i className="fas fa-lightbulb" />
              </div>
              <h3>후기 작성 가이드</h3>
              <ul>
                <li>구체적이고 솔직한 경험을 공유해주세요</li>
                <li>욕설이나 비방은 삼가주세요</li>
                <li>개인정보는 포함하지 말아주세요</li>
                <li>사진은 개인정보가 보이지 않도록 주의해주세요</li>
              </ul>
            </div>

            <div className="info-card">
              <div className="info-icon reward">
                <i className="fas fa-gift" />
              </div>
              <h3>후기 작성 혜택</h3>
              <ul>
                <li>
                  <i className="fas fa-check-circle" />
                  포인트 500점 적립
                </li>
                <li>
                  <i className="fas fa-check-circle" />
                  베스트 후기 선정 시 추가 혜택
                </li>
                <li>
                  <i className="fas fa-check-circle" />
                  커뮤니티 활동 등급 상승
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewCreate;
