import React, { useEffect, useRef } from 'react';
import "../assets/styles/MainPage.css";

const MainPage = () => {
    const heroStatsRef = useRef(null);
    const navRef = useRef(null);
    const hamburgerRef = useRef(null);
    const navMenuRef = useRef(null);
    const navButtonsRef = useRef(null);

    useEffect(() => {
        // --- Navigation Scroll Effect ---
        const handleScroll = () => {
            if (window.pageYOffset > 50) {
                navRef.current?.classList.add('scrolled');
            } else {
                navRef.current?.classList.remove('scrolled');
            }
        };
        window.addEventListener('scroll', handleScroll);

        // --- Intersection Observer for Animations ---
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };

        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        const animatedElements = document.querySelectorAll('.feature-card, .dept-card, .step, .testimonial-card');
        animatedElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            revealObserver.observe(el);
        });

        // --- Stats Counter Animation ---
        const formatNumber = (num) => {
            if (num >= 1000) return (num / 1000).toFixed(1) + 'K+';
            return num.toString();
        };

        const animateCounter = (element, target, duration = 2000) => {
            let start = 0;
            const increment = target / (duration / 16);
            const timer = setInterval(() => {
                start += increment;
                if (start >= target) {
                    element.textContent = formatNumber(target);
                    clearInterval(timer);
                } else {
                    element.textContent = formatNumber(Math.floor(start));
                }
            }, 16);
        };

        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const statNumbers = entry.target.querySelectorAll('.stat-number');
                    statNumbers.forEach(stat => {
                        const targetNumber = parseInt(stat.textContent.replace(/[^0-9]/g, ''));
                        if (!isNaN(targetNumber)) {
                            stat.textContent = '0';
                            animateCounter(stat, targetNumber);
                        }
                    });
                    statsObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        if (heroStatsRef.current) statsObserver.observe(heroStatsRef.current);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            revealObserver.disconnect();
            statsObserver.disconnect();
        };
    }, []);

    // --- Event Handlers ---
    const toggleMobileMenu = () => {
        hamburgerRef.current?.classList.toggle('active');
        navMenuRef.current?.classList.toggle('active');
        navButtonsRef.current?.classList.toggle('active');
    };

    const handleNavClick = (e, targetId) => {
        e.preventDefault();
        const target = document.querySelector(targetId);
        if (target) {
            const offsetTop = target.offsetTop - 80;
            window.scrollTo({ top: offsetTop, behavior: 'smooth' });
            hamburgerRef.current?.classList.remove('active');
            navMenuRef.current?.classList.remove('active');
            navButtonsRef.current?.classList.remove('active');
        }
    };

    return (
        <div className="main-container">
            {/* 1. Navigation */}
            <nav className="navbar" ref={navRef}>
                <div className="container">
                    <div className="nav-wrapper">
                        <div className="logo">
                            <i className="fas fa-heart-pulse"></i>
                            <span>메디케어</span>
                        </div>
                        <ul className="nav-menu" ref={navMenuRef}>
                            <li><a href="#home" onClick={(e) => handleNavClick(e, '#home')} className="active">홈</a></li>
                            <li><a href="#services" onClick={(e) => handleNavClick(e, '#services')}>진료과목</a></li>
                            <li><a href="#hospitals" onClick={(e) => handleNavClick(e, '#hospitals')}>병원찾기</a></li>
                            <li><a href="#about" onClick={(e) => handleNavClick(e, '#about')}>소개</a></li>
                            <li><a href="#contact" onClick={(e) => handleNavClick(e, '#contact')}>문의</a></li>
                        </ul>
                        <div className="nav-buttons" ref={navButtonsRef}>
                            <button className="btn-secondary" onClick={() => alert('로그인 페이지로 이동')}>로그인</button>
                            <button className="btn-primary" onClick={() => alert('회원가입 페이지로 이동')}>회원가입</button>
                        </div>
                        <div className="hamburger" ref={hamburgerRef} onClick={toggleMobileMenu}>
                            <span></span><span></span><span></span>
                        </div>
                    </div>
                </div>
            </nav>

            {/* 2. Hero Section */}
            <section className="hero" id="home">
                <div className="container">
                    <div className="hero-content">
                        <div className="hero-text">
                            <span className="badge">AI 기반 병원 매칭 시스템</span>
                            <h1 className="hero-title">
                                당신에게 딱 맞는<br />
                                <span className="gradient-text">병원을 찾아드립니다</span>
                            </h1>
                            <p className="hero-description">
                                증상과 위치를 입력하면 AI가 최적의 병원을 추천해드립니다.<br />
                                간편한 예약부터 진료까지, 메디케어와 함께하세요.
                            </p>
                            <div className="hero-search">
                                <div className="search-box">
                                    <i className="fas fa-search"></i>
                                    <input type="text" placeholder="증상이나 진료과목을 입력하세요 (예: 감기, 치과, 정형외과)" />
                                </div>
                                <div className="search-box">
                                    <i className="fas fa-location-dot"></i>
                                    <input type="text" placeholder="지역을 입력하세요 (예: 강남구, 서초동)" />
                                </div>
                                <button className="btn-search" onClick={() => alert('검색 기능은 준비 중입니다.')}>
                                    <i className="fas fa-magnifying-glass"></i> 병원 찾기
                                </button>
                            </div>
                            <div className="hero-stats" ref={heroStatsRef}>
                                <div className="stat-item">
                                    <div className="stat-number">2500</div>
                                    <div className="stat-label">등록 병원</div>
                                </div>
                                <div className="stat-item">
                                    <div className="stat-number">50000</div>
                                    <div className="stat-label">누적 예약</div>
                                </div>
                                <div className="stat-item">
                                    <div className="stat-number">4.8</div>
                                    <div className="stat-label">평균 평점</div>
                                </div>
                            </div>
                        </div>
                        <div className="hero-image">
                            <div className="floating-card card-1">
                                <i className="fas fa-user-doctor"></i>
                                <div><div className="card-title">의료진</div><div className="card-value">1,200+</div></div>
                            </div>
                            <div className="floating-card card-2">
                                <i className="fas fa-calendar-check"></i>
                                <div><div className="card-title">실시간 예약</div><div className="card-value">가능</div></div>
                            </div>
                            <div className="floating-card card-3">
                                <i className="fas fa-clock"></i>
                                <div><div className="card-title">평균 대기시간</div><div className="card-value">15분</div></div>
                            </div>
                            <div className="hero-circle"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. Features Section */}
            <section className="features" id="services">
                <div className="container">
                    <div className="section-header">
                        <span className="section-badge">Features</span>
                        <h2 className="section-title">왜 메디케어를 선택해야 할까요?</h2>
                        <p className="section-description">최첨단 기술과 편리함으로 새로운 의료 경험을 제공합니다</p>
                    </div>
                    <div className="features-grid">
                        <FeatureCard icon="brain" title="AI 맞춤 추천" desc="증상과 위치를 분석하여 가장 적합한 병원과 의사를 AI가 추천해드립니다." />
                        <FeatureCard icon="calendar-days" title="실시간 예약" desc="병원의 실시간 예약 현황을 확인하고 즉시 예약할 수 있습니다." />
                        <FeatureCard icon="star" title="실제 리뷰" desc="검증된 환자들의 실제 리뷰와 평점을 확인하고 신뢰할 수 있는 병원을 선택하세요." />
                        <FeatureCard icon="bell" title="알림 서비스" desc="예약 시간 알림부터 진료 결과까지 중요한 정보를 놓치지 마세요." />
                        <FeatureCard icon="shield-halved" title="안전한 보안" desc="의료 정보는 철저한 보안 시스템으로 안전하게 보호됩니다." />
                        <FeatureCard icon="headset" title="24/7 고객지원" desc="언제든지 궁금한 사항을 문의하실 수 있는 고객 지원 서비스를 제공합니다." />
                    </div>
                </div>
            </section>

            {/* 4. Popular Departments Section */}
            <section className="departments">
                <div className="container">
                    <div className="section-header">
                        <span className="section-badge">Departments</span>
                        <h2 className="section-title">인기 진료과목</h2>
                        <p className="section-description">가장 많이 찾는 진료과목을 확인하세요</p>
                    </div>
                    <div className="departments-grid">
                        <DeptCard icon="tooth" title="치과" count="320" />
                        <DeptCard icon="bone" title="정형외과" count="285" />
                        <DeptCard icon="eye" title="안과" count="198" />
                        <DeptCard icon="heartbeat" title="내과" count="420" />
                        <DeptCard icon="ear-listen" title="이비인후과" count="156" />
                        <DeptCard icon="baby" title="소아청소년과" count="234" />
                        <DeptCard icon="face-smile" title="피부과" count="267" />
                        <DeptCard icon="brain" title="신경외과" count="142" />
                    </div>
                </div>
            </section>

            {/* 5. How It Works Section */}
            <section className="how-it-works">
                <div className="container">
                    <div className="section-header">
                        <span className="section-badge">Process</span>
                        <h2 className="section-title">이용 방법</h2>
                        <p className="section-description">3단계로 간편하게 병원 예약을 완료하세요</p>
                    </div>
                    <div className="steps-container">
                        <Step num="1" icon="magnifying-glass" title="병원 검색" desc="증상과 위치를 입력하여 적합한 병원을 찾아보세요" />
                        <div className="step-arrow"><i className="fas fa-arrow-right"></i></div>
                        <Step num="2" icon="calendar-check" title="예약 신청" desc="원하는 날짜와 시간을 선택하여 예약하세요" />
                        <div className="step-arrow"><i className="fas fa-arrow-right"></i></div>
                        <Step num="3" icon="user-doctor" title="진료 받기" desc="예약 시간에 방문하여 빠르게 진료를 받으세요" />
                    </div>
                </div>
            </section>

            {/* 6. Testimonials Section */}
            <section className="testimonials">
                <div className="container">
                    <div className="section-header">
                        <span className="section-badge">Reviews</span>
                        <h2 className="section-title">이용자 후기</h2>
                        <p className="section-description">메디케어를 이용한 고객들의 실제 후기입니다</p>
                    </div>
                    <div className="testimonials-grid">
                        <TestimonialCard 
                            name="김민준" info="직장인, 서울" initial="김"
                            text="&quot;급하게 병원을 찾아야 했는데 메디케어 덕분에 빠르게 예약하고 진료받을 수 있었어요. 정말 편리한 서비스입니다!&quot;" 
                        />
                        <TestimonialCard 
                            name="이서연" info="주부, 경기" initial="이"
                            text="&quot;리뷰를 보고 병원을 선택할 수 있어서 좋았어요. 실제로 방문했을 때도 리뷰대로 친절하고 실력있는 의사 선생님이셨습니다.&quot;" 
                        />
                        <TestimonialCard 
                            name="박지훈" info="대학생, 부산" initial="박"
                            text="&quot;예약 알림 기능이 정말 유용해요. 바쁜 일상에서 예약을 잊어버릴 뻔 했는데 알림 덕분에 잘 다녀왔습니다.&quot;" 
                        />
                    </div>
                </div>
            </section>

            {/* 7. CTA Section */}
            <section className="cta">
                <div className="container">
                    <div className="cta-content">
                        <h2>지금 바로 시작하세요</h2>
                        <p>메디케어와 함께 더 나은 의료 경험을 만들어보세요</p>
                        <div className="cta-buttons">
                            <button className="btn-cta-primary"><i className="fas fa-user-plus"></i> 무료 회원가입</button>
                            <button className="btn-cta-secondary"><i className="fas fa-play"></i> 서비스 소개 영상</button>
                        </div>
                    </div>
                </div>
            </section>

            {/* 8. Footer */}
            <footer className="footer">
                <div className="container">
                    <div className="footer-content">
                        <div className="footer-section">
                            <div className="footer-logo"><i className="fas fa-heart-pulse"></i><span>메디케어</span></div>
                            <p className="footer-description">스마트한 병원 예약으로<br />건강한 내일을 만들어갑니다</p>
                        </div>
                        <FooterLinks title="서비스" links={["병원 찾기", "진료과목", "예약 관리", "의료진 소개"]} />
                        <FooterLinks title="고객지원" links={["공지사항", "FAQ", "1:1 문의", "이용가이드"]} />
                        <FooterLinks title="회사소개" links={["회사 소개", "채용 정보", "제휴 문의", "이용약관"]} />
                    </div>
                    <div className="footer-bottom">
                        <p>&copy; 2026 메디케어. All rights reserved.</p>
                        <div className="footer-links">
                            <a href="#">개인정보처리방침</a>
                            <a href="#">이용약관</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

