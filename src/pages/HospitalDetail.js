import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../assets/styles/HospitalDetail.css";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";

/* ─────────────────────────────────────────
   util
───────────────────────────────────────── */
const toBool = (v) => {
  if (v === true || v === false) return v;
  if (v === 1 || v === 0) return Boolean(v);
  if (v == null) return false;

  const s = String(v).trim().toUpperCase();
  if (["Y", "YES", "TRUE", "T", "1"].includes(s)) return true;
  if (["N", "NO", "FALSE", "F", "0"].includes(s)) return false;

  const n = Number(v);
  if (!Number.isNaN(n)) return n === 1;
  return false;
};

// ✅ "09:00:00" / "9:00:00" / "09:00" => "09:00"
const stripSeconds = (t) => {
  if (!t) return "";
  const s = String(t).trim();
  const m = s.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (!m) return s;
  return `${m[1].padStart(2, "0")}:${m[2]}`;
};

const formatTimeRange = (openTime, closeTime) => {
  const o = stripSeconds(openTime);
  const c = stripSeconds(closeTime);
  if (!o || !c) return "운영시간 정보 없음";
  return `${o} ~ ${c}`;
};

const formatLunch = (start, end) => {
  const s = stripSeconds(start);
  const e = stripSeconds(end);
  if (!s || !e) return "";
  return `점심 ${s} ~ ${e}`;
};

const formatDate = (v) => {
  if (!v) return "";
  const s = String(v);
  return s.length >= 10 ? s.slice(0, 10) : s;
};

export default function Hos_Detail() {
  const { hospitalId } = useParams();
  const navigate = useNavigate();

  const [summary, setSummary] = useState(null); // ✅ camel only
  const [reviews, setReviews] = useState([]);   // ✅ camel only

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadData() {
      if (!hospitalId) return;
      setLoading(true);
      setError("");

      try {
        // ✅ summary
        const sumRes = await fetch(
          `${API_BASE_URL}/api/v1/hospitals/${hospitalId}/summary`
        );
        if (!sumRes.ok) {
          const txt = await sumRes.text().catch(() => "");
          throw new Error(
            `병원 정보 로드 실패 (status ${sumRes.status})\n${txt.slice(0, 200)}`
          );
        }
        const sumData = await sumRes.json();

        // ✅ reviews
        const revRes = await fetch(
          `${API_BASE_URL}/api/v1/hospitals/${hospitalId}/reviews?limit=3`
        );
        if (!revRes.ok) {
          const txt = await revRes.text().catch(() => "");
          throw new Error(
            `리뷰 로드 실패 (status ${revRes.status})\n${txt.slice(0, 200)}`
          );
        }
        const revData = await revRes.json();

        if (!ignore) {
          // ✅ summary는 VO/DTO가 camel이라고 했으니 그대로 사용
          setSummary({
            ...sumData,
            hoNightYn: toBool(sumData.hoNightYn),
            hoHolidayYn: toBool(sumData.hoHolidayYn),
          });

          // ✅ reviews도 camel로 통일
          setReviews(Array.isArray(revData) ? revData : []);
        }
      } catch (e) {
        if (!ignore) setError(e?.message || "에러 발생");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadData();
    return () => {
      ignore = true;
    };
  }, [hospitalId]);

  const tags = useMemo(() => {
    if (!summary) return [];
    const arr = [];
    if (summary.hoNightYn) arr.push("야간진료");
    if (summary.hoHolidayYn) arr.push("공휴일진료");
    return arr;
  }, [summary]);

  const timeText = formatTimeRange(summary?.hhOpenTime, summary?.hhCloseTime);
  const lunchText = formatLunch(summary?.hhLunchStart, summary?.hhLunchEnd);

  return (
    <div className="hd2">
      <div className="hd2__topbar-placeholder">BARODOCQ</div>

      <div className="hd2__wrap">
        <aside className="hd2__left">
          <section className="hd2__leftCard">
            {loading && <div>불러오는 중...</div>}
            {error && (
              <div style={{ color: "crimson", whiteSpace: "pre-wrap" }}>
                {error}
              </div>
            )}

            {!loading && !error && summary && (
              <>
                <div className="hd2__title">{summary.hoName}</div>

                <div className="hd2__sub">
                  ⭐ {summary.rvRating ?? "별점 없음"}
                  <span className="hd2__dot">·</span>
                  {summary.deptName ?? "진료과 미지정"}
                </div>

                <div className="hd2__infoLine">☎ {summary.hoPhone}</div>
                <div className="hd2__infoLine">📍 {summary.hoAddr}</div>
                <div className="hd2__infoLine">🕒 {timeText}</div>
                {lunchText && <div className="hd2__infoLine">{lunchText}</div>}

                {tags.length > 0 && (
                  <div className="hd2__tags">
                    {tags.map((t) => (
                      <span key={t} className="hd2__tag">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </>
            )}
          </section>

          <button className="hd2__actionBtn" type="button">
            예약하기
          </button>
          <button className="hd2__actionBtn" type="button">
            1:1문의
          </button>
        </aside>

        <main className="hd2__right">
          <section className="hd2__panel">
            <div className="hd2__panelBody hd2__photoBox">병원사진</div>
          </section>

          <section className="hd2__panel">
            <div className="hd2__panelTitle">오시는길</div>
            <div className="hd2__panelBody hd2__guideBox">
              📍 {summary?.hoAddr}
            </div>
          </section>

          <section className="hd2__panel">
            <div className="hd2__panelBody hd2__mapBox">지도</div>
          </section>

          {/* 리뷰 */}
          <section className="hd2__panel">
            <div className="hd2__panelTitle">리뷰</div>

            <div className="hd2__reviews">
              {reviews.length === 0 ? (
                <div className="hd2__emptyReviews">등록된 리뷰가 없습니다.</div>
              ) : (
                reviews.map((rev) => (
                  <div key={rev.rvNum} className="hd2__reviewRow">
                    <div className="hd2__reviewImg">
                      {rev.rfName ? (
                        <img
                          src={`${API_BASE_URL}/uploads/${rev.rfName}`}
                          alt="리뷰"
                        />
                      ) : (
                        "No Image"
                      )}
                    </div>

                    <div className="hd2__reviewContent">
                      <div className="hd2__revTop">
                        <span className="hd2__revUser">{rev.userName}님</span>
                        <span className="hd2__revStars">
                          {"⭐".repeat(rev.rvRating)}
                        </span>
                      </div>

                      <p className="hd2__reviewText">{rev.rvContent}</p>
                      <span className="hd2__revDate">
                        {formatDate(rev.rvCreatedAt)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {reviews.length > 0 && (
              <div className="hd2__moreWrap">
                <button
                  className="hd2__moreBtn"
                  type="button"
                  onClick={() => navigate(`/hospital/${hospitalId}/reviews`)}
                >
                  리뷰 더보기 〉
                </button>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}