import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useSocket } from "../WebSocketContext";
import {
  faHeart,
  faMagnifyingGlass,
  faXmark,
  faBell,
  faRightToBracket,
  faUserPlus,
  faCalendarCheck,
  faPills,
  faHospital,
  faStethoscope,
  faUser,
  faNotesMedical,
  faComments,
  faCircleQuestion,
  faBars,
  faChevronRight,
  faPaperPlane,
  faClock,
  faCalendarDays,
  faSyringe,
  faCheckCircle,
  faArrowLeft,
  faEllipsisVertical,
  faCircleDot,
  faTriangleExclamation,
  faMoon,
} from "@fortawesome/free-solid-svg-icons";
import "../assets/styles/Header.css";
import Chat from "../Chat/Chat";
/* ══════════════════════════════════════
   상수 데이터
══════════════════════════════════════ */
const NAV_ITEMS = [
  { path: "/pharmacy", label: "약국 찾기", icon: faPills },
  { path: "/hospitals", label: "병원 찾기", icon: faHospital },
  { path: "/mypage", label: "마이페이지", icon: faUser },
  { path: "/reservation", label: "예약하기", icon: faUser },
  { path: "/reviews", label: "리뷰", icon: faNotesMedical },
  { path: "/community", label: "커뮤니티", icon: faComments },
  { path: "/qna", label: "Q&A", icon: faCircleQuestion },
];

/* ── 예약 현황 데이터 ── */
const RESERVATIONS = [
  {
    id: 1,
    hospital: "강남메디컬센터",
    dept: "내과",
    date: "2026-02-27",
    time: "14:30",
    status: "confirmed",
    doctor: "이서연",
    waitNum: 3,
  },
  {
    id: 2,
    hospital: "서울아동병원",
    dept: "소아청소년과",
    date: "2026-03-05",
    time: "10:00",
    status: "pending",
    doctor: "김민수",
    waitNum: null,
  },
  {
    id: 3,
    hospital: "스마일치과",
    dept: "치과",
    date: "2026-03-12",
    time: "16:00",
    status: "confirmed",
    doctor: "박준호",
    waitNum: 7,
  },
  {
    id: 4,
    hospital: "밝은눈안과",
    dept: "안과",
    date: "2026-03-20",
    time: "11:00",
    status: "waiting",
    doctor: "최지혜",
    waitNum: null,
  },
];

/* ── 채팅방 데이터 ── */
const CHAT_ROOMS = [
  {
    id: 1,
    hospital: "강남메디컬센터",
    dept: "내과",
    avatar: "강",
    lastMsg: "네, 가능합니다. 원하시는 시간을 말씀해 주세요.",
    time: "10:32",
    unread: 1,
  },
  {
    id: 2,
    hospital: "서울아동병원",
    dept: "소아청소년과",
    avatar: "서",
    lastMsg: "예약 확인 차 연락드립니다. 내일 10시 맞으신가요?",
    time: "09:15",
    unread: 2,
  },
  {
    id: 3,
    hospital: "스마일치과",
    dept: "치과",
    avatar: "스",
    lastMsg: "감사합니다! 다음 방문 때 뵙겠습니다.",
    time: "어제",
    unread: 0,
  },
  {
    id: 4,
    hospital: "밝은눈안과",
    dept: "안과",
    avatar: "밝",
    lastMsg: "진료 후기를 남겨주시면 감사하겠습니다.",
    time: "월요일",
    unread: 0,
  },
  {
    id: 5,
    hospital: "한강정형외과",
    dept: "정형외과",
    avatar: "한",
    lastMsg: "다음 방문 일정을 잡아드릴까요?",
    time: "화요일",
    unread: 0,
  },
];

/* ── 초기 채팅 메시지 ── */
const INIT_MESSAGES = {
  1: [
    {
      from: "hospital",
      text: "안녕하세요! 강남메디컬센터입니다. 무엇을 도와드릴까요? 😊",
      time: "10:20",
    },
    {
      from: "user",
      text: "안녕하세요, 내일 오후 2시 30분 예약인데 시간 변경이 가능할까요?",
      time: "10:28",
    },
    {
      from: "hospital",
      text: "네, 가능합니다. 원하시는 시간을 말씀해 주세요.",
      time: "10:32",
    },
  ],
  2: [
    {
      from: "hospital",
      text: "안녕하세요. 서울아동병원 예약팀입니다.",
      time: "09:10",
    },
    {
      from: "hospital",
      text: "3월 5일 오전 10:00 예약 확인 차 연락드립니다. 맞으신가요?",
      time: "09:15",
    },
  ],
  3: [
    {
      from: "hospital",
      text: "안녕하세요! 스마일치과입니다. 지난번 치료는 불편하지 않으셨나요?",
      time: "어제 13:50",
    },
    {
      from: "user",
      text: "네, 덕분에 괜찮아졌어요. 감사합니다!",
      time: "어제 14:00",
    },
    {
      from: "hospital",
      text: "감사합니다! 다음 방문 때 뵙겠습니다. 😄",
      time: "어제 14:05",
    },
  ],
  4: [
    {
      from: "hospital",
      text: "안녕하세요. 밝은눈안과입니다. 진료 후기를 남겨주시면 감사하겠습니다.",
      time: "월요일",
    },
  ],
  5: [
    {
      from: "hospital",
      text: "안녕하세요! 한강정형외과입니다. 다음 방문 일정을 잡아드릴까요?",
      time: "화요일",
    },
  ],
};

