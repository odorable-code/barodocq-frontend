import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext';

function HospitalAdminLogin() {
  const navigate = useNavigate();
  const { getMeAndSetUser } = useAuth();
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:8080/api/v1/auth/admin/login', { // ✅ 8080 확인
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',   // ✅ 필수
        body: JSON.stringify({ userId: id, userPw: pw }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error('관리자 로그인 실패:', res.status, errorText);
        alert('아이디 또는 비밀번호가 올바르지 않습니다.');
        return;
      }

      const data = await res.json();
      localStorage.setItem('accessToken', data.accessToken);
      await getMeAndSetUser();
      navigate('/admin/dashboard');
    } catch (err) {
      console.error('관리자 로그인 오류:', err);
      alert('로그인 중 오류가 발생했습니다.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#f8fafc' }}>
      <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', width: '340px' }}>
        <h2 style={{ marginBottom: '24px', color: '#1e3a5f', textAlign: 'center', fontSize: '20px' }}>
          🏥 병원 관리자 로그인
        </h2>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input
            type="text"
            placeholder="관리자 아이디"
            value={id}
            onChange={(e) => setId(e.target.value)}
            style={{ padding: '12px', fontSize: '14px', border: '1px solid #e2e8f0', borderRadius: '8px', outline: 'none' }}
          />
          <input
            type="password"
            placeholder="비밀번호"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            style={{ padding: '12px', fontSize: '14px', border: '1px solid #e2e8f0', borderRadius: '8px', outline: 'none' }}
          />
          <button
            type="submit"
            style={{ padding: '12px', backgroundColor: '#1e3a5f', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '8px', fontSize: '15px', marginTop: '4px' }}
          >
            로그인
          </button>
        </form>
        <p style={{ marginTop: '16px', fontSize: '13px', color: '#666', textAlign: 'center' }}>
          계정이 없으신가요? <a href="/admin/signup" style={{ color: '#2563eb' }}>병원 관리자 회원가입</a>
        </p>
        <p style={{ marginTop: '8px', fontSize: '13px', color: '#666', textAlign: 'center' }}>
          환자이신가요? <a href="/login" style={{ color: '#2563eb' }}>환자 로그인</a>
        </p>
      </div>
    </div>
  );
}

export default HospitalAdminLogin;
