// Footer.jsx
import "../assets/styles/Footer.css";

const FooterLinks = ({ title, links }) => (
  <div className="footer-col">
    <h4>{title}</h4>
    <ul>
      {links.map((l, i) => <li key={i}><a href="#">{l}</a></li>)}
    </ul>
  </div>
);

const Footer = () => {
  return (
    <footer className="footer-s2">
      <div className="container-s2">
        <div className="footer-top-s2">
          <div className="footer-brand-s2">
            <div className="footer-logo-s2">
              <div className="logo-icon-s2"><i className="fas fa-heartbeat" /></div>
              <span>바로닥큐</span>
            </div>
            <p>스마트한 병원 예약으로<br />더 건강한 내일을 만듭니다</p>
            <div className="social-links-s2">
              {["facebook-f", "twitter", "instagram", "youtube"].map((s) => (
                <a href="#" key={s}><i className={`fab fa-${s}`} /></a>
              ))}
            </div>
          </div>
          <FooterLinks title="서비스" links={["병원 찾기", "진료과목", "예약 관리", "리뷰"]} />
          <FooterLinks title="고객지원" links={["공지사항", "자주 묻는 질문", "1:1 문의", "이용 가이드"]} />
          <FooterLinks title="회사" links={["회사 소개", "채용", "제휴 문의", "약관"]} />
        </div>
        <div className="footer-bottom-s2">
          <p>&copy; 2026 바로닥큐. All rights reserved.</p>
          <div className="footer-links-s2">
            <a href="#">개인정보처리방침</a>
            <a href="#">이용약관</a>
            <a href="#">쿠키 정책</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;