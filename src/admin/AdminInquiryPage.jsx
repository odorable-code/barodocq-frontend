import React, { useState, useRef, useEffect } from "react";
import "../assets/styles/AdminInquiryPage.css";

/* ─────────────────────────────────────────
   더미 데이터
───────────────────────────────────────── */
const DUMMY_INQUIRIES = [
  {
    id: 1,
    title: "예약 취소 후 환불이 언제 되나요?",
    category: "예약/취소",
    content:
      "지난 화요일에 예약을 취소했는데 아직 환불이 안 됐어요. 카드사에도 문의했는데 병원 측에서 처리를 안 했다고 하더라고요. 빠른 확인 부탁드립니다.",
    authorName: "김민준",
    authorEmail: "minjun.kim@email.com",
    authorPhone: "010-1234-5678",
    createdAt: "2026-03-04 14:32",
    status: "pending",
    priority: "high",
    replies: [],
  },
  {
    id: 2,
    title: "진료 기록 열람 가능한가요?",
    category: "진료기록",
    content:
      "2월에 방문했던 진료 기록과 처방전을 다시 확인하고 싶습니다. 어떤 방법으로 열람할 수 있는지 안내 부탁드립니다.",
    authorName: "이서연",
    authorEmail: "seoyeon.lee@email.com",
    authorPhone: "010-9876-5432",
    createdAt: "2026-03-04 11:05",
    status: "in-progress",
    priority: "normal",
    replies: [
      {
        id: 1,
        adminName: "관리자",
        content:
          "안녕하세요, 이서연 님. 진료 기록은 원무과에 직접 방문하시거나 모바일 앱 내 [내 기록] 탭에서 확인하실 수 있습니다. 추가 문의사항이 있으시면 말씀해주세요.",
        createdAt: "2026-03-04 13:20",
      },
    ],
  },
  {
    id: 3,
    title: "소아과 예방접종 예약 방법 문의",
    category: "예약/취소",
    content:
      "아이 예방접종 일정을 잡고 싶은데 앱에서 예약이 안 됩니다. 소아과 전용 예약 페이지가 따로 있는 건가요?",
    authorName: "박지현",
    authorEmail: "jihyun.park@email.com",
    authorPhone: "010-5555-4444",
    createdAt: "2026-03-03 16:48",
    status: "resolved",
    priority: "normal",
    replies: [
      {
        id: 1,
        adminName: "관리자",
        content:
          "안녕하세요, 박지현 님. 소아과 예방접종은 앱 메인 화면 → 빠른검색 → 예방접종 을 통해 예약하실 수 있습니다. 이미 해결되셨다면 문의를 종료해 드리겠습니다!",
        createdAt: "2026-03-03 17:30",
      },
    ],
  },
  {
    id: 4,
    title: "리뷰 삭제 요청드립니다",
    category: "리뷰/평점",
    content:
      "저희 병원에 악의적인 허위 리뷰가 올라와 있습니다. 해당 리뷰 삭제를 요청드립니다. 리뷰 ID는 #REV-20260228-003입니다.",
    authorName: "최동훈",
    authorEmail: "donghun.choi@hospital.com",
    authorPhone: "02-1234-5678",
    createdAt: "2026-03-03 09:15",
    status: "in-progress",
    priority: "urgent",
    replies: [
      {
        id: 1,
        adminName: "관리자",
        content:
          "접수 확인했습니다. 해당 리뷰를 검토 중이며, 운영 정책에 따라 48시간 내 처리 결과를 안내드리겠습니다.",
        createdAt: "2026-03-03 10:00",
      },
    ],
  },
  {
    id: 5,
    title: "병원 운영시간 업데이트 요청",
    category: "병원정보",
    content:
      "저희 병원 운영 시간이 변경되었습니다. 기존 평일 09:00-18:00에서 09:00-20:00으로 수정 부탁드립니다. 토요일은 09:00-14:00으로 동일합니다.",
    authorName: "강보람",
    authorEmail: "boram.kang@medcenter.com",
    authorPhone: "031-987-6543",
    createdAt: "2026-03-02 15:22",
    status: "resolved",
    priority: "normal",
    replies: [
      {
        id: 1,
        adminName: "관리자",
        content: "운영시간 업데이트 완료하였습니다. 확인 부탁드립니다!",
        createdAt: "2026-03-02 16:10",
      },
    ],
  },
  {
    id: 6,
    title: "결제 오류 발생했습니다",
    category: "결제/환불",
    content:
      "진료비 결제 중 앱이 튕기면서 결제가 이중으로 됐습니다. 한 건은 취소 부탁드리고 영수증도 재발행 해주시면 감사하겠습니다.",
    authorName: "윤재호",
    authorEmail: "jaeho.yoon@email.com",
    authorPhone: "010-7777-8888",
    createdAt: "2026-03-02 11:40",
    status: "pending",
    priority: "urgent",
    replies: [],
  },
  {
    id: 7,
    title: "의사 선생님 전문의 자격 확인 가능할까요?",
    category: "의료진",
    content:
      "담당 선생님의 전문의 자격증을 앱 내에서 확인할 수 있는 방법이 있나요? 신뢰할 수 있는 정보 제공이 필요합니다.",
    authorName: "송미래",
    authorEmail: "mirae.song@email.com",
    authorPhone: "010-2222-3333",
    createdAt: "2026-03-01 10:05",
    status: "pending",
    priority: "normal",
    replies: [],
  },
  {
    id: 8,
    title: "앱 로그인이 안 됩니다",
    category: "앱/기술",
    content:
      "오늘부터 갑자기 앱 로그인이 안 됩니다. 비밀번호도 맞고 계정도 정상인데 '서버 오류'라고 뜨면서 튕겨요. iOS 17.5 사용 중입니다.",
    authorName: "한지우",
    authorEmail: "jiwoo.han@email.com",
    authorPhone: "010-6666-9999",
    createdAt: "2026-02-28 22:14",
    status: "resolved",
    priority: "high",
    replies: [
      {
        id: 1,
        adminName: "관리자",
        content:
          "서버 점검으로 인한 일시적 오류였습니다. 현재는 정상화되었으니 다시 시도해보시기 바랍니다. 불편을 드려 죄송합니다.",
        createdAt: "2026-02-28 23:05",
      },
    ],
  },
];

