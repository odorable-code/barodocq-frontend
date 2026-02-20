import React, { useEffect, useRef, useState } from 'react';
import "../assets/styles/MainPage2.css";

const MainPage2 = () => {
    const [activeTab, setActiveTab] = useState('증상');
    const [selectedDept, setSelectedDept] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const navRef = useRef(null);
    const hamburgerRef = useRef(null);
    const navMenuRef = useRef(null);

    useEffect(() => {
        // Scroll effect
        const handleScroll = () => {
            if (window.pageYOffset > 50) {
                navRef.current?.classList.add('scrolled');
            } else {
                navRef.current?.classList.remove('scrolled');
            }
        };
        window.addEventListener('scroll', handleScroll);

        // Intersection Observer
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                }
            });
        }, observerOptions);

        document.querySelectorAll('.reveal').forEach(el => {
            revealObserver.observe(el);
        });

        return () => {
            window.removeEventListener('scroll', handleScroll);
            revealObserver.disconnect();
        };
    }, []);

    const toggleMobileMenu = () => {
        hamburgerRef.current?.classList.toggle('active');
        navMenuRef.current?.classList.toggle('active');
    };

    return (
        <div className="app-container">
            {/* Navigation */}
            <nav className="navbar" ref={navRef}>
                <div className="container">
                    <div className="nav-wrapper">
                        <div className="logo">
                            <div className="logo-icon">
                                <i className="fas fa-heartbeat"></i>
                            </div>
                            <span className="logo-text">MediCare</span>
                        </div>
                        
                        <ul className="nav-menu" ref={navMenuRef}>
                            <li><a href="#home" className="nav-link active">홈</a></li>
                            <li><a href="#search" className="nav-link">병원찾기</a></li>
                            <li><a href="#departments" className="nav-link">진료과</a></li>
                            <li><a href="#reviews" className="nav-link">리뷰</a></li>
                            <li><a href="#about" className="nav-link">소개</a></li>
                        </ul>
                        
                        <div className="nav-actions">
                            <button className="btn-icon">
                                <i className="fas fa-bell"></i>
                                <span className="badge">3</span>
                            </button>
                            <button className="btn-secondary">로그인</button>
                            <button className="btn-primary">회원가입</button>
                        </div>

                        <div className="hamburger" ref={hamburgerRef} onClick={toggleMobileMenu}>
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="hero" id="home">
                <div className="hero-bg">
                    <div className="gradient-orb orb-1"></div>
                    <div className="gradient-orb orb-2"></div>
                    <div className="gradient-orb orb-3"></div>
                </div>
                
                <div className="container">
                    <div className="hero-content">
                        <div className="hero-text reveal">
                            <span className="hero-badge">
                                <span className="badge-dot"></span>
                                AI 기반 병원 추천
                            </span>
                            <h1 className="hero-title">
                                증상에 맞는<br />
                                <span className="gradient-text">최적의 병원</span>을<br />
                                빠르게 찾아보세요
                            </h1>
                            <p className="hero-desc">
                                2,500개 이상의 병원 정보와 실시간 예약 시스템으로<br />
                                더 스마트한 의료 경험을 제공합니다
                            </p>
                            
                            {/* Quick Stats */}
                            <div className="quick-stats">
                                <div className="stat-item">
                                    <div className="stat-value">2.5K+</div>
                                    <div className="stat-label">등록 병원</div>
                                </div>
                                <div className="stat-divider"></div>
                                <div className="stat-item">
                                    <div className="stat-value">50K+</div>
                                    <div className="stat-label">월간 예약</div>
                                </div>
                                <div className="stat-divider"></div>
                                <div className="stat-item">
                                    <div className="stat-value">4.8★</div>
                                    <div className="stat-label">평균 만족도</div>
                                </div>
                            </div>
                        </div>

                        {/* Advanced Search Card */}
                        <div className="search-card reveal">
                            <div className="search-header">
                                <h3>병원 검색하기</h3>
                                <div className="search-tabs">
                                    <button 
                                        className={`tab ${activeTab === '증상' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('증상')}
                                    >
                                        증상별
                                    </button>
                                    <button 
                                        className={`tab ${activeTab === '진료과' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('진료과')}
                                    >
                                        진료과별
                                    </button>
                                    <button 
                                        className={`tab ${activeTab === '위치' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('위치')}
                                    >
                                        위치별
                                    </button>
                                </div>
                            </div>

                            <div className="search-body">
                                {activeTab === '증상' && (
                                    <div className="search-section">
                                        <div className="input-group">
                                            <i className="fas fa-search"></i>
                                            <input 
                                                type="text" 
                                                placeholder="예: 두통, 복통, 발열 등 증상을 입력하세요"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                            />
                                        </div>
                                        
                                        <div className="popular-symptoms">
                                            <span className="label">자주 찾는 증상</span>
                                            <div className="tag-list">
                                                <button className="tag">감기 <i className="fas fa-fire"></i></button>
                                                <button className="tag">두통</button>
                                                <button className="tag">복통</button>
                                                <button className="tag">발열</button>
                                                <button className="tag">기침</button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === '진료과' && (
                                    <div className="search-section">
                                        <div className="dept-grid">
                                            {['내과', '치과', '정형외과', '안과', '이비인후과', '피부과', '소아청소년과', '산부인과'].map(dept => (
                                                <button 
                                                    key={dept}
                                                    className={`dept-btn ${selectedDept === dept ? 'selected' : ''}`}
                                                    onClick={() => setSelectedDept(dept)}
                                                >
                                                    <i className="fas fa-hospital"></i>
                                                    <span>{dept}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {activeTab === '위치' && (
                                    <div className="search-section">
                                        <div className="input-group">
                                            <i className="fas fa-map-marker-alt"></i>
                                            <input 
                                                type="text" 
                                                placeholder="주소 또는 동네 이름을 입력하세요"
                                            />
                                            <button className="btn-location">
                                                <i className="fas fa-crosshairs"></i>
                                                현재 위치
                                            </button>
                                        </div>
                                        
                                        <div className="distance-slider">
                                            <label>검색 반경: <strong>3km</strong></label>
                                            <input type="range" min="1" max="10" defaultValue="3" />
                                            <div className="slider-labels">
                                                <span>1km</span>
                                                <span>10km</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <button className="btn-search-primary">
                                    <i className="fas fa-search"></i>
                                    병원 검색하기
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Hospital List Section */}
            <section className="hospital-section" id="search">
                <div className="container">
                    <div className="section-header reveal">
                        <div>
                            <span className="section-badge">NEARBY HOSPITALS</span>
                            <h2 className="section-title">근처 병원 추천</h2>
                            <p className="section-desc">현재 위치 기준 5km 이내 병원</p>
                        </div>
                        
                        <div className="filter-controls">
                            <button className="filter-btn active">
                                <i className="fas fa-fire"></i>
                                인기순
                            </button>
                            <button className="filter-btn">
                                <i className="fas fa-star"></i>
                                평점순
                            </button>
                            <button className="filter-btn">
                                <i className="fas fa-map-marker-alt"></i>
                                거리순
                            </button>
                            <button className="filter-btn">
                                <i className="fas fa-clock"></i>
                                대기시간순
                            </button>
                        </div>
                    </div>

                    <div className="hospital-grid">
                        <HospitalCard 
                            name="서울대학교병원"
                            dept="종합병원"
                            rating={4.9}
                            reviews={2847}
                            distance="1.2km"
                            waitTime="15분"
                            status="진료중"
                            tags={['주차가능', '야간진료', '응급실']}
                            image="🏥"
                        />
                        <HospitalCard 
                            name="연세세브란스병원"
                            dept="종합병원"
                            rating={4.8}
                            reviews={3201}
                            distance="2.5km"
                            waitTime="25분"
                            status="진료중"
                            tags={['주차가능', '외국어진료']}
                            image="🏥"
                        />
                        <HospitalCard 
                            name="삼성서울병원"
                            dept="종합병원"
                            rating={4.9}
                            reviews={4132}
                            distance="3.8km"
                            waitTime="30분"
                            status="진료중"
                            tags={['주차가능', '첨단장비', '로봇수술']}
                            image="🏥"
                        />
                        <HospitalCard 
                            name="아산병원"
                            dept="종합병원"
                            rating={4.7}
                            reviews={2654}
                            distance="4.2km"
                            waitTime="20분"
                            status="진료중"
                            tags={['주차가능', '암센터']}
                            image="🏥"
                        />
                        <HospitalCard 
                            name="강남성모병원"
                            dept="종합병원"
                            rating={4.8}
                            reviews={1987}
                            distance="2.1km"
                            waitTime="18분"
                            status="진료중"
                            tags={['주차가능', '건강검진']}
                            image="🏥"
                        />
                        <HospitalCard 
                            name="고려대학교병원"
                            dept="종합병원"
                            rating={4.6}
                            reviews={1543}
                            distance="5.0km"
                            waitTime="35분"
                            status="혼잡"
                            tags={['주차가능', '재활의학']}
                            image="🏥"
                        />
                    </div>
                </div>
            </section>

            {/* Departments Section */}
            <section className="departments-section" id="departments">
                <div className="container">
                    <div className="section-header reveal">
                        <span className="section-badge">DEPARTMENTS</span>
                        <h2 className="section-title">진료과별 찾기</h2>
                        <p className="section-desc">전문 진료과를 선택하여 최적의 병원을 찾아보세요</p>
                    </div>

                    <div className="dept-list">
                        <DeptCard icon="fa-stethoscope" name="내과" count="420" color="#14b8a6" />
                        <DeptCard icon="fa-tooth" name="치과" count="320" color="#0d9488" />
                        <DeptCard icon="fa-bone" name="정형외과" count="285" color="#0f766e" />
                        <DeptCard icon="fa-eye" name="안과" count="198" color="#14b8a6" />
                        <DeptCard icon="fa-ear-listen" name="이비인후과" count="156" color="#0d9488" />
                        <DeptCard icon="fa-spa" name="피부과" count="267" color="#0f766e" />
                        <DeptCard icon="fa-baby" name="소아청소년과" count="234" color="#14b8a6" />
                        <DeptCard icon="fa-venus" name="산부인과" count="189" color="#0d9488" />
                        <DeptCard icon="fa-brain" name="신경외과" count="142" color="#0f766e" />
                        <DeptCard icon="fa-heart-pulse" name="심장내과" count="176" color="#14b8a6" />
                        <DeptCard icon="fa-lungs" name="호흡기내과" count="203" color="#0d9488" />
                        <DeptCard icon="fa-syringe" name="마취통증의학과" count="154" color="#0f766e" />
                    </div>
                </div>
            </section>

            {/* Booking Process */}
            <section className="process-section">
                <div className="container">
                    <div className="section-header reveal">
                        <span className="section-badge">HOW IT WORKS</span>
                        <h2 className="section-title">예약 프로세스</h2>
                        <p className="section-desc">3단계로 간편하게 병원 예약을 완료하세요</p>
                    </div>

                    <div className="process-flow">
                        <ProcessStep 
                            num="01"
                            icon="fa-search-location"
                            title="병원 검색"
                            desc="증상, 진료과, 위치 등으로 최적의 병원을 찾아보세요"
                            color="#14b8a6"
                        />
                        <div className="flow-arrow">
                            <i className="fas fa-arrow-right"></i>
                        </div>
                        <ProcessStep 
                            num="02"
                            icon="fa-calendar-check"
                            title="날짜 선택"
                            desc="실시간 예약 가능 시간을 확인하고 편한 시간을 선택하세요"
                            color="#0d9488"
                        />
                        <div className="flow-arrow">
                            <i className="fas fa-arrow-right"></i>
                        </div>
                        <ProcessStep 
                            num="03"
                            icon="fa-hospital-user"
                            title="진료 완료"
                            desc="예약 확인 후 병원 방문하여 빠르게 진료를 받으세요"
                            color="#0f766e"
                        />
                    </div>

                    {/* Quick Booking Demo */}
                    <div className="booking-demo reveal">
                        <div className="demo-header">
                            <h3>빠른 예약 미리보기</h3>
                            <span className="demo-badge">DEMO</span>
                        </div>
                        
                        <div className="booking-steps">
                            <div className="booking-col">
                                <label>진료과 선택</label>
                                <select className="select-input">
                                    <option>내과</option>
                                    <option>치과</option>
                                    <option>정형외과</option>
                                    <option>안과</option>
                                </select>
                            </div>

                            <div className="booking-col">
                                <label>예약 날짜</label>
                                <div className="date-picker">
                                    <input type="date" className="date-input" />
                                    <i className="fas fa-calendar"></i>
                                </div>
                            </div>

                            <div className="booking-col">
                                <label>예약 시간</label>
                                <div className="time-slots">
                                    <button className="time-slot">09:00</button>
                                    <button className="time-slot active">10:30</button>
                                    <button className="time-slot">14:00</button>
                                    <button className="time-slot disabled">15:30</button>
                                </div>
                            </div>
                        </div>

                        <button className="btn-booking-submit">
                            <i className="fas fa-check-circle"></i>
                            예약하기
                        </button>
                    </div>
                </div>
            </section>

            {/* Reviews Section */}
            <section className="reviews-section" id="reviews">
                <div className="container">
                    <div className="section-header reveal">
                        <span className="section-badge">REVIEWS</span>
                        <h2 className="section-title">실제 사용자 후기</h2>
                        <p className="section-desc">메디케어를 이용한 분들의 생생한 경험담</p>
                    </div>

                    <div className="reviews-grid">
                        <ReviewCard 
                            name="김서연"
                            role="직장인 · 32세"
                            avatar="김"
                            rating={5}
                            date="2일 전"
                            text="AI 추천 기능이 정말 정확해요. 두통 증상을 입력했더니 신경과 전문의가 있는 병원을 추천해줬고, 실제로 가서 정확한 진단을 받았습니다. 대기시간도 정확하게 표시되어서 시간 낭비 없이 진료 받을 수 있었어요!"
                            hospital="세브란스병원 신경과"
                        />
                        <ReviewCard 
                            name="이준호"
                            role="프리랜서 · 28세"
                            avatar="이"
                            rating={5}
                            date="5일 전"
                            text="야간 진료 가능한 병원을 급하게 찾아야 했는데, 필터 기능으로 바로 찾을 수 있었습니다. 실시간 예약도 너무 편하고, 병원 리뷰를 보고 선택할 수 있어서 안심하고 방문했어요. 정말 유용한 서비스입니다!"
                            hospital="강남연세병원 응급의학과"
                        />
                        <ReviewCard 
                            name="박민지"
                            role="대학생 · 24세"
                            avatar="박"
                            rating={4.5}
                            date="1주일 전"
                            text="처음으로 혼자 병원 예약을 해봤는데 너무 쉬웠어요. 거리순 정렬로 학교 근처 병원을 찾고, 학생 할인이 되는지까지 확인할 수 있었습니다. 예약 알림도 와서 놓치지 않았어요. 강력 추천합니다!"
                            hospital="서울대병원 가정의학과"
                        />
                    </div>

                    <div className="review-stats reveal">
                        <div className="stat-box">
                            <div className="stat-number">4.9/5.0</div>
                            <div className="stat-label">평균 평점</div>
                            <div className="star-row">
                                <i className="fas fa-star"></i>
                                <i className="fas fa-star"></i>
                                <i className="fas fa-star"></i>
                                <i className="fas fa-star"></i>
                                <i className="fas fa-star-half-alt"></i>
                            </div>
                        </div>
                        <div className="stat-box">
                            <div className="stat-number">50,482</div>
                            <div className="stat-label">누적 리뷰</div>
                        </div>
                        <div className="stat-box">
                            <div className="stat-number">98.5%</div>
                            <div className="stat-label">재방문률</div>
                        </div>
                        <div className="stat-box">
                            <div className="stat-number">4.2분</div>
                            <div className="stat-label">평균 예약시간</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="container">
                    <div className="cta-card reveal">
                        <div className="cta-content">
                            <div className="cta-icon">
                                <i className="fas fa-mobile-alt"></i>
                            </div>
                            <h2>지금 바로 시작하세요</h2>
                            <p>간편한 회원가입으로 메디케어의 모든 기능을 이용해보세요</p>
                            <div className="cta-features">
                                <div className="cta-feature">
                                    <i className="fas fa-check-circle"></i>
                                    <span>무료 회원가입</span>
                                </div>
                                <div className="cta-feature">
                                    <i className="fas fa-check-circle"></i>
                                    <span>즉시 예약 가능</span>
                                </div>
                                <div className="cta-feature">
                                    <i className="fas fa-check-circle"></i>
                                    <span>24시간 고객지원</span>
                                </div>
                            </div>
                            <div className="cta-buttons">
                                <button className="btn-cta-primary">
                                    <i className="fas fa-rocket"></i>
                                    무료로 시작하기
                                </button>
                                <button className="btn-cta-secondary">
                                    <i className="fas fa-play-circle"></i>
                                    서비스 소개 영상
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <div className="container">
                    <div className="footer-main">
                        <div className="footer-brand">
                            <div className="logo">
                                <div className="logo-icon">
                                    <i className="fas fa-heartbeat"></i>
                                </div>
                                <span className="logo-text">MediCare</span>
                            </div>
                            <p className="footer-desc">
                                AI 기술로 더 나은 의료 경험을 제공하는<br />
                                스마트 병원 예약 플랫폼
                            </p>
                            <div className="social-links">
                                <a href="#" className="social-link">
                                    <i className="fab fa-facebook-f"></i>
                                </a>
                                <a href="#" className="social-link">
                                    <i className="fab fa-instagram"></i>
                                </a>
                                <a href="#" className="social-link">
                                    <i className="fab fa-twitter"></i>
                                </a>
                                <a href="#" className="social-link">
                                    <i className="fab fa-youtube"></i>
                                </a>
                            </div>
                        </div>

                        <div className="footer-links">
                            <div className="footer-col">
                                <h4>서비스</h4>
                                <ul>
                                    <li><a href="#">병원 찾기</a></li>
                                    <li><a href="#">예약 관리</a></li>
                                    <li><a href="#">리뷰 작성</a></li>
                                    <li><a href="#">건강 정보</a></li>
                                </ul>
                            </div>
                            <div className="footer-col">
                                <h4>고객지원</h4>
                                <ul>
                                    <li><a href="#">공지사항</a></li>
                                    <li><a href="#">FAQ</a></li>
                                    <li><a href="#">1:1 문의</a></li>
                                    <li><a href="#">이용가이드</a></li>
                                </ul>
                            </div>
                            <div className="footer-col">
                                <h4>병원 제휴</h4>
                                <ul>
                                    <li><a href="#">병원 등록</a></li>
                                    <li><a href="#">광고 문의</a></li>
                                    <li><a href="#">파트너 센터</a></li>
                                    <li><a href="#">API 문서</a></li>
                                </ul>
                            </div>
                            <div className="footer-col">
                                <h4>회사</h4>
                                <ul>
                                    <li><a href="#">회사 소개</a></li>
                                    <li><a href="#">채용</a></li>
                                    <li><a href="#">언론 보도</a></li>
                                    <li><a href="#">투자 정보</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="footer-bottom">
                        <div className="footer-legal">
                            <a href="#">이용약관</a>
                            <span>·</span>
                            <a href="#" className="privacy">개인정보처리방침</a>
                            <span>·</span>
                            <a href="#">위치기반서비스 이용약관</a>
                        </div>
                        <p className="copyright">
                            © 2026 MediCare Inc. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

// Sub Components
const HospitalCard = ({ name, dept, rating, reviews, distance, waitTime, status, tags, image }) => (
    <div className="hospital-card reveal">
        <div className="hospital-header">
            <div className="hospital-image">{image}</div>
            <div className="hospital-status">
                <span className={`status-badge ${status === '진료중' ? 'open' : 'busy'}`}>
                    {status}
                </span>
            </div>
        </div>
        
        <div className="hospital-body">
            <div className="hospital-title">
                <h3>{name}</h3>
                <span className="hospital-dept">{dept}</span>
            </div>
            
            <div className="hospital-rating">
                <div className="rating-stars">
                    <i className="fas fa-star"></i>
                    <span className="rating-value">{rating}</span>
                </div>
                <span className="rating-count">리뷰 {reviews.toLocaleString()}개</span>
            </div>

            <div className="hospital-info">
                <div className="info-item">
                    <i className="fas fa-map-marker-alt"></i>
                    <span>{distance}</span>
                </div>
                <div className="info-item">
                    <i className="fas fa-clock"></i>
                    <span>대기 {waitTime}</span>
                </div>
            </div>

            <div className="hospital-tags">
                {tags.map((tag, idx) => (
                    <span key={idx} className="tag-sm">{tag}</span>
                ))}
            </div>
        </div>

        <div className="hospital-footer">
            <button className="btn-outline">
                <i className="fas fa-info-circle"></i>
                상세정보
            </button>
            <button className="btn-primary-sm">
                <i className="fas fa-calendar-plus"></i>
                예약하기
            </button>
        </div>
    </div>
);

const DeptCard = ({ icon, name, count, color }) => (
    <div className="dept-card reveal" style={{'--dept-color': color}}>
        <div className="dept-icon">
            <i className={`fas ${icon}`}></i>
        </div>
        <div className="dept-info">
            <h4>{name}</h4>
            <span>{count}개 병원</span>
        </div>
        <div className="dept-arrow">
            <i className="fas fa-chevron-right"></i>
        </div>
    </div>
);

const ProcessStep = ({ num, icon, title, desc, color }) => (
    <div className="process-step reveal" style={{'--step-color': color}}>
        <div className="step-number">{num}</div>
        <div className="step-icon">
            <i className={`fas ${icon}`}></i>
        </div>
        <h3>{title}</h3>
        <p>{desc}</p>
    </div>
);

const ReviewCard = ({ name, role, avatar, rating, date, text, hospital }) => (
    <div className="review-card reveal">
        <div className="review-header">
            <div className="review-author">
                <div className="author-avatar">{avatar}</div>
                <div className="author-info">
                    <div className="author-name">{name}</div>
                    <div className="author-role">{role}</div>
                </div>
            </div>
            <div className="review-meta">
                <div className="review-rating">
                    {[...Array(Math.floor(rating))].map((_, i) => (
                        <i key={i} className="fas fa-star"></i>
                    ))}
                    {rating % 1 !== 0 && <i className="fas fa-star-half-alt"></i>}
                </div>
                <span className="review-date">{date}</span>
            </div>
        </div>
        
        <p className="review-text">{text}</p>
        
        <div className="review-footer">
            <div className="review-hospital">
                <i className="fas fa-hospital"></i>
                <span>{hospital}</span>
            </div>
            <button className="btn-helpful">
                <i className="far fa-thumbs-up"></i>
                도움됨 (24)
            </button>
        </div>
    </div>
);

export default MainPage2;
