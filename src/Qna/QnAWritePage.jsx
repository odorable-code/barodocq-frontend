import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/styles/QnAWritePage.css";

const CATEGORIES = [
  { id: "예약", label: "예약", icon: "calendar-check" },
  { id: "결제", label: "결제", icon: "credit-card" },
  { id: "서비스", label: "서비스", icon: "concierge-bell" },
  { id: "회원", label: "회원", icon: "user" },
  { id: "기타", label: "기타", icon: "circle-question" }
];

const QnAWritePage = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    category: "",
    title: "",
    content: "",
    email: "",
    isPrivate: false
  });

  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // 에러 초기화
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.category) newErrors.category = "카테고리를 선택해주세요";
    if (!formData.title.trim()) newErrors.title = "제목을 입력해주세요";
    if (formData.title.trim().length < 5) newErrors.title = "제목은 최소 5자 이상 입력해주세요";
    if (!formData.content.trim()) newErrors.content = "내용을 입력해주세요";
    if (formData.content.trim().length < 10) newErrors.content = "내용은 최소 10자 이상 입력해주세요";
    if (!formData.email.trim()) newErrors.email = "이메일을 입력해주세요";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "올바른 이메일 형식이 아닙니다";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validate()) {
      // 백엔드로 전송할 데이터
      console.log("제출 데이터:", formData);
      
      // 성공 메시지 및 페이지 이동
      alert("문의가 성공적으로 등록되었습니다!");
      navigate("/qna");
    }
  };

  const handleCancel = () => {
    if (window.confirm("작성을 취소하시겠습니까? 입력한 내용은 저장되지 않습니다.")) {
      navigate("/qna");
    }
  };

  return (
    <div className="qna-write-page">
      
      {/* HERO */}
      <section className="qna-write-hero">
        <div className="qna-write-hero-blob blob-1" />
        <div className="qna-write-hero-blob blob-2" />
        <div className="container-s2">
          <div className="qna-write-hero-content">
            <span className="qna-write-hero-label">
              <i className="fas fa-pen" />
              문의 작성
            </span>
            <h1>무엇이든 물어보세요</h1>
            <p>궁금하신 점을 남겨주시면 최대한 빠르게 답변해드리겠습니다</p>
          </div>
        </div>
      </section>

      {/* FORM */}
      <section className="qna-write-content">
        <div className="container-s2">
          <div className="qna-write-wrapper">
            
            {/* 안내 */}
            <div className="qna-write-info">
              <div className="info-card">
                <div className="info-icon">
                  <i className="fas fa-lightbulb" />
                </div>
                <div className="info-text">
                  <strong>문의 작성 팁</strong>
                  <p>구체적으로 작성하실수록 정확한 답변을 받을 수 있습니다</p>
                </div>
              </div>
              <div className="info-card">
                <div className="info-icon">
                  <i className="fas fa-clock" />
                </div>
                <div className="info-text">
                  <strong>평균 답변 시간</strong>
                  <p>영업일 기준 24시간 이내 답변드립니다</p>
                </div>
              </div>
              <div className="info-card">
                <div className="info-icon">
                  <i className="fas fa-shield-halved" />
                </div>
                <div className="info-text">
                  <strong>개인정보 보호</strong>
                  <p>비공개 설정 시 본인과 관리자만 확인 가능합니다</p>
                </div>
              </div>
            </div>

            {/* 폼 */}
            <div className="qna-write-form-container">
              <form className="qna-write-form" onSubmit={handleSubmit}>
                
                {/* 카테고리 */}
                <div className="form-group">
                  <label className="form-label">
                    <i className="fas fa-folder" />
                    카테고리 <span className="required">*</span>
                  </label>
                  <div className="category-grid">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat.id}
                        type="button"
                        className={`category-option ${formData.category === cat.id ? "selected" : ""}`}
                        onClick={() => handleChange("category", cat.id)}
                      >
                        <i className={`fas fa-${cat.icon}`} />
                        <span>{cat.label}</span>
                      </button>
                    ))}
                  </div>
                  {errors.category && <span className="error-message">{errors.category}</span>}
                </div>

                {/* 제목 */}
                <div className="form-group">
                  <label className="form-label">
                    <i className="fas fa-heading" />
                    제목 <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-input ${errors.title ? "error" : ""}`}
                    placeholder="문의 제목을 입력하세요 (최소 5자)"
                    value={formData.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    maxLength={100}
                  />
                  <div className="input-footer">
                    {errors.title && <span className="error-message">{errors.title}</span>}
                    <span className="char-count">{formData.title.length}/100</span>
                  </div>
                </div>

                {/* 내용 */}
                <div className="form-group">
                  <label className="form-label">
                    <i className="fas fa-align-left" />
                    내용 <span className="required">*</span>
                  </label>
                  <textarea
                    className={`form-textarea ${errors.content ? "error" : ""}`}
                    placeholder="문의 내용을 상세히 입력해주세요 (최소 10자)"
                    value={formData.content}
                    onChange={(e) => handleChange("content", e.target.value)}
                    rows={10}
                    maxLength={2000}
                  />
                  <div className="input-footer">
                    {errors.content && <span className="error-message">{errors.content}</span>}
                    <span className="char-count">{formData.content.length}/2000</span>
                  </div>
                </div>

                {/* 이메일 */}
                <div className="form-group">
                  <label className="form-label">
                    <i className="fas fa-envelope" />
                    답변 받을 이메일 <span className="required">*</span>
                  </label>
                  <input
                    type="email"
                    className={`form-input ${errors.email ? "error" : ""}`}
                    placeholder="example@email.com"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                  />
                  {errors.email && <span className="error-message">{errors.email}</span>}
                  <p className="form-hint">
                    <i className="fas fa-circle-info" />
                    답변이 등록되면 이메일로 알림을 보내드립니다
                  </p>
                </div>

                {/* 비공개 설정 */}
                <div className="form-group">
                  <label className="form-checkbox">
                    <input
                      type="checkbox"
                      checked={formData.isPrivate}
                      onChange={(e) => handleChange("isPrivate", e.target.checked)}
                    />
                    <span className="checkbox-custom" />
                    <div className="checkbox-label">
                      <i className="fas fa-lock" />
                      <span>비공개 문의로 설정</span>
                      <small>(본인과 관리자만 확인 가능)</small>
                    </div>
                  </label>
                </div>

                {/* 버튼 */}
                <div className="form-actions">
                  <button type="button" className="btn-cancel" onClick={handleCancel}>
                    <i className="fas fa-times" />
                    취소
                  </button>
                  <button type="submit" className="btn-submit">
                    <i className="fas fa-paper-plane" />
                    문의 등록
                  </button>
                </div>

              </form>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
};

export default QnAWritePage;