const CATEGORY_OPTIONS = [
  { value: "all", label: "전체 카테고리" },
  { value: "예약/취소", label: "예약/취소" },
  { value: "결제/환불", label: "결제/환불" },
  { value: "진료기록", label: "진료기록" },
  { value: "리뷰/평점", label: "리뷰/평점" },
  { value: "병원정보", label: "병원정보" },
  { value: "의료진", label: "의료진" },
  { value: "앱/기술", label: "앱/기술" },
];

const STATUS_MAP = {
  pending:     { label: "미답변",   cls: "status-pending" },
  "in-progress": { label: "답변중",   cls: "status-progress" },
  resolved:    { label: "완료",     cls: "status-resolved" },
};

const PRIORITY_MAP = {
  urgent: { label: "긴급", cls: "priority-urgent" },
  high:   { label: "높음", cls: "priority-high" },
  normal: { label: "일반", cls: "priority-normal" },
};

/* ─────────────────────────────────────────
   AdminInquiryPage
───────────────────────────────────────── */
const AdminInquiryPage = () => {
  const [inquiries, setInquiries]   = useState(DUMMY_INQUIRIES);
  const [search,    setSearch]      = useState("");
  const [filterStatus,   setFilterStatus]   = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [sortBy,    setSortBy]      = useState("newest");
  const [selected,  setSelected]    = useState(null);
  const [replyText, setReplyText]   = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const PER_PAGE = 6;
  const replyRef = useRef(null);

  /* 통계 */
  const stats = {
    total:      inquiries.length,
    pending:    inquiries.filter(i => i.status === "pending").length,
    inProgress: inquiries.filter(i => i.status === "in-progress").length,
    resolved:   inquiries.filter(i => i.status === "resolved").length,
    urgent:     inquiries.filter(i => i.priority === "urgent").length,
  };

  /* 필터 + 정렬 */
  const filtered = inquiries
    .filter(i => {
      const matchSearch =
        i.title.includes(search) ||
        i.authorName.includes(search) ||
        i.content.includes(search);
      const matchStatus   = filterStatus   === "all" || i.status   === filterStatus;
      const matchCategory = filterCategory === "all" || i.category === filterCategory;
      const matchPriority = filterPriority === "all" || i.priority === filterPriority;
      return matchSearch && matchStatus && matchCategory && matchPriority;
    })
    .sort((a, b) => {
      if (sortBy === "newest")   return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === "oldest")   return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === "priority") {
        const ord = { urgent: 0, high: 1, normal: 2 };
        return ord[a.priority] - ord[b.priority];
      }
      return 0;
    });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated  = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  /* 상세 열기 */
  const openDetail = (inq) => {
    setSelected(inq);
    setReplyText("");
    setTimeout(() => replyRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  /* 답변 등록 */
  const handleReply = () => {
    if (!replyText.trim()) return;
    const newReply = {
      id: Date.now(),
      adminName: "관리자",
      content: replyText.trim(),
      createdAt: new Date().toLocaleString("ko-KR"),
    };
    const updated = inquiries.map(i =>
      i.id === selected.id
        ? { ...i, status: "resolved", replies: [...i.replies, newReply] }
        : i
    );
    setInquiries(updated);
    setSelected(prev => ({
      ...prev,
      status: "resolved",
      replies: [...prev.replies, newReply],
    }));
    setReplyText("");
  };

  /* 상태 변경 */
  const handleStatusChange = (id, status) => {
    setInquiries(prev => prev.map(i => i.id === id ? { ...i, status } : i));
    if (selected?.id === id) setSelected(prev => ({ ...prev, status }));
  };

  /* 필터 변경 시 페이지 초기화 */
  useEffect(() => setCurrentPage(1), [search, filterStatus, filterCategory, filterPriority, sortBy]);

  return (
    <div className="aiq-root">
      {/* ── 헤더 바 ── */}
      <div className="aiq-top-bar">
        <div className="aiq-top-left">
          <div className="aiq-top-icon"><i className="fas fa-headset" /></div>
          <div>
            <h1 className="aiq-top-title">1:1 문의 관리</h1>
            <p className="aiq-top-sub">환자 및 병원 관계자의 문의를 확인하고 답변하세요</p>
          </div>
        </div>
        <div className="aiq-top-actions">
          <button className="aiq-btn-outline">
            <i className="fas fa-download" /> 내보내기
          </button>
          <button className="aiq-btn-primary">
            <i className="fas fa-rotate" /> 새로고침
          </button>
        </div>
      </div>

      {/* ── 통계 카드 ── */}
      <div className="aiq-stats-row">
        <StatCard icon="inbox" label="전체 문의" value={stats.total}      color="#14b8a6" />
        <StatCard icon="clock" label="미답변"    value={stats.pending}    color="#f59e0b" badge={stats.pending > 0} />
        <StatCard icon="spinner" label="답변중"  value={stats.inProgress} color="#3b82f6" />
        <StatCard icon="circle-check" label="완료" value={stats.resolved} color="#10b981" />
        <StatCard icon="triangle-exclamation" label="긴급" value={stats.urgent} color="#ef4444" badge={stats.urgent > 0} />
      </div>

      <div className="aiq-body">
        {/* ── 좌측: 목록 패널 ── */}
        <div className="aiq-list-panel">
          {/* 검색 + 필터 */}
          <div className="aiq-filter-bar">
            <div className="aiq-search-wrap">
              <i className="fas fa-search aiq-search-icon" />
              <input
                type="text"
                className="aiq-search-input"
                placeholder="제목, 이름, 내용으로 검색..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && (
                <button className="aiq-search-clear" onClick={() => setSearch("")}>
                  <i className="fas fa-xmark" />
                </button>
              )}
            </div>
            <div className="aiq-filter-row">
              <select
                className="aiq-select"
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
              >
                <option value="all">전체 상태</option>
                <option value="pending">미답변</option>
                <option value="in-progress">답변중</option>
                <option value="resolved">완료</option>
              </select>
              <select
                className="aiq-select"
                value={filterCategory}
                onChange={e => setFilterCategory(e.target.value)}
              >
                {CATEGORY_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <select
                className="aiq-select"
                value={filterPriority}
                onChange={e => setFilterPriority(e.target.value)}
              >
                <option value="all">전체 우선순위</option>
                <option value="urgent">긴급</option>
                <option value="high">높음</option>
                <option value="normal">일반</option>
              </select>
              <select
                className="aiq-select"
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
              >
                <option value="newest">최신순</option>
                <option value="oldest">오래된순</option>
                <option value="priority">우선순위순</option>
              </select>
            </div>
            <div className="aiq-result-count">
              총 <strong>{filtered.length}</strong>건의 문의
            </div>
          </div>

          {/* 문의 목록 */}
          <div className="aiq-list">
            {paginated.length === 0 ? (
              <div className="aiq-empty">
                <i className="fas fa-inbox" />
                <p>검색 결과가 없습니다</p>
              </div>
            ) : (
              paginated.map(inq => (
                <InquiryRow
                  key={inq.id}
                  inq={inq}
                  isSelected={selected?.id === inq.id}
                  onClick={() => openDetail(inq)}
                  onStatusChange={handleStatusChange}
                />
              ))
            )}
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="aiq-pagination">
              <button
                className="aiq-page-btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
              >
                <i className="fas fa-chevron-left" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  className={`aiq-page-btn ${currentPage === p ? "active" : ""}`}
                  onClick={() => setCurrentPage(p)}
                >
                  {p}
                </button>
              ))}
              <button
                className="aiq-page-btn"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
              >
                <i className="fas fa-chevron-right" />
              </button>
            </div>
          )}
        </div>

        {/* ── 우측: 상세 패널 ── */}
        <div className="aiq-detail-panel">
          {selected ? (
            <DetailView
              inq={selected}
              replyText={replyText}
              setReplyText={setReplyText}
              onReply={handleReply}
              onStatusChange={handleStatusChange}
              replyRef={replyRef}
              onClose={() => setSelected(null)}
            />
          ) : (
            <div className="aiq-detail-empty">
              <div className="aiq-detail-empty-icon">
                <i className="fas fa-comment-dots" />
              </div>
              <h3>문의를 선택하세요</h3>
              <p>좌측 목록에서 문의를 클릭하면<br />상세 내용과 답변 창이 열립니다</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────
   StatCard
───────────────────────────────────────── */
const StatCard = ({ icon, label, value, color, badge }) => (
  <div className="aiq-stat-card" style={{ "--sc-color": color }}>
    <div className="aiq-stat-icon"><i className={`fas fa-${icon}`} /></div>
    <div className="aiq-stat-body">
      <span className="aiq-stat-value">{value}</span>
      <span className="aiq-stat-label">{label}</span>
    </div>
    {badge && <span className="aiq-stat-badge" />}
  </div>
);

/* ─────────────────────────────────────────
   InquiryRow
───────────────────────────────────────── */
const InquiryRow = ({ inq, isSelected, onClick, onStatusChange }) => {
  const s = STATUS_MAP[inq.status];
  const p = PRIORITY_MAP[inq.priority];
  return (
    <div
      className={`aiq-row ${isSelected ? "selected" : ""} ${inq.status === "pending" ? "unread" : ""}`}
      onClick={onClick}
    >
      {inq.status === "pending" && <span className="aiq-unread-dot" />}
      <div className="aiq-row-top">
        <span className={`aiq-priority-tag ${p.cls}`}>{p.label}</span>
        <span className="aiq-category-tag">{inq.category}</span>
        <span className={`aiq-status-tag ${s.cls}`}>{s.label}</span>
        <span className="aiq-time"><i className="fas fa-clock" />{inq.createdAt}</span>
      </div>
      <h4 className="aiq-row-title">{inq.title}</h4>
      <p className="aiq-row-preview">{inq.content}</p>
      <div className="aiq-row-footer">
        <div className="aiq-author-info">
          <div className="aiq-author-avatar">
            {inq.authorName.charAt(0)}
          </div>
          <span className="aiq-author-name">{inq.authorName}</span>
          <span className="aiq-author-email">{inq.authorEmail}</span>
        </div>
        <div className="aiq-row-meta">
          {inq.replies.length > 0 && (
            <span className="aiq-reply-count">
              <i className="fas fa-reply" />{inq.replies.length}개 답변
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────
   DetailView
───────────────────────────────────────── */
const DetailView = ({ inq, replyText, setReplyText, onReply, onStatusChange, replyRef, onClose }) => {
  const s = STATUS_MAP[inq.status];
  const p = PRIORITY_MAP[inq.priority];

  return (
    <div className="aiq-detail">
      {/* 상세 헤더 */}
      <div className="aiq-detail-header">
        <div className="aiq-detail-header-top">
          <div className="aiq-detail-tags">
            <span className={`aiq-priority-tag ${p.cls}`}>{p.label}</span>
            <span className="aiq-category-tag">{inq.category}</span>
            <span className={`aiq-status-tag ${s.cls}`}>{s.label}</span>
          </div>
          <button className="aiq-close-btn" onClick={onClose}>
            <i className="fas fa-xmark" />
          </button>
        </div>
        <h2 className="aiq-detail-title">{inq.title}</h2>
        <div className="aiq-detail-meta">
          <div className="aiq-author-info">
            <div className="aiq-author-avatar lg">{inq.authorName.charAt(0)}</div>
            <div>
              <strong>{inq.authorName}</strong>
              <div className="aiq-author-contacts">
                <span><i className="fas fa-envelope" />{inq.authorEmail}</span>
                <span><i className="fas fa-phone" />{inq.authorPhone}</span>
              </div>
            </div>
          </div>
          <span className="aiq-detail-time"><i className="fas fa-calendar" />{inq.createdAt}</span>
        </div>
        {/* 상태 변경 버튼 그룹 */}
        <div className="aiq-status-actions">
          <span className="aiq-status-label">상태 변경:</span>
          {["pending", "in-progress", "resolved"].map(st => (
            <button
              key={st}
              className={`aiq-status-btn ${STATUS_MAP[st].cls} ${inq.status === st ? "active-status" : ""}`}
              onClick={() => onStatusChange(inq.id, st)}
            >
              {STATUS_MAP[st].label}
            </button>
          ))}
        </div>
      </div>

      {/* 원문 내용 */}
      <div className="aiq-detail-body">
        <div className="aiq-content-box">
          <div className="aiq-content-label">
            <i className="fas fa-comment-alt" />문의 내용
          </div>
          <p className="aiq-content-text">{inq.content}</p>
        </div>

        {/* 기존 답변 목록 */}
        {inq.replies.length > 0 && (
          <div className="aiq-replies-section">
            <div className="aiq-replies-label">
              <i className="fas fa-reply-all" />답변 내역 ({inq.replies.length})
            </div>
            <div className="aiq-replies-list">
              {inq.replies.map(r => (
                <div key={r.id} className="aiq-reply-bubble">
                  <div className="aiq-reply-admin-avatar">
                    <i className="fas fa-user-shield" />
                  </div>
                  <div className="aiq-reply-content">
                    <div className="aiq-reply-meta">
                      <strong>{r.adminName}</strong>
                      <span>{r.createdAt}</span>
                    </div>
                    <p>{r.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 답변 작성 */}
        <div className="aiq-reply-form" ref={replyRef}>
          <div className="aiq-reply-form-header">
            <i className="fas fa-pen-to-square" />
            <span>답변 작성</span>
          </div>
          <textarea
            className="aiq-reply-textarea"
            rows={5}
            placeholder="환자 또는 관계자에게 답변을 입력하세요..."
            value={replyText}
            onChange={e => setReplyText(e.target.value)}
          />
          <div className="aiq-reply-footer">
            <span className="aiq-char-count">{replyText.length} / 1000</span>
            <div className="aiq-reply-btns">
              <button className="aiq-btn-outline sm" onClick={() => setReplyText("")}>
                <i className="fas fa-rotate-left" />초기화
              </button>
              <button
                className={`aiq-btn-primary sm ${!replyText.trim() ? "disabled" : ""}`}
                onClick={onReply}
                disabled={!replyText.trim()}
              >
                <i className="fas fa-paper-plane" />답변 등록
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminInquiryPage;