/* ── 건강 리마인더 데이터 ── */
const HEALTH_REMINDERS = [
  {
    id: 1,
    icon: faPills,
    title: "혈압약 복용",
    sub: "오전 8:00",
    done: true,
    color: "#14b8a6",
    type: "pill",
  },
  {
    id: 2,
    icon: faPills,
    title: "비타민D 복용",
    sub: "오후 1:00",
    done: false,
    color: "#0d9488",
    type: "pill",
  },
  {
    id: 3,
    icon: faSyringe,
    title: "독감 예방접종",
    sub: "D-14 남음",
    done: false,
    color: "#f97316",
    type: "vaccine",
  },
  {
    id: 4,
    icon: faStethoscope,
    title: "정기 건강검진",
    sub: "D-30 남음",
    done: false,
    color: "#6366f1",
    type: "checkup",
  },
  {
    id: 5,
    icon: faMoon,
    title: "수면 루틴 알림",
    sub: "오후 11:00",
    done: false,
    color: "#0f766e",
    type: "sleep",
  },
];

/* ══════════════════════════════════════
   Header 컴포넌트
══════════════════════════════════════ */
const Header = ({ onOpenReservation }) => {
  const location = useLocation();
  const navigate = useNavigate();

  /* ── 기본 상태 ── */
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  /* ── 채팅 상태 ── */
  const { activeChatRoom, setActiveChatRoom } = useSocket();
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState(INIT_MESSAGES);
  const [reminders, setReminders] = useState(HEALTH_REMINDERS);

  

  /* ── Refs ── */
  const bellRef = useRef(null);
  const panelRef = useRef(null);
  const { chatRef, chatEndRef } = useSocket();
  
  
  /* ── 스크롤 감지 ── */
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.pageYOffset > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ── 라우트 변경 → 닫기 ── */
  useEffect(() => {
    setMobileOpen(false);
    setNotifOpen(false);
    setActiveChatRoom(null);
  }, [location.pathname]);

  /* ── 외부 클릭 → 닫기 ── */
  useEffect(() => {
    if (!notifOpen) return;
    const handler = (e) => {
      const inBell = bellRef.current?.contains(e.target);
      const inPanel = panelRef.current?.contains(e.target);
      const inChat = chatRef.current?.contains(e.target);
      if (!inBell && !inPanel && !inChat) {
        setNotifOpen(false);
        setActiveChatRoom(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [notifOpen]);

  /* ── 채팅 스크롤 bottom ── */
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChatRoom]);

  /* ── 검색 ── */
  const handleSearch = useCallback(() => {
    const q = searchValue.trim();
    if (q) {
      navigate(`/search?q=${encodeURIComponent(q)}`);
      setSearchValue("");
    }
  }, [searchValue, navigate]);

  /* ── 메시지 전송 ── */

  /* ── 리마인더 체크 토글 ── */
  const toggleReminder = (id) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, done: !r.done } : r)),
    );
  };

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  const totalUnread = CHAT_ROOMS.reduce((s, r) => s + r.unread, 0);

  return (
    <header className={`hdr${isScrolled ? " hdr--scrolled" : ""}`}>
      {/* ════════ 상단 바 ════════ */}
      <div className="hdr__top">
        <div className="hdr__inner">
          {/* 로고 */}
          <Link to="/" className="hdr__logo" aria-label="홈으로">
            <span className="hdr__logo-icon">
              <FontAwesomeIcon icon={faHeart} />
            </span>
            <span className="hdr__logo-text">
              바로닥큐<span className="hdr__logo-plus">+</span>
            </span>
          </Link>

          {/* 검색바 */}
          <div
            className={`hdr__search${searchFocused ? " hdr__search--focused" : ""}`}
          >
            <FontAwesomeIcon
              icon={faMagnifyingGlass}
              className="hdr__search-icon"
            />
            <input
              type="text"
              className="hdr__search-input"
              placeholder="병원·약국·증상을 검색하세요"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
            {searchValue && (
              <button
                className="hdr__search-clear"
                onClick={() => setSearchValue("")}
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            )}
            <button className="hdr__search-btn" onClick={handleSearch}>
              검색
            </button>
          </div>

          {/* 우측 액션 */}
          <div className="hdr__actions">
            {/* 알림 벨 */}
            <div className="hdr__bell-wrap" ref={bellRef}>
              <button
                className={`hdr__icon-btn${notifOpen ? " hdr__icon-btn--active" : ""}`}
                onClick={() => {
                  setNotifOpen((v) => !v);
                  if (notifOpen) setActiveChatRoom(null);
                }}
                aria-label="알림"
              >
                <FontAwesomeIcon icon={faBell} />
                {totalUnread > 0 && (
                  <span className="hdr__notif-badge">{totalUnread}</span>
                )}
              </button>
            </div>
            <Link to="/login" className="hdr__btn hdr__btn--ghost">
              <FontAwesomeIcon icon={faRightToBracket} />
              <span>로그인</span>
            </Link>
            <Link to="/signup" className="hdr__btn hdr__btn--solid">
              <FontAwesomeIcon icon={faUserPlus} />
              <span>회원가입</span>
            </Link>

            <button
              className={`hdr__hamburger${mobileOpen ? " hdr__hamburger--open" : ""}`}
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="메뉴"
            >
              <FontAwesomeIcon icon={mobileOpen ? faXmark : faBars} />
            </button>
          </div>
        </div>
      </div>

      {/* ════════ 네비게이션 ════════ */}
      <nav className={`hdr__nav${mobileOpen ? " hdr__nav--open" : ""}`}>
        <div className="hdr__nav-inner">
          <ul className="hdr__nav-list">
            {NAV_ITEMS.map(({ path, label, icon }) => (
              <li key={path} className="hdr__nav-item">
                <Link
                  to={path}
                  className={`hdr__nav-link${isActive(path) ? " hdr__nav-link--active" : ""}`}
                >
                  <FontAwesomeIcon icon={icon} className="hdr__nav-icon" />
                  <span>{label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* ════════ 딤 오버레이 ════════ */}
      {notifOpen && (
        <div
          className="hdr__overlay"
          onClick={() => {
            setNotifOpen(false);
            setActiveChatRoom(null);
          }}
        />
      )}

      {/* ════════ 알림 3컬럼 패널 ════════ */}
      {notifOpen && (
        <div className="hdr__np" ref={panelRef}>
          <div className="hdr__np-col">
            <div className="hdr__np-head">
              <FontAwesomeIcon
                icon={faCalendarDays}
                className="hdr__np-head-icon"
                style={{ color: "#14b8a6" }}
              />
              <span>내 예약 현황</span>
              <span className="hdr__np-head-badge">{RESERVATIONS.length}</span>
            </div>
            <div className="hdr__np-body">
              {RESERVATIONS.map((r) => (
                <div key={r.id} className="hdr__rv-card">
                  <div className="hdr__rv-top">
                    <span className="hdr__rv-hospital">{r.hospital}</span>
                    <span
                      className={`hdr__rv-status hdr__rv-status--${r.status}`}
                    >
                      {r.status === "confirmed"
                        ? "확정"
                        : r.status === "pending"
                          ? "대기중"
                          : "접수중"}
                    </span>
                  </div>
                  <div className="hdr__rv-dept">
                    {r.dept} · {r.doctor} 선생님
                  </div>
                  <div className="hdr__rv-time">
                    <FontAwesomeIcon icon={faClock} />
                    <span>
                      {r.date} {r.time}
                    </span>
                  </div>
                  {r.waitNum !== null && (
                    <div className="hdr__rv-wait">
                      <FontAwesomeIcon
                        icon={faCircleDot}
                        style={{ color: "#14b8a6" }}
                      />
                      <span>
                        현재 대기 <strong>{r.waitNum}명</strong>
                      </span>
                    </div>
                  )}
                  <div className="hdr__rv-btns">
                    <button className="hdr__rv-btn hdr__rv-btn--outline">
                      변경
                    </button>
                    <button className="hdr__rv-btn hdr__rv-btn--outline hdr__rv-btn--red">
                      취소
                    </button>
                    <button className="hdr__rv-btn hdr__rv-btn--fill">
                      상세보기
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <Link to="/mypage/reservations" className="hdr__np-footer-link">
              전체 예약 보기 <FontAwesomeIcon icon={faChevronRight} />
            </Link>
          </div>

          {/* ── 구분선 ── */}
          <div className="hdr__np-divider" />

          {/* ── Col 2 : 병원 채팅 ── */}
          <div className="hdr__np-col">
            <div className="hdr__np-head">
              <FontAwesomeIcon
                icon={faComments}
                className="hdr__np-head-icon"
                style={{ color: "#0d9488" }}
              />
              <span>병원 채팅</span>
              {totalUnread > 0 && (
                <span className="hdr__np-head-badge hdr__np-head-badge--red">
                  {totalUnread}
                </span>
              )}
            </div>
            <div className="hdr__np-body">
              {CHAT_ROOMS.map((room) => (
                <div
                  key={room.id}
                  className={`hdr__cr-item${activeChatRoom?.id === room.id ? " hdr__cr-item--active" : ""}`}
                  onClick={() => setActiveChatRoom(room)}
                >
                  <div className="hdr__cr-avatar">{room.avatar}</div>
                  <div className="hdr__cr-info">
                    <div className="hdr__cr-top">
                      <span className="hdr__cr-name">{room.hospital}</span>
                      <span className="hdr__cr-time">{room.time}</span>
                    </div>
                    <div className="hdr__cr-bottom">
                      <span className="hdr__cr-last">{room.lastMsg}</span>
                      {room.unread > 0 && (
                        <span className="hdr__cr-unread">{room.unread}</span>
                      )}
                    </div>
                    <span className="hdr__cr-dept">{room.dept}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── 구분선 ── */}
          <div className="hdr__np-divider" />

          {/* ── Col 3 : 건강 리마인더 ── */}
          <div className="hdr__np-col">
            <div className="hdr__np-head">
              <FontAwesomeIcon
                icon={faPills}
                className="hdr__np-head-icon"
                style={{ color: "#0f766e" }}
              />
              <span>건강 리마인더</span>
              <span className="hdr__np-head-badge hdr__np-head-badge--green">
                {reminders.filter((r) => r.done).length}/{reminders.length}
              </span>
            </div>
            <div className="hdr__np-body">
              {/* 오늘 진행률 */}
              <div className="hdr__hl-progress-wrap">
                <div className="hdr__hl-progress-label">
                  <span>오늘의 건강 미션</span>
                  <strong>
                    {Math.round(
                      (reminders.filter((r) => r.done).length /
                        reminders.length) *
                        100,
                    )}
                    %
                  </strong>
                </div>
                <div className="hdr__hl-progress-bar">
                  <div
                    className="hdr__hl-progress-fill"
                    style={{
                      width: `${(reminders.filter((r) => r.done).length / reminders.length) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {reminders.map((r) => (
                <div
                  key={r.id}
                  className={`hdr__hl-item${r.done ? " hdr__hl-item--done" : ""}`}
                  onClick={() => toggleReminder(r.id)}
                >
                  <div
                    className="hdr__hl-icon"
                    style={{ background: r.color + "22", color: r.color }}
                  >
                    <FontAwesomeIcon icon={r.icon} />
                  </div>
                  <div className="hdr__hl-info">
                    <span className="hdr__hl-title">{r.title}</span>
                    <span className="hdr__hl-sub">{r.sub}</span>
                  </div>
                  <div
                    className={`hdr__hl-check${r.done ? " hdr__hl-check--done" : ""}`}
                  >
                    {r.done ? (
                      <FontAwesomeIcon icon={faCheckCircle} />
                    ) : (
                      <span className="hdr__hl-check-empty" />
                    )}
                  </div>
                </div>
              ))}

              {/* 긴급 알림 */}
              <div className="hdr__hl-alert">
                <FontAwesomeIcon
                  icon={faTriangleExclamation}
                  style={{ color: "#f97316" }}
                />
                <div>
                  <p className="hdr__hl-alert-title">A형간염 미접종</p>
                  <p className="hdr__hl-alert-sub">
                    예방접종을 아직 맞지 않으셨어요
                  </p>
                </div>
                <button className="hdr__hl-alert-btn">예약</button>
              </div>
            </div>
            <Link to="/mypage/health" className="hdr__np-footer-link">
              건강 관리 보기 <FontAwesomeIcon icon={faChevronRight} />
            </Link>
          </div>
        </div>
      )}

      {/* ════════ 카톡식 채팅창 ════════ */}
      {notifOpen && activeChatRoom && (
        <Chat />
      )}
    </header>
  );
};

export default Header;
