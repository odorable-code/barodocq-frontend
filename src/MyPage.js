import React, { useState, useEffect, useRef } from "react";
import "./MyPage.css";
import { useAuth } from "./AuthContext";
import { authFetch } from "./utils/AuthFetch";

/* ─────────────────────────────────────────
   데이터 상수
───────────────────────────────────────── */
const USER_INFO = {
  name: "은유진",
  email: "yujin.eun@email.com",
  phone: "010-1234-5678",
  grade: "골드 회원",
  joinDate: "2024-03-15",
  points: 1240,
  avatar: "은",
};

const RESERVATIONS = [
  { id: 1, hospital: "서울아동병원",   dept: "소아청소년과", date: "2026-03-05", time: "14:30", status: "예정" },
  { id: 2, hospital: "강남메디컬센터", dept: "내과",         date: "2026-03-12", time: "10:00", status: "예정" },
  { id: 3, hospital: "이대목동병원",   dept: "신경과",       date: "2026-04-01", time: "09:00", status: "예정" },
  { id: 4, hospital: "세브란스병원",   dept: "정형외과",     date: "2026-04-10", time: "11:30", status: "예정" },
];

const MENU_GROUPS = [
  {
    groupTitle: "활동 내역",
    items: [
      { id: 1, icon: "bell",         title: "알림",       badge: 3,    color: "#14b8a6" },
      { id: 2, icon: "comments",     title: "내 Q&A",     badge: null, color: "#0d9488" },
      { id: 3, icon: "star",         title: "나의 후기",  badge: 2,    color: "#0f766e" },
      { id: 4, icon: "comment-dots", title: "채팅",       badge: 1,    color: "#14b8a6" },
    ],
  },
  {
    groupTitle: "계정 관리",
    items: [
      { id: 5, icon: "user-pen",     title: "개인정보 수정", badge: null, color: "#0d9488" },
      { id: 6, icon: "lock",         title: "비밀번호 변경", badge: null, color: "#0f766e" },
      { id: 7, icon: "shield-check", title: "보안 설정",     badge: null, color: "#14b8a6" },
    ],
  },
  {
    groupTitle: "고객 지원",
    items: [
      { id: 8,  icon: "circle-question", title: "공지사항", badge: null, color: "#0d9488" },
      { id: 9,  icon: "headset",         title: "고객센터", badge: null, color: "#0f766e" },
      { id: 10, icon: "file-contract",   title: "이용약관", badge: null, color: "#14b8a6" },
    ],
  },
];

const RECENT_REVIEWS = [
  { id: 1, hospital: "한강정형외과의원", dept: "정형외과", rating: 5, text: "친절하고 대기 시간도 짧았어요.", date: "2026-02-10" },
  { id: 2, hospital: "밝은눈안과",       dept: "안과",    rating: 4, text: "시설이 깔끔하고 선생님이 자세히 설명해주셨습니다.", date: "2026-01-25" },
  { id: 3, hospital: "서울아동병원",      dept: "소아청소년과", rating: 5, text: "아이가 무서워했는데 선생님이 너무 잘 달래줘서 감사했어요.", date: "2025-12-30" },
  { id: 4, hospital: "강남메디컬센터",    dept: "내과",    rating: 3, text: "대기 시간이 조금 길었지만 진료는 만족스러웠습니다.", date: "2025-11-18" },
];

const NOTICES = [
  { id: 1, title: "2026년 설 연휴 운영 안내", date: "2026-01-20", isNew: true },
  { id: 2, title: "앱 버전 업데이트 안내 (v3.2.0)", date: "2026-01-15", isNew: true },
  { id: 3, title: "개인정보처리방침 개정 안내", date: "2025-12-28", isNew: false },
  { id: 4, title: "시스템 점검 안내 (1월 5일 02:00~04:00)", date: "2025-12-26", isNew: false },
  { id: 5, title: "연말 이벤트: 포인트 2배 적립!", date: "2025-12-10", isNew: false },
];

const NOTIFICATIONS = [
  { id: 1, icon: "calendar-check", color: "#14b8a6", title: "예약 확정", desc: "서울아동병원 소아청소년과 예약이 확정되었습니다.", time: "10분 전", isRead: false },
  { id: 2, icon: "star",           color: "#f59e0b", title: "후기 작성 요청", desc: "강남메디컬센터 방문 후기를 작성해주세요!", time: "1시간 전", isRead: false },
  { id: 3, icon: "gift",           color: "#8b5cf6", title: "포인트 적립", desc: "진료 완료로 50P가 적립되었습니다.", time: "3시간 전", isRead: false },
  { id: 4, icon: "bell",           color: "#0d9488", title: "공지사항", desc: "앱 버전 업데이트 안내입니다.", time: "1일 전", isRead: true },
  { id: 5, icon: "heart",          color: "#ef4444", title: "찜 병원 알림", desc: "찜한 병원 '밝은눈안과'에 이벤트가 있습니다!", time: "2일 전", isRead: true },
];

const QNA_LIST = [
  { id: 1, title: "예약 취소 시 환불이 되나요?", date: "2026-01-22", status: "답변완료", answer: "네, 예약 취소는 진료 24시간 전까지 가능하며 결제 금액은 전액 환불됩니다." },
  { id: 2, title: "비급여 진료도 예약할 수 있나요?", date: "2026-01-10", status: "답변완료", answer: "일부 비급여 항목은 예약이 가능합니다. 병원별 상세 안내를 확인해주세요." },
  { id: 3, title: "앱에서 처방전 발급이 가능한가요?", date: "2025-12-20", status: "답변대기", answer: null },
];

