import React, { useEffect, useRef, useState } from "react";
import "../assets/styles/MainPage.css";

/* ─────────────────────────────────────────
   데이터 상수
───────────────────────────────────────── */
const DEPT_CATEGORIES = [
  { id: "all",           label: "전체",         icon: "th-large" },
  { id: "pediatrics",    label: "소아청소년과",  icon: "baby" },
  { id: "internal",      label: "내과",          icon: "heartbeat" },
  { id: "surgery",       label: "외과",          icon: "cut" },
  { id: "orthopedics",   label: "정형외과",      icon: "bone" },
  { id: "ophthalmology", label: "안과",          icon: "eye" },
  { id: "dental",        label: "치과",          icon: "tooth" },
  { id: "dermatology",   label: "피부과",        icon: "spa" },
  { id: "ent",           label: "이비인후과",    icon: "ear-listen" },
  { id: "neuro",         label: "신경과",        icon: "brain" },
];

const HOSPITAL_DATA = [
  { id: 1, name: "서울아동병원",    dept: "소아청소년과", deptId: "pediatrics",    address: "서울 강남구 테헤란로 123",      rating: 4.9, reviews: 312, wait: "15분", distance: "0.8km", badge: "추천",   open: true  },
  { id: 2, name: "강남메디컬센터",  dept: "내과",         deptId: "internal",      address: "서울 강남구 논현로 456",        rating: 4.8, reviews: 245, wait: "20분", distance: "1.2km", badge: "인기",   open: true  },
  { id: 3, name: "한강정형외과의원",dept: "정형외과",     deptId: "orthopedics",   address: "서울 용산구 이태원로 78",       rating: 5.0, reviews: 198, wait: "5분",  distance: "2.1km", badge: "즉시예약",open: true  },
  { id: 4, name: "밝은눈안과",      dept: "안과",         deptId: "ophthalmology", address: "서울 마포구 홍익로 90",         rating: 4.7, reviews: 167, wait: "30분", distance: "1.5km", badge: null,     open: false },
  { id: 5, name: "스마일치과의원",  dept: "치과",         deptId: "dental",        address: "서울 서초구 방배로 200",        rating: 4.8, reviews: 289, wait: "10분", distance: "0.5km", badge: "이벤트", open: true  },
  { id: 6, name: "맑은피부과",      dept: "피부과",       deptId: "dermatology",   address: "서울 강남구 청담동 55",         rating: 4.6, reviews: 134, wait: "25분", distance: "1.8km", badge: null,     open: true  },
  { id: 7, name: "우리아이클리닉",  dept: "소아청소년과", deptId: "pediatrics",    address: "서울 송파구 올림픽로 301",      rating: 4.7, reviews: 156, wait: "10분", distance: "3.0km", badge: null,     open: true  },
  { id: 8, name: "소화기내과의원",  dept: "내과",         deptId: "internal",      address: "서울 영등포구 여의대방로 12",   rating: 4.9, reviews: 203, wait: "0분",  distance: "2.4km", badge: "즉시예약",open: true  },
];

const HOT_REVIEWS = [
  { hospital: "강남메디컬센터",  dept: "내과",         reviewer: "이준호", avatar: "이", rating: 5, text: "대기 시간이 짧고 의사 선생님이 정말 친절하세요. AI 추천으로 처음 방문했는데 완전 만족!", time: "2시간 전", likes: 47 },
  { hospital: "서울아동병원",   dept: "소아청소년과", reviewer: "박민지", avatar: "박", rating: 5, text: "아이가 무서워하지 않도록 선생님이 배려해주셨어요. 시설도 깔끔하고 정말 좋았습니다.",       time: "4시간 전", likes: 38 },
  { hospital: "스마일치과의원", dept: "치과",         reviewer: "김서연", avatar: "김", rating: 5, text: "치료 과정을 친절하게 설명해주시고 통증도 최소화해주셨어요. 다음에도 꼭 올 것 같아요!",   time: "어제",     likes: 29 },
  { hospital: "밝은눈안과",     dept: "안과",         reviewer: "최다운", avatar: "최", rating: 4, text: "라식 상담 받았는데 과장 없이 솔직하게 말씀해주셔서 신뢰가 갔어요.",                       time: "어제",     likes: 22 },
];

