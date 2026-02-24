import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../assets/styles/HospitalDetail.css";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";

const toBool = (v) => {
  if (v === true || v === false) return v;
  if (v === 1 || v === 0) return Boolean(v);
  if (v == null) return false;
  const s = String(v).trim().toUpperCase();
  if (s === "Y" || s === "YES" || s === "TRUE" || s === "T" || s === "1") return true;
  if (s === "N" || s === "NO" || s === "FALSE" || s === "F" || s === "0") return false;
  const n = Number(v);
  if (!Number.isNaN(n)) return n === 1;
  return false;
};

export default function Hos_Detail() {
  const { hospitalId } = useParams();
  const navigate = useNavigate();

  const [summary, setSummary] = useState(null);
  const [reviews, setReviews] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;
    async function loadData() {
      setLoading(true);
      setError("");
      try {
        const sumRes = await fetch(`${API_BASE_URL}/api/v1/hospitals/${hospitalId}/summary`);
        if (!sumRes.ok) throw new Error(`병원 정보 로드 실패`);
        const sumData = await sumRes.json();

        const revRes = await fetch(`${API_BASE_URL}/api/v1/hospitals/${hospitalId}/reviews?limit=3`);
        const revData = revRes.ok ? await revRes.json() : [];

        
        if (!ignore) {
          setSummary({
            ...sumData,
            ho_night_yn: toBool(sumData.ho_night_yn),
            ho_holiday_yn: toBool(sumData.ho_holiday_yn),
          });
          setReviews(revData);
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
    if (summary.ho_night_yn) arr.push("야간진료");
    if (summary.ho_holiday_yn) arr.push("공휴일진료");
    return arr;
  }, [summary]);

  const timeText = summary?.hh_open_time ? `${summary.hh_open_time} ~ ${summary.hh_close_time}` : "운영시간 정보 없음";
  const lunchText = summary?.hh_lunch_start ? `점심 ${summary.hh_lunch_start} ~ ${summary.hh_lunch_end}` : "";

  return (
    <div className="hd2">
      <div className="hd2__topbar-placeholder">BARODOCQ</div>

      <div className="hd2__wrap">
        <aside className="hd2__left">
          <section className="hd2__leftCard">
            {loading && <div>불러오는 중...</div>}
            {error && <div style={{ color: "crimson" }}>{error}</div>}
            {!loading && summary && (
              <>
                <div className="hd2__title">{summary.ho_name}</div>
                <div className="hd2__sub">
                  ⭐ {summary.rv_rating ?? "별점 없음"} <span className="hd2__dot">·</span> {summary.dept_name ?? "진료과 미지정"}
                </div>
                <div className="hd2__infoLine">☎ {summary.ho_phone}</div>
                <div className="hd2__infoLine">📍 {summary.ho_addr}</div>
                <div className="hd2__infoLine">🕒 {timeText}</div>
                {lunchText && <div className="hd2__infoLine">{lunchText}</div>}
                {tags.length > 0 && (
                  <div className="hd2__tags">
                    {tags.map((t) => <span key={t} className="hd2__tag">{t}</span>)}
                  </div>
                )}
              </>
            )}
          </section>
          <button className="hd2__actionBtn" type="button">예약하기</button>
          <button className="hd2__actionBtn" type="button">1:1문의</button>
        </aside>

        <main className="hd2__right">
          <section className="hd2__panel">
            <div className="hd2__panelBody hd2__photoBox">병원사진</div>
          </section>
          <section className="hd2__panel">
            <div className="hd2__panelTitle">오시는길</div>
            <div className="hd2__panelBody hd2__guideBox">📍 {summary?.ho_addr}</div>
          </section>
          <section className="hd2__panel">
            <div className="hd2__panelBody hd2__mapBox">지도</div>
          </section>

          {/* 리뷰 섹션 */}
          <section className="hd2__panel">
            <div className="hd2__panelTitle">리뷰</div>
            <div className="hd2__reviews">
              {reviews.length === 0 ? (
                <div className="hd2__emptyReviews">등록된 리뷰가 없습니다.</div>
              ) : (
                reviews.map((rev) => (
                  <div key={rev.rv_num} className="hd2__reviewRow">
                    <div className="hd2__reviewImg">
                      {rev.rf_name ? <img src={`${API_BASE_URL}/uploads/${rev.rf_name}`} alt="리뷰" /> : "No Image"}
                    </div>
                    <div className="hd2__reviewContent">
                      <div className="hd2__revTop">
                        <span className="hd2__revUser">{rev.user_name}님</span>
                        <span className="hd2__revStars">{"⭐".repeat(rev.rv_rating)}</span>
                      </div>
                      <p className="hd2__reviewText">{rev.rv_content}</p>
                      <span className="hd2__revDate">{rev.rv_created_at?.substring(0, 10)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
            {reviews.length > 0 && (
              <div className="hd2__moreWrap">
                <button className="hd2__moreBtn" onClick={() => navigate(`/hospital/${hospitalId}/reviews`)}>리뷰 더보기 〉</button>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}