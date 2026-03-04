import React, { useEffect, useMemo, useRef } from "react";

const DEFAULT_CENTER = { lat: 37.5665, lng: 126.9780 }; // 서울시청

const normalizeNum = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

export default function KakaoMap({
  markers = [],
  center = DEFAULT_CENTER,
  level = 4,
  height = 360,
  fitBounds = false,
  showCenterPin = false,
  centerPinEmoji = "🏥",
  onMarkerClick,
}) {
  const mapElRef = useRef(null);
  const mapRef = useRef(null);

  const overlaysRef = useRef([]);
  const clickablesRef = useRef([]);
  const centerOverlayRef = useRef(null);

  const safeCenter = useMemo(() => {
    const lat = normalizeNum(center?.lat) ?? DEFAULT_CENTER.lat;
    const lng = normalizeNum(center?.lng) ?? DEFAULT_CENTER.lng;
    return { lat, lng };
  }, [center]);

  const safeMarkers = useMemo(() => {
    return (markers || [])
      .map((m) => ({
        ...m,
        lat: normalizeNum(m.lat),
        lng: normalizeNum(m.lng),
      }))
      .filter((m) => m.lat != null && m.lng != null);
  }, [markers]);

  const clearOverlays = () => {
    overlaysRef.current.forEach((ov) => ov.setMap(null));
    overlaysRef.current = [];
    clickablesRef.current.forEach((ov) => ov.setMap(null));
    clickablesRef.current = [];
  };

  // ✅ 1) 맵 최초 생성 (핵심: kakao.maps.load로 보장)
  useEffect(() => {
    const kakao = window.kakao;
    if (!kakao?.maps) return;

    const el = mapElRef.current;
    if (!el) return;

    kakao.maps.load(() => {
      // 이미 만들어졌으면 중복 생성 방지
      if (mapRef.current) return;

      const map = new kakao.maps.Map(el, {
        center: new kakao.maps.LatLng(safeCenter.lat, safeCenter.lng),
        level,
      });

      mapRef.current = map;

      // ✅ mount 직후 resize 보정
      setTimeout(() => {
        kakao.maps.event.trigger(map, "resize");
        map.setCenter(new kakao.maps.LatLng(safeCenter.lat, safeCenter.lng));
      }, 0);
    });

    return () => {
      clearOverlays();
      if (centerOverlayRef.current) {
        centerOverlayRef.current.setMap(null);
        centerOverlayRef.current = null;
      }
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // ✅ 1회

  // ✅ 2) center / level 반영 (map 준비된 뒤에만)
  useEffect(() => {
    const kakao = window.kakao;
    const map = mapRef.current;
    if (!kakao?.maps || !map) return;

    kakao.maps.load(() => {
      map.setCenter(new kakao.maps.LatLng(safeCenter.lat, safeCenter.lng));
      if (typeof level === "number") map.setLevel(level);
    });
  }, [safeCenter, level]);

  // ✅ 3) center pin 표시
  useEffect(() => {
    const kakao = window.kakao;
    const map = mapRef.current;
    if (!kakao?.maps || !map) return;

    kakao.maps.load(() => {
      // 기존 제거
      if (centerOverlayRef.current) {
        centerOverlayRef.current.setMap(null);
        centerOverlayRef.current = null;
      }

      if (!showCenterPin) return;

      const content = `
        <div style="
          transform: translate(-50%, -100%);
          font-size: 34px;
          line-height: 34px;
          user-select: none;
          pointer-events: none;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,.25));
        ">
          ${centerPinEmoji}
        </div>
      `;

      const ov = new kakao.maps.CustomOverlay({
        position: new kakao.maps.LatLng(safeCenter.lat, safeCenter.lng),
        content,
        yAnchor: 1,
      });

      ov.setMap(map);
      centerOverlayRef.current = ov;
    });
  }, [showCenterPin, safeCenter, centerPinEmoji]);

  // ✅ 4) 마커(핀) 그리기
  useEffect(() => {
    const kakao = window.kakao;
    const map = mapRef.current;
    if (!kakao?.maps || !map) return;

    kakao.maps.load(() => {
      clearOverlays();

      const pinDefault = "\u{1F3E5}";
      const nextOverlays = [];
      const nextClickables = [];

      safeMarkers.forEach((m) => {
        const emoji = m.emoji || pinDefault;

        // 표시용 (pointer-events: none)
        const content = `
          <div style="
            transform: translate(-50%, -100%);
            font-size: 34px;
            line-height: 34px;
            user-select: none;
            pointer-events: none;
            filter: drop-shadow(0 2px 4px rgba(0,0,0,.25));
          ">
            ${emoji}
          </div>
        `;

        const ov = new kakao.maps.CustomOverlay({
          position: new kakao.maps.LatLng(m.lat, m.lng),
          content,
          yAnchor: 1,
        });
        ov.setMap(map);
        nextOverlays.push(ov);

        // 클릭 레이어(필요할 때만)
        if (typeof onMarkerClick === "function") {
          const clickable = document.createElement("div");
          clickable.style.width = "44px";
          clickable.style.height = "44px";
          clickable.style.transform = "translate(-50%, -100%)";
          clickable.style.cursor = "pointer";
          clickable.style.background = "transparent";
          clickable.style.pointerEvents = "auto";

          clickable.addEventListener("click", (e) => {
            e.stopPropagation();
            onMarkerClick(m);
          });

          const clickOv = new kakao.maps.CustomOverlay({
            position: new kakao.maps.LatLng(m.lat, m.lng),
            content: clickable,
            yAnchor: 1,
          });
          clickOv.setMap(map);
          nextClickables.push(clickOv);
        }
      });

      overlaysRef.current = nextOverlays;
      clickablesRef.current = nextClickables;
    });

    return () => {
      clearOverlays();
    };
  }, [safeMarkers, onMarkerClick]);

  // ✅ 5) fitBounds
  useEffect(() => {
    const kakao = window.kakao;
    const map = mapRef.current;
    if (!kakao?.maps || !map) return;
    if (!fitBounds) return;
    if (!safeMarkers.length) return;

    kakao.maps.load(() => {
      const bounds = new kakao.maps.LatLngBounds();
      safeMarkers.forEach((m) => bounds.extend(new kakao.maps.LatLng(m.lat, m.lng)));
      map.setBounds(bounds);
    });
  }, [fitBounds, safeMarkers]);

  return (
    <div
      ref={mapElRef}
      style={{
        width: "100%",
        height: typeof height === "number" ? `${height}px` : height,
        borderRadius: 16,
        overflow: "hidden",
      }}
    />
  );
}