const HOSPITAL_EVENTS = [
  { hospital: "스마일치과의원", title: "신규 환자 스케일링 50% 할인",      badge: "D-3",  color: "#14b8a6", icon: "tooth" },
  { hospital: "맑은피부과",     title: "봄맞이 피부 진단 무료 이벤트",     badge: "D-7",  color: "#0d9488", icon: "spa"   },
  { hospital: "밝은눈안과",     title: "라식 수술 1+1 상담 이벤트",        badge: "D-14", color: "#0f766e", icon: "eye"   },
];

const NEARBY_HOSPITALS = [
  { name: "서울아동병원",    dept: "소아청소년과", distance: "0.8km", open: true,  wait: "15분" },
  { name: "스마일치과의원",  dept: "치과",         distance: "0.5km", open: true,  wait: "10분" },
  { name: "강남메디컬센터",  dept: "내과",         distance: "1.2km", open: true,  wait: "20분" },
  { name: "밝은눈안과",      dept: "안과",         distance: "1.5km", open: false, wait: "-"    },
  { name: "한강정형외과의원",dept: "정형외과",     distance: "2.1km", open: true,  wait: "5분"  },
];

const SCRAPED_HOSPITALS = [
  { name: "강남메디컬센터",  dept: "내과",         rating: 4.8, memo: "정기검진용" },
  { name: "서울아동병원",   dept: "소아청소년과", rating: 4.9, memo: "아이 진료"  },
  { name: "스마일치과의원", dept: "치과",         rating: 4.8, memo: "스케일링"   },
];

const MY_RECORDS = [
  { date: "2026-02-20", hospital: "서울아동병원",    dept: "소아청소년과", doctor: "김민수", status: "완료", diagnosis: "상기도감염" },
  { date: "2026-02-15", hospital: "강남메디컬센터",  dept: "내과",         doctor: "이서연", status: "완료", diagnosis: "건강검진"   },
  { date: "2026-02-10", hospital: "한강정형외과의원",dept: "정형외과",     doctor: "박준호", status: "완료", diagnosis: "무릎통증"   },
  { date: "2026-01-25", hospital: "밝은눈안과",      dept: "안과",         doctor: "최지혜", status: "완료", diagnosis: "시력검사"   },
];

const VACCINES = [
  { name: "독감 (인플루엔자)", date: "2025-10-15", nextDate: "2026-10-15", status: "완료",   progress: 100, color: "#14b8a6" },
  { name: "폐렴구균",          date: "2024-03-20", nextDate: "2029-03-20", status: "완료",   progress: 100, color: "#0d9488" },
  { name: "파상풍 (Td)",       date: "2020-06-10", nextDate: "2030-06-10", status: "예정",   progress: 60,  color: "#0f766e" },
  { name: "A형간염",           date: "-",          nextDate: "2026-04-01", status: "미접종", progress: 0,   color: "#94a3b8" },
];

