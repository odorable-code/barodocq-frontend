# BaroDocQ Frontend (바로닥큐 프론트엔드)

> **병원 예약 및 약국 검색 웹 서비스 — 프론트엔드 모듈**

가까운 병원을 예약하고 약국을 검색할 수 있는 웹 서비스의 프론트엔드입니다.
React 기반 SPA로 구성되어 있으며, 백엔드(Spring Boot) API와 연동됩니다.

`패스트캠퍼스 풀스택 개발자 양성과정` · `팀 프로젝트 (4인)` · `2026.03 ~ 2026.04`

---

## 관련 레포지토리

- **Frontend (이 레포)** — [barodocq-frontend](https://github.com/odorable-code/barodocq-frontend)
- **Backend** — [barodocq-backend](https://github.com/odorable-code/barodocq-backend)

---

## 기술 스택

- **React**
- **JavaScript**, **CSS**
- **GitHub Actions** (CI/CD)



## 주요 기능

### 병원 예약
- 병원 검색 및 상세 정보 조회
- 예약 신청 및 관리

### 약국 검색
- 위치·정보 기반 약국 검색

### 마이페이지
- 회원 정보 수정
- 예약 내역 조회
- 즐겨찾기한 병원·약국 관리
- 작성한 리뷰 관리

---

## 데이터 출처

병원·약국 데이터는 백엔드에서 다음 공공 데이터를 스크래핑·적재하여 제공합니다.

- 건강보험심사평가원
- 공공데이터포털

---

## 프로젝트 구조

```
barodocq-frontend/
├── public/
├── src/
├── .github/workflows/   # CI/CD 설정
├── package.json
└── .env
```

---

## 실행 방법

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm start

# 빌드
npm run build
```

`.env` 파일에 백엔드 API 주소를 설정해 주세요.

```env
REACT_APP_API_URL=http://localhost:8080
```

---

## 팀 구성

총 4인 팀 프로젝트입니다.

---

## 라이선스

본 프로젝트는 학습 및 포트폴리오 목적으로 개발되었습니다.
