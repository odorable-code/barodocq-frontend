import React from 'react';
import '../assets/styles/ChatList.css';

const chatData = [
  { id: 1, name: '00병원', message: '예..?', date: '12월 23일', type: 'system' },
  { id: 2, name: '00병원', message: '예..?', date: '12월 22일', type: 'ad' },
  { id: 3, name: '00병원', message: '예..?', date: '12월 21일', type: 'bank' },
  { id: 4, name: '00병원', message: '예..?', date: '12월 19일', type: 'group' },
  { id: 5, name: '00병원', message: '예..?', date: '12월 13일', type: 'friend' },

];

const ChatList = () => {
  return (
    <div className="chatListContainer">
      <div className="chat-list-wrapper">

        {/* 상단 배너 */}
        <div className="top-banner">
          <div className="banner-content">
            <strong style={{fontSize: '28px'}}>내 채팅목록</strong>
          </div>
        </div>

        {/* 채팅 목록 */}
        <div className="chat-list">
          {chatData.map((chat) => (
            <div key={chat.id} className="chat-item">
              <div className={`profile-img ${chat.type}`}>
                {chat.name.substring(0, 1)}
              </div>
              <div className="chat-info">
                <div className="chatListHeader">
                  <span className="chat-name">{chat.name}</span>
                  <span className="chat-date">{chat.date}</span>
                </div>
                <div className="chat-last-msg">{chat.message}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChatList;