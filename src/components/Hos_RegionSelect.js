import React, { useEffect, useMemo, useState } from "react";
import "./Hos_RegionSelect.css";

import SIDO from "../data/sido.json";
import SIGUNGU from "../data/sigungu.json";
import EMD from "../data/eupmyeondong.json";

export default function RegionSelectModal({
  isOpen = true,
  onClose = () => {},
  onConfirm = () => {},
}) {
  const STEP = { SIDO: "SIDO", SIGUNGU: "SIGUNGU", EMD: "EMD" };

  const [step, setStep] = useState(STEP.SIDO);
  const [sido, setSido] = useState(null);
  const [sigungu, setSigungu] = useState(null);
  const [emd, setEmd] = useState(null);

  // 모달 열릴 때 초기화
  useEffect(() => {
    if (!isOpen) return;
    setStep(STEP.SIDO);
    setSido(null);
    setSigungu(null);
    setEmd(null);
  }, [isOpen]);

  
  // ===============================
  // 현재 단계에 따른 리스트 생성
  // ===============================
  const list = useMemo(() => {
    if (!isOpen) return [];
    if (step === STEP.SIDO) {
      return SIDO.map((v) => ({
        code: v.sidocode,
        name: v.sidoname,
      }));
    }

    if (step === STEP.SIGUNGU) {
      if (!sido?.code) return [];
      return SIGUNGU
        .filter((v) => String(v.sidocode) === String(sido.code))
        .map((v) => ({
          code: v.sigungucode,
          name: v.sigunguname,
        }));
    }

    // STEP.EMD
    if (!sigungu?.code) return [];
    return EMD
      .filter((v) => String(v.sigungucode) === String(sigungu.code))
      .map((v) => ({
        code: v.eupmyeondongcode,
        name: v.eupmyeondongname,
      }));
  }, [isOpen, step, sido?.code, sigungu?.code]);

    if (!isOpen) return null;

  // ===============================
  // ✅ 선택 핸들러
  // ===============================
  const handleSelect = (item) => {
    if (step === STEP.SIDO) {
      setSido(item);
      setSigungu(null);
      setEmd(null);
      setStep(STEP.SIGUNGU);
    } else if (step === STEP.SIGUNGU) {
      setSigungu(item);
      setEmd(null);
      setStep(STEP.EMD);
    } else {
      setEmd(item);
    }
  };

  const isSelected = (item) => {
    const code =
      step === STEP.SIDO
        ? sido?.code
        : step === STEP.SIGUNGU
        ? sigungu?.code
        : emd?.code;
    return String(item.code) === String(code);
  };

  // ===============================
  // ✅ 하단 버튼 상태/텍스트
  // ===============================
  const canConfirm = Boolean(sido || sigungu || emd);
  const pickedName = emd?.name || sigungu?.name || sido?.name || "";
  const confirmText = pickedName ? `${pickedName} 선택` : "선택완료";

  const handleConfirm = () => {
    if (!canConfirm) return;

    const level = emd ? STEP.EMD : sigungu ? STEP.SIGUNGU : STEP.SIDO;

    onConfirm({
      level,
      sido,
      sigungu,
      emd,
    });
  };

  // ===============================
  // ✅ 오버레이 클릭 닫기
  // ===============================
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="region-overlay" onMouseDown={handleOverlayClick}>
      <div className="region-modal">
        {/* 헤더 */}
        <div className="region-header">
          <div className="region-breadcrumb">
            <span onClick={() => setStep(STEP.SIDO)}>{sido?.name || "시/도"}</span>
            <span> &gt; </span>
            <span
              onClick={() => sido && setStep(STEP.SIGUNGU)}
              style={{ opacity: sido ? 1 : 0.5 }}
            >
              {sigungu?.name || "시/군/구"}
            </span>
            <span> &gt; </span>
            <span
              onClick={() => sigungu && setStep(STEP.EMD)}
              style={{ opacity: sigungu ? 1 : 0.5 }}
            >
              {emd?.name || "읍/면/동"}
            </span>
          </div>

          <button className="region-close" onClick={onClose} type="button">
            ×
          </button>
        </div>

        {/* 리스트 */}
        <div className="region-grid">
          {list.map((item) => (
            <button
              key={`${step}-${item.code}`}
              className={`region-item ${isSelected(item) ? "selected" : ""}`}
              onClick={() => handleSelect(item)}
              type="button"
            >
              {item.name}
            </button>
          ))}

          {list.length === 0 && (
            <div className="region-empty">상위 지역을 먼저 선택해 주세요</div>
          )}
        </div>

        {/* 하단 */}
        <div className="region-footer">
          <button
            className="region-confirm"
            disabled={!canConfirm}
            onClick={handleConfirm}
            type="button"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}