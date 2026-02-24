import "./hoAndPharNoti.css"
import { useNavigate } from 'react-router-dom';

function HoAndPharNoti(){

    const navigate = useNavigate();

    return (
        <div className="web">
            <div className="container">
                <div className="question">예약한 병원과 비슷한 시간대와 장소의 약국을 찾아보시겠습니까?</div>
                <div className="container2" >
                    <div className="reservation" onClick={() => navigate("/mypage/나의 예약 현황")}>예약 장소 / 예약 일시</div>
                    <div className="img" onClick={() => navigate("/hos_detail/:hospitalId")}>예약 병원 이미지</div>
                </div>
                <div className="container3">
                    <button type="button" className="letsFind" onClick={navigate("/병원약국매칭페이지")}>주변 가까운 약국과 시간대 찾아보기(지도 배경)</button>
                    <button type="button" className="go" onClick={navigate("/병원약국매칭페이지")}>{">"}</button>
                </div>
            </div>
        </div>
    );
}
export default HoAndPhar공지;   
