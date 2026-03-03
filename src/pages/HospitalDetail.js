import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate }       from "react-router-dom";
import { useSocket }                    from "../WebSocketContext";
import { useAuth }                      from "../AuthContext";
import "../assets/styles/HospitalDetail.css";
import Chat from "../Chat/Chat";


const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";

const toBool = (v) => {
  if (v === true || v === false) return v;
  if (v === 1 || v === 0) return Boolean(v);
  if (v == null) return false;
  const s = String(v).trim().toUpperCase();
  if (["Y","YES","TRUE","T","1"].includes(s)) return true;
  if (["N","NO","FALSE","F","0"].includes(s)) return false;
  const n = Number(v);
  if (!Number.isNaN(n)) return n === 1;
  return false;
};
const stripSeconds = (t) => {
  if (!t) return "";
  const s = String(t).trim();
  const m = s.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  return m ? `${m[1].padStart(2,"0")}:${m[2]}` : s;
};
const formatTimeRange = (o, c) => {
  const ot = stripSeconds(o), ct = stripSeconds(c);
  return ot && ct ? `${ot} ~ ${ct}` : "운영시간 정보 없음";
};
const formatLunch = (s, e) => {
  const st = stripSeconds(s), et = stripSeconds(e);
  return st && et ? `점심 ${st} ~ ${et}` : "";
};
const formatDate = (v) => {
  if (!v) return "";
  const s = String(v);
  return s.length >= 10 ? s.slice(0,10) : s;
};

function Stars({ score = 0 }) {
  return (
    <span className="hd2__stars">
      {Array.from({ length: 5 }, (_, i) => {
        const fill = Math.min(1, Math.max(0, score - i));
        return (
          <i key={i} className={
            fill >= 1   ? "fas fa-star" :
            fill >= 0.5 ? "fas fa-star-half-stroke" :
                          "far fa-star"
          } />
        );
      })}
    </span>
  );
}