/* ─────────────────────────────────────────
   MainPage Component
───────────────────────────────────────── */
const MainPage = () => {
  // ✅ heroStats ref 만 유지 (nav 관련 ref 모두 제거 — Header.jsx에서 관리)
  const heroStatsRef = useRef(null);

  const [activeDept, setActiveDept] = useState("all");
  const [activeTab,  setActiveTab]  = useState("review"); // review | event | nearby

  const filteredHospitals =
    activeDept === "all"
      ? HOSPITAL_DATA
      : HOSPITAL_DATA.filter((h) => h.deptId === activeDept);

  useEffect(() => {
    /* ── 스크롤 reveal 애니메이션 ── */
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.opacity    = "1";
            entry.target.style.transform  = "translateY(0)";
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -80px 0px" }
    );

    document
      .querySelectorAll(
        ".feature-card-s2, .dept-card-s2, .step-s2, .testimonial-card-s2, .hospital-card-new, .event-card-new"
      )
      .forEach((el) => {
        el.style.opacity    = "0";
        el.style.transform  = "translateY(24px)";
        el.style.transition = "opacity 0.55s ease, transform 0.55s ease";
        revealObserver.observe(el);
      });

    /* ── 숫자 카운터 애니메이션 ── */
    const formatNumber = (n) =>
      n >= 1000 ? (n / 1000).toFixed(1) + "K+" : String(n);

    const animateCounter = (el, target, duration = 2000) => {
      let start = 0;
      const inc   = target / (duration / 16);
      const timer = setInterval(() => {
        start += inc;
        if (start >= target) {
          el.textContent = formatNumber(target);
          clearInterval(timer);
        } else {
          el.textContent = formatNumber(Math.floor(start));
        }
      }, 16);
    };

    const statsObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll(".stat-number").forEach((stat) => {
              const t = parseInt(stat.textContent.replace(/[^0-9]/g, ""), 10);
              if (!isNaN(t)) {
                stat.textContent = "0";
                animateCounter(stat, t);
              }
            });
            statsObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    if (heroStatsRef.current) statsObserver.observe(heroStatsRef.current);

    return () => {
      revealObserver.disconnect();
      statsObserver.disconnect();
    };
  }, []);

  return (
    <div className="main-container-s2">

      {/* ══════════════════════════════
          HERO
      ══════════════════════════════ */}
      <section className="hero-s2" id="home">
        <div className="hero-blob-s2 blob-1-s2" />
        <div className="hero-blob-s2 blob-2-s2" />
        <div className="container-s2">
          <div className="hero-content-s2">
            <div className="hero-left-s2">
              <h1 className="hero-title-s2">
                건강한 내일을 위한<br />
                <span className="gradient-text-s2">스마트한 선택</span>
              </h1>
              <p className="hero-subtitle-s2">
                증상에 맞는 최적의 병원을 추천해드립니다.<br />
                간편한 예약부터 진료 후기까지, 모든 것을 한곳에서
              </p>
              <div className="hero-search-s2">
                <div className="search-container-s2">
                  <div className="search-field-s2">
                    <i className="fas fa-search" />
                    <input type="text" placeholder="증상이나 진료과를 검색하세요" />
                  </div>
                  <button className="btn-search-s2">
                    검색하기 <i className="fas fa-arrow-right" />
                  </button>
                </div>
                <div className="search-tags-s2">
                  {["감기", "소아청소년과", "내과", "두통", "피부과"].map((t) => (
                    <span className="tag-s2" key={t}>
                      <i className="fas fa-fire" />{t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="hero-right-s2">
              <div className="stats-card-s2" ref={heroStatsRef}>
                <StatItem icon="hospital"       number="2500"  label="등록 병원"  color="#14b8a6" />
                <StatItem icon="user-doctor"    number="8500"  label="전문 의료진" color="#0d9488" />
                <StatItem icon="calendar-check" number="50000" label="월간 예약"  color="#0f766e" />
              </div>
              <div className="hero-illustration-s2">
                <div className="illustration-circle-s2" />
                <div className="illustration-icon-s2">
                  <i className="fas fa-hospital-user" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          QUICK SEARCH BAR
      ══════════════════════════════ */}
      <section className="quick-search-s2">
        <div className="container-s2">
          <div className="quick-search-wrapper">
            <QuickSearchItem icon="shield-virus"  label="응급실진료" />
            <QuickSearchItem icon="certificate"   label="일요일진료" />
            <QuickSearchItem icon="moon"           label="야간진료"   />
            <QuickSearchItem icon="circle-check"  label="지금진료중" />
            <QuickSearchItem icon="venus"          label="여성의원"   />
            <QuickSearchItem icon="syringe"        label="예방접종"   />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          진료과 병원 찾기
      ══════════════════════════════ */}
      <section className="hospital-search-s2" id="hospital-search">
        <div className="container-s2">
          <div className="section-header-s2">
            <span className="section-subtitle-s2">FIND HOSPITAL</span>
            <h2 className="section-title-s2">진료과로 병원 찾기</h2>
            <p className="section-desc-s2">원하는 진료과를 선택하면 주변 병원을 바로 찾아드려요</p>
          </div>

          {/* 진료과 탭 */}
          <div className="dept-tab-scroll">
            <div className="dept-tabs-s2">
              {DEPT_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  className={`dept-tab-btn ${activeDept === cat.id ? "active" : ""}`}
                  onClick={() => setActiveDept(cat.id)}
                >
                  <i className={`fas fa-${cat.icon}`} />
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 병원 카드 그리드 */}
          <div className="hospital-grid-s2">
            {filteredHospitals.map((h) => (
              <HospitalCard key={h.id} {...h} />
            ))}
            {filteredHospitals.length === 0 && (
              <div className="no-result">해당 진료과 병원이 없습니다.</div>
            )}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          내 건강 대시보드
      ══════════════════════════════ */}
      <section className="dashboard-s2" id="dashboard">
        <div className="container-s2">
          <div className="section-header-s2">
            <span className="section-subtitle-s2">MY HEALTH BOARD</span>
            <h2 className="section-title-s2">내 건강 대시보드</h2>
          </div>

          {/* 상단: 탭 패널 + 스크랩 사이드 */}
          <div className="dashboard-top-grid">
            <div className="dash-panel-main">
              <div className="dash-tab-bar">
                {[
                  { key: "review", icon: "fire",         label: "핫한 병원후기" },
                  { key: "event",  icon: "tag",          label: "병원 이벤트"   },
                  { key: "nearby", icon: "location-dot", label: "주변 병원"     },
                ].map((t) => (
                  <button
                    key={t.key}
                    className={`dash-tab-btn ${activeTab === t.key ? "active" : ""}`}
                    onClick={() => setActiveTab(t.key)}
                  >
                    <i className={`fas fa-${t.icon}`} />
                    {t.label}
                  </button>
                ))}
              </div>

              {activeTab === "review" && (
                <div className="dash-panel-body">
                  {HOT_REVIEWS.map((r, i) => <HotReviewCard key={i} {...r} />)}
                </div>
              )}
              {activeTab === "event" && (
                <div className="dash-panel-body event-list">
                  {HOSPITAL_EVENTS.map((e, i) => <EventCard key={i} {...e} />)}
                </div>
              )}
              {activeTab === "nearby" && (
                <div className="dash-panel-body">
                  <div className="nearby-map-placeholder">
                    <i className="fas fa-map-location-dot" />
                    <span>지도 로딩 중...</span>
                  </div>
                  <div className="nearby-list">
                    {NEARBY_HOSPITALS.map((h, i) => <NearbyHospitalRow key={i} {...h} />)}
                  </div>
                </div>
              )}
            </div>

            {/* 스크랩 사이드 */}
            <div className="dash-side-card">
              <div className="dash-side-header">
                <span className="dash-side-icon" style={{ background: "linear-gradient(135deg,#14b8a6,#0d9488)" }}>
                  <i className="fas fa-bookmark" />
                </span>
                <h3>스크랩 병원</h3>
                <button className="dash-side-more">전체보기 <i className="fas fa-chevron-right" /></button>
              </div>
              <div className="dash-side-body">
                {SCRAPED_HOSPITALS.map((h, i) => <ScrapHospitalRow key={i} {...h} />)}
              </div>
            </div>
          </div>

          {/* 하단: 내 병원 기록 + 예방접종 */}
          <div className="dashboard-bottom-grid">
            {/* 내 병원 기록 */}
            <div className="dash-record-card">
              <div className="dash-side-header">
                <span className="dash-side-icon" style={{ background: "linear-gradient(135deg,#0d9488,#0f766e)" }}>
                  <i className="fas fa-clipboard-list" />
                </span>
                <h3>내 병원 기록</h3>
                <button className="dash-side-more">전체보기 <i className="fas fa-chevron-right" /></button>
              </div>
              <div className="record-table-wrap">
                <table className="record-table">
                  <thead>
                    <tr>
                      <th>날짜</th><th>병원명</th><th>진료과</th><th>담당의</th><th>진단명</th><th>상태</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MY_RECORDS.map((r, i) => (
                      <tr key={i} className="record-row">
                        <td>{r.date}</td>
                        <td><strong>{r.hospital}</strong></td>
                        <td><span className="dept-badge">{r.dept}</span></td>
                        <td>{r.doctor}</td>
                        <td>{r.diagnosis}</td>
                        <td><span className="status-chip done">{r.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 예방접종 */}
            <div className="dash-vaccine-card">
              <div className="dash-side-header">
                <span className="dash-side-icon" style={{ background: "linear-gradient(135deg,#0f766e,#115e59)" }}>
                  <i className="fas fa-syringe" />
                </span>
                <h3>예방접종 / 백신</h3>
                <button className="dash-side-more">관리하기 <i className="fas fa-chevron-right" /></button>
              </div>
              <div className="vaccine-list">
                {VACCINES.map((v, i) => <VaccineRow key={i} {...v} />)}
              </div>
              <div className="vaccine-cta">
                <i className="fas fa-calendar-plus" />
                <span>다음 예방접종 예약하기</span>
                <button className="vaccine-book-btn">예약 <i className="fas fa-arrow-right" /></button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          FEATURES
      ══════════════════════════════ */}
      <section className="features-s2" id="services">
        <div className="container-s2">
          <div className="section-header-s2">
            <span className="section-subtitle-s2">FEATURES</span>
            <h2 className="section-title-s2">바로닥큐만의 특별함</h2>
            <p className="section-desc-s2">최첨단 기술로 더 나은 의료 경험을 제공합니다</p>
          </div>
          <div className="features-grid-s2">
            <FeatureCard icon="wand-magic-sparkles" title="AI 맞춤 추천"  desc="증상과 위치 기반으로 가장 적합한 병원을 인공지능이 추천합니다"          color="#14b8a6" />
            <FeatureCard icon="bolt"                title="실시간 예약"  desc="병원의 실시간 예약 가능 시간을 확인하고 즉시 예약하세요"                 color="#0d9488" />
            <FeatureCard icon="star"                title="검증된 리뷰"  desc="실제 환자들의 진솔한 후기로 신뢰할 수 있는 선택을 하세요"               color="#0f766e" />
            <FeatureCard icon="bell"                title="스마트 알림"  desc="예약 시간부터 사후 관리까지 놓치지 않도록 알려드립니다"                  color="#14b8a6" />
            <FeatureCard icon="shield-halved"       title="안전한 보안"  desc="의료 정보는 최고 수준의 보안 시스템으로 안전하게 보호됩니다"             color="#0d9488" />
            <FeatureCard icon="comments"            title="24시간 지원"  desc="언제든지 궁금한 점을 문의하실 수 있는 고객센터를 운영합니다"             color="#0f766e" />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          HOW IT WORKS
      ══════════════════════════════ */}
      <section className="how-it-works-s2">
        <div className="container-s2">
          <div className="section-header-s2">
            <span className="section-subtitle-s2">HOW IT WORKS</span>
            <h2 className="section-title-s2">3단계로 간편하게</h2>
            <p className="section-desc-s2">복잡한 절차 없이 빠르게 병원 예약을 완료하세요</p>
          </div>
          <div className="steps-container-s2">
            <Step num="1" icon="magnifying-glass" title="병원 검색" desc="증상과 위치를 입력하여 적합한 병원을 찾아보세요" color="#14b8a6" />
            <div className="step-connector-s2"><i className="fas fa-chevron-right" /></div>
            <Step num="2" icon="calendar-days"    title="예약 신청" desc="원하는 날짜와 시간을 선택하여 간편하게 예약하세요" color="#0d9488" />
            <div className="step-connector-s2"><i className="fas fa-chevron-right" /></div>
            <Step num="3" icon="user-nurse"       title="진료 받기" desc="예약 시간에 방문하여 빠르게 진료를 받으세요" color="#0f766e" />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          TESTIMONIALS
      ══════════════════════════════ */}
      <section className="testimonials-s2">
        <div className="container-s2">
          <div className="section-header-s2">
            <span className="section-subtitle-s2">REVIEWS</span>
            <h2 className="section-title-s2">사용자 후기</h2>
            <p className="section-desc-s2">바로닥큐를 이용한 분들의 생생한 후기입니다</p>
          </div>
          <div className="testimonials-grid-s2">
            <TestimonialCard name="김서연" role="직장인"   avatar="김" text="AI 추천 기능이 정말 정확해요. 제 증상에 딱 맞는 병원을 찾았고, 예약도 쉽게 할 수 있었습니다!" rating={5} />
            <TestimonialCard name="이준호" role="프리랜서" avatar="이" text="리뷰를 보고 병원을 선택할 수 있어서 정말 좋았어요. 실제로 방문했을 때도 만족스러웠습니다."       rating={5} />
            <TestimonialCard name="박민지" role="대학생"   avatar="박" text="예약 알림 기능 덕분에 병원 예약을 놓치지 않을 수 있었어요. 정말 편리한 서비스입니다!"           rating={5} />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          CTA
      ══════════════════════════════ */}
      <section className="cta-s2">
        <div className="container-s2">
          <div className="cta-box-s2">
            <div className="cta-content-s2">
              <h2>지금 바로 시작해보세요</h2>
              <p>바로닥큐와 함께 더 건강한 내일을 만들어가세요</p>
            </div>
            <div className="cta-actions-s2">
              <button className="btn-cta-primary-s2">
                무료로 시작하기 <i className="fas fa-arrow-right" />
              </button>
              <button className="btn-cta-secondary-s2">
                <i className="fas fa-play" />소개 영상 보기
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

