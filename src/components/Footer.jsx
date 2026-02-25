import "../assets/styles/Footer.css";

/* ── 링크 데이터 ── */
const FOOTER_DATA = {
  서비스: [
    { label: "병원 찾기",    href: "/hospitals" },
    { label: "약국 찾기",    href: "/pharmacy" },
    { label: "AI 추천",      href: "/ai-recommend" },
    { label: "실시간 예약",  href: "/reservation" },
    { label: "병원 후기",    href: "/reviews" },
  ],
  회사소개: [
    { label: "서비스 소개", href: "/about" },
    { label: "팀 소개",     href: "/team" },
    { label: "채용 정보",   href: "/careers" },
    { label: "투자자 관계", href: "/ir" },
    { label: "뉴스룸",      href: "/news" },
  ],
  고객지원: [
    { label: "공지사항",   href: "/notice" },
    { label: "자주 묻는 질문", href: "/faq" },
    { label: "1:1 문의",   href: "/qna" },
    { label: "커뮤니티",   href: "/community" },
    { label: "파트너십",   href: "/partnership" },
  ],
};

const SOCIAL_LINKS = [
  { icon: "fab fa-instagram", href: "#", label: "인스타그램" },
  { icon: "fab fa-twitter",   href: "#", label: "트위터" },
  { icon: "fab fa-facebook",  href: "#", label: "페이스북" },
  { icon: "fab fa-youtube",   href: "#", label: "유튜브" },
];

const APP_LINKS = [
  { icon: "fab fa-apple",   label: "App Store",    href: "#" },
  { icon: "fab fa-google-play", label: "Google Play", href: "#" },
];

/* ── 컴포넌트 ── */
const Footer = () => {
  return (
    <footer className="footer-s2">
      <div className="footer-container-s2">

        {/* ── 상단 그리드 ── */}
        <div className="footer-top-s2">

          {/* 브랜드 컬럼 */}
          <div className="footer-brand-s2">
            <div className="footer-logo-s2">
              <div className="logo-icon-s2">
                <i className="fas fa-heart" />
              </div>
              <span>바로닥큐</span>
            </div>
            <p>AI 기반 스마트 병원 예약 플랫폼으로 건강한 내일을 만들어갑니다. 내 증상에 맞는 최적의 병원을 빠르고 쉽게 찾아보세요.</p>

            {/* 앱 다운로드 */}
            <div className="footer-app-btns">
              {APP_LINKS.map((app) => (
                <a key={app.label} href={app.href} className="footer-app-btn">
                  <i className={app.icon} />
                  <span>{app.label}</span>
                </a>
              ))}
            </div>

            {/* 소셜 */}
            <div className="social-links-s2">
              {SOCIAL_LINKS.map((s) => (
                <a key={s.label} href={s.href} aria-label={s.label} title={s.label}>
                  <i className={s.icon} />
                </a>
              ))}
            </div>
          </div>

          {/* 링크 컬럼들 */}
          {Object.entries(FOOTER_DATA).map(([title, links]) => (
            <div key={title} className="footer-column-s2">
              <h4>{title}</h4>
              <ul>
                {links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href}>{link.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── 하단 ── */}
        <div className="footer-bottom-s2">
          <div className="footer-bottom-left">
            <p className="footer-copyright">
              © {new Date().getFullYear()} 바로닥큐. All rights reserved.
            </p>
            <p className="footer-address">
              서울특별시 강남구 테헤란로 123&nbsp;|&nbsp;
              사업자등록번호: 123-45-67890&nbsp;|&nbsp;
              대표: 홍길동
            </p>
          </div>
          <div className="footer-links-s2">
            <a href="/terms">이용약관</a>
            <a href="/privacy" className="footer-policy-strong">개인정보 처리방침</a>
            <a href="/cookies">쿠키 정책</a>
            <a href="/accessibility">접근성 안내</a>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