const CHAT_LIST = [
  { id: 1, hospital: "서울아동병원", lastMsg: "안녕하세요! 예약 관련 문의 주셨는데요.", time: "오후 2:30", unread: 1 },
  { id: 2, hospital: "강남메디컬센터", lastMsg: "감사합니다. 내방 시 신분증을 꼭 지참해주세요.", time: "어제", unread: 0 },
];

const TERMS_TEXT = `제1조 (목적)
이 약관은 헬스케어 서비스(이하 "서비스")를 이용함에 있어 회사와 이용자의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.

제2조 (정의)
"서비스"란 회사가 제공하는 모든 온라인 의료 예약 및 정보 서비스를 의미합니다.

제3조 (약관의 효력 및 변경)
① 이 약관은 서비스를 이용하는 모든 이용자에게 적용됩니다.
② 회사는 약관을 변경할 경우 최소 7일 전에 공지합니다.

제4조 (개인정보 보호)
회사는 이용자의 개인정보를 관련 법령에 따라 보호하며, 개인정보처리방침에 따라 운영합니다.

제5조 (서비스 이용)
① 서비스는 24시간 연중무휴 제공됩니다. 단, 정기점검 등 필요한 경우 일시 중단될 수 있습니다.
② 이용자는 서비스 이용 시 관계 법령 및 이 약관의 규정을 준수해야 합니다.

제6조 (책임 제한)
회사는 천재지변, 서비스 이용의 불편함에 대해 책임을 지지 않습니다.`;

/* ─────────────────────────────────────────
   범용 모달 컴포넌트
───────────────────────────────────────── */
const Modal = ({ isOpen, onClose, title, size = "md", children, icon, iconBg }) => {
  const overlayRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    if (isOpen) window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className={`mp-modal-overlay ${isOpen ? "open" : ""}`}
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className={`mp-modal mp-modal-${size}`}>
        <div className="mp-modal-header">
          {icon && (
            <span className="mp-modal-header-icon" style={{ background: iconBg || "linear-gradient(135deg,#14b8a6,#0d9488)" }}>
              <i className={`fas fa-${icon}`} />
            </span>
          )}
          <h2 className="mp-modal-title">{title}</h2>
          <button className="mp-modal-close" onClick={onClose}>
            <i className="fas fa-xmark" />
          </button>
        </div>
        <div className="mp-modal-body">{children}</div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────
   확인 모달 (로그아웃 / 취소 / 탈퇴 등)
───────────────────────────────────────── */
const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "확인", confirmColor = "#14b8a6", icon = "circle-question" }) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm" icon={icon} iconBg={confirmColor === "#ef4444" ? "linear-gradient(135deg,#ef4444,#dc2626)" : undefined}>
    <div className="mp-confirm-body">
      <p className="mp-confirm-msg">{message}</p>
      <div className="mp-confirm-actions">
        <button className="mp-btn mp-btn-ghost" onClick={onClose}>취소</button>
        <button className="mp-btn" style={{ background: confirmColor }} onClick={() => { onConfirm(); onClose(); }}>
          {confirmText}
        </button>
      </div>
    </div>
  </Modal>
);

/* ─────────────────────────────────────────
   모달 내용 컴포넌트들
───────────────────────────────────────── */

