import React, {
  createContext, useContext, useEffect, useRef, useState,
} from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from './AuthContext';
import UseNotification from './hooks/UseNotification';

const API = 'http://localhost:8080';
export const SocketContext = createContext(null);

export function WebSocketProvider({ children }) {
  const { user } = useAuth();
  const { playNotifSound, showBrowserNotif, setTabTitle } = UseNotification();

  const stompRef          = useRef(null);
  const subscriptionRef   = useRef(null);
  const alarmSubRef       = useRef(null);
  const activeChatRoomRef = useRef(null);
  const chatRef           = useRef(null);
  const chatEndRef        = useRef(null);

  const [connected,      setConnected]      = useState(false);
  const [chatRooms,      setChatRooms]      = useState([]);
  const [activeChatRoom, setActiveChatRoom] = useState(null);
  const [messages,       setMessages]       = useState({});
  const [notifOpen,      setNotifOpen]      = useState(false);

  // ─── 헬퍼: 관리자 여부 ───────────────────────────────────────
  const isAdmin = (u) => u?.role === 'ADMIN';

  // ─── 헬퍼: 채팅방 목록 API URL ───────────────────────────────
  const getRoomsUrl = (u) => {
    if (isAdmin(u)) {
      return `${API}/api/chat/rooms/hospital/${u.hoNum}`;  // 병원 기준
    }
    return `${API}/api/chat/rooms/${u.num}`;               // 환자 기준
  };

  // ─── 헬퍼: 알람 채널 ─────────────────────────────────────────
  const getAlarmChannel = (u) => {
    if (isAdmin(u)) {
      return `/topic/alarm.hospital_${u.hoNum}`;  // 병원 알람 채널
    }
    return `/topic/alarm.${u.num}`;               // 환자 알람 채널
  };

  // ─── 헬퍼: 메시지 from 값 ────────────────────────────────────
  const getSenderFrom = (u) => {
    if (isAdmin(u)) return `hospital_${u.hoNum}`;
    return 'user';
  };

  // ─── REST: 채팅방 목록 ────────────────────────────────────────
  const fetchRooms = async (u) => {
    if (!u) return;
    try {
      const res = await fetch(getRoomsUrl(u));
      if (!res.ok) return;
      const rooms = await res.json();
      setChatRooms(rooms);
      const total = rooms.reduce((s, r) => s + (r.unread || 0), 0);
      setTabTitle(total);
    } catch (e) {
      console.error('fetchRooms 오류:', e);
    }
  };

  // ─── REST: 메시지 기록 ────────────────────────────────────────
  const fetchMessages = async (roomId) => {
    try {
      const res = await fetch(`${API}/api/chat/rooms/${roomId}/messages`);
      if (!res.ok) return;
      const msgs = await res.json();
      setMessages(prev => ({ ...prev, [roomId]: msgs }));
    } catch (e) {
      console.error('fetchMessages 오류:', e);
    }
  };

  // ─── REST: 채팅방 생성 (환자만 생성 가능) ────────────────────
  const createRoom = async ({ hospitalId, hospitalName, dept, avatar }) => {
    if (!user || isAdmin(user)) return null;
    try {
      const res = await fetch(`${API}/api/chat/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: user.num,
          hospitalId, hospitalName, dept, avatar,
        }),
      });
      if (!res.ok) return null;
      const room = await res.json();
      setChatRooms(prev => [room, ...prev]);
      return room;
    } catch (e) {
      console.error('createRoom 오류:', e);
      return null;
    }
  };

  // ─── STOMP: 메시지 전송 ───────────────────────────────────────
  const sendMessage = (text) => {
    if (!stompRef.current?.connected || !activeChatRoom || !text.trim()) return;
    stompRef.current.publish({
      destination: '/app/chat.send',
      body: JSON.stringify({
        roomId:     activeChatRoom.id,
        from:       getSenderFrom(user),         // ✅ 관리자/환자 구분
        senderName: user?.name || user?.id || '사용자',
        text:       text.trim(),
      }),
    });
  };

  // ─── useEffect: 유저 변경 시 → 즉시 방 목록 REST 로드 ────────
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

    const token = localStorage.getItem('accessToken');

    const client = new Client({
      webSocketFactory: () => new SockJS(`${API}/ws-chat`),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,

      onConnect: () => {
      console.log('✅ STOMP 연결됨 - role:', user.role);
      setConnected(true);
      // ✅ fetchRooms 제거 → user useEffect에서 이미 로드함

        // ✅ 관리자/환자 구분하여 알람 채널 구독
        const alarmChannel = getAlarmChannel(user);
        console.log('알람 구독:', alarmChannel);

        alarmSubRef.current = client.subscribe(alarmChannel, (frame) => {
          const msg = JSON.parse(frame.body);
          if (msg.roomId === activeChatRoomRef.current?.id) return;

          playNotifSound();
          showBrowserNotif('새 메시지', msg.text || '새 메시지가 도착했습니다.');

          setChatRooms(prev => {
            const updated = prev.map(r =>
              r.id === msg.roomId
                ? { ...r, lastMsg: msg.text, lastTime: msg.createdAt, unread: (r.unread || 0) + 1 }
                : r
            );
            const total = updated.reduce((s, r) => s + (r.unread || 0), 0);
            setTabTitle(total);
            return updated;
          });
        });
      },

      onStompError: (frame) => console.error('STOMP 오류:', frame),
      onDisconnect: ()      => setConnected(false),
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

    subscriptionRef.current = stompRef.current.subscribe(
      `/topic/room.${roomId}`,
      (frame) => {
        const msg = JSON.parse(frame.body);
        setMessages(prev => ({
          ...prev,
          [roomId]: [...(prev[roomId] || []), msg],
        }));
        setChatRooms(prev =>
          prev.map(r =>
            r.id === roomId
              ? { ...r, lastMsg: msg.text, lastTime: msg.createdAt, unread: 0 }
              : r
          )
        );
        // 상대방 메시지만 알림음
        if (isAdmin(user) ? !msg.from?.startsWith('hospital') : msg.from !== 'user') {
          playNotifSound();
        }
        setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
      }
    );

    // 방 진입 시 unread 초기화
    setChatRooms(prev => {
      const updated = prev.map(r => r.id === roomId ? { ...r, unread: 0 } : r);
      setTabTitle(updated.reduce((s, r) => s + (r.unread || 0), 0));
      return updated;
    });
  }, [activeChatRoom]);

  // ─── 자동 스크롤 ─────────────────────────────────────────────
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const totalUnread = chatRooms.reduce((s, r) => s + (r.unread || 0), 0);

  return (
    <SocketContext.Provider value={{
      connected,
      chatRooms,      setChatRooms,
      activeChatRoom, setActiveChatRoom,
      messages,
      sendMessage,
      createRoom,
      totalUnread,
      notifOpen,      setNotifOpen,
      chatRef,        chatEndRef,
      isAdmin:        isAdmin(user),   // ✅ 컴포넌트에서 관리자 여부 접근 가능
    }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext) || {};
