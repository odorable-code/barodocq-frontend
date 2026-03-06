import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useSocket } from "../WebSocketContext";
import { useAuth } from "../AuthContext";
import { authFetch } from "../utils/AuthFetch";
import ReactDOM from "react-dom";
import DeptSearch from "../pages/DeptSearch";
import NotificationsModal from "./NotificationsModal";
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

  // openModal — 이전 모달 저장
  const openModal = (type, reservation) => {
    setPrevModalType(modalType);
    setModalType(type);
    setModalReservation(reservation);
  };

  // closeModal — 이전 모달로 복귀 or 전체 닫기
  const closeModal = () => {
    if (prevModalType) {
      setModalType(prevModalType);
      setPrevModalType(null);
    } else {
      setModalType(null);
      setModalReservation(null);
    }
  };

  // closeAllModals — 성공 시 전체 닫기
  const closeAllModals = () => {
    setModalType(null);
    setModalReservation(null);
    setPrevModalType(null);
  };

  // handleModalSuccess — closeAllModals 사용
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
    sysNotifications, // ✅ useSocket() 에서 꺼내오도록 추가!
    setSysNotifications, // ✅ useSocket() 에서 꺼내오도록 추가!
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
      if (modalType) return; // 모달 열려있으면 외부클릭 무시

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

  /* 패널 열릴 때 예약 목록 데이터 fetch */
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

  /* 초기 로드 시 시스템 알림 데이터 fetch (실제 API 연동) */
  useEffect(() => {
    // ✅ user 객체가 없거나 userNum이 없을 때는(undefined) 요청을 안 보냄!
    if (!user || !user.userNum) return;

    const fetchNotifications = async () => {
      try {
        const res = await authFetch(`/api/v1/notifications/${user.userNum}`); // 본인 user 객체의 PK 변수명에 맞게 수정
        if (!res.ok) throw new Error(`알림 데이터 응답 에러: ${res.status}`);

        const data = await res.json();
        setSysNotifications(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("알림 목록 불러오기 실패:", err);
        // 에러 시 화면이 터지지 않도록 빈 배열 처리
        setSysNotifications([]);
      }
    };

    fetchNotifications();
  }, [user]);

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

  /* ✅ 알림 클릭 처리 함수 (실제 읽음 처리 API 연동) */
  const handleNotificationClick = async (notif) => {
    // nt_is_read -> ntIsRead 로 변경
    if (!notif.ntIsRead) {
      try {
        // nt_num -> ntNum 으로 변경
        const res = await authFetch(
          `/api/v1/notifications/${notif.ntNum}/read`,
          {
            method: "PATCH",
          },
        );

        if (res.ok) {
          setSysNotifications((prev) =>
            prev.map((n) =>
              // 여기도 ntNum, ntIsRead 로 변경
              n.ntNum === notif.ntNum ? { ...n, ntIsRead: true } : n,
            ),
          );
        }
      } catch (err) {
        console.error("알림 읽음 처리 실패:", err);
      }
    }

    // nt_url -> ntUrl 로 변경
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
      case "예약대기":
        return "waiting";
      case "예약확정":
        return "confirmed";
      case "예약취소":
        return "cancelled";
      case "예약거절":
        return "rejected";
      case "진료완료":
        return "done";
      default:
        return "waiting";
    }
  };

  // ✅ 읽지 않은 시스템 알림 개수 계산 (nt_is_read -> ntIsRead)
  const unreadSysNotifCount = sysNotifications.filter(
    (n) => !n.ntIsRead,
  ).length;

  return (
    <header className={`hdr${isScrolled ? " hdr--scrolled" : ""}`}>
      {/* ════ 상단 바 ════ */}
      <div className="hdr__top">
        <div className="hdr__inner">
          <Logo size="md" to="/" />
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
                    {/* ✅ 총 안 읽은 메시지 + 시스템 알림 합산 뱃지 */}
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
                    <div
                      className={`hdr__rv-stripe hdr__rv-stripe--${statusCls(r.reStatus)}`}
                    />

                    <div className="hdr__rv-content">
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

                        <span
                          className={`hdr__rv-status hdr__rv-status--${statusCls(r.reStatus)}`}
                        >
                          <span className="hdr__rv-status-dot" />
                          {r.reStatus}
                        </span>
                      </div>

                      <div className="hdr__rv-tags">
                        <div className="hdr__rv-dept">
                          <FontAwesomeIcon icon={faStethoscope} />
                          <span>{r.deptName ?? `진료과 #${r.deptNum}`}</span>
                        </div>
                        <div className="hdr__rv-visit-type">
                          {r.reVisitType}
                        </div>
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
                            <span>
                              대기 <strong>{r.waitNum}명</strong>
                            </span>
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
                chatRooms.map((room) => {
                  const displayName = isAdmin
                    ? room.patientName && room.patientName.trim() !== ""
                      ? room.patientName
                      : room.patientId
                        ? `환자 ${room.patientId}`
                        : "알수없음"
                    : room.hospitalName;

                  const avatarChar = displayName.charAt(0).toUpperCase();

                  return (
                    <div
                      key={room.id}
                      className={`hdr__cr-item${activeChatRoom?.id === room.id ? " hdr__cr-item--active" : ""}`}
                      onClick={() => setActiveChatRoom(room)}
                    >
                      <div className="hdr__cr-avatar">
                        {isAdmin ? avatarChar : room.avatar}
                      </div>
                      <div className="hdr__cr-info">
                        <div className="hdr__cr-top">
                          <span className="hdr__cr-name">{displayName}</span>
                          <span className="hdr__cr-time">{room.lastTime}</span>
                        </div>
                        <div className="hdr__cr-bottom">
                          <span className="hdr__cr-last">
                            {room.lastMsg || "대화를 시작해보세요"}
                          </span>
                          {room.unread > 0 && (
                            <span className="hdr__cr-unread">
                              {room.unread}
                            </span>
                          )}
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
              <FontAwesomeIcon
                icon={faBell}
                className="hdr__np-head-icon"
                style={{ color: "#10b981" }}
              />
              <span>시스템 알림</span>
              {unreadSysNotifCount > 0 && (
                <span
                  className="hdr__np-head-badge"
                  style={{ background: "#10b981", color: "#fff" }}
                >
                  {unreadSysNotifCount}
                </span>
              )}
            </div>

            <div className="hdr__np-body">
              {sysNotifications.length === 0 ? (
                <div className="hdr__rv-empty">
                  <div className="hdr__rv-empty-icon">
                    <FontAwesomeIcon icon={faBell} />
                  </div>
                  <p className="hdr__rv-empty-title">새로운 알림이 없어요</p>
                </div>
              ) : (
                sysNotifications.map((notif) => (
                  <div
                    key={notif.ntNum} // ✅ nt_num -> ntNum 변경 (Key 에러 해결)
                    className={`hdr__hl-item ${notif.ntIsRead ? "hdr__hl-item--read" : ""}`}
                    onClick={() => handleNotificationClick(notif)}
                    style={{
                      cursor: "pointer",
                      opacity: notif.ntIsRead ? 0.6 : 1, // ✅ ntIsRead 변경
                      padding: "1rem",
                      borderBottom: "1px solid #f3f4f6",
                    }}
                  >
                    <div
                      className="hdr__hl-icon"
                      style={{ background: "#ecfdf5", color: "#10b981" }}
                    >
                      <FontAwesomeIcon icon={faCircleExclamation} />
                    </div>

                    <div className="hdr__hl-info" style={{ flex: 1 }}>
                      <span
                        className="hdr__hl-title"
                        style={{
                          fontSize: "0.9rem",
                          whiteSpace: "normal",
                          lineHeight: "1.4",
                        }}
                      >
                        {notif.ntFinalContent}{" "}
                        {/* ✅ nt_final_content -> ntFinalContent 변경 */}
                      </span>
                      <span
                        className="hdr__hl-sub"
                        style={{ marginTop: "4px", display: "block" }}
                      >
                        {/* ✅ Invalid Date 방지: ntCreatedAt이 null이면 현재 시간 출력 */}
                        {new Date(
                          notif.ntCreatedAt || Date.now(),
                        ).toLocaleDateString()}
                      </span>
                    </div>

                    {!notif.ntIsRead && ( // ✅ ntIsRead 변경
                      <div
                        className="hdr__hl-check"
                        style={{ color: "#10b981", marginLeft: "8px" }}
                      >
                        <FontAwesomeIcon
                          icon={faCircleDot}
                          style={{ fontSize: "0.5rem" }}
                        />
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <button 
              className="hdr__np-footer-link" 
              style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'center' }}
              onClick={() => {
                setNotifOpen(false); // 패널 닫기
                setModalType("notifications"); // 모달 열기
              }}
            >
              전체 알림 보기 <FontAwesomeIcon icon={faChevronRight} />
            </button>
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
            <div className="hdr__cw-avatar">
              {isAdmin
                ? (
                    activeChatRoom.patientName ||
                    activeChatRoom.patientId ||
                    "?"
                  )
                    .toString()
                    .substring(0, 1)
                    .toUpperCase()
                : activeChatRoom.avatar}
            </div>
            <div className="hdr__cw-hinfo">
              <span className="hdr__cw-hname">
                {isAdmin
                  ? activeChatRoom.patientName ||
                    `환자 ${activeChatRoom.patientId}`
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
              // 🌟 isMine 변수가 선언되는 매우 중요한 부분!
              const isFromHospital = msg.from?.startsWith("hospital");
              const isMine = isAdmin ? isFromHospital : !isFromHospital;

              return (
                <div
                  key={msg.id || i}
                  className={`hdr__cw-msg hdr__cw-msg--${isMine ? "user" : "hospital"}`}
                >
                  {/* 🌟 수정했던 상대방 아바타 표시 부분 */}
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

      {modalType === "notifications" &&
        ReactDOM.createPortal(
          <NotificationsModal
            isOpen={true}
            onClose={closeModal}
            notifications={sysNotifications}
            setNotifications={setSysNotifications}
          />,
          document.body
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