/* 포인트 사용 */
const PointsModal = ({ isOpen, onClose }) => {
  const [tab, setTab] = useState("use");
  const history = [
    { type: "적립", desc: "강남메디컬센터 진료 완료", points: "+50", date: "2026-02-25", color: "#14b8a6" },
    { type: "적립", desc: "후기 작성 보너스",         points: "+30", date: "2026-02-10", color: "#14b8a6" },
    { type: "사용", desc: "예약 결제 적용",           points: "-100", date: "2026-01-28", color: "#ef4444" },
    { type: "적립", desc: "출석 체크 보너스",         points: "+10", date: "2026-01-20", color: "#14b8a6" },
    { type: "사용", desc: "진료비 할인 적용",         points: "-200", date: "2025-12-15", color: "#ef4444" },
  ];
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="포인트 관리" size="md" icon="coins" iconBg="linear-gradient(135deg,#f59e0b,#d97706)">
      <div className="mp-points-summary">
        <div className="mp-points-total">
          <span className="mp-points-total-label"><i className="fas fa-coins" /> 보유 포인트</span>
          <span className="mp-points-total-value">1,240<span>P</span></span>
        </div>
      </div>
      <div className="mp-tab-bar">
        <button className={`mp-tab ${tab === "use" ? "active" : ""}`} onClick={() => setTab("use")}>포인트 사용</button>
        <button className={`mp-tab ${tab === "history" ? "active" : ""}`} onClick={() => setTab("history")}>이용 내역</button>
      </div>
      {tab === "use" ? (
        <div className="mp-points-use-form">
          <p className="mp-points-use-desc">사용할 포인트를 입력하세요. (최소 100P, 100P 단위)</p>
          <div className="mp-input-row">
            <input type="number" className="mp-input" placeholder="포인트 입력" min={100} step={100} />
            <button className="mp-btn">사용하기</button>
          </div>
          <div className="mp-quick-btns">
            {[100, 300, 500, 1000].map(v => (
              <button key={v} className="mp-btn mp-btn-outline">{v.toLocaleString()}P</button>
            ))}
            <button className="mp-btn mp-btn-outline">전액사용</button>
          </div>
        </div>
      ) : (
        <div className="mp-list">
          {history.map((h, i) => (
            <div key={i} className="mp-list-item">
              <div className="mp-list-icon" style={{ background: h.color + "22", color: h.color }}>
                <i className={`fas fa-${h.type === "적립" ? "plus" : "minus"}`} />
              </div>
              <div className="mp-list-info">
                <strong>{h.desc}</strong>
                <span>{h.date}</span>
              </div>
              <span className="mp-list-value" style={{ color: h.color }}>{h.points}P</span>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
};

/* 예약 현황 전체보기 */
const ReservationAllModal = ({ isOpen, onClose, reservations, onCancel }) => {
  const [filterStatus, setFilterStatus] = useState("전체");
  const statuses = ["전체", "예정", "완료", "취소"];
  const filtered = filterStatus === "전체" ? reservations : reservations.filter(r => r.status === filterStatus);
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="예약 현황 전체보기" size="lg" icon="calendar-check" iconBg="linear-gradient(135deg,#14b8a6,#0d9488)">
      <div className="mp-filter-bar">
        {statuses.map(s => (
          <button key={s} className={`mp-filter-btn ${filterStatus === s ? "active" : ""}`} onClick={() => setFilterStatus(s)}>{s}</button>
        ))}
      </div>
      <div className="mp-reservation-list">
        {filtered.length > 0 ? filtered.map((r, i) => (
          <ReservationCard key={i} {...r} onCancel={() => onCancel(r)} />
        )) : (
          <div className="mp-empty"><i className="fas fa-calendar-xmark" /><p>해당 내역이 없습니다.</p></div>
        )}
      </div>
    </Modal>
  );
};

/* 병원 내역 전체보기 */
const HistoryAllModal = ({ isOpen, onClose }) => {
  const allHistory = [
    ...RECENT_REVIEWS,
    { id: 5, hospital: "이대목동병원",  dept: "신경과",   rating: 4, text: "꼼꼼한 진료에 만족했습니다.", date: "2025-10-05" },
    { id: 6, hospital: "세브란스병원",  dept: "정형외과", rating: 5, text: "최고의 병원입니다.", date: "2025-08-20" },
  ];
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="병원 내역 전체보기" size="lg" icon="clipboard-list" iconBg="linear-gradient(135deg,#0d9488,#0f766e)">
      <div className="mp-history-list">
        {allHistory.map((rv, i) => (
          <MyReviewCard key={i} {...rv} />
        ))}
      </div>
    </Modal>
  );
};

/* 찜한 병원 전체보기 */
const ScrapAllModal = ({ isOpen, onClose, scraps }) => (
  <Modal isOpen={isOpen} onClose={onClose} title="찜한 병원 전체보기" size="lg" icon="heart" iconBg="linear-gradient(135deg,#0f766e,#115e59)">
    {(!scraps || scraps.length === 0) ? (
      <div className="mp-empty"><i className="fas fa-heart" style={{ color: "#14b8a6" }} /><p>찜한 병원이 없습니다.</p></div>
    ) : (
      <div className="mp-history-list">
        {scraps.map((data, i) => <ScrapCard key={i} {...data} />)}
      </div>
    )}
  </Modal>
);

/* 알림 */
const NotificationsModal = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const markAll = () => setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="알림" size="md" icon="bell" iconBg="linear-gradient(135deg,#14b8a6,#0d9488)">
      <div className="mp-notif-header">
        <span className="mp-notif-count">{notifications.filter(n => !n.isRead).length}개 읽지 않음</span>
        <button className="mp-text-btn" onClick={markAll}>모두 읽음</button>
      </div>
      <div className="mp-list">
        {notifications.map(n => (
          <div key={n.id} className={`mp-list-item mp-notif-item ${n.isRead ? "read" : ""}`}
            onClick={() => setNotifications(prev => prev.map(p => p.id === n.id ? { ...p, isRead: true } : p))}>
            <div className="mp-list-icon" style={{ background: n.color + "22", color: n.color }}>
              <i className={`fas fa-${n.icon}`} />
            </div>
            <div className="mp-list-info">
              <strong>{n.title}</strong>
              <span>{n.desc}</span>
              <span className="mp-notif-time">{n.time}</span>
            </div>
            {!n.isRead && <div className="mp-notif-dot" />}
          </div>
        ))}
      </div>
    </Modal>
  );
};

/* 내 Q&A */
const QnaModal = ({ isOpen, onClose }) => {
  const [expanded, setExpanded] = useState(null);
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="내 Q&A" size="md" icon="comments" iconBg="linear-gradient(135deg,#0d9488,#0f766e)">
      <button className="mp-btn mp-btn-full" style={{ marginBottom: "1rem" }}>
        <i className="fas fa-plus" /> 문의하기
      </button>
      <div className="mp-list">
        {QNA_LIST.map(q => (
          <div key={q.id} className="mp-qna-item">
            <div className="mp-qna-header" onClick={() => setExpanded(expanded === q.id ? null : q.id)}>
              <div className="mp-list-icon" style={{ background: q.status === "답변완료" ? "#d1fae522" : "#fef3c722", color: q.status === "답변완료" ? "#059669" : "#d97706" }}>
                <i className={`fas fa-${q.status === "답변완료" ? "check" : "clock"}`} />
              </div>
              <div className="mp-list-info">
                <strong>{q.title}</strong>
                <span>{q.date}</span>
              </div>
              <span className={`mp-res-chip ${q.status === "답변완료" ? "done" : "upcoming"}`}>{q.status}</span>
              <i className={`fas fa-chevron-${expanded === q.id ? "up" : "down"} mp-qna-chevron`} />
            </div>
            {expanded === q.id && q.answer && (
              <div className="mp-qna-answer">
                <i className="fas fa-reply" /> {q.answer}
              </div>
            )}
            {expanded === q.id && !q.answer && (
              <div className="mp-qna-answer pending">아직 답변이 등록되지 않았습니다.</div>
            )}
          </div>
        ))}
      </div>
    </Modal>
  );
};