export default function HospitalDetail() {
  const { hospitalId } = useParams();
  const navigate       = useNavigate();

  const { user }                                      = useAuth();
  const { createRoom, setActiveChatRoom, setNotifOpen } = useSocket();

  const [summary, setSummary] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const {
    setCmContents   
  } = useSocket();

  useEffect(() => {
    let ignore = false; // 데이터가 늦게 도착했을 때, 이미 떠나버린 페이지의 상태를 업데이트하려고 시도하다가 발생하는 에러(Memory Leak)를 막아주는 거절용 스위치
    async function loadData() {
      if (!hospitalId) return;
      setLoading(true); // 시간이 걸릴 때 "데이터를 가져오는 중이니 잠시만 기다려주세요"라는 표시(예: 빙글빙글 도는 아이콘이나 로딩 메시지)를 보여주기 위해
      setError(""); //에러 메시지 통을 깨끗하게 비워
      try {
        const [sumRes, revRes] = await Promise.all([ // 두 개의 fetch를 동시에 요청
          fetch(`${API_BASE_URL}/api/v1/hospitals/${hospitalId}/summary`), // summary의 결과값이 sumRes에 들어감
          fetch(`${API_BASE_URL}/api/v1/hospitals/${hospitalId}/reviews?limit=3`), // reviews의 결과값이 revRes에 들어감
        ]);
        if (!sumRes.ok) throw new Error(`병원 정보 로드 실패 (${sumRes.status})`); 
        if (!revRes.ok) throw new Error(`리뷰 로드 실패 (${revRes.status})`);
        const [sumData, revData] = await Promise.all([sumRes.json(), revRes.json()]);
        if (!ignore) {
          setSummary({ ...sumData, hoNightYn: toBool(sumData.hoNightYn), hoHolidayYn: toBool(sumData.hoHolidayYn) });
          setReviews(Array.isArray(revData) ? revData : []);
          console.log(sumData)
        }
      } catch (e) {
        if (!ignore) setError(e?.message || "에러 발생");
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    loadData();
    return () => { ignore = true; };
  }, [hospitalId]);

  const handleChatOpen = async () => {
    if (!user) { navigate("/login"); return; }
    if (!summary) return;

    const room = await createRoom({
      hospitalId:   String(hospitalId),
      hospitalName: summary.hoName,
      dept:         summary.deptName || "상담",
      avatar:       summary.hoName?.slice(0, 1) || "병",
    });

    if (room) {
      setActiveChatRoom(room);
      setNotifOpen(true); // ✅ 패널 + 채팅창 열기
    }
  };

  const tags = useMemo(() => {
    if (!summary) return [];
    const arr = [];
    if (summary.hoNightYn)   arr.push({ label:"야간진료",   icon:"fa-moon",         cls:"night"   });
    if (summary.hoHolidayYn) arr.push({ label:"공휴일진료", icon:"fa-calendar-star", cls:"holiday" });
    return arr;
  }, [summary]);

  const timeText  = formatTimeRange(summary?.hhOpenTime,  summary?.hhCloseTime);
  const lunchText = formatLunch(summary?.hhLunchStart, summary?.hhLunchEnd);

  if (loading) return (
    <div className="hd2__fullstate">
      <i className="fas fa-spinner fa-spin" />
      <span>병원 정보를 불러오는 중...</span>
    </div>
  );
  if (error) return (
    <div className="hd2__fullstate hd2__fullstate--err">
      <i className="fas fa-triangle-exclamation" />
      <p>{error}</p>
      <button onClick={() => navigate(-1)}>
        <i className="fas fa-arrow-left" />돌아가기
      </button>
    </div>
  );

  const aaaaa = ()=>{

    //로그인 여부 확인 후 처리 작업
    const isLoggedIn = !!localStorage.getItem("accessToken"); //토큰이 있으면 true, 없으면 false. !!를 통해 값을 true 또는 false로 가져옴

    if (!isLoggedIn) {
    alert("로그인 후 이용 가능합니다.");
    return; // 로그인이 안 되어 있으면 아래 코드를 실행하지 않고 함수를 여기서 종료합니다.
    }

    //통신으로 해당 병원과 회원 사이의 채팅방 정보를 가져옴(없으면 추가 후 가져옴)
    //userNum 가져옴
    const userNum = user.num;
    console.log(userNum);

    //setActiveChatRoom을 이용하여 선택된 채팅방 정보를 가져옴
    //채팅방 정보: cr_num, ho_num, user_num, cm_sender_type, 
    // setActiveChatRoom({
    //   hospital : "dd"})
    const ho_num = parseInt(window.location.pathname.replace(/\/details\//i, ""));

    const getChatRoomInfo = async () => {
      try {
        const response = await fetch(`/api/chat/chatRoom`, {
          method : "POST",
          headers : {
            'Content-Type' : 'application/json'
          },
          body : JSON.stringify({
          //crNum: crNum,
          //hoNum: hoNum,
          //userId: userId
        })
        });

        const data = await response.json();

      }catch (err) {
        console.error("채팅방 정보 불러오기 실패", err);
      }
    };

    setActiveChatRoom({
      //cr_num,
      //ho_num,
      //user_num,
      //cm_sender_type
    })
      
    //통신으로 해당 병원과 회원 사이의 챙팅방 메세지 기록을 가져옴 => s
    setCmContents([{cmContent : "안녕", cmCreatedAt: "2026-01-01"}])
    setNotifOpen((v) => !v);
    
  }
  return (
    <div className="hd2">
      <div className="hd2__hero">
        <div className="hd2__hero-blob" />
        <div className="hd2__hero-blob hd2__hero-blob--2" />
        <div className="hd2__hero-inner">
          <button className="hd2__back" onClick={() => navigate(-1)}>
            <i className="fas fa-arrow-left" />목록으로
          </button>
          <div className="hd2__hero-content">
            <div className="hd2__hero-icon"><i className="fas fa-hospital" /></div>
            <div className="hd2__hero-text">
              {summary?.deptName && (
                <span className="hd2__hero-dept">
                  <i className="fas fa-stethoscope" />{summary.deptName}
                </span>
              )}
              <h1 className="hd2__hero-name">{summary?.hoName ?? "병원명 없음"}</h1>
              <div className="hd2__hero-rating">
                <Stars score={summary?.rvRating ?? 0} />
                <strong className="hd2__hero-score">
                  {Number(summary?.rvRating ?? 0).toFixed(1)}
                </strong>
                <span className="hd2__hero-rcnt">
                  <i className="far fa-comment-dots" />{reviews.length}개 리뷰
                </span>
              </div>
              {tags.length > 0 && (
                <div className="hd2__hero-tags">
                  {tags.map(t => (
                    <span key={t.label} className={`hd2__hero-tag hd2__hero-tag--${t.cls}`}>
                      <i className={`fas ${t.icon}`} />{t.label}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {summary && (
        <div className="hd2__strip">
          <span className="hd2__strip-item">
            <i className="fas fa-location-dot" />{summary.hoAddr}
          </span>
          <span className="hd2__strip-sep" />
          <span className="hd2__strip-item">
            <i className="far fa-clock" />{timeText}
          </span>
          {lunchText && (
            <>
              <span className="hd2__strip-sep" />
              <span className="hd2__strip-item">
                <i className="fas fa-utensils" />{lunchText}
              </span>
            </>
          )}
          <span className="hd2__strip-sep" />
          <span className="hd2__strip-item">
            <i className="fas fa-phone" />
            <a href={`tel:${summary.hoPhone}`} className="hd2__strip-tel">{summary.hoPhone}</a>
          </span>
        </div>
      )}

      <div className="hd2__wrap">
        <aside className="hd2__left">
          <div className="hd2__reserveCard">
            <div className="hd2__reserveHead">
              <i className="fas fa-calendar-check" />빠른 예약
            </div>
            <p className="hd2__reserveDesc">
              지금 바로 온라인으로<br />간편하게 예약하세요
            </p>
            <button className="hd2__actionBtn hd2__actionBtn--primary">
              <i className="fas fa-calendar-plus" />예약하기
            </button>
            <button
              className="hd2__actionBtn hd2__actionBtn--ghost"
              onClick={handleChatOpen}
            >
              <i className="far fa-comment-dots" />
              {user ? "1:1 문의" : "로그인 후 문의"}
            </button>
          </div>

          <section className="hd2__leftCard">
            <div className="hd2__cardTitle">
              <i className="fas fa-circle-info" />병원 정보
            </div>
            {summary && (
              <>
                <div className="hd2__title">{summary.hoName}</div>
                <div className="hd2__sub">
                  <Stars score={summary.rvRating ?? 0} />
                  <span className="hd2__score-sm">{Number(summary.rvRating ?? 0).toFixed(1)}</span>
                  <span className="hd2__dot" />
                  {summary.deptName ?? "진료과 미지정"}
                </div>
                <ul className="hd2__infoList">
                  <li className="hd2__infoLine">
                    <i className="fas fa-phone hd2__infoIcon" />
                    <a href={`tel:${summary.hoPhone}`} className="hd2__tel">{summary.hoPhone}</a>
                  </li>
                  <li className="hd2__infoLine">
                    <i className="fas fa-location-dot hd2__infoIcon" />
                    <span>{summary.hoAddr}</span>
                  </li>
                  <li className="hd2__infoLine">
                    <i className="far fa-clock hd2__infoIcon" />
                    <span>{timeText}</span>
                  </li>
                  {lunchText && (
                    <li className="hd2__infoLine">
                      <i className="fas fa-utensils hd2__infoIcon" />
                      <span>{lunchText}</span>
                    </li>
                  )}
                </ul>
                {tags.length > 0 && (
                  <div className="hd2__tags">
                    {tags.map(t => (
                      <span key={t.label} className={`hd2__tag hd2__tag--${t.cls}`}>
                        <i className={`fas ${t.icon}`} />{t.label}
                      </span>
                    ))}
                  </div>
                )}
              </>
            )}
          </section>
        </aside>

        <main className="hd2__right">
          <section className="hd2__panel">
            <div className="hd2__panelTitle">
              <span className="hd2__panelIcon"><i className="fas fa-camera" /></span>병원 사진
            </div>
            <div className="hd2__panelBody hd2__photoBox">
              <i className="fas fa-image hd2__placeholder-icon" />
              <span>등록된 사진이 없습니다</span>
            </div>
          </section>

          <section className="hd2__panel">
            <div className="hd2__panelTitle">
              <span className="hd2__panelIcon"><i className="fas fa-map-location-dot" /></span>오시는 길
            </div>
            <div className="hd2__addrBar">
              <i className="fas fa-location-dot" />{summary?.hoAddr ?? "주소 정보 없음"}
            </div>
            <div className="hd2__panelBody hd2__mapBox">
              <i className="fas fa-map-pin hd2__placeholder-icon" />
              <span>지도가 여기에 표시됩니다</span>
              <button
                className="hd2__mapLink"
                onClick={() => window.open(`https://map.kakao.com/link/search/${summary?.hoName}`)}
              >
                <i className="fas fa-map-location-dot" />카카오맵으로 보기
              </button>
            </div>
          </section>

          <section className="hd2__panel">
            <div className="hd2__panelTitle">
              <span className="hd2__panelIcon"><i className="fas fa-star" /></span>
              리뷰
              {reviews.length > 0 && <span className="hd2__reviewBadge">{reviews.length}</span>}
            </div>
            <div className="hd2__reviews">
              {reviews.length === 0 ? (
                <div className="hd2__emptyReviews">
                  <i className="far fa-comment-dots" />
                  <p>등록된 리뷰가 없습니다</p>
                </div>
              ) : (
                reviews.map(rev => (
                  <div key={rev.rvNum} className="hd2__reviewRow">
                    <div className="hd2__revAvatar">
                      {rev.rfName
                        ? <img src={`${API_BASE_URL}/uploads/${rev.rfName}`} alt="리뷰" className="hd2__revAvatarImg" />
                        : <i className="fas fa-user" />
                      }
                    </div>
                    <div className="hd2__reviewContent">
                      <div className="hd2__revTop">
                        <span className="hd2__revUser">{rev.userName}님</span>
                        <div className="hd2__revRating">
                          <Stars score={rev.rvRating ?? 0} />
                          <span className="hd2__revScore">{Number(rev.rvRating ?? 0).toFixed(1)}</span>
                        </div>
                      </div>
                      <p className="hd2__reviewText">{rev.rvContent}</p>
                      <span className="hd2__revDate">
                        <i className="far fa-calendar" />{formatDate(rev.rvCreatedAt)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
            {reviews.length > 0 && (
              <div className="hd2__moreWrap">
                <button className="hd2__moreBtn" onClick={() => navigate(`/hospital/${hospitalId}/reviews`)}>
                  리뷰 전체보기 <i className="fas fa-arrow-right" />
                </button>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
