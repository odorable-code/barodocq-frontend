import React, { useEffect, useRef } from 'react';
import "../assets/styles/MainPage3.css";

const MainPage3 = () => {
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
        <div className="main-container-s2">
            {/* 1. Navigation */}
            <nav className="navbar-s2" ref={navRef}>
                <div className="container-s2">
                    <div className="nav-wrapper-s2">
                        <div className="logo-s2">
                            <div className="logo-icon-s2">
                                <i className="fas fa-heartbeat"></i>
                            </div>
                            <span>medicare</span>
                        </div>
                        <ul className="nav-menu-s2" ref={navMenuRef}>
                            <li><a href="#home" onClick={(e) => handleNavClick(e, '#home')} className="active">홈</a></li>
                            <li><a href="#services" onClick={(e) => handleNavClick(e, '#services')}>서비스</a></li>
                            <li><a href="#departments" onClick={(e) => handleNavClick(e, '#departments')}>진료과</a></li>
                            <li><a href="#about" onClick={(e) => handleNavClick(e, '#about')}>소개</a></li>
                            <li><a href="#contact" onClick={(e) => handleNavClick(e, '#contact')}>문의</a></li>
                        </ul>
                        <div className="nav-buttons-s2" ref={navButtonsRef}>
                            <button className="btn-text-s2">로그인</button>
                            <button className="btn-primary-s2">시작하기</button>
                        </div>
                        <div className="hamburger-s2" ref={hamburgerRef} onClick={toggleMobileMenu}>
                            <span></span><span></span><span></span>
                        </div>
                    </div>
                </div>
            </nav>

            {/* 2. Hero Section */}
            <section className="hero-s2" id="home">
                <div className="hero-blob-s2 blob-1-s2"></div>
                <div className="hero-blob-s2 blob-2-s2"></div>
                <div className="container-s2">
                    <div className="hero-content-s2">
                        <div className="hero-left-s2">
                            <span className="hero-label-s2">
                                <span className="label-icon-s2">✨</span>
                                AI 병원 추천 플랫폼
                            </span>
                            <h1 className="hero-title-s2">
                                건강한 내일을 위한<br />
                                <span className="gradient-text-s2">스마트한 선택</span>
                            </h1>
                            <p className="hero-subtitle-s2">
                                증상에 맞는 최적의 병원을 AI가 추천해드립니다.<br />
                                간편한 예약부터 진료 후기까지, 모든 것을 한곳에서
                            </p>
                            <div className="hero-search-s2">
                                <div className="search-container-s2">
                                    <div className="search-field-s2">
                                        <i className="fas fa-search"></i>
                                        <input type="text" placeholder="증상이나 진료과를 검색하세요" />
                                    </div>
                                    <button className="btn-search-s2">
                                        검색하기
                                        <i className="fas fa-arrow-right"></i>
                                    </button>
                                </div>
                                <div className="search-tags-s2">
                                    <span className="tag-s2"><i className="fas fa-fire"></i>감기</span>
                                    <span className="tag-s2"><i className="fas fa-fire"></i>치과</span>
                                    <span className="tag-s2"><i className="fas fa-fire"></i>정형외과</span>
                                </div>
                            </div>
                        </div>
                        <div className="hero-right-s2">
                            <div className="stats-card-s2" ref={heroStatsRef}>
                                <StatItem icon="hospital" number="2500" label="등록 병원" color="#14b8a6" />
                                <StatItem icon="user-doctor" number="8500" label="전문 의료진" color="#0d9488" />
                                <StatItem icon="calendar-check" number="50000" label="월간 예약" color="#0f766e" />
                            </div>
                            <div className="hero-illustration-s2">
                                <div className="illustration-circle-s2"></div>
                                <div className="illustration-icon-s2">
                                    <i className="fas fa-hospital-user"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. Features Section */}
            <section className="features-s2" id="services">
                <div className="container-s2">
                    <div className="section-header-s2">
                        <span className="section-subtitle-s2">FEATURES</span>
                        <h2 className="section-title-s2">메디케어만의 특별함</h2>
                        <p className="section-desc-s2">최첨단 기술로 더 나은 의료 경험을 제공합니다</p>
                    </div>
                    <div className="features-grid-s2">
                        <FeatureCard 
                            icon="wand-magic-sparkles" 
                            title="AI 맞춤 추천" 
                            desc="증상과 위치 기반으로 가장 적합한 병원을 인공지능이 추천합니다"
                            color="#14b8a6"
                        />
                        <FeatureCard 
                            icon="bolt" 
                            title="실시간 예약" 
                            desc="병원의 실시간 예약 가능 시간을 확인하고 즉시 예약하세요"
                            color="#0d9488"
                        />
                        <FeatureCard 
                            icon="star" 
                            title="검증된 리뷰" 
                            desc="실제 환자들의 진솔한 후기로 신뢰할 수 있는 선택을 하세요"
                            color="#0f766e"
                        />
                        <FeatureCard 
                            icon="bell" 
                            title="스마트 알림" 
                            desc="예약 시간부터 사후 관리까지 놓치지 않도록 알려드립니다"
                            color="#14b8a6"
                        />
                        <FeatureCard 
                            icon="shield-halved" 
                            title="안전한 보안" 
                            desc="의료 정보는 최고 수준의 보안 시스템으로 안전하게 보호됩니다"
                            color="#0d9488"
                        />
                        <FeatureCard 
                            icon="comments" 
                            title="24시간 지원" 
                            desc="언제든지 궁금한 점을 문의하실 수 있는 고객센터를 운영합니다"
                            color="#0f766e"
                        />
                    </div>
                </div>
            </section>

            {/* 4. Departments Section */}
            <section className="departments-s2" id="departments">
                <div className="container-s2">
                    <div className="section-header-s2">
                        <span className="section-subtitle-s2">DEPARTMENTS</span>
                        <h2 className="section-title-s2">인기 진료 과목</h2>
                        <p className="section-desc-s2">가장 많이 찾는 진료과를 확인해보세요</p>
                    </div>
                    <div className="departments-grid-s2">
                        <DeptCard icon="tooth" title="치과" count="320" gradient="linear-gradient(135deg, #14b8a6, #0d9488)" />
                        <DeptCard icon="bone" title="정형외과" count="285" gradient="linear-gradient(135deg, #0d9488, #0f766e)" />
                        <DeptCard icon="eye" title="안과" count="198" gradient="linear-gradient(135deg, #0f766e, #115e59)" />
                        <DeptCard icon="heartbeat" title="내과" count="420" gradient="linear-gradient(135deg, #14b8a6, #0d9488)" />
                        <DeptCard icon="ear-listen" title="이비인후과" count="156" gradient="linear-gradient(135deg, #0d9488, #0f766e)" />
                        <DeptCard icon="baby" title="소아청소년과" count="234" gradient="linear-gradient(135deg, #0f766e, #115e59)" />
                        <DeptCard icon="spa" title="피부과" count="267" gradient="linear-gradient(135deg, #14b8a6, #0d9488)" />
                        <DeptCard icon="brain" title="신경외과" count="142" gradient="linear-gradient(135deg, #0d9488, #0f766e)" />
                    </div>
                </div>
            </section>

            {/* 5. How It Works */}
            <section className="how-it-works-s2">
                <div className="container-s2">
                    <div className="section-header-s2">
                        <span className="section-subtitle-s2">HOW IT WORKS</span>
                        <h2 className="section-title-s2">3단계로 간편하게</h2>
                        <p className="section-desc-s2">복잡한 절차 없이 빠르게 병원 예약을 완료하세요</p>
                    </div>
                    <div className="steps-container-s2">
                        <Step 
                            num="1" 
                            icon="magnifying-glass" 
                            title="병원 검색" 
                            desc="증상과 위치를 입력하여 적합한 병원을 찾아보세요"
                            color="#14b8a6"
                        />
                        <div className="step-connector-s2">
                            <i className="fas fa-chevron-right"></i>
                        </div>
                        <Step 
                            num="2" 
                            icon="calendar-days" 
                            title="예약 신청" 
                            desc="원하는 날짜와 시간을 선택하여 간편하게 예약하세요"
                            color="#0d9488"
                        />
                        <div className="step-connector-s2">
                            <i className="fas fa-chevron-right"></i>
                        </div>
                        <Step 
                            num="3" 
                            icon="user-nurse" 
                            title="진료 받기" 
                            desc="예약 시간에 방문하여 빠르게 진료를 받으세요"
                            color="#0f766e"
                        />
                    </div>
                </div>
            </section>

            {/* 6. Testimonials */}
            <section className="testimonials-s2">
                <div className="container-s2">
                    <div className="section-header-s2">
                        <span className="section-subtitle-s2">REVIEWS</span>
                        <h2 className="section-title-s2">사용자 후기</h2>
                        <p className="section-desc-s2">메디케어를 이용한 분들의 생생한 후기입니다</p>
                    </div>
                    <div className="testimonials-grid-s2">
                        <TestimonialCard 
                            name="김서연" 
                            role="직장인" 
                            avatar="김"
                            text="AI 추천 기능이 정말 정확해요. 제 증상에 딱 맞는 병원을 찾았고, 예약도 쉽게 할 수 있었습니다!"
                            rating={5}
                        />
                        <TestimonialCard 
                            name="이준호" 
                            role="프리랜서" 
                            avatar="이"
                            text="리뷰를 보고 병원을 선택할 수 있어서 정말 좋았어요. 실제로 방문했을 때도 만족스러웠습니다."
                            rating={5}
                        />
                        <TestimonialCard 
                            name="박민지" 
                            role="대학생" 
                            avatar="박"
                            text="예약 알림 기능 덕분에 병원 예약을 놓치지 않을 수 있었어요. 정말 편리한 서비스입니다!"
                            rating={5}
                        />
                    </div>
                </div>
            </section>

            {/* 7. CTA */}
            <section className="cta-s2">
                <div className="container-s2">
                    <div className="cta-box-s2">
                        <div className="cta-content-s2">
                            <h2>지금 바로 시작해보세요</h2>
                            <p>메디케어와 함께 더 건강한 내일을 만들어가세요</p>
                        </div>
                        <div className="cta-actions-s2">
                            <button className="btn-cta-primary-s2">
                                무료로 시작하기
                                <i className="fas fa-arrow-right"></i>
                            </button>
                            <button className="btn-cta-secondary-s2">
                                <i className="fas fa-play"></i>
                                소개 영상 보기
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* 8. Footer */}
            <footer className="footer-s2">
                <div className="container-s2">
                    <div className="footer-top-s2">
                        <div className="footer-brand-s2">
                            <div className="footer-logo-s2">
                                <div className="logo-icon-s2">
                                    <i className="fas fa-heartbeat"></i>
                                </div>
                                <span>medicare</span>
                            </div>
                            <p>스마트한 병원 예약으로<br />더 건강한 내일을 만듭니다</p>
                            <div className="social-links-s2">
                                <a href="#"><i className="fab fa-facebook-f"></i></a>
                                <a href="#"><i className="fab fa-twitter"></i></a>
                                <a href="#"><i className="fab fa-instagram"></i></a>
                                <a href="#"><i className="fab fa-youtube"></i></a>
                            </div>
                        </div>
                        <FooterLinks title="서비스" links={["병원 찾기", "진료과목", "예약 관리", "리뷰"]} />
                        <FooterLinks title="고객지원" links={["공지사항", "자주 묻는 질문", "1:1 문의", "이용 가이드"]} />
                        <FooterLinks title="회사" links={["회사 소개", "채용", "제휴 문의", "약관"]} />
                    </div>
                    <div className="footer-bottom-s2">
                        <p>&copy; 2026 Medicare. All rights reserved.</p>
                        <div className="footer-links-s2">
                            <a href="#">개인정보처리방침</a>
                            <a href="#">이용약관</a>
                            <a href="#">쿠키 정책</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

