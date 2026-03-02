import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useSocket } from "../WebSocketContext";
import { useAuth } from "../AuthContext";
import {
  faHeart,
  faMagnifyingGlass,
  faXmark,
  faBell,
  faRightToBracket,
  faUserPlus,
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
  faRightFromBracket,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import "../assets/styles/Header.css";

const NAV_ITEMS = [
  { path: "/pharmacy", label: "약국 찾기", icon: faPills },
  { path: "/hospitals", label: "병원 찾기", icon: faHospital },
  { path: "/mypage", label: "마이페이지", icon: faUser },
  { path: "/reviews", label: "리뷰", icon: faNotesMedical },
  { path: "/community", label: "커뮤니티", icon: faComments },
  { path: "/qna", label: "Q&A", icon: faCircleQuestion },
];

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

const HEALTH_REMINDERS = [
  {
    id: 1,
    icon: faPills,
    title: "혈압약 복용",
    sub: "오전 8:00",
    done: true,
    color: "#14b8a6",
  },
  {
    id: 2,
    icon: faPills,
    title: "비타민D 복용",
    sub: "오후 1:00",
    done: false,
    color: "#0d9488",
  },
  {
    id: 3,
    icon: faSyringe,
    title: "독감 예방접종",
    sub: "D-14 남음",
    done: false,
    color: "#f97316",
  },
  {
    id: 4,
    icon: faStethoscope,
    title: "정기 건강검진",
    sub: "D-30 남음",
    done: false,
    color: "#6366f1",
  },
  {
    id: 5,
    icon: faMoon,
    title: "수면 루틴 알림",
    sub: "오후 11:00",
    done: false,
    color: "#0f766e",
  },
];

const Header = ({ onOpenReservation }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  /* ── 로컬 상태 ── */
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [reminders, setReminders] = useState(HEALTH_REMINDERS);

  /* ── Refs ── */
  const bellRef = useRef(null);
  const panelRef = useRef(null);

  /* ── useSocket (딱 한 번) ── */
  const {
    chatRooms,
    activeChatRoom,
    setActiveChatRoom,
    messages,
    sendMessage: socketSendMessage,
    totalUnread,
    chatRef,
    chatEndRef,
    notifOpen,
    setNotifOpen,
    isAdmin,
  } = useSocket();

  /* ── 스크롤 감지 ── */
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.pageYOffset > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ── 라우트 변경 시 패널 닫기 ── */
  useEffect(() => {
    setMobileOpen(false);
    setNotifOpen(false);
    setActiveChatRoom(null);
  }, [location.pathname]);

  /* ── 패널 외부 클릭 시 닫기 ── */
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

  /* ── 채팅 스크롤 ── */
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeChatRoom]);

  /* ── 검색 ── */
  const handleSearch = useCallback(() => {
    const q = searchValue.trim();
    if (q) {
      navigate(`/search?q=${encodeURIComponent(q)}`);
      setSearchValue("");
    }
  }, [searchValue, navigate]);

  /* ── 메시지 전송 ── */
  const sendMessage = () => {
    if (!chatInput.trim()) return;
    socketSendMessage(chatInput);
    setChatInput("");
  };

  const toggleReminder = (id) =>
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, done: !r.done } : r)),
    );

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  const initials = user?.name ? user.name.slice(0, 1) : "U";

  return (
    <header className={`hdr${isScrolled ? " hdr--scrolled" : ""}`}>
      {/* ════ 상단 바 ════ */}
      <div className="hdr__top">
        <div className="hdr__inner">
          <Link to="/" className="hdr__logo" aria-label="홈으로">
            <span className="hdr__logo-icon">
              <FontAwesomeIcon icon={faHeart} />
            </span>
            <span className="hdr__logo-text">
              바로닥큐<span className="hdr__logo-plus">+</span>
            </span>
          </Link>

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

          <div className="hdr__actions">
            {user && (
              <>
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

                <div className="hdr__divider" />

                <Link to="/mypage" className="hdr__profile-chip">
                  <span className="hdr__profile-avatar">{initials}</span>
                  <span className="hdr__profile-name">{user.name}님</span>
                  <FontAwesomeIcon
                    icon={faChevronDown}
                    className="hdr__profile-chevron"
                  />
                </Link>

                <button className="hdr__logout-btn" onClick={logout}>
                  <FontAwesomeIcon icon={faRightFromBracket} />
                  <span>로그아웃</span>
                </button>
              </>
            )}

            {!user && (
              <>
                <Link to="/login" className="hdr__btn hdr__btn--ghost">
                  <FontAwesomeIcon icon={faRightToBracket} />
                  <span>로그인</span>
                </Link>
                <Link to="/signup" className="hdr__btn hdr__btn--solid">
                  <FontAwesomeIcon icon={faUserPlus} />
                  <span>회원가입</span>
                </Link>
              </>
            )}

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

      {/* ════ 네비게이션 ════ */}
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

      {/* ════ 딤 오버레이 ════ */}
      {notifOpen && (
        <div
          className="hdr__overlay"
          onClick={() => {
            setNotifOpen(false);
            setActiveChatRoom(null);
          }}
        />
      )}

      {/* ════ 알림 3컬럼 패널 ════ */}
      {notifOpen && (
        <div className="hdr__np" ref={panelRef}>
          {/* Col 1 : 예약 현황 */}
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

          <div className="hdr__np-divider" />

          {/* Col 2 : 병원 채팅 */}
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
              {chatRooms.length === 0 ? (
                <div className="hdr__cr-empty">
                  <p>아직 채팅방이 없어요</p>
                  <p>병원 찾기에서 1:1 대화를 시작해보세요</p>
                </div>
              ) : (
                chatRooms.map((room) => (
                  <div
                    key={room.id}
                    className={`hdr__cr-item${activeChatRoom?.id === room.id ? " hdr__cr-item--active" : ""}`}
                    onClick={() => setActiveChatRoom(room)}
                  >
                    <div className="hdr__cr-avatar">{room.avatar}</div>
                    <div className="hdr__cr-info">
                      <div className="hdr__cr-top">
                        <span className="hdr__cr-name">
                          {room.hospitalName}
                        </span>
                        <span className="hdr__cr-time">{room.lastTime}</span>
                      </div>
                      <div className="hdr__cr-bottom">
                        <span className="hdr__cr-last">
                          {room.lastMsg || "대화를 시작해보세요"}
                        </span>
                        {room.unread > 0 && (
                          <span className="hdr__cr-unread">{room.unread}</span>
                        )}
                      </div>
                      <span className="hdr__cr-dept">{room.dept}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="hdr__np-divider" />

          {/* Col 3 : 건강 리마인더 */}
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

      {/* ════ 카톡식 채팅창 ════ */}
      {notifOpen && activeChatRoom && (
        <div className="hdr__cw" ref={chatRef}>
          <div className="hdr__cw-head">
            <button
              className="hdr__cw-back"
              onClick={() => setActiveChatRoom(null)}
            >
              <FontAwesomeIcon icon={faArrowLeft} />
            </button>
            <div className="hdr__cw-avatar">{activeChatRoom.avatar}</div>
            <div className="hdr__cw-hinfo">
              <span className="hdr__cw-hname">
                {activeChatRoom.hospitalName}
              </span>
              <span className="hdr__cw-hdept">{activeChatRoom.dept}</span>
            </div>
            <button className="hdr__cw-more">
              <FontAwesomeIcon icon={faEllipsisVertical} />
            </button>
          </div>

          <div className="hdr__cw-body">
            {(messages[activeChatRoom.id] || []).map((msg, i) => {
              // ✅ 수정 1: role 기반으로 "내 메시지" 판별
              //    관리자  → hospital_로 시작하면 내 것 (오른쪽)
              //    환자    → user 이면 내 것 (오른쪽)
              const isFromHospital = msg.from?.startsWith("hospital");
              const isMine = isAdmin ? isFromHospital : !isFromHospital;

              return (
                <div
                  key={msg.id || i}
                  // ✅ 수정 2: isMine 기준으로 CSS 클래스 고정
                  //    내 것  → hdr__cw-msg--user  (오른쪽)
                  //    상대방 → hdr__cw-msg--hospital (왼쪽)
                  className={`hdr__cw-msg hdr__cw-msg--${isMine ? "user" : "hospital"}`}
                >
                  {/* ✅ 수정 3: 상대방 아바타는 !isMine 일 때만 표시 */}
                  {!isMine && (
                    <div className="hdr__cw-msg-avatar">
                      {activeChatRoom.avatar}
                    </div>
                  )}
                  <div className="hdr__cw-msg-wrap">
                    {/* ✅ 수정 4: 왼쪽 말풍선 인라인 스타일로 확실히 구분 */}
                    <div
                      className="hdr__cw-bubble"
                      style={
                        !isMine
                          ? {
                              backgroundColor: "#ffffff",
                              border: "1px solid #d1d5db",
                              color: "#111827",
                            }
                          : {}
                      }
                    >
                      {msg.text}
                    </div>
                    <span className="hdr__cw-time">
                      {msg.timestamp
                        ? new Date(msg.timestamp).toLocaleTimeString("ko-KR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : msg.time || ""}
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>

          <div className="hdr__cw-input-wrap">
            <input
              type="text"
              className="hdr__cw-input"
              placeholder="메시지를 입력하세요..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            />
            <button
              className={`hdr__cw-send${chatInput.trim() ? " hdr__cw-send--active" : ""}`}
              onClick={sendMessage}
            >
              <FontAwesomeIcon icon={faPaperPlane} />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
