import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useAuth } from "./AuthContext";
import UseNotification from "./hooks/UseNotification";

const API = "http://3.38.49.151:8080";
export const SocketContext = createContext(null);

export function WebSocketProvider({ children }) {
  const { user } = useAuth();
  const { playNotifSound, showBrowserNotif, setTabTitle } = UseNotification();

  const stompRef = useRef(null);
  const subscriptionRef = useRef(null);
  const alarmSubRef = useRef(null);
  const activeChatRoomRef = useRef(null);
  const chatRef = useRef(null);
  const chatEndRef = useRef(null);

  const [connected, setConnected] = useState(false);
  const [chatRooms, setChatRooms] = useState([]);
  const [activeChatRoom, setActiveChatRoom] = useState(null);
  const [messages, setMessages] = useState({});
  const [notifOpen, setNotifOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // ✅ 시스템 알림 상태를 Context로 끌어올림 (실시간 반영을 위해)
  const [sysNotifications, setSysNotifications] = useState([]);

  // ─── 헬퍼 ────────────────────────────────────────────────────
  const isAdmin = (u) => u?.role?.toUpperCase() === "ADMIN";

  const getRoomsUrl = (u) =>
    isAdmin(u)
      ? `${API}/api/chat/rooms/hospital/${u.hoNum}`
      : `${API}/api/chat/rooms/${u.num}`;
  const getAlarmChannel = (u) =>
    isAdmin(u) ? `/topic/alarm.hospital_${u.hoNum}` : `/topic/alarm.${u.num}`;
  const getSenderFrom = (u) => (isAdmin(u) ? `hospital_${u.hoNum}` : "user");

  // ─── REST: 채팅방 목록 ────────────────────────────────────────
  const fetchRooms = async (u) => {
    if (!u) return;
    try {
      const token = localStorage.getItem("accessToken");

      const res = await fetch(getRoomsUrl(u), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) return;
      const rooms = await res.json();
      console.log("[DEBUG] fetchRooms rooms:", rooms);
      setChatRooms(rooms);
      const total = rooms.reduce((s, r) => s + (r.unread || 0), 0);
      setTabTitle(total);
    } catch (e) {
      console.error("fetchRooms 오류:", e);
    }
  };

  // ─── REST: 메시지 기록 ────────────────────────────────────────
  const fetchMessages = async (roomId) => {
    try {
      const res = await fetch(`${API}/api/chat/rooms/${roomId}/messages`);
      if (!res.ok) return;
      const msgs = await res.json();
      setMessages((prev) => ({ ...prev, [roomId]: msgs }));
    } catch (e) {
      console.error("fetchMessages 오류:", e);
    }
  };

  // ─── REST: 채팅방 생성 (환자만) ──────────────────────────────
  const createRoom = async ({ hospitalId, hospitalName, dept }) => {
    if (!user || isAdmin(user)) return null;

    try {
      const firstChar = hospitalName?.trim()?.charAt(0) || "?";

      const res = await fetch(`${API}/api/chat/rooms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: user.num,
          hospitalId,
          hospitalName,
          dept,
          avatar: firstChar,
        }),
      });

      if (!res.ok) return null;
      const room = await res.json();

      setChatRooms((prev) => {
        const exists = prev.find((r) => r.id === room.id);
        if (exists) {
          return [room, ...prev.filter((r) => r.id !== room.id)];
        }
        return [room, ...prev];
      });

      return room;
    } catch (e) {
      console.error("createRoom 오류:", e);
      return null;
    }
  };

  // ─── STOMP: 메시지 전송 ───────────────────────────────────────
  const sendMessage = (text) => {
    if (!stompRef.current?.connected || !activeChatRoom || !text.trim()) return;
    stompRef.current.publish({
      destination: "/app/chat.send",
      body: JSON.stringify({
        roomId: activeChatRoom.id,
        from: getSenderFrom(user),
        senderName: user?.name || user?.id || "사용자",
        text: text.trim(),
      }),
    });
  };

  // ─── useEffect: 유저 변경 → 방 목록 로드 ─────────────────────
  useEffect(() => {
    if (!user) {
      setChatRooms([]);
      setMessages({});
      setActiveChatRoom(null);
      setConnected(false);
      setTabTitle(0);
      setSysNotifications([]); // 유저 로그아웃 시 알림도 초기화
      return;
    }
    fetchRooms(user);
  }, [user]);

  // ─── useEffect: STOMP 연결 ────────────────────────────────────
  useEffect(() => {
    if (!user) return;

    const token = localStorage.getItem("accessToken");
    const client = new Client({
      webSocketFactory: () => new SockJS(`${API}/ws-chat`),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,

      onConnect: () => {
        setConnected(true);
        console.log(
          "✅ STOMP 연결됨 - role:",
          user.role,
          "| hoNum:",
          user.hoNum,
        );

        const alarmChannel = getAlarmChannel(user);
        console.log("[DEBUG] 알람 구독 채널:", alarmChannel);

        alarmSubRef.current = client.subscribe(alarmChannel, (frame) => {
          const msg = JSON.parse(frame.body);

          // 🚨 [핵심 수정] 1. 시스템 알림인지 구분 (ntFinalContent 필드가 있으면 시스템 알림)
          if (msg.ntFinalContent || msg.ntNum) {
            console.log("[DEBUG] 🚨 시스템 알림 수신!", msg);
            playNotifSound();
            showBrowserNotif("바로닥큐 알림", msg.ntFinalContent);

            // 기존 알림 배열 맨 앞에 새 알림 끼워넣기 (실시간 반영)
            setSysNotifications((prev) => [msg, ...prev]);
            return; // 시스템 알림 처리가 끝났으므로 여기서 함수 종료!
          }

          // 💬 2. 기존 채팅 알림 처리 (roomId가 있는 경우)
          console.log("[DEBUG] 🔔 채팅 알림 수신!", msg);
          if (msg.roomId === activeChatRoomRef.current?.id) return;

          playNotifSound();
          showBrowserNotif(
            "새 메시지",
            msg.text || "새 메시지가 도착했습니다.",
          );

          setChatRooms((prev) => {
            const updated = prev.map((r) =>
              r.id === msg.roomId
                ? {
                    ...r,
                    lastMsg: msg.text,
                    lastTime: msg.createdAt,
                    unread: (r.unread || 0) + 1,
                  }
                : r,
            );
            setTabTitle(updated.reduce((s, r) => s + (r.unread || 0), 0));
            return updated;
          });
        });
      },

      onStompError: (frame) => console.error("STOMP 오류:", frame),
      onDisconnect: () => setConnected(false),
    });

    client.activate();
    stompRef.current = client;

    return () => {
      alarmSubRef.current?.unsubscribe();
      client.deactivate();
      setConnected(false);
    };
  }, [user]);

  // ─── useEffect: 활성 채팅방 변경 → 구독 전환 ────────────────
  useEffect(() => {
    activeChatRoomRef.current = activeChatRoom;

    subscriptionRef.current?.unsubscribe();
    subscriptionRef.current = null;

    if (!activeChatRoom || !stompRef.current?.connected) return;

    const roomId = activeChatRoom.id;

    if (!messages[roomId]) fetchMessages(roomId);

    const reader = isAdmin(user) ? "hospital" : "user";
    fetch(`${API}/api/chat/rooms/${roomId}/read?reader=${reader}`, {
      method: "PUT",
    }).catch((e) => console.warn("읽음 처리 실패:", e));

    subscriptionRef.current = stompRef.current.subscribe(
      `/topic/room.${roomId}`,
      (frame) => {
        const msg = JSON.parse(frame.body);

        setMessages((prev) => ({
          ...prev,
          [roomId]: [...(prev[roomId] || []), msg],
        }));

        setChatRooms((prev) =>
          prev.map((r) =>
            r.id === roomId
              ? { ...r, lastMsg: msg.text, lastTime: msg.createdAt, unread: 0 }
              : r,
          ),
        );

        const isOpponent = isAdmin(user)
          ? !msg.from?.startsWith("hospital")
          : msg.from !== "user";
        if (isOpponent) playNotifSound();

        setTimeout(
          () => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }),
          50,
        );
      },
    );

    setChatRooms((prev) => {
      const updated = prev.map((r) =>
        r.id === roomId ? { ...r, unread: 0 } : r,
      );
      setTabTitle(updated.reduce((s, r) => s + (r.unread || 0), 0));
      return updated;
    });
  }, [activeChatRoom]);

  // ─── 자동 스크롤 ─────────────────────────────────────────────
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const totalUnread = chatRooms.reduce((s, r) => s + (r.unread || 0), 0);

  return (
    <SocketContext.Provider
      value={{
        connected,
        chatRooms,
        setChatRooms,
        activeChatRoom,
        setActiveChatRoom,
        messages,
        sendMessage,
        createRoom,
        totalUnread,
        notifOpen,
        setNotifOpen,
        chatRef,
        chatEndRef,
        isAdmin: isAdmin(user),
        isChatOpen,
        setIsChatOpen,
        sysNotifications,      // ✅ 새로 추가: Header가 갖다 쓸 수 있도록 배포
        setSysNotifications,   // ✅ 새로 추가
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext) || {};