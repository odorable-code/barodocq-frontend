import React, { useEffect, useState } from "react";
import { useAuth } from "../AuthContext";
import { authFetch } from "../utils/AuthFetch";

export default function MyReservations() {
  const { user } = useAuth();
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    if (!user) return;

    const fetchReservations = async () => {
      try {
        const res = await authFetch(`/api/v1/reservations/${user.num}`);
        const data = await res.json();
        setReservations(data);
      } catch (err) {
        console.error("예약 불러오기 실패", err);
      }
    };

    fetchReservations();
  }, [user]);

  return (
    <div className="reservation-panel">
      <h3>내 예약</h3>
      {reservations.length === 0 ? (
        <p>예약 내역이 없습니다.</p>
      ) : (
        <ul>
          {reservations.map((r) => (
            <li key={r.reservationId}>
              <div>{r.hospitalName}</div>
              <div>{r.date} {r.time}</div>
              <div>{r.status}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}