// Sub Components
const StatItem = ({ icon, number, label, color }) => (
    <div className="stat-item-s2" style={{'--stat-color': color}}>
        <div className="stat-icon-s2">
            <i className={`fas fa-${icon}`}></i>
        </div>
        <div className="stat-content-s2">
            <div className="stat-number">{number}</div>
            <div className="stat-label">{label}</div>
        </div>
    </div>
);

const FeatureCard = ({ icon, title, desc, color }) => (
    <div className="feature-card-s2" style={{'--feature-color': color}}>
        <div className="feature-icon-wrapper-s2">
            <i className={`fas fa-${icon}`}></i>
        </div>
        <h3>{title}</h3>
        <p>{desc}</p>
        <div className="feature-arrow-s2">
            <i className="fas fa-arrow-right"></i>
        </div>
    </div>
);

const DeptCard = ({ icon, title, count, gradient }) => (
    <div className="dept-card-s2" style={{'--dept-gradient': gradient}}>
        <div className="dept-icon-wrapper-s2">
            <i className={`fas fa-${icon}`}></i>
        </div>
        <h3>{title}</h3>
        <p>{count}개 병원</p>
    </div>
);

const Step = ({ num, icon, title, desc, color }) => (
    <div className="step-s2" style={{'--step-color': color}}>
        <div className="step-number-s2">{num}</div>
        <div className="step-icon-wrapper-s2">
            <i className={`fas fa-${icon}`}></i>
        </div>
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
            {[...Array(rating)].map((_, i) => <i key={i} className="fas fa-star"></i>)}
        </div>
        <p className="testimonial-text-s2">{text}</p>
        <div className="testimonial-quote-s2">
            <i className="fas fa-quote-right"></i>
        </div>
    </div>
);

const FooterLinks = ({ title, links }) => (
    <div className="footer-column-s2">
        <h4>{title}</h4>
        <ul>{links.map((link, i) => <li key={i}><a href="#">{link}</a></li>)}</ul>
    </div>
);

export default MainPage3;
