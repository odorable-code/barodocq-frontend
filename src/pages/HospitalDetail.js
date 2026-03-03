import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../assets/styles/HospitalDetail.css";
import Chat from "../Chat/Chat";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";

/* ── utils ── */
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

/* ── Font Awesome 별점 ── */
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

/* ════════════════════════════════
   Hos_Detail
════════════════════════════════ */
export default function Hos_Detail() {
  const { hospitalId } = useParams();
  const navigate       = useNavigate();

  const [summary, setSummary] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  useEffect(() => {
    let ignore = false;
    async function loadData() {
      if (!hospitalId) return;
      setLoading(true); setError("");
      try {
        const [sumRes, revRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/v1/hospitals/${hospitalId}/summary`),
          fetch(`${API_BASE_URL}/api/v1/hospitals/${hospitalId}/reviews?limit=3`),
        ]);
        if (!sumRes.ok) throw new Error(`병원 정보 로드 실패 (${sumRes.status})`);
        if (!revRes.ok) throw new Error(`리뷰 로드 실패 (${revRes.status})`);
        const [sumData, revData] = await Promise.all([sumRes.json(), revRes.json()]);
        if (!ignore) {
          setSummary({ ...sumData, hoNightYn: toBool(sumData.hoNightYn), hoHolidayYn: toBool(sumData.hoHolidayYn) });
          setReviews(Array.isArray(revData) ? revData : []);
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

  const tags = useMemo(() => {
    if (!summary) return [];
    const arr = [];
    if (summary.hoNightYn)   arr.push({ label: "야간진료",   icon: "fa-moon",          cls: "night"   });
    if (summary.hoHolidayYn) arr.push({ label: "공휴일진료", icon: "fa-calendar-star",  cls: "holiday" });
    return arr;
  }, [summary]);

  const timeText  = formatTimeRange(summary?.hhOpenTime,  summary?.hhCloseTime);
  const lunchText = formatLunch(summary?.hhLunchStart, summary?.hhLunchEnd);

  /* ── 로딩 / 에러 풀스크린 ── */
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

  return (
    <div className="hd2">

      {/* ══ 히어로 ══ */}
      <div className="hd2__hero">
        <div className="hd2__hero-blob" />
        <div className="hd2__hero-blob hd2__hero-blob--2" />
        <div className="hd2__hero-inner">

          {/* 뒤로가기 */}
          <button className="hd2__back" onClick={() => navigate(-1)}>
            <i className="fas fa-arrow-left" />목록으로
          </button>

          <div className="hd2__hero-content">
            {/* 병원 아이콘 */}
            <div className="hd2__hero-icon">
              <i className="fas fa-hospital" />
            </div>

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
                  {tags.map((t) => (
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

      {/* ══ 퀵 스트립 ══ */}
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
            <a href={`tel:${summary.hoPhone}`} className="hd2__strip-tel">
              {summary.hoPhone}
            </a>
          </span>
        </div>
      )}

      {/* ══ 본문 레이아웃 ══ */}
      <div className="hd2__wrap">

        {/* ─ 사이드바 ─ */}
        <aside className="hd2__left">

          {/* 예약 카드 */}
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
            <button className="hd2__actionBtn hd2__actionBtn--ghost">
              <i className="far fa-comment-dots" />1:1 문의
            </button>
          </div>

          {/* 병원 정보 카드 */}
          <section className="hd2__leftCard">
            <div className="hd2__cardTitle">
              <i className="fas fa-circle-info" />병원 정보
            </div>
            {summary && (
              <>
                <div className="hd2__title">{summary.hoName}</div>
                <div className="hd2__sub">
                  <Stars score={summary.rvRating ?? 0} />
                  <span className="hd2__score-sm">
                    {Number(summary.rvRating ?? 0).toFixed(1)}
                  </span>
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
                    {tags.map((t) => (
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

        {/* ─ 메인 콘텐츠 ─ */}
        <main className="hd2__right">

          {/* 병원 사진 */}
          <section className="hd2__panel">
            <div className="hd2__panelTitle">
              <span className="hd2__panelIcon"><i className="fas fa-camera" /></span>
              병원 사진
            </div>
            <div className="hd2__panelBody hd2__photoBox">
              <i className="fas fa-image hd2__placeholder-icon" />
              <span>등록된 사진이 없습니다</span>
            </div>
          </section>

          {/* 오시는 길 */}
          <section className="hd2__panel">
            <div className="hd2__panelTitle">
              <span className="hd2__panelIcon"><i className="fas fa-map-location-dot" /></span>
              오시는 길
            </div>
            <div className="hd2__addrBar">
              <i className="fas fa-location-dot" />
              {summary?.hoAddr ?? "주소 정보 없음"}
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

          {/* 리뷰 */}
          <section className="hd2__panel">
            <div className="hd2__panelTitle">
              <span className="hd2__panelIcon"><i className="fas fa-star" /></span>
              리뷰
              {reviews.length > 0 && (
                <span className="hd2__reviewBadge">{reviews.length}</span>
              )}
            </div>

            <div className="hd2__reviews">
              {reviews.length === 0 ? (
                <div className="hd2__emptyReviews">
                  <i className="far fa-comment-dots" />
                  <p>등록된 리뷰가 없습니다</p>
                </div>
              ) : (
                reviews.map((rev) => (
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
