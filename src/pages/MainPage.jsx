import { useEffect, useRef, useState } from 'react';

export default function HomePage() {
  const navbarRef = useRef(null);
  const hamburgerRef = useRef(null);
  const navMenuRef = useRef(null);
  const navButtonsRef = useRef(null);
  const searchInputRefs = [useRef(null), useRef(null)];
  const heroStatsRef = useRef(null);

  const [activeLink, setActiveLink] = useState(null);

  // ================================
  // Navigation Scroll Effect
  // ================================
  useEffect(() => {
    const handleScroll = () => {
      if (!navbarRef.current) return;
      if (window.pageYOffset > 50) {
        navbarRef.current.classList.add('scrolled');
      } else {
        navbarRef.current.classList.remove('scrolled');
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ================================
  // Mobile Menu Toggle
  // ================================
  const toggleMobileMenu = () => {
    hamburgerRef.current.classList.toggle('active');
    navMenuRef.current.classList.toggle('active');
    navButtonsRef.current.classList.toggle('active');
  };

  // ================================
  // Smooth Scroll for Navigation Links
  // ================================
  const handleNavClick = (e, id) => {
    e.preventDefault();
    const target = document.querySelector(id);
    if (target) {
      const offsetTop = target.offsetTop - 80;
      window.scrollTo({ top: offsetTop, behavior: 'smooth' });

      // Close mobile menu if open
      if (hamburgerRef.current.classList.contains('active')) {
        hamburgerRef.current.classList.remove('active');
        navMenuRef.current.classList.remove('active');
        navButtonsRef.current.classList.remove('active');
      }

      setActiveLink(id);
    }
  };

  // ================================
  // Intersection Observer for Animations
  // ================================
  useEffect(() => {
    const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -100px 0px' };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, observerOptions);

    const elements = document.querySelectorAll('.feature-card, .dept-card, .step, .testimonial-card');
    elements.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
      el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      observer.observe(el);
    });
  }, []);

  // ================================
  // Search Functionality
  // ================================
  const handleSearch = () => {
    const symptom = searchInputRefs[0].current.value.trim();
    const location = searchInputRefs[1].current.value.trim();

    if (!symptom && !location) {
      alert('증상이나 지역을 입력해주세요.');
      return;
    }

    console.log('Searching for:', { symptom, location });
    alert(`검색 중: ${symptom || '모든 증상'} - ${location || '모든 지역'}`);
  };

  // ================================
  // CTA Buttons Handler
  // ================================
  const handleCTA = (text) => {
    if (text.includes('회원가입') || text.includes('무료 회원가입')) {
      alert('회원가입 페이지로 이동합니다.');
    } else if (text.includes('로그인')) {
      alert('로그인 페이지로 이동합니다.');
    } else if (text.includes('영상')) {
      alert('서비스 소개 영상을 준비 중입니다.');
    }
  };

  // ================================
  // Page Load Animation
  // ================================
  useEffect(() => {
    document.body.style.opacity = '0';
    setTimeout(() => {
      document.body.style.transition = 'opacity 0.5s ease';
      document.body.style.opacity = '1';
    }, 100);
  }, []);

  return (
    <div>
      {/* Navbar */}
      <nav ref={navbarRef} className="navbar">
        <div ref={hamburgerRef} className="hamburger" onClick={toggleMobileMenu}>
          <span></span><span></span><span></span>
        </div>
        <ul ref={navMenuRef} className="nav-menu">
          <li><a href="#home" className={activeLink === '#home' ? 'active' : ''} onClick={(e) => handleNavClick(e, '#home')}>Home</a></li>
          <li><a href="#features" className={activeLink === '#features' ? 'active' : ''} onClick={(e) => handleNavClick(e, '#features')}>Features</a></li>
        </ul>
        <div ref={navButtonsRef} className="nav-buttons">
          <button onClick={() => handleCTA('회원가입')}>회원가입</button>
          <button onClick={() => handleCTA('로그인')}>로그인</button>
        </div>
      </nav>

      {/* Search Section */}
      <section className="search-box">
        <input ref={searchInputRefs[0]} type="text" placeholder="증상 입력" onKeyPress={(e) => e.key === 'Enter' && handleSearch()} />
        <input ref={searchInputRefs[1]} type="text" placeholder="지역 입력" onKeyPress={(e) => e.key === 'Enter' && handleSearch()} />
        <button className="btn-search" onClick={handleSearch}>검색</button>
      </section>

      {/* Example CTA Button */}
      <button className="btn-cta-primary" onClick={() => handleCTA('무료 회원가입')}>무료 회원가입</button>
    </div>
  );
}