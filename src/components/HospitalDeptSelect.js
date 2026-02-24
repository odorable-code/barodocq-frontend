import { useMemo, useState } from "react";
import "../assets/styles/HospitalDeptSelect.css";

export default function Hos_DeptSelect({
  isOpen = false,
  onClose = () => {},
  onConfirm = () => {},
}) {
  // ✅ 과 목록 (전체는 맨 위, 나머지는 가나다순)
  const DEPTS = useMemo(
    () => [
      "전체",
      "가정의학과",
      "내과",
      "마취통증과",
      "비뇨기과",
      "산부인과",
      "성형외과",
      "소아청소년과",
      "신경과",
      "신경외과",
      "안과",
      "영상의학과",
      "외과",
      "이비인후과",
      "재활의학과",
      "정신의학과",
      "정형외과",
      "치과",
      "피부과",
      "한의과",
      "흉부외과",
    ],
    []
  );

  const [selectedDept, setSelectedDept] = useState(null);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!selectedDept) return;
    onConfirm({ deptName: selectedDept });
  };

  const handleOverlayClick = (e) => {
    // 오버레이(바깥) 클릭 시 닫기
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="dept-overlay" onMouseDown={handleOverlayClick}>
      <div className="dept-modal">
        {/* Header */}
        <div className="dept-header">
          <div className="dept-title">진료과 선택</div>

          <button className="dept-close" onClick={onClose} type="button" aria-label="닫기">
            ×
          </button>
        </div>

        {/* Grid */}
        <div className="dept-grid">
          {DEPTS.map((name) => (
            <button
              key={name}
              className={`dept-item ${selectedDept === name ? "selected" : ""}`}
              onClick={() => setSelectedDept(name)}
              type="button"
            >
              {name}
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="dept-footer">
          <button
            className="dept-confirm"
            disabled={!selectedDept}
            onClick={handleConfirm}
            type="button"
          >
            {selectedDept ? `${selectedDept} 보기` : "선택완료"}
          </button>
        </div>
      </div>
    </div>
  );
}