/* ─────────────────────────────────────────
   서브 컴포넌트
───────────────────────────────────────── */
const StatItem = ({ icon, number, label, color }) => (
  <div className="stat-item-s2" style={{ "--stat-color": color }}>
    <div className="stat-icon-s2"><i className={`fas fa-${icon}`} /></div>
    <div className="stat-content-s2">
      <div className="stat-number">{number}</div>
      <div className="stat-label">{label}</div>
    </div>
  </div>
);

const QuickSearchItem = ({ icon, label }) => (
  <div className="quick-search-item">
    <div className="quick-icon"><i className={`fas fa-${icon}`} /></div>
    <span>{label}</span>
  </div>
);

const HospitalCard = ({ name, dept, address, rating, reviews, wait, distance, badge, open }) => (
  <div className="hospital-card-new">
    {badge && (
      <span className={`hospital-badge ${badge === "즉시예약" ? "instant" : badge === "이벤트" ? "event" : "hot"}`}>
        {badge}
      </span>
    )}
    <div className="hospital-card-top">
      <div className="hospital-avatar-new"><i className="fas fa-hospital" /></div>
      <div className="hospital-meta">
        <h3>{name}</h3>
        <span className="hospital-dept-tag">{dept}</span>
        <p className="hospital-addr"><i className="fas fa-location-dot" />{address}</p>
      </div>
    </div>
    <div className="hospital-card-stats">
      <div className="hcs-item">
        <i className="fas fa-star" style={{ color: "#fbbf24" }} />
        <span>{rating}</span>
        <span className="hcs-sub">({reviews})</span>
      </div>
      <div className="hcs-item">
        <i className="fas fa-clock" style={{ color: "#14b8a6" }} />
        <span>대기 {wait}</span>
      </div>
      <div className="hcs-item">
        <i className="fas fa-location-dot" style={{ color: "#0d9488" }} />
        <span>{distance}</span>
      </div>
      <span className={`open-tag ${open ? "open" : "closed"}`}>
        {open ? "진료중" : "진료종료"}
      </span>
    </div>
    <div className="hospital-card-footer">
      <button className="btn-reserve-new"><i className="fas fa-calendar-plus" />예약하기</button>
      <button className="btn-scrap-new"><i className="fas fa-bookmark" /></button>
    </div>
  </div>
);

