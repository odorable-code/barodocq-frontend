// src/components/AuthLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import Logo from "../components/Logo";
import "../assets/styles/AuthLayout.css";

export default function AuthLayout() {
  return (
    <div className="auth-layout">

      {/* ── 로고만 있는 심플 헤더 ── */}
      <header className="auth-header">
        <Logo size="md" to="/" />
      </header>

      {/* ── 페이지 본문 ── */}
      <main className="auth-body">
        <Outlet />
      </main>

    </div>
  );
}
