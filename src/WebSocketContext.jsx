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

const API = "http://localhost:8080";
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

  // ─── 헬퍼 ────────────────────────────────────────────────────
  // const isAdmin       = (u) => u?.role === "ADMIN";
  // 밑에거 안되면 위에거로!
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
  const createRoom = async ({ hospitalId, hospitalName, dept, avatar }) => {
    if (!user || isAdmin(user)) return null;
    try {
      const res = await fetch(`${API}/api/chat/rooms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: user.num,
          hospitalId,
          hospitalName,
          dept,
          avatar,
        }),
      });
      if (!res.ok) return null;
      const room = await res.json();
      setChatRooms((prev) => [room, ...prev]);
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
          console.log("[DEBUG] 🔔 알람 수신!", frame.body);
          const msg = JSON.parse(frame.body);

          // 현재 열려있는 방이면 무시 (이미 room 구독이 처리)
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

    // 메시지 기록 로드
    if (!messages[roomId]) fetchMessages(roomId);

    // ✅ 백엔드 읽음 처리
    const reader = isAdmin(user) ? "hospital" : "user";
    fetch(`${API}/api/chat/rooms/${roomId}/read?reader=${reader}`, {
      method: "PUT",
    }).catch((e) => console.warn("읽음 처리 실패:", e));

    // room 구독
    subscriptionRef.current = stompRef.current.subscribe(
      `/topic/room.${roomId}`,
      (frame) => {
        const msg = JSON.parse(frame.body);

        // 메시지 추가
        setMessages((prev) => ({
          ...prev,
          [roomId]: [...(prev[roomId] || []), msg],
        }));

        // lastMsg 업데이트 + unread = 0 유지 (보고 있는 방이므로)
        setChatRooms((prev) =>
          prev.map((r) =>
            r.id === roomId
              ? { ...r, lastMsg: msg.text, lastTime: msg.createdAt, unread: 0 }
              : r,
          ),
        );

        // 상대방 메시지에만 알림음
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

    // ✅ 방 진입 시 프론트 unread 초기화 (구독 콜백 밖 — 딱 1번만)
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
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext) || {};