const HotReviewCard = ({ hospital, dept, reviewer, avatar, rating, text, time, likes }) => (
  <div className="hot-review-card">
    <div className="hrv-left"><div className="hrv-avatar">{avatar}</div></div>
    <div className="hrv-body">
      <div className="hrv-top">
        <span className="hrv-hospital">{hospital}</span>
        <span className="hrv-dept">{dept}</span>
        <span className="hrv-time">{time}</span>
      </div>
      <div className="hrv-stars">
        {[...Array(rating)].map((_, i) => <i key={i} className="fas fa-star" />)}
      </div>
      <p className="hrv-text">"{text}"</p>
      <div className="hrv-footer">
        <span className="hrv-reviewer">{reviewer}</span>
        <button className="hrv-like"><i className="fas fa-heart" />{likes}</button>
      </div>
    </div>
  </div>
);

const EventCard = ({ hospital, title, badge, color, icon }) => (
  <div className="event-card-new" style={{ "--ev-color": color }}>
    <div className="ev-icon-wrap"><i className={`fas fa-${icon}`} /></div>
    <div className="ev-body">
      <p className="ev-hospital">{hospital}</p>
      <h4>{title}</h4>
    </div>
    <span className="ev-badge">{badge}</span>
  </div>
);

const NearbyHospitalRow = ({ name, dept, distance, open, wait }) => (
  <div className="nearby-row">
    <div className="nearby-icon"><i className="fas fa-hospital-user" /></div>
    <div className="nearby-info">
      <strong>{name}</strong>
      <span>{dept}</span>
    </div>
    <div className="nearby-meta">
      <span className="nearby-dist"><i className="fas fa-location-dot" />{distance}</span>
      <span className={`open-tag ${open ? "open" : "closed"}`}>{open ? `대기 ${wait}` : "종료"}</span>
    </div>
    <button className="nearby-book-btn"><i className="fas fa-plus" /></button>
  </div>
);