/* 나의 후기 */
const ReviewsModal = ({ isOpen, onClose }) => {
  const [editTarget, setEditTarget] = useState(null);
  const [reviews, setReviews] = useState(RECENT_REVIEWS);
  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="나의 후기" size="lg" icon="star" iconBg="linear-gradient(135deg,#0f766e,#115e59)">
        <div className="mp-history-list">
          {reviews.map((rv) => (
            <MyReviewCard key={rv.id} {...rv} onEdit={() => setEditTarget(rv)} />
          ))}
        </div>
      </Modal>
      <EditReviewModal
        isOpen={!!editTarget}
        review={editTarget}
        onClose={() => setEditTarget(null)}
        onSave={(updated) => {
          setReviews(prev => prev.map(r => r.id === updated.id ? updated : r));
          setEditTarget(null);
        }}
      />
    </>
  );
};

/* 후기 수정 모달 */
const EditReviewModal = ({ isOpen, review, onClose, onSave }) => {
  const [text, setText] = useState("");
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);

  useEffect(() => {
    if (review) { setText(review.text); setRating(review.rating); }
  }, [review]);

  if (!review) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="후기 수정" size="md" icon="pen" iconBg="linear-gradient(135deg,#8b5cf6,#7c3aed)">
      <div className="mp-edit-review-form">
        <div className="mp-edit-hospital-info">
          <i className="fas fa-hospital" />
          <div>
            <strong>{review.hospital}</strong>
            <span>{review.dept}</span>
          </div>
        </div>
        <div className="mp-star-editor">
          <p className="mp-form-label">별점</p>
          <div className="mp-star-row">
            {[1,2,3,4,5].map(s => (
              <button key={s} className="mp-star-btn"
                onMouseEnter={() => setHover(s)}
                onMouseLeave={() => setHover(0)}
                onClick={() => setRating(s)}>
                <i className={`fas fa-star ${s <= (hover || rating) ? "filled" : "empty"}`} />
              </button>
            ))}
            <span className="mp-star-label">{rating}점</span>
          </div>
        </div>
        <div>
          <p className="mp-form-label">후기 내용</p>
          <textarea
            className="mp-textarea"
            value={text}
            onChange={e => setText(e.target.value)}
            rows={4}
            placeholder="후기를 입력해주세요..."
          />
        </div>
        <div className="mp-confirm-actions">
          <button className="mp-btn mp-btn-ghost" onClick={onClose}>취소</button>
          <button className="mp-btn" onClick={() => onSave({ ...review, rating, text })}>저장하기</button>
        </div>
      </div>
    </Modal>
  );
};

