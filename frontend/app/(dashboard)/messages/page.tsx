'use client';
import { useEffect, useState, useRef } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Send, Hash } from 'lucide-react';
import { io, Socket } from 'socket.io-client';

interface Message {
  id: number; sender_id: number; sender_email: string;
  content: string; created_at: string; channel_id?: number;
}
interface Channel { id: number; name: string; description: string; }

export default function MessagesPage() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
  const [newMsg, setNewMsg] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem('hrms_user');
    if (stored) setUser(JSON.parse(stored));
    loadChannels();

    const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
    const skt = io(SOCKET_URL, { transports: ['websocket'] });
    setSocket(skt);

    skt.on('new_message', (data: any) => {
      setMessages(prev => [...prev, {
        id: Date.now(), sender_id: data.sender_id || 0,
        sender_email: data.sender || 'Unknown',
        content: data.content, created_at: new Date().toISOString()
      }]);
    });

    return () => { skt.disconnect(); };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadChannels = async () => {
    try {
      const { data } = await api.get('/chat/channels');
      setChannels(data.data);
      if (data.data.length > 0) selectChannel(data.data[0]);
    } catch {
      const mockChannels = [
        { id: 1, name: 'general', description: 'General discussion' },
        { id: 2, name: 'hr-team', description: 'HR Team updates' },
        { id: 3, name: 'announcements', description: 'Company announcements' },
      ];
      setChannels(mockChannels);
      selectChannel(mockChannels[0]);
    }
  };

  const selectChannel = (channel: Channel) => {
    setActiveChannel(channel);
    if (socket) {
      socket.emit('join', { room: channel.name });
    }
    setMessages([
      { id: 1, sender_id: 1, sender_email: 'admin@xceltech.com', content: `Welcome to #${channel.name}!`, created_at: new Date().toISOString() },
      { id: 2, sender_id: 2, sender_email: 'john@company.com', content: 'Hello everyone!', created_at: new Date().toISOString() },
    ]);
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsg.trim() || !activeChannel) return;
    const msgData = { room: activeChannel.name, content: newMsg, sender: user?.email };
    socket?.emit('send_message', msgData);
    // Also persist via API
    api.post('/chat/messages', { channel_id: activeChannel.id, content: newMsg }).catch(() => {});
    setNewMsg('');
  };

  return (
    <div className="h-[calc(100vh-140px)] flex rounded-xl overflow-hidden border border-gray-200 bg-white">
      {/* Sidebar - Channels */}
      <div className="w-64 flex-shrink-0 border-r border-gray-200" style={{ background: '#0f1b2d' }}>
        <div className="p-4 border-b border-white/10">
          <h3 className="text-white font-semibold text-sm">Messages</h3>
          <p className="text-xs text-blue-300 mt-0.5">Real-time chat</p>
        </div>
        <div className="p-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-400 px-2 mb-2">Channels</p>
          {channels.map(ch => (
            <button key={ch.id} onClick={() => selectChannel(ch)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm mb-1 transition ${
                activeChannel?.id === ch.id ? 'bg-yellow-400 text-blue-900 font-semibold' : 'text-blue-200 hover:bg-white/10'
              }`}>
              <Hash size={14} /> #{ch.name}
            </button>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {/* Channel header */}
        {activeChannel && (
          <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
            <Hash size={16} className="text-gray-400" />
            <span className="font-semibold text-gray-800">{activeChannel.name}</span>
            <span className="text-sm text-gray-400">· {activeChannel.description}</span>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map(m => {
            const isMe = m.sender_email === user?.email;
            return (
              <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md ${isMe ? 'order-2' : ''}`}>
                  {!isMe && <p className="text-xs text-gray-400 mb-1">{m.sender_email}</p>}
                  <div className={`px-4 py-2 rounded-2xl text-sm ${
                    isMe ? 'text-white rounded-br-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                  }`}
                  style={isMe ? { background: '#1e3a5f' } : {}}>
                    {m.content}
                  </div>
                  <p className="text-[10px] text-gray-400 mt-0.5">{new Date(m.created_at).toLocaleTimeString()}</p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={sendMessage} className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <input
              value={newMsg}
              onChange={e => setNewMsg(e.target.value)}
              placeholder={`Message #${activeChannel?.name || 'general'}...`}
              className="flex-1 form-input"
            />
            <button type="submit" className="btn-primary px-4 py-2">
              <Send size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
