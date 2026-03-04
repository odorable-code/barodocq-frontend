import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useSocket } from "../WebSocketContext";
import { useAuth } from "../AuthContext";
import { authFetch } from "../utils/AuthFetch";
import ReactDOM from "react-dom";
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
import ReservationDetailModal from "./ReservationDetailModal";
import ReservationChangeModal from "./ReservationChangeModal";
import ReservationCancelModal from "./ReservationCancelModal";

const NAV_ITEMS = [
  { path: "/pharmacy", label: "약국 찾기", icon: faPills },
  { path: "/hospitals", label: "병원 찾기", icon: faHospital },
  { path: "/mypage", label: "마이페이지", icon: faUser },
  { path: "/reviews", label: "리뷰", icon: faNotesMedical },
  { path: "/community", label: "커뮤니티", icon: faComments },
  { path: "/qna", label: "Q&A", icon: faCircleQuestion },
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
  const [reservations, setReservations] = useState([]);

  const [isScrolled, setIsScrolled] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [reminders, setReminders] = useState(HEALTH_REMINDERS);
  const [modalType, setModalType] = useState(null);
  const [modalReservation, setModalReservation] = useState(null);
  const [prevModalType, setPrevModalType] = useState(null);

  // openModal — 이전 모달 저장
  const openModal = (type, reservation) => {
    setPrevModalType(modalType);
    setModalType(type);
    setModalReservation(reservation);
  };

  // closeModal — 이전 모달로 복귀 or 전체 닫기
  const closeModal = () => {
    if (prevModalType) {
      // ✅ 이전 모달이 있으면 거기로 돌아감 (change/cancel → detail)
      setModalType(prevModalType);
      setPrevModalType(null);
    } else {
      // ✅ 이전 모달 없으면 전부 닫기 (detail → 완전 종료)
      setModalType(null);
      setModalReservation(null);
    }
  };

  // closeAllModals — 성공 시 전체 닫기
  const closeAllModals = () => {
    setModalType(null);
    setModalReservation(null);
    setPrevModalType(null); // ✅ 히스토리도 초기화
  };

  // handleModalSuccess — closeAllModals 사용
  const handleModalSuccess = async () => {
    const res = await authFetch("/api/v1/reservations/my");
    const data = await res.json();
    setReservations(Array.isArray(data) ? data : []);
    closeAllModals(); // ✅ 성공 시엔 전부 닫기
  };

  const bellRef = useRef(null);
  const panelRef = useRef(null);

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

  /* 스크롤 감지 */
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.pageYOffset > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* 라우트 변경 시 패널 닫기 */
  useEffect(() => {
    setMobileOpen(false);
    setNotifOpen(false);
    setActiveChatRoom(null);
  }, [location.pathname, setNotifOpen, setActiveChatRoom]);

  /* 패널 외부 클릭 시 닫기 */
  useEffect(() => {
    if (!notifOpen) return;
    const handler = (e) => {
      if (modalType) return; // ✅ 모달 열려있으면 외부클릭 완전 무시

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
  }, [notifOpen, modalType, setNotifOpen, setActiveChatRoom, chatRef]); // ✅ modalType 의존성 추가

  /* 패널 열릴 때 예약 목록 fetch */
  useEffect(() => {
    if (!notifOpen || !user) return;
    const fetchReservations = async () => {
      try {
        const res = await authFetch("/api/v1/reservations/my");
        const data = await res.json();
        setReservations(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("예약 목록 불러오기 실패:", err);
      }
    };
    fetchReservations();
  }, [notifOpen, user]);

  /* 채팅 스크롤 */
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeChatRoom, chatEndRef]);

  /* 검색 */
  const handleSearch = useCallback(() => {
    const q = searchValue.trim();
    if (q) {
      navigate(`/search?q=${encodeURIComponent(q)}`);
      setSearchValue("");
    }
  }, [searchValue, navigate]);

  /* 메시지 전송 */
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

  /* ────────────────────────────────────────────
   상태 → CSS 클래스 매핑 (핵심 수정 부분)
──────────────────────────────────────────── */
  const statusCls = (status) => {
    switch (status) {
      case "예약대기":
        return "waiting";
      case "예약확정":
        return "confirmed";
      case "예약취소":
        return "cancelled"; // ✅ 수정
      case "예약거절":
        return "rejected"; // ✅ 추가
      case "진료완료":
        return "done"; // ✅ 추가
      default:
        return "waiting";
    }
  };

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
          {/* ── Col 1 : 예약 현황 ── */}
          <div className="hdr__np-col">
            <div className="hdr__np-head">
              <FontAwesomeIcon
                icon={faCalendarDays}
                className="hdr__np-head-icon"
                style={{ color: "#14b8a6" }}
              />
              <span>내 예약 현황</span>
              <span className="hdr__np-head-badge">{reservations.length}</span>
            </div>

            <div className="hdr__np-body">
              {reservations.length === 0 ? (
                <div className="hdr__rv-empty">
                  <div className="hdr__rv-empty-icon">
                    <FontAwesomeIcon icon={faCalendarDays} />
                  </div>
                  <p className="hdr__rv-empty-title">예약 내역이 없어요</p>
                  <p className="hdr__rv-empty-sub">
                    병원 찾기에서 예약해보세요
                  </p>
                </div>
              ) : (
                reservations.map((r) => (
                  <div key={r.reNum} className="hdr__rv-card">
                    {/* ✅ 수정1: stripe – 예약취소(cancelled) 포함 */}
                    <div
                      className={`hdr__rv-stripe hdr__rv-stripe--${statusCls(r.reStatus)}`}
                    />

                    <div className="hdr__rv-content">
                      {/* 병원명 행 */}
                      <div className="hdr__rv-top">
                        <div className="hdr__rv-hospital-wrap">
                          <div className="hdr__rv-hosp-icon">
                            <FontAwesomeIcon icon={faHospital} />
                          </div>
                          <div className="hdr__rv-hospital-info">
                            <span className="hdr__rv-hospital">
                              {r.hoName ?? `병원 #${r.hoNum}`}
                            </span>
                            <span className="hdr__rv-renum">
                              예약번호 {r.reNum}
                            </span>
                          </div>
                        </div>

                        {/* ✅ 수정2: 상태 배지 – 예약취소(cancelled) 포함 */}
                        <span
                          className={`hdr__rv-status hdr__rv-status--${statusCls(r.reStatus)}`}
                        >
                          <span className="hdr__rv-status-dot" />
                          {r.reStatus}
                        </span>
                      </div>

                      {/* 진료과 + 방문유형 */}
                      <div className="hdr__rv-tags">
                        <div className="hdr__rv-dept">
                          <FontAwesomeIcon icon={faStethoscope} />
                          <span>{r.deptName ?? `진료과 #${r.deptNum}`}</span>
                        </div>
                        <div className="hdr__rv-visit-type">
                          {r.reVisitType}
                        </div>
                      </div>

                      {/* 날짜·시간 칩 */}
                      <div className="hdr__rv-meta-row">
                        <div className="hdr__rv-chip hdr__rv-chip--time">
                          <FontAwesomeIcon icon={faCalendarDays} />
                          <span>{r.reDate}</span>
                        </div>
                        <div className="hdr__rv-chip hdr__rv-chip--time">
                          <FontAwesomeIcon icon={faClock} />
                          <span>{r.reTime?.slice(0, 5)}</span>
                        </div>
                        {r.waitNum !== null && (
                          <div className="hdr__rv-chip hdr__rv-chip--wait">
                            <FontAwesomeIcon icon={faCircleDot} />
                            <span>
                              대기 <strong>{r.waitNum}명</strong>
                            </span>
                          </div>
                        )}
                      </div>

                      {/* 메모 */}
                      {r.reMemo && (
                        <div className="hdr__rv-memo">
                          <FontAwesomeIcon icon={faNotesMedical} />
                          <span>{r.reMemo}</span>
                        </div>
                      )}

                      <div className="hdr__rv-sep" />

                      {/* ✅ 수정3: 예약취소 상태에서는 변경/취소 버튼 숨김 */}
                      <div className="hdr__rv-btns">
                        {r.reStatus !== "예약취소" && (
                          <>
                            <button
                              className="hdr__rv-btn hdr__rv-btn--outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                openModal("change", r);
                              }}
                            >
                              변경
                            </button>
                            <button
                              className="hdr__rv-btn hdr__rv-btn--outline hdr__rv-btn--red"
                              onClick={(e) => {
                                e.stopPropagation();
                                openModal("cancel", r);
                              }}
                            >
                              취소
                            </button>
                          </>
                        )}
                        <button
                          className="hdr__rv-btn hdr__rv-btn--fill"
                          onClick={(e) => {
                            e.stopPropagation();
                            openModal("detail", r);
                          }}
                        >
                          <FontAwesomeIcon icon={faChevronRight} />
                          상세보기
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <Link to="/mypage/reservations" className="hdr__np-footer-link">
              전체 예약 보기 <FontAwesomeIcon icon={faChevronRight} />
            </Link>
          </div>

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

      {/* ════ 채팅창 ════ */}
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
              const isFromHospital = msg.from?.startsWith("hospital");
              const isMine = isAdmin ? isFromHospital : !isFromHospital;
              return (
                <div
                  key={msg.id || i}
                  className={`hdr__cw-msg hdr__cw-msg--${isMine ? "user" : "hospital"}`}
                >
                  {!isMine && (
                    <div className="hdr__cw-msg-avatar">
                      {activeChatRoom.avatar}
                    </div>
                  )}
                  <div className="hdr__cw-msg-wrap">
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
                            hour12: false,
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

      {/* ════ 예약 모달들 (Portal로 body에 렌더링) ════ */}
      {modalType === "detail" &&
        ReactDOM.createPortal(
          <ReservationDetailModal
            reservation={modalReservation}
            onClose={closeModal}
            onChangePage={(rv) => openModal("change", rv)}
            onCancelPage={(rv) => openModal("cancel", rv)}
          />,
          document.body,
        )}
      {modalType === "change" &&
        ReactDOM.createPortal(
          <ReservationChangeModal
            reservation={modalReservation}
            onClose={closeModal}
            onSuccess={handleModalSuccess}
          />,
          document.body,
        )}
      {modalType === "cancel" &&
        ReactDOM.createPortal(
          <ReservationCancelModal
            reservation={modalReservation}
            onClose={closeModal}
            onSuccess={handleModalSuccess}
          />,
          document.body,
        )}
    </header>
  );
};

export default Header;
