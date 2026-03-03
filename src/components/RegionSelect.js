import React, { useEffect, useMemo, useState } from "react";
import "../assets/styles/RegionSelect.css";

import SIDO from "../data/sido.json";
import SIGUNGU from "../data/sigungu.json";
import EMD from "../data/eupmyeondong.json";

export default function Hos_RegionSelect({
  isOpen = false,
  onClose = () => {},
  onConfirm = () => {},
}) {
  const STEP = { SIDO: "SIDO", SIGUNGU: "SIGUNGU", EMD: "EMD" };
  const ALL_SIDO = { code: "ALL", name: "전체" };

  const [step, setStep] = useState(STEP.SIDO);
  const [sido, setSido] = useState(null);       // { code, name }
  const [sigungu, setSigungu] = useState(null); // { code, name }
  const [emd, setEmd] = useState(null);         // { code, name }

  // ✅ 모달 열릴 때 초기화
  useEffect(() => {
    if (!isOpen) return;
    setStep(STEP.SIDO);
    setSido(null);
    setSigungu(null);
    setEmd(null);
  }, [isOpen]);

  // ✅ (B안) 원하는 시/도 표시 순서 (서울/경기/인천 편애 반영)
  const SIDO_ORDER = useMemo(
    () => [
      "서울특별시",
      "경기도",
      "인천광역시",

      "강원특별자치도",

      "대전광역시",
      "세종특별자치시",
      "충청북도",
      "충청남도",

      "광주광역시",
      "전라북도",
      "전라남도",

      "대구광역시",
      "경상북도",

      "부산광역시",
      "울산광역시",
      "경상남도",

      "제주특별자치도",
    ],
    []
  );

  // ✅ 현재 단계 리스트
  const list = useMemo(() => {
    if (!isOpen) return [];

    if (step === STEP.SIDO) {
      const rank = new Map(SIDO_ORDER.map((name, idx) => [name, idx]));

      const sortedSido = SIDO
        .map((v) => ({ code: v.sidocode, name: v.sidoname }))
        .sort((a, b) => {
          const ra = rank.has(a.name) ? rank.get(a.name) : 999;
          const rb = rank.has(b.name) ? rank.get(b.name) : 999;

          if (ra !== rb) return ra - rb;

          // 편애 목록 외 '가나다순'
          return a.name.localeCompare(b.name, "ko");
        });
        // 앞에 전체 추가
        return [ALL_SIDO, ...sortedSido];
    }

    if (step === STEP.SIGUNGU) {
      if (!sido?.code) return [];
      return SIGUNGU
        .filter((v) => String(v.sidocode) === String(sido.code))
        .map((v) => ({ code: v.sigungucode, name: v.sigunguname }))
        .sort((a, b) => a.name.localeCompare(b.name, "ko"));
    }

    // STEP.EMD
    if (!sigungu?.code) return [];
    return EMD
      .filter((v) => String(v.sigungucode) === String(sigungu.code))
      .map((v) => ({ code: v.eupmyeondongcode, name: v.eupmyeondongname }))
      .sort((a, b) => a.name.localeCompare(b.name, "ko"));
  }, [isOpen, step, sido?.code, sigungu?.code, SIDO_ORDER]);

  if (!isOpen) return null;

  // ✅ 선택 처리
  const handleSelect = (item) => {
    if (step === STEP.SIDO && String(item.code) === "ALL") {
      const all = item; // { code:"ALL", name:"전체" }

      setSido(all);
      setSigungu(null);
      setEmd(null);
      setStep(STEP.SIDO);

      onConfirm({
        level: STEP.SIDO,
        sido: all,
        sigungu: null,
        emd: null,
    });
    onClose();
    return;
  }
    if (step === STEP.SIDO) {
      setSido(item);
      setSigungu(null);
      setEmd(null);
      setStep(STEP.SIGUNGU);
      return;
    }

    if (step === STEP.SIGUNGU) {
      setSigungu(item);
      setEmd(null);
      setStep(STEP.EMD);
      return;
    }

    // STEP.EMD
    setEmd(item);
  };

  const isSelected = (item) => {
    const code =
      step === STEP.SIDO ? sido?.code : step === STEP.SIGUNGU ? sigungu?.code : emd?.code;
    return String(item.code) === String(code);
  };

  // ✅ 하단 버튼 상태/텍스트
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

    onClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  // ✅ breadcrumb 클릭 시 하위 선택 초기화
  const goSido = () => {
    setStep(STEP.SIDO);
    setSido(null);
    setSigungu(null);
    setEmd(null);
  };

  const goSigungu = () => {
    if (!sido) return;
    setStep(STEP.SIGUNGU);
    setSigungu(null);
    setEmd(null);
  };

  const goEmd = () => {
    if (!sigungu) return;
    setStep(STEP.EMD);
    setEmd(null);
  };

  return (
    <div className="region-overlay" onMouseDown={handleOverlayClick}>
      <div className="region-modal">
        {/* 헤더 */}
        <div className="region-header">
          <div className="region-breadcrumb">
            <span onClick={goSido}>{sido?.name || "시/도"}</span>
            <span> &gt; </span>

            <span
              onClick={goSigungu}
              style={{ opacity: sido ? 1 : 0.5, cursor: sido ? "pointer" : "default" }}
            >
              {sigungu?.name || "시/군/구"}
            </span>
            <span> &gt; </span>

            <span
              onClick={goEmd}
              style={{ opacity: sigungu ? 1 : 0.5, cursor: sigungu ? "pointer" : "default" }}
            >
              {emd?.name || "읍/면/동"}
            </span>
          </div>

          <button className="region-close" onClick={onClose} type="button" aria-label="닫기">
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

          {list.length === 0 && <div className="region-empty">상위 지역을 먼저 선택해 주세요</div>}
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