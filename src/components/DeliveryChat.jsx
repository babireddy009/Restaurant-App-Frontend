import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Phone, User, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { playNotificationSound } from '../utils/audio';
import toast from 'react-hot-toast';

export default function DeliveryChat({ orderId, driverName, driverPhone, onClose }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Scroll to bottom whenever messages update
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
    const wsDomain = new URL(apiUrl).host; // Extracts e.g., 'localhost:8000' or 'api.render.com'
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProtocol}//${wsDomain}/ws/chat/order/${orderId}/?token=${token}`;
    
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('Connected to chat');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'history') {
        setMessages(data.messages);
      } else if (data.type === 'new_message') {
        setMessages(prev => [...prev, data]);
        
        let rolePart = data.sender;
        let namePart = data.sender;
        if (data.sender.includes('|')) {
          const parts = data.sender.split('|');
          namePart = parts[0];
          rolePart = parts[1];
        }

        let myRole = 'customer';
        if (user?.role === 'staff' || user?.role === 'admin') myRole = 'staff';
        if (user?.role === 'driver') myRole = 'driver';

        if (rolePart !== myRole) {
          playNotificationSound();
          toast.success(`New message from ${namePart}`, { icon: '💬' });
        }
      }
    };

    ws.onerror = (err) => {
      console.error('WebSocket error:', err);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, [orderId]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !socket) return;

    let senderRole = 'customer';
    if (user?.role === 'staff' || user?.role === 'admin') senderRole = 'staff';
    if (user?.role === 'driver') senderRole = 'driver';

    socket.send(JSON.stringify({
      message: inputText,
      sender: senderRole
    }));
    setInputText('');
  };

  return (
    <div className="delivery-chat-container">
      {/* Header */}
      <div style={{
        padding: '16px',
        backgroundColor: 'var(--clr-surface-2)',
        borderBottom: '1px solid var(--clr-border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--clr-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <User size={20} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>{driverName || 'Delivery Partner'}</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--clr-success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '6px', height: '6px', backgroundColor: 'var(--clr-success)', borderRadius: '50%', display: 'inline-block' }}></span>
              Online
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {driverPhone && (
            <a href={`tel:${driverPhone}`} className="btn btn-sm" style={{ padding: '8px', background: 'rgba(6, 214, 160, 0.1)', color: '#06d6a0', border: 'none' }}>
              <Phone size={16} />
            </a>
          )}
          <button onClick={onClose} className="btn btn-sm" style={{ padding: '8px', background: 'transparent', color: 'var(--clr-text-muted)' }}>
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <div style={{ textAlign: 'center', margin: '10px 0' }}>
          <span style={{ fontSize: '0.75rem', backgroundColor: 'var(--clr-surface-3)', padding: '4px 10px', borderRadius: '12px', color: 'var(--clr-text-faint)' }}>
            Chat started
          </span>
        </div>
        {messages.map((msg, idx) => {
          let senderRole = 'customer';
          if (user?.role === 'staff' || user?.role === 'admin') senderRole = 'staff';
          if (user?.role === 'driver') senderRole = 'driver';

          let rolePart = msg.sender;
          let namePart = msg.sender;

          if (msg.sender.includes('|')) {
            const parts = msg.sender.split('|');
            namePart = parts[0];
            rolePart = parts[1];
          } else {
            namePart = rolePart.charAt(0).toUpperCase() + rolePart.slice(1);
          }

          const isMe = rolePart === senderRole;
          const senderLabel = isMe ? 'Me' : namePart;

          return (
            <div key={idx} style={{
              alignSelf: isMe ? 'flex-end' : 'flex-start',
              backgroundColor: isMe ? 'var(--clr-primary)' : 'var(--clr-surface-3)',
              color: isMe ? '#fff' : 'var(--clr-text)',
              padding: '10px 14px',
              borderRadius: '16px',
              borderBottomRightRadius: isMe ? '4px' : '16px',
              borderBottomLeftRadius: !isMe ? '4px' : '16px',
              maxWidth: '85%',
              fontSize: '0.9rem',
              lineHeight: 1.4
            }}>
              {!isMe && <div style={{ fontSize: '0.7rem', fontWeight: 800, marginBottom: '4px', opacity: 0.8 }}>{senderLabel}</div>}
              {msg.message}
              <div style={{ fontSize: '0.65rem', textAlign: 'right', marginTop: '4px', opacity: 0.7 }}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={sendMessage} style={{
        padding: '12px',
        borderTop: '1px solid var(--clr-border)',
        display: 'flex',
        gap: '10px',
        backgroundColor: 'var(--clr-surface-2)'
      }}>
        <input 
          type="text" 
          placeholder="Type a message..." 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          style={{
            flex: 1,
            backgroundColor: 'var(--clr-bg)',
            border: '1px solid var(--clr-border)',
            borderRadius: '20px',
            padding: '10px 16px',
            color: 'var(--clr-text)',
            outline: 'none'
          }}
        />
        <button 
          type="submit" 
          disabled={!inputText.trim() || !socket}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: 'var(--clr-primary)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            cursor: inputText.trim() ? 'pointer' : 'not-allowed',
            opacity: inputText.trim() ? 1 : 0.5
          }}
        >
          <Send size={18} />
        </button>
      </form>
      <style>{`
        .delivery-chat-container {
          position: fixed;
          bottom: 20px;
          right: 20px;
          width: 350px;
          height: 500px;
          max-height: 80vh;
          background-color: var(--clr-surface);
          border-radius: var(--radius-lg);
          box-shadow: 0 10px 40px rgba(0,0,0,0.5);
          display: flex;
          flex-direction: column;
          z-index: 1000;
          border: 1px solid var(--clr-border);
          overflow: hidden;
          animation: slideUp 0.3s ease-out forwards;
        }

        @media (max-width: 600px) {
          .delivery-chat-container {
            bottom: 0;
            right: 0;
            left: 0;
            width: 100%;
            height: 85vh;
            max-height: 85vh;
            border-radius: var(--radius-lg) var(--radius-lg) 0 0;
            border-bottom: none;
            border-left: none;
            border-right: none;
          }
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(50px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