const ScrapHospitalRow = ({ name, dept, rating, memo }) => (
  <div className="scrap-row">
    <div className="scrap-icon"><i className="fas fa-bookmark" /></div>
    <div className="scrap-info">
      <strong>{name}</strong>
      <span>{dept} · <i className="fas fa-star" style={{ color: "#fbbf24", fontSize: "0.7rem" }} /> {rating}</span>
      <p className="scrap-memo">{memo}</p>
    </div>
    <button className="scrap-book-btn">예약</button>
  </div>
);

const VaccineRow = ({ name, date, nextDate, status, progress, color }) => (
  <div className="vaccine-row">
    <div className="vaccine-info">
      <div className="vaccine-name-wrap">
        <span className="vaccine-dot" style={{ background: color }} />
        <strong>{name}</strong>
        <span className={`vaccine-status-tag ${status === "완료" ? "done" : status === "예정" ? "upcoming" : "none"}`}>
          {status}
        </span>
      </div>
      <div className="vaccine-dates">
        <span>최근: {date}</span>
        <span>다음: {nextDate}</span>
      </div>
    </div>
    <div className="vaccine-progress-wrap">
      <div className="vaccine-progress-bar">
        <div className="vaccine-progress-fill" style={{ width: `${progress}%`, background: color }} />
      </div>
      <span className="vaccine-progress-pct">{progress}%</span>
    </div>
  </div>
);

