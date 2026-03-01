import { useEffect, useCallback } from "react";

const UseNotification = () => {

  /* ── 브라우저 알림 권한 요청 ── */
  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) return "denied";
    if (Notification.permission === "granted") return "granted";
    if (Notification.permission !== "denied") {
      return await Notification.requestPermission();
    }
    return Notification.permission;
  }, []);

  /* 마운트 시 권한 요청 */
  useEffect(() => {
    requestPermission();
  }, [requestPermission]);

  /* ── 🔊 알림 소리 (Web Audio API – 외부 파일 불필요) ── */
  const playNotifSound = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx  = new AudioCtx();
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);        // 높은 음
      osc.frequency.setValueAtTime(660, ctx.currentTime + 0.12); // 낮은 음
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.45);
    } catch (e) {
      console.warn("알림 소리 재생 실패:", e);
    }
  }, []);

  /* ── 🔔 브라우저 팝업 알림 ── */
  const showBrowserNotif = useCallback(
    (title, body, icon = "/favicon.ico") => {
      if (Notification.permission !== "granted") return;

      const notif = new Notification(title, {
        body,
        icon,
        badge : "/favicon.ico",
        tag   : "chat-message", // 중복 방지 – 같은 tag는 덮어씀
      });

      notif.onclick = () => {
        window.focus();
        notif.close();
      };

      /* 5 초 후 자동 닫기 */
      setTimeout(() => notif.close(), 5000);
    },
    [],
  );

  /* ── 📄 탭 제목 변경 ── */
  const setTabTitle = useCallback((unreadCount) => {
    document.title =
      unreadCount > 0 ? `(${unreadCount}) 새 메시지 | 바로닥큐` : "바로닥큐";
  }, []);

  return { playNotifSound, showBrowserNotif, requestPermission, setTabTitle };
};

export default UseNotification;
