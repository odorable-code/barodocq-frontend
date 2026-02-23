import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import "./Hos_Detail.css";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";

// ✅ tinyint(0/1), "0"/"1", Y/N, true/false → boolean
const toBool = (v) => {
  if (v === true || v === false) return v;
  if (v === 1 || v === 0) return Boolean(v);
  if (v == null) return false;

  const s = String(v).trim().toUpperCase();
  if (s === "Y" || s === "YES" || s === "TRUE" || s === "T" || s === "1") return true;
  if (s === "N" || s === "NO" || s === "FALSE" || s === "F" || s === "0") return false;

  // 숫자처럼 생겼으면 마지막으로 처리
  const n = Number(v);
  if (!Number.isNaN(n)) return n === 1;

  return false;
};

export default function Hos_Detail() {
  const { hospitalId } = useParams();

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/hospitals/${hospitalId}/summary`, {
          method: "GET",
        });

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(`요약 조회 실패 (status: ${res.status}) ${text.slice(0, 120)}`);
        }

        const data = await res.json();

        // ✅ 여기서 한 번만 정규화해두면 아래 코드가 깔끔해짐
        const normalized = {
          ...data,
          ho_night_yn: toBool(data.ho_night_yn),
          ho_holiday_yn: toBool(data.ho_holiday_yn),
        };

        if (!ignore) setSummary(normalized);
      } catch (e) {
        if (!ignore) setError(e?.message || "에러 발생");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();
    return () => {
      ignore = true;
    };
  }, [hospitalId]);

  const tags = useMemo(() => {
    if (!summary) return [];
    const arr = [];
    if (summary.ho_night_yn === true) arr.push("야간진료");
    if (summary.ho_holiday_yn === true) arr.push("공휴일진료");
    return arr;
  }, [summary]);

  const timeText = useMemo(() => {
    if (!summary) return "";
    const o = summary.hh_open_time;
    const c = summary.hh_close_time;
    if (!o || !c) return "운영시간 정보 없음";
    return `${o} ~ ${c}`;
  }, [summary]);

  const lunchText = useMemo(() => {
    if (!summary) return "";
    const s = summary.hh_lunch_start;
    const e = summary.hh_lunch_end;
    if (!s || !e) return "";
    return `점심 ${s} ~ ${e}`;
  }, [summary]);

  return (
    <div className="hd2">
      <div className="hd2__topbar-placeholder">상단바 위치</div>

      <div className="hd2__wrap">
        {/* 왼쪽 */}
        <aside className="hd2__left">
          <section className="hd2__leftCard">
            {loading && <div>불러오는 중...</div>}
            {error && <div style={{ color: "crimson" }}>{error}</div>}

            {!loading && !error && summary && (
              <>
                <div className="hd2__title">{summary.ho_name}</div>

                <div className="hd2__sub">
                  ⭐ {summary.rv_rating ?? "별점 없음"} <span className="hd2__dot">·</span>{" "}
                  {summary.dept_name ?? "진료과 정보 없음"}
                </div>

                <div className="hd2__infoLine">☎ {summary.ho_phone ?? "전화번호 없음"}</div>
                <div className="hd2__infoLine">📍 {summary.ho_addr ?? "주소 없음"}</div>
                <div className="hd2__infoLine">🕒 {timeText}</div>
                {lunchText && <div className="hd2__infoLine">{lunchText}</div>}

                {/* 태그 */}
                <div className="hd2__tags">
                  {tags.length === 0 ? (
                    <span className="hd2__tag">태그 없음</span>
                  ) : (
                    tags.map((t) => (
                      <span key={t} className="hd2__tag">
                        {t}
                      </span>
                    ))
                  )}
                </div>
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

        {/* 오른쪽 패널들 그대로 두기*/}
        <main className="hd2__right">
          <section className="hd2__panel">
            <div className="hd2__panelBody hd2__photoBox">병원사진</div>
          </section>
          <section className="hd2__panel">
            <div className="hd2__panelTitle">오시는길</div>
            <div className="hd2__panelBody hd2__guideBox">(안내문구)</div>
          </section>
          <section className="hd2__panel">
            <div className="hd2__panelBody hd2__mapBox">지도</div>
          </section>
          <section className="hd2__panel">
            <div className="hd2__panelTitle">리뷰</div>
            <div className="hd2__panelBody">(리뷰 리스트)</div>
          </section>
        </main>
      </div>
    </div>
  );
}