const FeatureCard = ({ icon, title, desc, color }) => (
  <div className="feature-card-s2" style={{ "--feature-color": color }}>
    <div className="feature-icon-wrapper-s2"><i className={`fas fa-${icon}`} /></div>
    <h3>{title}</h3>
    <p>{desc}</p>
    <div className="feature-arrow-s2"><i className="fas fa-arrow-right" /></div>
  </div>
);

const Step = ({ num, icon, title, desc, color }) => (
  <div className="step-s2" style={{ "--step-color": color }}>
    <div className="step-number-s2">{num}</div>
    <div className="step-icon-wrapper-s2"><i className={`fas fa-${icon}`} /></div>
    <h3>{title}</h3>
    <p>{desc}</p>
  </div>
);

const TestimonialCard = ({ name, role, avatar, text, rating }) => (
  <div className="testimonial-card-s2">
    <div className="testimonial-header-s2">
      <div className="testimonial-avatar-s2">{avatar}</div>
      <div className="testimonial-author-s2">
        <div className="author-name">{name}</div>
        <div className="author-role">{role}</div>
      </div>
    </div>
    <div className="rating-s2">
      {[...Array(rating)].map((_, i) => <i key={i} className="fas fa-star" />)}
    </div>
    <p className="testimonial-text-s2">{text}</p>
    <div className="testimonial-quote-s2"><i className="fas fa-quote-right" /></div>
  </div>
);

export default MainPage;
