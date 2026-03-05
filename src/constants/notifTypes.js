import {
  faHeart,
  faCalendarCheck,
  faCalendarXmark,
  faBell,
  faStethoscope,
  faHospital,
  faComment,
} from "@fortawesome/free-solid-svg-icons";

export const NOTIF_META = {
  1: { icon: faHeart,          color: "#14b8a6", bg: "#f0fdfa", label: "환영"       },
  2: { icon: faCalendarCheck,  color: "#22c55e", bg: "#f0fdf4", label: "예약확정"   },
  3: { icon: faCalendarXmark,  color: "#ef4444", bg: "#fef2f2", label: "예약취소"   },
  4: { icon: faBell,           color: "#f59e0b", bg: "#fffbeb", label: "리마인더"   },
  5: { icon: faStethoscope,    color: "#8b5cf6", bg: "#faf5ff", label: "QnA답변"   },
  6: { icon: faHospital,       color: "#3b82f6", bg: "#eff6ff", label: "리뷰댓글"   },
  7: { icon: faComment,        color: "#ec4899", bg: "#fdf2f8", label: "커뮤니티"   },
};

export const getNotifMeta = (ntdNum) =>
  NOTIF_META[ntdNum] ?? { icon: faBell, color: "#64748b", bg: "#f8fafc", label: "알림" };
