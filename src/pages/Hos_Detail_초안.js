import { useParams, useNavigate } from "react-router-dom";
import "./Hos_Detail_초안.css";

export default function HospitalDetailPage() {
  const { hospitalId } = useParams();
  const navigate = useNavigate();

  // TODO: 나중에 hospitalId로 API 호출해서 실제 데이터로 교체
  const hospital = {
    id: hospitalId,
    name: "병원이름",
    dept: "진료과",
    distance: "거리(내위치로부터)",
    address: "주소",
    closing: "진료종료/마감",
    holiday: "휴진일",
    hours: "영업일/영업시간/점심시간/배튼(누르면 상세 정보)",
    options: ["야간진료", "공휴일진료", "운영여부", "의사수", "주차가능여부"],
  };

  return (
    <div className="hd">
      
      {/* 상단바 자리만 (공통 TopBar 추후 연결 예정) */}
      <div className="hd__topbar-placeholder">
        상단바 자리
      </div>

      <main className="hd__content">
        {/* 상단 제목/예약 */}
        <div className="hd__title-row">
          <div className="hd__title-left">
            <div className="hd__name">{hospital.name}</div>
            <div className="hd__dept">{hospital.dept}</div>
          </div>

          <div className="hd__title-right">
            <button className="hd__reserve" onClick={() => alert("예약하기")}>
              예약
            </button>
          </div>
        </div>

        {/* 이미지/길찾기 카드 2개 */}
        <div className="hd__hero">
          <div className="hd__hero-box">
            <div className="hd__hero-label">사진</div>
          </div>
          <div className="hd__hero-box">
            <div className="hd__hero-label">길찾기</div>
          </div>
        </div>

        {/* 정보 줄 */}
        <div className="hd__info">
          <div className="hd__info-left">
            <div className="hd__info-line">{hospital.closing}</div>
            <div className="hd__info-line">{hospital.holiday}</div>
            <div className="hd__info-line">{hospital.hours}</div>
          </div>

          <div className="hd__info-right">
            <div className="hd__info-cols">
              <div className="hd__col">
                <div className="hd__col-title">거리(내위치로부터)</div>
                <div className="hd__col-value">{hospital.distance}</div>
              </div>
              <div className="hd__col">
                <div className="hd__col-title">주소</div>
                <div className="hd__col-value">{hospital.address}</div>
              </div>
            </div>
          </div>
        </div>

        {/* 옵션 칩 */}
        <div className="hd__chips">
          {hospital.options.map((opt) => (
            <button key={opt} className="hd__chip" type="button">
              {opt}
            </button>
          ))}
        </div>

        {/* 후기 */}
        <section className="hd__review">
          <div className="hd__review-title">
            후기 <span className="hd__star">☆</span>
          </div>

          <div className="hd__review-box">
            <div className="hd__review-empty">아직 리뷰가 없어요</div>
          </div>
        </section>

        <div className="hd__bottom">
          <button className="hd__back" onClick={() => navigate(-1)}>
            ← 뒤로가기
          </button>
          <div className="hd__debug">hospitalId: {hospitalId}</div>
        </div>
      </main>
    </div>
  );
}