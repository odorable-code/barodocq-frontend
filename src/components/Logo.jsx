// src/components/Logo.jsx
import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart } from "@fortawesome/free-solid-svg-icons";
import "../assets/styles/Logo.css";

/**
 * size: "sm" | "md" (기본값)
 * to: 링크 경로 (기본값 "/")
 */
export default function Logo({ size = "md", to = "/" }) {
  return (
    <Link to={to} className={`logo logo--${size}`} aria-label="홈으로">
      <span className="logo__icon">
        <FontAwesomeIcon icon={faHeart} />
      </span>
      <span className="logo__text">
        바로닥큐<span className="logo__plus">+</span>
      </span>
    </Link>
  );
}
