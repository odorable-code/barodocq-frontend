// ─── MainPage.jsx 수정사항 ───
// 기존 파일에서 아래 3가지만 바꾸면 됩니다.
//
// 1) 상단 import에 추가
// 2) useState에 selectedHoNum 추가
// 3) HospitalCard 컴포넌트 정의 수정
// 4) return 안에 모달 렌더링 추가
//
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ─── [1] import 맨 위에 추가 ───────────────────────────────────
import ReservationModal from "./ReservationModal"; // 경로는 프로젝트에 맞게 조정


// ─── [2] MainPage 컴포넌트 내부 state 추가 (기존 useState 선언 아래에) ───
const [selectedHoNum, setSelectedHoNum] = useState(null);


// ─── [3] HospitalCard 서브컴포넌트 수정 (onReserve prop 추가) ───
//  기존 HospitalCard 정의를 아래로 교체하세요.

const HospitalCard = ({ id, name, dept, address, rating, reviews, wait, distance, badge, open, onReserve }) => (
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
      <button className="btn-reserve-new" onClick={() => onReserve(id)}>
        <i className="fas fa-calendar-plus" />예약하기
      </button>
      <button className="btn-scrap-new"><i className="fas fa-bookmark" /></button>
    </div>
  </div>
);


// ─── [4] 병원 카드 그리드 렌더링 부분 수정 ───
// 기존: <HospitalCard key={h.id} {...h} />
// 수정: onReserve prop 추가

// hospital-grid-s2 안의 map을 아래처럼 수정:
{filteredHospitals.map((h) => (
  <HospitalCard
    key={h.id}
    {...h}
    onReserve={(hoNum) => setSelectedHoNum(hoNum)}
  />
))}


// ─── [5] return 의 가장 마지막 </div> 바로 앞에 모달 추가 ───
{selectedHoNum && (
  <ReservationModal
    hoNum={selectedHoNum}
    onClose={() => setSelectedHoNum(null)}
  />
)}