/* 채팅 */
const ChatModal = ({ isOpen, onClose }) => {
  const [activeChat, setActiveChat] = useState(null);
  const [msg, setMsg] = useState("");
  const [messages, setMessages] = useState([
    { id: 1, from: "hospital", text: "안녕하세요! 예약 관련 문의 주셨는데요.", time: "14:28" },
    { id: 2, from: "me", text: "네, 예약 변경이 가능한가요?", time: "14:29" },
    { id: 3, from: "hospital", text: "네, 가능합니다. 원하시는 날짜를 알려주세요.", time: "14:30" },
  ]);
  const send = () => {
    if (!msg.trim()) return;
    setMessages(prev => [...prev, { id: Date.now(), from: "me", text: msg, time: new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }) }]);
    setMsg("");
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="채팅" size="lg" icon="comment-dots" iconBg="linear-gradient(135deg,#14b8a6,#0d9488)">
      {!activeChat ? (
        <div className="mp-list">
          {CHAT_LIST.map(c => (
            <div key={c.id} className="mp-list-item mp-chat-row" onClick={() => setActiveChat(c)}>
              <div className="mp-list-icon" style={{ background: "#14b8a622", color: "#14b8a6" }}>
                <i className="fas fa-hospital" />
              </div>
              <div className="mp-list-info">
                <strong>{c.hospital}</strong>
                <span>{c.lastMsg}</span>
              </div>
              <div className="mp-chat-meta">
                <span className="mp-notif-time">{c.time}</span>
                {c.unread > 0 && <span className="mp-menu-badge">{c.unread}</span>}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mp-chat-room">
          <button className="mp-back-btn" onClick={() => setActiveChat(null)}>
            <i className="fas fa-arrow-left" /> {activeChat.hospital}
          </button>
          <div className="mp-chat-messages">
            {messages.map(m => (
              <div key={m.id} className={`mp-chat-bubble-wrap ${m.from === "me" ? "me" : "them"}`}>
                <div className="mp-chat-bubble">{m.text}</div>
                <span className="mp-chat-time">{m.time}</span>
              </div>
            ))}
          </div>
          <div className="mp-chat-input-row">
            <input
              className="mp-input"
              value={msg}
              onChange={e => setMsg(e.target.value)}
              placeholder="메시지를 입력하세요..."
              onKeyDown={e => e.key === "Enter" && send()}
            />
            <button className="mp-btn mp-btn-icon" onClick={send}>
              <i className="fas fa-paper-plane" />
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};

/* 개인정보 수정 */
const EditProfileModal = ({ isOpen, onClose }) => {
  const [form, setForm] = useState({ name: USER_INFO.name, email: USER_INFO.email, phone: USER_INFO.phone });
  const [saved, setSaved] = useState(false);
  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="개인정보 수정" size="md" icon="user-pen" iconBg="linear-gradient(135deg,#0d9488,#0f766e)">
      <div className="mp-form">
        {[
          { label: "이름", key: "name", type: "text", placeholder: "이름을 입력하세요" },
          { label: "이메일", key: "email", type: "email", placeholder: "이메일을 입력하세요" },
          { label: "휴대폰 번호", key: "phone", type: "tel", placeholder: "010-0000-0000" },
        ].map(f => (
          <div key={f.key} className="mp-form-group">
            <label className="mp-form-label">{f.label}</label>
            <input
              type={f.type}
              className="mp-input"
              value={form[f.key]}
              onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
              placeholder={f.placeholder}
            />
          </div>
        ))}
        <div className="mp-form-group">
          <label className="mp-form-label">생년월일</label>
          <input type="date" className="mp-input" defaultValue="1995-05-20" />
        </div>
        <div className="mp-confirm-actions">
          <button className="mp-btn mp-btn-ghost" onClick={onClose}>취소</button>
          <button className="mp-btn" onClick={handleSave}>
            {saved ? <><i className="fas fa-check" /> 저장됨</> : "저장하기"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

/* 비밀번호 변경 */
const ChangePasswordModal = ({ isOpen, onClose }) => {
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const validate = () => {
    const e = {};
    if (!form.current) e.current = "현재 비밀번호를 입력하세요.";
    if (form.next.length < 8) e.next = "8자 이상 입력하세요.";
    if (form.next !== form.confirm) e.confirm = "비밀번호가 일치하지 않습니다.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="비밀번호 변경" size="md" icon="lock" iconBg="linear-gradient(135deg,#0f766e,#115e59)">
      <div className="mp-form">
        {[
          { label: "현재 비밀번호", key: "current", placeholder: "현재 비밀번호" },
          { label: "새 비밀번호", key: "next", placeholder: "8자 이상" },
          { label: "새 비밀번호 확인", key: "confirm", placeholder: "새 비밀번호 재입력" },
        ].map(f => (
          <div key={f.key} className="mp-form-group">
            <label className="mp-form-label">{f.label}</label>
            <input
              type="password"
              className={`mp-input ${errors[f.key] ? "error" : ""}`}
              value={form[f.key]}
              onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
              placeholder={f.placeholder}
            />
            {errors[f.key] && <span className="mp-form-error">{errors[f.key]}</span>}
          </div>
        ))}
        <div className="mp-pw-strength">
          <span>비밀번호 강도:</span>
          <div className="mp-pw-bars">
            {[1,2,3,4].map(i => (
              <div key={i} className={`mp-pw-bar ${form.next.length >= i * 3 ? "active" : ""}`}
                style={{ background: form.next.length >= i * 3 ? (form.next.length > 9 ? "#14b8a6" : "#f59e0b") : undefined }} />
            ))}
          </div>
          <span className="mp-pw-label">{form.next.length === 0 ? "" : form.next.length < 6 ? "약함" : form.next.length < 10 ? "보통" : "강함"}</span>
        </div>
        <div className="mp-confirm-actions">
          <button className="mp-btn mp-btn-ghost" onClick={onClose}>취소</button>
          <button className="mp-btn" onClick={() => validate() && onClose()}>변경하기</button>
        </div>
      </div>
    </Modal>
  );
};

/* 보안 설정 */
const SecurityModal = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState({
    twoFactor: true, loginAlert: true, appLock: false, bioAuth: true,
  });
  const toggle = (key) => setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  const items = [
    { key: "twoFactor",  icon: "shield-halved", label: "2단계 인증",         desc: "로그인 시 SMS 인증을 추가합니다." },
    { key: "loginAlert", icon: "bell",          label: "로그인 알림",         desc: "새 기기 로그인 시 알림을 받습니다." },
    { key: "appLock",    icon: "lock",          label: "앱 잠금",             desc: "앱 실행 시 PIN 또는 생체인증을 요구합니다." },
    { key: "bioAuth",    icon: "fingerprint",   label: "생체 인증",           desc: "지문 또는 Face ID 로그인을 허용합니다." },
  ];
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="보안 설정" size="md" icon="shield-check" iconBg="linear-gradient(135deg,#14b8a6,#0d9488)">
      <div className="mp-list">
        {items.map(item => (
          <div key={item.key} className="mp-list-item mp-security-row">
            <div className="mp-list-icon" style={{ background: "#14b8a622", color: "#14b8a6" }}>
              <i className={`fas fa-${item.icon}`} />
            </div>
            <div className="mp-list-info">
              <strong>{item.label}</strong>
              <span>{item.desc}</span>
            </div>
            <button
              className={`mp-toggle ${settings[item.key] ? "on" : ""}`}
              onClick={() => toggle(item.key)}
            >
              <div className="mp-toggle-thumb" />
            </button>
          </div>
        ))}
      </div>
    </Modal>
  );
};

/* 공지사항 */
const NoticesModal = ({ isOpen, onClose }) => {
  const [selected, setSelected] = useState(null);
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={selected ? selected.title : "공지사항"} size="md" icon="circle-question" iconBg="linear-gradient(135deg,#0d9488,#0f766e)">
      {!selected ? (
        <div className="mp-list">
          {NOTICES.map(n => (
            <div key={n.id} className="mp-list-item mp-notice-row" onClick={() => setSelected(n)}>
              <div className="mp-list-icon" style={{ background: "#14b8a622", color: "#14b8a6" }}>
                <i className="fas fa-bullhorn" />
              </div>
              <div className="mp-list-info">
                <strong>{n.title} {n.isNew && <span className="mp-new-badge">NEW</span>}</strong>
                <span>{n.date}</span>
              </div>
              <i className="fas fa-chevron-right" style={{ color: "#94a3b8", fontSize: ".8rem" }} />
            </div>
          ))}
        </div>
      ) : (
        <div className="mp-notice-detail">
          <button className="mp-back-btn" onClick={() => setSelected(null)}>
            <i className="fas fa-arrow-left" /> 목록으로
          </button>
          <div className="mp-notice-meta">{selected.date}</div>
          <p className="mp-notice-body">
            안녕하세요. 헬스케어 서비스입니다.<br /><br />
            <strong>{selected.title}</strong>에 관련하여 안내 드립니다.<br /><br />
            더 나은 서비스 제공을 위해 항상 노력하겠습니다.<br />
            이용에 불편을 드려 죄송합니다.<br /><br />
            감사합니다.
          </p>
        </div>
      )}
    </Modal>
  );
};

/* 고객센터 */
const SupportModal = ({ isOpen, onClose }) => {
  const [tab, setTab] = useState("contact");
  const faqs = [
    { q: "예약 취소는 어떻게 하나요?", a: "마이페이지 > 예약현황에서 예약 취소 버튼을 누르시면 됩니다. 진료 24시간 전까지 무료 취소가 가능합니다." },
    { q: "포인트는 어떻게 적립되나요?", a: "진료 완료, 후기 작성, 출석 체크, 이벤트 참여 시 포인트가 적립됩니다." },
    { q: "회원 탈퇴 후 데이터는 어떻게 되나요?", a: "탈퇴 후 30일간 데이터가 보관되며, 이후 모든 개인정보는 파기됩니다." },
  ];
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="고객센터" size="md" icon="headset" iconBg="linear-gradient(135deg,#0f766e,#115e59)">
      <div className="mp-tab-bar">
        <button className={`mp-tab ${tab === "contact" ? "active" : ""}`} onClick={() => setTab("contact")}>문의하기</button>
        <button className={`mp-tab ${tab === "faq" ? "active" : ""}`} onClick={() => setTab("faq")}>자주 묻는 질문</button>
      </div>
      {tab === "contact" ? (
        <div className="mp-form">
          <div className="mp-support-cards">
            {[
              { icon: "phone", label: "전화 상담", value: "1588-0000", sub: "평일 09:00~18:00", color: "#14b8a6" },
              { icon: "envelope", label: "이메일", value: "help@healthcare.kr", sub: "24시간 접수", color: "#0d9488" },
            ].map(c => (
              <div key={c.icon} className="mp-support-card">
                <div className="mp-support-icon" style={{ background: c.color }}><i className={`fas fa-${c.icon}`} /></div>
                <strong>{c.label}</strong>
                <span className="mp-support-value">{c.value}</span>
                <span className="mp-support-sub">{c.sub}</span>
              </div>
            ))}
          </div>
          <div className="mp-form-group">
            <label className="mp-form-label">문의 유형</label>
            <select className="mp-input">
              <option>예약 문의</option><option>결제 문의</option><option>개인정보 문의</option><option>기타</option>
            </select>
          </div>
          <div className="mp-form-group">
            <label className="mp-form-label">문의 내용</label>
            <textarea className="mp-textarea" rows={4} placeholder="문의 내용을 입력하세요..." />
          </div>
          <button className="mp-btn mp-btn-full">문의 접수하기</button>
        </div>
      ) : (
        <div className="mp-list">
          {faqs.map((f, i) => (
            <details key={i} className="mp-faq-item">
              <summary><i className="fas fa-circle-question" />{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      )}
    </Modal>
  );
};

/* 이용약관 */
const TermsModal = ({ isOpen, onClose }) => (
  <Modal isOpen={isOpen} onClose={onClose} title="이용약관" size="md" icon="file-contract" iconBg="linear-gradient(135deg,#14b8a6,#0d9488)">
    <div className="mp-terms-body">
      <pre>{TERMS_TEXT}</pre>
    </div>
  </Modal>
);

/* ─────────────────────────────────────────
   MyPage Component
───────────────────────────────────────── */
const MyPage = () => {
  const [activeStatus, setActiveStatus] = useState("reservation");
  const [scrapCount, setScrapCount] = useState(0);
  const [scraps, setScraps] = useState([]);
<<<<<<< HEAD
  const [reservations, setReservations] = useState(RESERVATIONS);

  // 모달 상태
  const [modal, setModal] = useState(null); // 'points' | 'reservationAll' | 'historyAll' | 'scrapAll' | 'notifications' | 'qna' | 'reviews' | 'chat' | 'editProfile' | 'changePassword' | 'security' | 'notices' | 'support' | 'terms' | 'logout' | 'withdraw' | 'cancelConfirm'
  const [cancelTarget, setCancelTarget] = useState(null);
=======
>>>>>>> seoyeon

  const auth = useAuth();

  useEffect(() => {
    if (auth?.getMeAndSetUser) auth.getMeAndSetUser();
  }, []);

  useEffect(() => {
    if (!auth?.user) return;
    async function fetchCount() {
      const result = await authFetch("/api/v1/hospitals/me/scraps/count");
      if (result.ok) { const count = await result.text(); setScrapCount(count); }
    }
    async function fetchScraps() {
      const result = await authFetch("/api/v1/hospitals/me/scraps");
      if (result.ok) { const data = await result.json(); setScraps(data); }
    }
    fetchCount();
    fetchScraps();
  }, [auth?.user]);

  if (!auth) return null;
  const { user } = auth;

  const openModal = (type) => setModal(type);
  const closeModal = () => setModal(null);

  const STATUS_STATS = [
    { id: "reservation", icon: "calendar-check", label: "예약현황",  value: reservations.length, color: "#14b8a6", sub: "진행 중" },
    { id: "history",     icon: "clipboard-list", label: "병원내역",  value: 14,                  color: "#0d9488", sub: "총 방문" },
    { id: "scrap",       icon: "heart",          label: "찜한 병원", value: scrapCount,           color: "#0f766e", sub: "저장됨" },
  ];

  const handleCancelReservation = (r) => { setCancelTarget(r); openModal("cancelConfirm"); };
  const confirmCancel = () => {
    setReservations(prev => prev.filter(r => r.id !== cancelTarget?.id));
    setCancelTarget(null);
  };

  const menuActionMap = {
    1: () => openModal("notifications"),
    2: () => openModal("qna"),
    3: () => openModal("reviews"),
    4: () => openModal("chat"),
    5: () => openModal("editProfile"),
    6: () => openModal("changePassword"),
    7: () => openModal("security"),
    8: () => openModal("notices"),
    9: () => openModal("support"),
    10: () => openModal("terms"),
  };

  return (
    <div className="mypage-wrapper">

      {/* ══════════════════ 히어로 배너 ══════════════════ */}
      <section className="mp-hero">
        <div className="mp-hero-blob blob-a" />
        <div className="mp-hero-blob blob-b" />
        <div className="mp-container">
          <div className="mp-hero-inner">
            <div className="mp-profile-row">
              <div className="mp-avatar-wrap">
                <div className="mp-avatar">{USER_INFO.avatar}</div>
                <span className="mp-avatar-badge"><i className="fas fa-check" /></span>
              </div>
              <div className="mp-profile-info">
                <div className="mp-welcome-label"><i className="fas fa-hand-sparkles" /> WELCOME</div>
                <h1 className="mp-username">{user ? user.id : "none"}<span className="mp-nim">님</span></h1>
                <div className="mp-meta-row">
                  <span className="mp-grade-badge"><i className="fas fa-crown" />{USER_INFO.grade}</span>
                  <span className="mp-email"><i className="fas fa-envelope" />{USER_INFO.email}</span>
                </div>
              </div>
              <div className="mp-points-box">
                <div className="mp-points-label"><i className="fas fa-coins" />보유 포인트</div>
                <div className="mp-points-value">{USER_INFO.points.toLocaleString()}<span>P</span></div>
                <button className="mp-points-btn" onClick={() => openModal("points")}>
                  포인트 사용 <i className="fas fa-arrow-right" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mp-container mp-body">

        {/* ══════════════════ 스탯 카드 ══════════════════ */}
        <section className="mp-stats-section">
          <div className="mp-stats-grid">
            {STATUS_STATS.map((s) => (
              <button
                key={s.id}
                className={`mp-stat-card ${activeStatus === s.id ? "active" : ""}`}
                style={{ "--sc": s.color }}
                onClick={() => setActiveStatus(s.id)}
              >
                <div className="mp-stat-icon"><i className={`fas fa-${s.icon}`} /></div>
                <div className="mp-stat-body">
                  <div className="mp-stat-value">{s.value}</div>
                  <div className="mp-stat-label">{s.label}</div>
                  <div className="mp-stat-sub">{s.sub}</div>
                </div>
                <div className="mp-stat-arrow"><i className="fas fa-chevron-right" /></div>
              </button>
            ))}
          </div>
        </section>

        {/* ══════════════════ 예약 현황 패널 ══════════════════ */}
        {activeStatus === "reservation" && (
          <section className="mp-panel mp-reservation-panel">
            <div className="mp-panel-header">
              <span className="mp-panel-icon" style={{ background: "linear-gradient(135deg,#14b8a6,#0d9488)" }}>
                <i className="fas fa-calendar-check" />
              </span>
              <h2>예약 현황</h2>
              <button className="mp-panel-more" onClick={() => openModal("reservationAll")}>
                전체보기 <i className="fas fa-chevron-right" />
              </button>
            </div>
            <div className="mp-reservation-list">
              {reservations.slice(0, 2).map((r, i) => (
                <ReservationCard key={i} {...r} onCancel={() => handleCancelReservation(r)} />
              ))}
              {reservations.length === 0 && (
                <div className="mp-empty">
                  <i className="fas fa-calendar-xmark" /><p>예약 내역이 없습니다.</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ══════════════════ 병원 내역 패널 ══════════════════ */}
        {activeStatus === "history" && (
          <section className="mp-panel">
            <div className="mp-panel-header">
              <span className="mp-panel-icon" style={{ background: "linear-gradient(135deg,#0d9488,#0f766e)" }}>
                <i className="fas fa-clipboard-list" />
              </span>
              <h2>병원 내역</h2>
              <button className="mp-panel-more" onClick={() => openModal("historyAll")}>
                전체보기 <i className="fas fa-chevron-right" />
              </button>
            </div>
            <div className="mp-history-list">
              {RECENT_REVIEWS.slice(0, 2).map((rv, i) => (
                <MyReviewCard key={i} {...rv} />
              ))}
            </div>
          </section>
        )}

        {/* ══════════════════ 찜한 병원 패널 ══════════════════ */}
        {activeStatus === "scrap" && (
          <section className="mp-panel">
            <div className="mp-panel-header">
              <span className="mp-panel-icon" style={{ background: "linear-gradient(135deg,#0f766e,#115e59)" }}>
                <i className="fas fa-heart" />
              </span>
              <h2>찜한 병원</h2>
              <button className="mp-panel-more" onClick={() => openModal("scrapAll")}>
                전체보기 <i className="fas fa-chevron-right" />
              </button>
            </div>
            {scraps.length === 0 ? (
              <div className="mp-empty">
                <i className="fas fa-heart" style={{ color: "#14b8a6" }} />
                <p>찜한 병원을 확인하세요.</p>
              </div>
            ) : (
              <div className="mp-history-list">
                {scraps.slice(0, 3).map((data, i) => <ScrapCard key={i} {...data} />)}
              </div>
            )}
          </section>
        )}

        {/* ══════════════════ 메뉴 그룹 ══════════════════ */}
        <div className="mp-menu-area">
          {MENU_GROUPS.map((group, gi) => (
            <section key={gi} className="mp-menu-group">
              <h3 className="mp-group-title">{group.groupTitle}</h3>
              <div className="mp-menu-list">
                {group.items.map((item) => (
                  <MenuRow key={item.id} {...item} onClick={menuActionMap[item.id]} />
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* ══════════════════ 로그아웃 ══════════════════ */}
        <div className="mp-logout-area">
          <button className="mp-logout-btn" onClick={() => openModal("logout")}>
            <i className="fas fa-right-from-bracket" />로그아웃
          </button>
          <button className="mp-withdraw-btn" onClick={() => openModal("withdraw")}>회원탈퇴</button>
        </div>
      </div>

      {/* ══════════════════ 모달들 ══════════════════ */}
      <PointsModal          isOpen={modal === "points"}          onClose={closeModal} />
      <ReservationAllModal  isOpen={modal === "reservationAll"}  onClose={closeModal} reservations={reservations} onCancel={handleCancelReservation} />
      <HistoryAllModal      isOpen={modal === "historyAll"}      onClose={closeModal} />
      <ScrapAllModal        isOpen={modal === "scrapAll"}        onClose={closeModal} scraps={scraps} />
      <NotificationsModal   isOpen={modal === "notifications"}   onClose={closeModal} />
      <QnaModal             isOpen={modal === "qna"}             onClose={closeModal} />
      <ReviewsModal         isOpen={modal === "reviews"}         onClose={closeModal} />
      <ChatModal            isOpen={modal === "chat"}            onClose={closeModal} />
      <EditProfileModal     isOpen={modal === "editProfile"}     onClose={closeModal} />
      <ChangePasswordModal  isOpen={modal === "changePassword"}  onClose={closeModal} />
      <SecurityModal        isOpen={modal === "security"}        onClose={closeModal} />
      <NoticesModal         isOpen={modal === "notices"}         onClose={closeModal} />
      <SupportModal         isOpen={modal === "support"}         onClose={closeModal} />
      <TermsModal           isOpen={modal === "terms"}           onClose={closeModal} />

      <ConfirmModal
        isOpen={modal === "logout"}
        onClose={closeModal}
        onConfirm={() => console.log("logout")}
        title="로그아웃"
        message="정말 로그아웃 하시겠습니까?"
        confirmText="로그아웃"
        icon="right-from-bracket"
      />
      <ConfirmModal
        isOpen={modal === "withdraw"}
        onClose={closeModal}
        onConfirm={() => console.log("withdraw")}
        title="회원탈퇴"
        message={`탈퇴 시 모든 데이터가 삭제됩니다.\n정말 탈퇴하시겠습니까?`}
        confirmText="탈퇴하기"
        confirmColor="#ef4444"
        icon="triangle-exclamation"
      />
      <ConfirmModal
        isOpen={modal === "cancelConfirm"}
        onClose={() => { closeModal(); setCancelTarget(null); }}
        onConfirm={confirmCancel}
        title="예약 취소"
        message={cancelTarget ? `${cancelTarget.hospital} ${cancelTarget.dept}\n${cancelTarget.date} ${cancelTarget.time}\n예약을 취소하시겠습니까?` : ""}
        confirmText="예약 취소"
        confirmColor="#ef4444"
        icon="calendar-xmark"
      />
    </div>
  );
};

/* ─────────────────────────────────────────
   서브 컴포넌트
───────────────────────────────────────── */
const ReservationCard = ({ hospital, dept, date, time, status, onCancel }) => (
  <div className="mp-reservation-card">
    <div className="mp-res-status-dot" />
    <div className="mp-res-icon"><i className="fas fa-hospital" /></div>
    <div className="mp-res-info">
      <strong>{hospital}</strong>
      <span className="mp-res-dept">{dept}</span>
    </div>
    <div className="mp-res-time">
      <span className="mp-res-date"><i className="fas fa-calendar" />{date}</span>
      <span className="mp-res-clock"><i className="fas fa-clock" />{time}</span>
    </div>
    <div className="mp-res-actions">
      <span className="mp-res-chip upcoming">{status}</span>
      <button className="mp-res-cancel" onClick={onCancel}>취소</button>
    </div>
  </div>
);

const ScrapCard = ({ ho_name, hs_created_at, status }) => (
  <div className="mp-reservation-card">
    <div className="mp-res-status-dot" />
    <div className="mp-res-icon"><i className="fas fa-hospital" /></div>
    <div className="mp-res-info"><strong>{ho_name}</strong></div>
    <div className="mp-res-time">
      <span className="mp-res-date"><i className="fas fa-calendar" />{hs_created_at}</span>
    </div>
    <div className="mp-res-actions">
      <span className="mp-res-chip upcoming">{status}</span>
    </div>
  </div>
);

const MyReviewCard = ({ hospital, dept, rating, text, date, onEdit }) => (
  <div className="mp-review-card">
    <div className="mp-rev-left">
      <div className="mp-rev-avatar"><i className="fas fa-hospital" /></div>
    </div>
    <div className="mp-rev-body">
      <div className="mp-rev-top">
        <strong>{hospital}</strong>
        <span className="mp-rev-dept">{dept}</span>
        <span className="mp-rev-date">{date}</span>
      </div>
      <div className="mp-rev-stars">
        {[...Array(5)].map((_, i) => (
          <i key={i} className={`fas fa-star ${i < rating ? "filled" : "empty"}`} />
        ))}
      </div>
      <p className="mp-rev-text">"{text}"</p>
    </div>
    {onEdit && (
      <button className="mp-rev-edit" onClick={onEdit}><i className="fas fa-pen" /></button>
    )}
  </div>
);

const MenuRow = ({ icon, title, badge, color, onClick }) => (
  <button className="mp-menu-row" style={{ "--mc": color }} onClick={onClick}>
    <div className="mp-menu-icon"><i className={`fas fa-${icon}`} /></div>
    <span className="mp-menu-title">{title}</span>
    {badge && <span className="mp-menu-badge">{badge}</span>}
    <i className="fas fa-chevron-right mp-menu-arrow" />
  </button>
);

export default MyPage;