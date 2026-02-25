import React, { useState, useEffect } from "react";
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
  { hospital: "서울아동병원",    dept: "소아청소년과", date: "2026-03-05", time: "14:30", status: "예정" },
  { hospital: "강남메디컬센터",  dept: "내과",         date: "2026-03-12", time: "10:00", status: "예정" },
];

const MENU_GROUPS = [
  {
    groupTitle: "활동 내역",
    items: [
      { id: 1, icon: "bell",        title: "알림",       badge: 3,    color: "#14b8a6" },
      { id: 2, icon: "comments",    title: "내 Q&A",     badge: null, color: "#0d9488" },
      { id: 3, icon: "star",        title: "나의 후기",  badge: 2,    color: "#0f766e" },
      { id: 4, icon: "comment-dots",title: "채팅",       badge: 1,    color: "#14b8a6" },
    ],
  },
  {
    groupTitle: "계정 관리",
    items: [
      { id: 5, icon: "user-pen",    title: "개인정보 수정", badge: null, color: "#0d9488" },
      { id: 6, icon: "lock",        title: "비밀번호 변경", badge: null, color: "#0f766e" },
      { id: 7, icon: "shield-check",title: "보안 설정",     badge: null, color: "#14b8a6" },
    ],
  },
  {
    groupTitle: "고객 지원",
    items: [
      { id: 8,  icon: "circle-question", title: "공지사항",      badge: null, color: "#0d9488" },
      { id: 9,  icon: "headset",         title: "고객센터",      badge: null, color: "#0f766e" },
      { id: 10, icon: "file-contract",   title: "이용약관",      badge: null, color: "#14b8a6" },
    ],
  },
];

const RECENT_REVIEWS = [
  { hospital: "한강정형외과의원", dept: "정형외과", rating: 5, text: "친절하고 대기 시간도 짧았어요.", date: "2026-02-10" },
  { hospital: "밝은눈안과",      dept: "안과",    rating: 4, text: "시설이 깔끔하고 선생님이 자세히 설명해주셨습니다.", date: "2026-01-25" },
];

