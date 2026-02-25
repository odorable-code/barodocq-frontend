import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/styles/QnAWritePage.css";
import { authFetch } from "../utils/authFetch";

const QnAWritePage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    ho_num: "",
    title: "",
    content: "",
    isPrivate: false
  });

  const [hospitalKeyword, setHospitalKeyword] = useState("");
  const [hospitalList, setHospitalList] = useState([]);
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  /* ---------------- 병원 검색 ---------------- */

  const searchHospital = async (keyword) => {
    if (keyword.length < 2) {
      setHospitalList([]);
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8080/api/v1/hospitals/search?keyword=${keyword}`
      );
      const data = await response.json();
      setHospitalList(data);
    } catch (err) {
      console.error(err);
    }
  };

  /* ---------------- 유효성 검사 ---------------- */

  const validate = () => {
    const newErrors = {};

    if (!formData.ho_num) newErrors.ho_num = "병원을 선택해주세요";
    if (!formData.title.trim()) newErrors.title = "제목을 입력해주세요";
    if (formData.title.trim().length < 5)
      newErrors.title = "제목은 최소 5자 이상 입력해주세요";
    if (!formData.content.trim()) newErrors.content = "내용을 입력해주세요";
    if (formData.content.trim().length < 10)
      newErrors.content = "내용은 최소 10자 이상 입력해주세요";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ---------------- QnA 등록 ---------------- */

  const CreateQnA = async () => {
    try {
      const response = await authFetch(
        "http://localhost:8080/api/v1/qnawrite",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            qn_title: formData.title,
            qn_content: formData.content,
            qn_is_private: formData.isPrivate ? 1 : 0,
            qn_status: "답변기다리는중",
            qn_deleted_yn: 0,
            ho_num: formData.ho_num
          })
        }
      );

      if (response.ok) {
        const text = await response.text();
        alert(text);
        navigate("/qna");
      } else {
        alert("문의 등록 실패");
      }
    } catch (err) {
      console.error(err);
      alert("서버 오류");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      CreateQnA();
    }
  };

  const handleCancel = () => {
    if (window.confirm("작성을 취소하시겠습니까? 입력한 내용은 저장되지 않습니다.")) {
      navigate("/qna");
    }
  };

  /* ---------------- 화면 ---------------- */

  return (
    <div className="qna-write-page">
      <section className="qna-write-content">
        <div className="container-s2">
          <div className="qna-write-form-container">
            <form className="qna-write-form" onSubmit={handleSubmit}>

              {/* 병원 선택 */}
              <div className="form-group">
                <label className="form-label">
                  병원 선택 <span className="required">*</span>
                </label>

                <input
                  type="text"
                  className={`form-input ${errors.ho_num ? "error" : ""}`}
                  placeholder="병원명을 입력하세요"
                  value={hospitalKeyword}
                  onChange={(e) => {
                    setHospitalKeyword(e.target.value);
                    searchHospital(e.target.value);
                  }}
                />

                {hospitalList.length > 0 && (
                  <ul className="hospital-list">
                    {hospitalList.map(hospital => (
                      <li
                        key={hospital.ho_num}
                        onClick={() => {
                          handleChange("ho_num", hospital.ho_num);
                          setHospitalKeyword(hospital.ho_name);
                          setHospitalList([]);
                        }}
                      >
                        {hospital.ho_name} - {hospital.ho_addr}
                      </li>
                    ))}
                  </ul>
                )}

                {errors.ho_num && (
                  <span className="error-message">{errors.ho_num}</span>
                )}
              </div>

              {/* 제목 */}
              <div className="form-group">
                <label>제목 *</label>
                <input
                  type="text"
                  value={formData.title}
                  className={`form-input ${errors.title ? "error" : ""}`}
                  onChange={(e) => handleChange("title", e.target.value)}
                  maxLength={50}
                />
                {errors.title && (
                  <span className="error-message">{errors.title}</span>
                )}
              </div>

              {/* 내용 */}
              <div className="form-group">
                <label>내용 *</label>
                <textarea
                  rows={8}
                  value={formData.content}
                  className={`form-textarea ${errors.content ? "error" : ""}`}
                  onChange={(e) => handleChange("content", e.target.value)}
                />
                {errors.content && (
                  <span className="error-message">{errors.content}</span>
                )}
              </div>

              {/* 비공개 */}
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.isPrivate}
                    onChange={(e) =>
                      handleChange("isPrivate", e.target.checked)
                    }
                  />
                  비공개 문의
                </label>
              </div>
              <button type="button" className="btn-cancel" onClick={handleCancel}>
                <i className="fas fa-times" />
                  취소
              </button>
              <button type="submit" className="btn-submit">
                <i className="fas fa-paper-plane" />
                  문의 등록
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default QnAWritePage;