// --- 컴포넌트 내에서 사용할 작은 서브 컴포넌트들 (코드 중복 방지) ---

const FeatureCard = ({ icon, title, desc }) => (
    <div className="feature-card">
        <div className="feature-icon"><i className={`fas fa-${icon}`}></i></div>
        <h3>{title}</h3>
        <p>{desc}</p>
    </div>
);

const DeptCard = ({ icon, title, count }) => (
    <div className="dept-card" onClick={() => alert(`${title} 진료과를 선택하셨습니다.`)}>
        <div className="dept-icon"><i className={`fas fa-${icon}`}></i></div>
        <h3>{title}</h3>
        <p>{count}개 병원</p>
    </div>
);

const Step = ({ num, icon, title, desc }) => (
    <div className="step">
        <div className="step-number">{num}</div>
        <div className="step-icon"><i className={`fas fa-${icon}`}></i></div>
        <h3>{title}</h3>
        <p>{desc}</p>
    </div>
);

const TestimonialCard = ({ name, info, initial, text }) => (
    <div className="testimonial-card">
        <div className="rating">
            {[...Array(5)].map((_, i) => <i key={i} className="fas fa-star"></i>)}
        </div>
        <p className="testimonial-text" dangerouslySetInnerHTML={{ __html: text }}></p>
        <div className="testimonial-author">
            <div className="author-avatar">{initial}</div>
            <div>
                <div className="author-name">{name}</div>
                <div className="author-info">{info}</div>
            </div>
        </div>
    </div>
);

const FooterLinks = ({ title, links }) => (
    <div className="footer-section">
        <h4>{title}</h4>
        <ul>{links.map((link, i) => <li key={i}><a href="#">{link}</a></li>)}</ul>
    </div>
);

export default MainPage;