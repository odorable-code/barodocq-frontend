import { useMemo } from "react";
import { useParams } from "react-router-dom";
import "./Hos_Detail.css";

export default function Hos_Detail() {
  const { hospitalId } = useParams();

  // 더미 데이터 (나중에 API로 교체)
  const hospital = useMemo(
    () => ({
      id: hospitalId,
      name: "병원명",
      dept: "진료과",
      summary: "병원정보 확인",
      tags: ["태그", "태그", "태그"],
    }),
    [hospitalId]
  );

  const reviews = useMemo(
    () => [
      { id: 1, text: "리뷰들", hasImage: true },
      { id: 2, text: "리뷰들", hasImage: false },
      { id: 3, text: "리뷰들", hasImage: false },
      { id: 4, text: "리뷰들", hasImage: false },
    ],
    []
  );

  return (
    <div className="hd2">
      {/* ✅ 상단바 자리만 확보 */}
      <div className="hd2__topbar-placeholder">상단바 위치</div>

      <div className="hd2__wrap">
        {/* 왼쪽: 스크롤 고정 영역 */}
        <aside className="hd2__left">
          <section className="hd2__leftCard">
            <div className="hd2__title">{hospital.name} / {hospital.dept}</div>
            <div className="hd2__summary">{hospital.summary}</div>

            <div className="hd2__tags">
              {hospital.tags.map((t) => (
                <span key={t} className="hd2__tag">{t}</span>
              ))}
            </div>
          </section>

          <button className="hd2__actionBtn" type="button" onClick={() => {}}>
            예약하기
          </button>

          <button className="hd2__actionBtn" type="button" onClick={() => {}}>
            1:1문의
          </button>
        </aside>

        {/* 오른쪽: 컨텐츠 스크롤 */}
        <main className="hd2__right">
          {/* 병원사진 */}
          <section className="hd2__panel">
            <div className="hd2__panelBody hd2__photoBox">병원사진</div>
          </section>

          {/* 오시는길 */}
          <section className="hd2__panel">
            <div className="hd2__panelTitle">오시는길</div>
            <div className="hd2__panelBody hd2__guideBox">
              <div className="hd2__guideText">
                (예: 지하철/버스/주차 안내 문구 들어갈 자리)
              </div>
            </div>
          </section>

          {/* 지도 자리 */}
          <section className="hd2__panel">
            <div className="hd2__panelBody hd2__mapBox">
              지도 (카카오맵 API 이용 예정)
            </div>
          </section>

          {/* 리뷰 */}
          <section className="hd2__panel">
            <div className="hd2__panelTitle">리뷰</div>

            <div className="hd2__reviews">
              {reviews.map((r) => (
                <div key={r.id} className="hd2__reviewRow">
                  <div className="hd2__reviewImg">
                    {r.hasImage ? "병원사진" : "이미지"}
                  </div>
                  <div className="hd2__reviewText">{r.text}</div>
                </div>
              ))}
            </div>

            <div className="hd2__moreWrap">
              <button className="hd2__moreBtn" type="button" onClick={() => {}}>
                리뷰더보기
              </button>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}