/* ─────────────────────────────────────────
   MyPage Component
───────────────────────────────────────── */
const MyPage = () => {
  const [activeStatus, setActiveStatus] = useState("reservation");
  const [scrapCount, setScrapCount] = useState(0);

  const auth = useAuth();


  useEffect(() => {
    if (auth?.getMeAndSetUser) {
      auth.getMeAndSetUser();
    }
  }, []);

  useEffect(() => {
    async function fetchCount() {
      const result = await authFetch("/api/v1/hospitals/me/scraps/count");
      if (result.ok) {
        const count = await result.text();
        setScrapCount(count);
      }
    }
    fetchCount();
  }, []);
  if (!auth) return null; 
  const { user } = auth;
  const STATUS_STATS = [
    { id: "reservation", icon: "calendar-check", label: "예약현황", value: 2, color: "#14b8a6", sub: "진행 중" },
    { id: "history",     icon: "clipboard-list",  label: "병원내역",  value: 14, color: "#0d9488", sub: "총 방문" },
    { id: "scrap",       icon: "heart",           label: "찜한 병원", value: scrapCount,  color: "#0f766e", sub: "저장됨" },
  ];
  return (
    <div className="mypage-wrapper">

      {/* ══════════════════
          히어로 프로필 배너
      ══════════════════ */}
      <section className="mp-hero">
        <div className="mp-hero-blob blob-a" />
        <div className="mp-hero-blob blob-b" />
        <div className="mp-container">
          <div className="mp-hero-inner">
            {/* 아바타 + 이름 */}
            <div className="mp-profile-row">
              <div className="mp-avatar-wrap">
                <div className="mp-avatar">{USER_INFO.avatar}</div>
                <span className="mp-avatar-badge"><i className="fas fa-check" /></span>
              </div>
              <div className="mp-profile-info">
                <div className="mp-welcome-label">
                  <i className="fas fa-hand-sparkles" /> WELCOME
                </div>
                <h1 className="mp-username">
                  {user? user.id : "none"}<span className="mp-nim">님</span>
                </h1>
                <div className="mp-meta-row">
                  <span className="mp-grade-badge">
                    <i className="fas fa-crown" />{USER_INFO.grade}
                  </span>
                  <span className="mp-email">
                    <i className="fas fa-envelope" />{USER_INFO.email}
                  </span>
                </div>
              </div>
              <div className="mp-points-box">
                <div className="mp-points-label"><i className="fas fa-coins" />보유 포인트</div>
                <div className="mp-points-value">{USER_INFO.points.toLocaleString()}<span>P</span></div>
                <button className="mp-points-btn">포인트 사용 <i className="fas fa-arrow-right" /></button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mp-container mp-body">

        {/* ══════════════════
            현황 스탯 카드
        ══════════════════ */}
        <section className="mp-stats-section">
          <div className="mp-stats-grid">
            {STATUS_STATS.map((s) => (
              <button
                key={s.id}
                className={`mp-stat-card ${activeStatus === s.id ? "active" : ""}`}
                style={{ "--sc": s.color }}
                onClick={() => setActiveStatus(s.id)}
              >
                <div className="mp-stat-icon">
                  <i className={`fas fa-${s.icon}`} />
                </div>
                <div className="mp-stat-body">
                  <div className="mp-stat-value">{s.value}</div>
                  <div className="mp-stat-label">{s.label}</div>
                  <div className="mp-stat-sub">{s.sub}</div>
                </div>
                <div className="mp-stat-arrow">
                  <i className="fas fa-chevron-right" />
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* ══════════════════
            예약 현황 패널
        ══════════════════ */}
        {activeStatus === "reservation" && (
          <section className="mp-panel mp-reservation-panel">
            <div className="mp-panel-header">
              <span className="mp-panel-icon" style={{ background: "linear-gradient(135deg,#14b8a6,#0d9488)" }}>
                <i className="fas fa-calendar-check" />
              </span>
              <h2>예약 현황</h2>
              <button className="mp-panel-more">전체보기 <i className="fas fa-chevron-right" /></button>
            </div>
            <div className="mp-reservation-list">
              {RESERVATIONS.map((r, i) => (
                <ReservationCard key={i} {...r} />
              ))}
              {RESERVATIONS.length === 0 && (
                <div className="mp-empty">
                  <i className="fas fa-calendar-xmark" />
                  <p>예약 내역이 없습니다.</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ══════════════════
            병원 내역 패널
        ══════════════════ */}
        {activeStatus === "history" && (
          <section className="mp-panel">
            <div className="mp-panel-header">
              <span className="mp-panel-icon" style={{ background: "linear-gradient(135deg,#0d9488,#0f766e)" }}>
                <i className="fas fa-clipboard-list" />
              </span>
              <h2>병원 내역</h2>
              <button className="mp-panel-more">전체보기 <i className="fas fa-chevron-right" /></button>
            </div>
            <div className="mp-history-list">
              {RECENT_REVIEWS.map((rv, i) => (
                <MyReviewCard key={i} {...rv} />
              ))}
            </div>
          </section>
        )}

        {/* ══════════════════
            찜한 병원 패널
        ══════════════════ */}
        {activeStatus === "scrap" && (
          <section className="mp-panel">
            <div className="mp-panel-header">
              <span className="mp-panel-icon" style={{ background: "linear-gradient(135deg,#0f766e,#115e59)" }}>
                <i className="fas fa-heart" />
              </span>
              <h2>찜한 병원</h2>
              <button className="mp-panel-more">전체보기 <i className="fas fa-chevron-right" /></button>
            </div>
            <div className="mp-empty">
              <i className="fas fa-heart" style={{ color: "#14b8a6" }} />
              <p>찜한 병원을 확인하세요.</p>
            </div>
          </section>
        )}

        {/* ══════════════════
            메뉴 그룹 리스트
        ══════════════════ */}
        <div className="mp-menu-area">
          {MENU_GROUPS.map((group, gi) => (
            <section key={gi} className="mp-menu-group">
              <h3 className="mp-group-title">{group.groupTitle}</h3>
              <div className="mp-menu-list">
                {group.items.map((item) => (
                  <MenuRow key={item.id} {...item} />
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* ══════════════════
            로그아웃 버튼
        ══════════════════ */}
        <div className="mp-logout-area">
          <button className="mp-logout-btn">
            <i className="fas fa-right-from-bracket" />로그아웃
          </button>
          <button className="mp-withdraw-btn">회원탈퇴</button>
        </div>

      </div>
    </div>
  );
};

/* ─────────────────────────────────────────
   서브 컴포넌트
───────────────────────────────────────── */
const ReservationCard = ({ hospital, dept, date, time, status }) => (
  <div className="mp-reservation-card">
    <div className="mp-res-status-dot" />
    <div className="mp-res-icon">
      <i className="fas fa-hospital" />
    </div>
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
      <button className="mp-res-cancel">취소</button>
    </div>
  </div>
);

const MyReviewCard = ({ hospital, dept, rating, text, date }) => (
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
    <button className="mp-rev-edit"><i className="fas fa-pen" /></button>
  </div>
);

const MenuRow = ({ icon, title, badge, color }) => (
  <button className="mp-menu-row" style={{ "--mc": color }}>
    <div className="mp-menu-icon">
      <i className={`fas fa-${icon}`} />
    </div>
    <span className="mp-menu-title">{title}</span>
    {badge && <span className="mp-menu-badge">{badge}</span>}
    <i className="fas fa-chevron-right mp-menu-arrow" />
  </button>
);

export default MyPage;
