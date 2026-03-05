import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useSocket } from "../WebSocketContext";
import { useAuth } from "../AuthContext";
import { authFetch } from "../utils/AuthFetch";
import ReactDOM from "react-dom";
import DeptSearch from "../pages/DeptSearch";
import { getNotifMeta } from "../constants/notifTypes";
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
  faCircleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import "../assets/styles/Header.css";
import Logo from "./Logo";
import ReservationDetailModal from "./ReservationDetailModal";
import ReservationChangeModal from "./ReservationChangeModal";
import ReservationCancelModal from "./ReservationCancelModal";

const NAV_ITEMS = [
  { path: "/pharmacy", label: "약국 찾기", icon: faPills },
  { path: "/hospitals", label: "병원 찾기", icon: faHospital },
  { path: "/mypage", label: "마이페이지", icon: faUser },
  { path: "/reviews", label: "리뷰", icon: faNotesMedical },
  { path: "/qna", label: "Q&A", icon: faCircleQuestion },
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
  const [modalType, setModalType] = useState(null);
  const [modalReservation, setModalReservation] = useState(null);
  const [prevModalType, setPrevModalType] = useState(null);

  const openModal = (type, reservation) => {
    setPrevModalType(modalType);
    setModalType(type);
    setModalReservation(reservation);
  };

  const closeModal = () => {
    if (prevModalType) {
      setModalType(prevModalType);
      setPrevModalType(null);
    } else {
      setModalType(null);
      setModalReservation(null);
    }
  };

  const closeAllModals = () => {
    setModalType(null);
    setModalReservation(null);
    setPrevModalType(null);
  };

  const handleModalSuccess = async () => {
    const res = await authFetch("/api/v1/reservations/my");
    const data = await res.json();
    setReservations(Array.isArray(data) ? data : []);
    closeAllModals();
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
    sysNotifications,
    setSysNotifications,
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
      if (modalType) return;
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
  }, [notifOpen, modalType, setNotifOpen, setActiveChatRoom, chatRef]);

  /* 패널 열릴 때 예약 목록 fetch */
  useEffect(() => {
    if (!notifOpen || !user) return;
    const fetchReservations = async () => {
      try {
        const res = await authFetch("/api/v1/reservations/my");
        if (!res.ok) throw new Error("예약 데이터 응답 에러");
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

  /* 알림 클릭 — 읽음 처리 + 페이지 이동 */
  const handleNotificationClick = async (notif) => {
    if (!notif.ntIsRead) {
      try {
        const res = await authFetch(`/api/v1/notifications/${notif.ntNum}/read`, {
          method: "PATCH",
        });
        if (res.ok) {
          setSysNotifications((prev) =>
            prev.map((n) =>
              n.ntNum === notif.ntNum ? { ...n, ntIsRead: true } : n
            )
          );
        }
      } catch (err) {
        console.error("알림 읽음 처리 실패:", err);
      }
    }
    if (notif.ntUrl) {
      navigate(notif.ntUrl);
      setNotifOpen(false);
    }
  };

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  const initials = user?.name ? user.name.slice(0, 1) : "U";

  const statusCls = (status) => {
    switch (status) {
      case "예약대기":   return "waiting";
      case "예약확정":   return "confirmed";
      case "예약취소":   return "cancelled";
      case "예약거절":   return "rejected";
      case "진료완료":   return "done";
      default:           return "waiting";
    }
  };

  /* ✅ 읽지 않은 시스템 알림 수 */
  const unreadSysNotifCount = sysNotifications.filter((n) => !n.ntIsRead).length;

  /* ✅ ntCreatedAt 날짜 포맷 헬퍼 */
  const formatNotifDate = (raw) => {
    if (!raw) return "방금";
    const d = new Date(raw);
    if (isNaN(d.getTime())) return "방금";
    return d.toLocaleString("ko-KR", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <header className={`hdr${isScrolled ? " hdr--scrolled" : ""}`}>

      {/* ════ 상단 바 ════ */}
      <div className="hdr__top">
        <div className="hdr__inner">
          <Logo size="md" to="/" />

          <div className={`hdr__search${searchFocused ? " hdr__search--focused" : ""}`}>
            <FontAwesomeIcon icon={faMagnifyingGlass} className="hdr__search-icon" />
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
              <button className="hdr__search-clear" onClick={() => setSearchValue("")}>
                <FontAwesomeIcon icon={faXmark} />
              </button>
            )}
            <button className="hdr__search-btn" onClick={handleSearch}>검색</button>
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
                    {totalUnread + unreadSysNotifCount > 0 && (
                      <span className="hdr__notif-badge">
                        {totalUnread + unreadSysNotifCount}
                      </span>
                    )}
                  </button>
                </div>

                <div className="hdr__divider" />

                <Link to="/mypage" className="hdr__profile-chip">
                  <span className="hdr__profile-avatar">{initials}</span>
                  <span className="hdr__profile-name">{user.name}님</span>
                  <FontAwesomeIcon icon={faChevronDown} className="hdr__profile-chevron" />
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
          onClick={() => { setNotifOpen(false); setActiveChatRoom(null); }}
        />
      )}

      {/* ════ 알림 3컬럼 패널 ════ */}
      {notifOpen && (
        <div className="hdr__np" ref={panelRef}>

          {/* ── Col 1 : 예약 현황 ── */}
          <div className="hdr__np-col">
            <div className="hdr__np-head">
              <FontAwesomeIcon icon={faCalendarDays} className="hdr__np-head-icon" style={{ color: "#14b8a6" }} />
              <span>내 예약 현황</span>
              <span className="hdr__np-head-badge">{reservations.length}</span>
            </div>

            <div className="hdr__np-body">
              {reservations.length === 0 ? (
                <div className="hdr__rv-empty">
                  <div className="hdr__rv-empty-icon"><FontAwesomeIcon icon={faCalendarDays} /></div>
                  <p className="hdr__rv-empty-title">예약 내역이 없어요</p>
                  <p className="hdr__rv-empty-sub">병원 찾기에서 예약해보세요</p>
                </div>
              ) : (
                reservations.map((r) => (
                  <div key={r.reNum} className="hdr__rv-card">
                    <div className={`hdr__rv-stripe hdr__rv-stripe--${statusCls(r.reStatus)}`} />
                    <div className="hdr__rv-content">
                      <div className="hdr__rv-top">
                        <div className="hdr__rv-hospital-wrap">
                          <div className="hdr__rv-hosp-icon"><FontAwesomeIcon icon={faHospital} /></div>
                          <div className="hdr__rv-hospital-info">
                            <span className="hdr__rv-hospital">{r.hoName ?? `병원 #${r.hoNum}`}</span>
                            <span className="hdr__rv-renum">예약번호 {r.reNum}</span>
                          </div>
                        </div>
                        <span className={`hdr__rv-status hdr__rv-status--${statusCls(r.reStatus)}`}>
                          <span className="hdr__rv-status-dot" />
                          {r.reStatus}
                        </span>
                      </div>

                      <div className="hdr__rv-tags">
                        <div className="hdr__rv-dept">
                          <FontAwesomeIcon icon={faStethoscope} />
                          <span>{r.deptName ?? `진료과 #${r.deptNum}`}</span>
                        </div>
                        <div className="hdr__rv-visit-type">{r.reVisitType}</div>
                      </div>

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
                            <span>대기 <strong>{r.waitNum}명</strong></span>
                          </div>
                        )}
                      </div>

                      {r.reMemo && (
                        <div className="hdr__rv-memo">
                          <FontAwesomeIcon icon={faNotesMedical} />
                          <span>{r.reMemo}</span>
                        </div>
                      )}

                      <div className="hdr__rv-sep" />

                      <div className="hdr__rv-btns">
                        {r.reStatus !== "예약취소" && (
                          <>
                            <button
                              className="hdr__rv-btn hdr__rv-btn--outline"
                              onClick={(e) => { e.stopPropagation(); openModal("change", r); }}
                            >변경</button>
                            <button
                              className="hdr__rv-btn hdr__rv-btn--outline hdr__rv-btn--red"
                              onClick={(e) => { e.stopPropagation(); openModal("cancel", r); }}
                            >취소</button>
                          </>
                        )}
                        <button
                          className="hdr__rv-btn hdr__rv-btn--fill"
                          onClick={(e) => { e.stopPropagation(); openModal("detail", r); }}
                        >
                          <FontAwesomeIcon icon={faChevronRight} />상세보기
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
              <FontAwesomeIcon icon={faComments} className="hdr__np-head-icon" style={{ color: "#0d9488" }} />
              <span>병원 채팅</span>
              {totalUnread > 0 && (
                <span className="hdr__np-head-badge hdr__np-head-badge--red">{totalUnread}</span>
              )}
            </div>

            <div className="hdr__np-body">
              {chatRooms.length === 0 ? (
                <div className="hdr__cr-empty">
                  <p>아직 채팅방이 없어요</p>
                  <p>병원 찾기에서 1:1 대화를 시작해보세요</p>
                </div>
              ) : (
                chatRooms.map((room) => {
                  const displayName = isAdmin
                    ? room.patientName?.trim()
                      ? room.patientName
                      : room.patientId ? `환자 ${room.patientId}` : "알수없음"
                    : room.hospitalName;
                  const avatarChar = displayName.charAt(0).toUpperCase();

                  return (
                    <div
                      key={room.id}
                      className={`hdr__cr-item${activeChatRoom?.id === room.id ? " hdr__cr-item--active" : ""}`}
                      onClick={() => setActiveChatRoom(room)}
                    >
                      <div className="hdr__cr-avatar">{isAdmin ? avatarChar : room.avatar}</div>
                      <div className="hdr__cr-info">
                        <div className="hdr__cr-top">
                          <span className="hdr__cr-name">{displayName}</span>
                          <span className="hdr__cr-time">{room.lastTime}</span>
                        </div>
                        <div className="hdr__cr-bottom">
                          <span className="hdr__cr-last">{room.lastMsg || "대화를 시작해보세요"}</span>
                          {room.unread > 0 && <span className="hdr__cr-unread">{room.unread}</span>}
                        </div>
                        <span className="hdr__cr-dept">{room.dept}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="hdr__np-divider" />

          {/* ── Col 3 : 시스템 알림 ── */}
          <div className="hdr__np-col">
            <div className="hdr__np-head">
              <FontAwesomeIcon icon={faBell} className="hdr__np-head-icon" style={{ color: "#10b981" }} />
              <span>시스템 알림</span>
              {unreadSysNotifCount > 0 && (
                <span className="hdr__np-head-badge" style={{ background: "#10b981", color: "#fff" }}>
                  {unreadSysNotifCount}
                </span>
              )}
            </div>

            <div className="hdr__np-body">
              {sysNotifications.length === 0 ? (
                <div className="hdr__rv-empty">
                  <div className="hdr__rv-empty-icon"><FontAwesomeIcon icon={faBell} /></div>
                  <p className="hdr__rv-empty-title">새로운 알림이 없어요</p>
                </div>
              ) : (
                sysNotifications.map((notif) => {
                  // ✅ ntdNum으로 아이콘·색상·라벨 결정
                  const meta = getNotifMeta(notif.ntdNum);

                  return (
                    <div
                      key={notif.ntNum}
                      onClick={() => handleNotificationClick(notif)}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "0.75rem",
                        padding: "0.85rem 1rem",
                        borderBottom: "1px solid #f3f4f6",
                        cursor: "pointer",
                        opacity: notif.ntIsRead ? 0.55 : 1,
                        background: notif.ntIsRead ? "transparent" : "#fafffe",
                        transition: "background 0.15s",
                      }}
                    >
                      {/* ✅ ntdNum별 아이콘 */}
                      <div
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "50%",
                          background: meta.bg,
                          color: meta.color,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          fontSize: "0.9rem",
                        }}
                      >
                        <FontAwesomeIcon icon={meta.icon} />
                      </div>

                      {/* 텍스트 영역 */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        {/* ✅ 유형 라벨 뱃지 */}
                        <span
                          style={{
                            display: "inline-block",
                            fontSize: "0.68rem",
                            fontWeight: 700,
                            color: meta.color,
                            background: meta.bg,
                            borderRadius: "4px",
                            padding: "1px 7px",
                            marginBottom: "5px",
                            letterSpacing: "0.02em",
                          }}
                        >
                          {meta.label}
                        </span>

                        {/* 알림 내용 */}
                        <p
                          style={{
                            margin: 0,
                            fontSize: "0.865rem",
                            lineHeight: "1.45",
                            color: "#111827",
                            wordBreak: "break-word",
                          }}
                        >
                          {notif.ntFinalContent}
                        </p>

                        {/* 날짜 */}
                        <span
                          style={{
                            display: "block",
                            fontSize: "0.74rem",
                            color: "#9ca3af",
                            marginTop: "5px",
                          }}
                        >
                          {formatNotifDate(notif.ntCreatedAt)}
                        </span>
                      </div>

                      {/* ✅ 읽지 않은 알림 표시 점 */}
                      {!notif.ntIsRead && (
                        <span
                          style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            background: meta.color,
                            flexShrink: 0,
                            marginTop: "6px",
                          }}
                        />
                      )}
                    </div>
                  );
                })
              )}
            </div>

            <Link to="/mypage/notifications" className="hdr__np-footer-link">
              전체 알림 보기 <FontAwesomeIcon icon={faChevronRight} />
            </Link>
          </div>
        </div>
      )}

      {/* ════ 채팅창 ════ */}
      {notifOpen && activeChatRoom && (
        <div className="hdr__cw" ref={chatRef}>
          <div className="hdr__cw-head">
            <button className="hdr__cw-back" onClick={() => setActiveChatRoom(null)}>
              <FontAwesomeIcon icon={faArrowLeft} />
            </button>
            <div className="hdr__cw-avatar">
              {isAdmin
                ? (activeChatRoom.patientName || activeChatRoom.patientId || "?")
                    .toString().substring(0, 1).toUpperCase()
                : activeChatRoom.avatar}
            </div>
            <div className="hdr__cw-hinfo">
              <span className="hdr__cw-hname">
                {isAdmin
                  ? activeChatRoom.patientName || `환자 ${activeChatRoom.patientId}`
                  : activeChatRoom.hospitalName}
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
                      {isAdmin
                        ? activeChatRoom.patientName?.substring(0, 1)
                        : activeChatRoom.avatar}
                    </div>
                  )}
                  <div className="hdr__cw-msg-wrap">
                    <div
                      className="hdr__cw-bubble"
                      style={
                        !isMine
                          ? { backgroundColor: "#ffffff", border: "1px solid #d1d5db", color: "#111827" }
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

      {/* ════ 예약 모달들 ════ */}
      {modalType === "detail" &&
        ReactDOM.createPortal(
          <ReservationDetailModal
            reservation={modalReservation}
            onClose={closeModal}
            onChangePage={(rv) => openModal("change", rv)}
            onCancelPage={(rv) => openModal("cancel", rv)}
          />,
          document.body
        )}
      {modalType === "change" &&
        ReactDOM.createPortal(
          <ReservationChangeModal
            reservation={modalReservation}
            onClose={closeModal}
            onSuccess={handleModalSuccess}
          />,
          document.body
        )}
      {modalType === "cancel" &&
        ReactDOM.createPortal(
          <ReservationCancelModal
            reservation={modalReservation}
            onClose={closeModal}
            onSuccess={handleModalSuccess}
          />,
          document.body
        )}
    </header>
  );
};

export default Header;
