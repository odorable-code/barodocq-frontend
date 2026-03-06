import React, { useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faBell, faCalendarCheck, faCircleQuestion } from "@fortawesome/free-solid-svg-icons";

const Modal = ({ isOpen, onClose, title, size = "md", children, icon }) => {
  const overlayRef = useRef(null);

  // 아이콘 매핑 (문자열로 전달될 경우 대비)
  const getIcon = (iconName) => {
    switch(iconName) {
      case 'bell': return faBell;
      case 'calendar-check': return faCalendarCheck;
      case 'circle-question': return faCircleQuestion;
      default: return faBell;
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className={`mp-modal-overlay open`} 
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      style={{
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
        backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
        justifyContent: 'center', zIndex: 9999
      }}
    >
      <div className={`mp-modal mp-modal-${size}`} style={{
        backgroundColor: '#fff', borderRadius: '12px', width: size === 'md' ? '500px' : '400px',
        maxWidth: '90%', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
      }}>
        <div className="mp-modal-header" style={{
          padding: '1.25rem', borderBottom: '1px solid #eee', display: 'flex', 
          alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {icon && <FontAwesomeIcon icon={getIcon(icon)} style={{ color: '#10b981' }} />}
            <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 'bold' }}>{title}</h2>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>
        <div className="mp-modal-body" style={{ padding: '1.25rem' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;