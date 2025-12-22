import { useState, useEffect, useRef } from 'react';
import { Message, Match } from '../App';
import { ArrowLeft, Send, MapPin } from 'lucide-react';
import { ProfileModal } from './ProfileModal';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface ChatProps {
  matchId: string;
  onBack: () => void;
}

export function Chat({ matchId, onBack }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [match, setMatch] = useState<Match | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [userMessageCount, setUserMessageCount] = useState(10);
  const [matchMessageCount, setMatchMessageCount] = useState(10);
  const [currentStage, setCurrentStage] = useState('Знакомство');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUserId = 'user-1';

  useEffect(() => {
    // Mock match data
    const mockMatch: Match = {
      id: matchId,
      name: 'Анна',
      age: 28,
      distance: 5,
      photo: undefined,
      isOnline: true,
    };

    // Mock messages
    const mockMessages: Message[] = [
      {
        id: 'msg-1',
        text: 'Привет! Как дела?',
        senderId: matchId,
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
      },
      {
        id: 'msg-2',
        text: 'Привет! Всё отлично, спасибо! А у тебя?',
        senderId: currentUserId,
        timestamp: new Date(Date.now() - 1000 * 60 * 25),
      },
      {
        id: 'msg-3',
        text: 'Тоже хорошо! Чем занимаешься на выходных?',
        senderId: matchId,
        timestamp: new Date(Date.now() - 1000 * 60 * 20),
      },
      {
        id: 'msg-4',
        text: 'Планирую сходить в кино, а потом погулять в парке. Может составишь компанию?',
        senderId: currentUserId,
        timestamp: new Date(Date.now() - 1000 * 60 * 15),
      },
      {
        id: 'msg-5',
        text: 'Звучит здорово! С удовольствием!',
        senderId: matchId,
        timestamp: new Date(Date.now() - 1000 * 60 * 10),
      },
    ];

    setMatch(mockMatch);
    setMessages(mockMessages);

    // Initialize counters based on existing messages
    const userMsgCount = mockMessages.filter(m => m.senderId === currentUserId).length;
    const matchMsgCount = mockMessages.filter(m => m.senderId === matchId).length;
    setUserMessageCount(10 - userMsgCount);
    setMatchMessageCount(10 - matchMsgCount);

    // Simulate real-time online status updates
    const interval = setInterval(() => {
      setMatch(prev => prev ? { ...prev, isOnline: Math.random() > 0.3 } : null);
    }, 10000);

    return () => clearInterval(interval);
  }, [matchId]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || userMessageCount <= 0) return;

    const message: Message = {
      id: `msg-${Date.now()}`,
      text: newMessage,
      senderId: currentUserId,
      timestamp: new Date(),
    };

    setMessages([...messages, message]);
    setNewMessage('');
    setUserMessageCount(prev => prev - 1);

    // Simulate response
    if (matchMessageCount > 0) {
      setTimeout(() => {
        const response: Message = {
          id: `msg-${Date.now()}`,
          text: 'Отличная идея!',
          senderId: matchId,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, response]);
        setMatchMessageCount(prev => prev - 1);
      }, 2000);
    }
  };

  const formatMessageTime = (date: Date) => {
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  if (!match) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-xl border-b border-emerald-100 px-4 py-3 flex items-center gap-3 shadow-sm">
        <button
          onClick={onBack}
          className="p-2 hover:bg-emerald-100 rounded-full transition-all duration-300"
        >
          <ArrowLeft className="w-5 h-5 text-emerald-600" />
        </button>

        <button
          onClick={() => setShowProfileModal(true)}
          className="flex items-center gap-3 flex-1 min-w-0 hover:bg-emerald-50 rounded-xl p-2 -m-2 transition-all duration-300"
        >
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            {match.photo ? (
              <ImageWithFallback
                src={match.photo}
                alt={match.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-400 flex items-center justify-center">
                <span className="text-white">
                  {match.name.charAt(0)}
                </span>
              </div>
            )}
            
            {/* Online indicator */}
            {match.isOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
            )}
          </div>

          {/* Name and status */}
          <div className="text-left flex-1">
            <div className="flex items-center gap-2">
              <p className="text-gray-900">{match.name}</p>
              <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                {currentStage}
              </span>
            </div>
            <p className="text-xs text-gray-500">
              {match.isOnline ? 'Online' : 'Offline'}
            </p>
          </div>
        </button>

        {/* Message counters */}
        <div className="flex flex-col items-end gap-0.5">
          <div className="flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-full">
            <div className="w-2 h-2 rounded-full bg-emerald-600"></div>
            <span className={`text-xs ${userMessageCount <= 3 ? 'text-red-600 font-semibold' : 'text-emerald-700'}`}>
              {userMessageCount}
            </span>
          </div>
          <div className="flex items-center gap-1.5 bg-teal-50 px-2.5 py-1 rounded-full">
            <div className="w-2 h-2 rounded-full bg-teal-600"></div>
            <span className={`text-xs ${matchMessageCount <= 3 ? 'text-red-600 font-semibold' : 'text-teal-700'}`}>
              {matchMessageCount}
            </span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {messages.map((message) => {
            const isOwn = message.senderId === currentUserId;
            
            return (
              <div
                key={message.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-2 max-w-[75%] md:max-w-[60%] ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Avatar for other person */}
                  {!isOwn && (
                    <div className="flex-shrink-0">
                      {match.photo ? (
                        <ImageWithFallback
                          src={match.photo}
                          alt={match.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-400 flex items-center justify-center">
                          <span className="text-white text-sm">
                            {match.name.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Message bubble */}
                  <div>
                    <div
                      className={`rounded-3xl px-4 py-2.5 ${
                        isOwn
                          ? 'bg-gradient-to-br from-emerald-600 to-teal-600 text-white rounded-br-lg shadow-md'
                          : 'bg-white/80 backdrop-blur-sm text-gray-900 rounded-bl-lg shadow-sm border border-emerald-100'
                      }`}
                    >
                      <p>{message.text}</p>
                    </div>
                    <p className={`text-xs text-gray-400 mt-1 px-1 ${isOwn ? 'text-right' : 'text-left'}`}>
                      {formatMessageTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />

          {/* Intuition stage button */}
          {(userMessageCount <= 0 || matchMessageCount <= 0) && (
            <div className="flex justify-center mt-6 mb-4">
              <button
                className="px-6 py-3 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 text-white rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 animate-pulse"
              >
                Перейти на этап "Интуиция"
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <form
        onSubmit={handleSendMessage}
        className="bg-white/70 backdrop-blur-xl border-t border-emerald-100 p-4"
      >
        <div className="flex gap-2 max-w-2xl mx-auto">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={userMessageCount <= 0 ? "Лимит сообщений исчерпан" : "Введите сообщение..."}
            disabled={userMessageCount <= 0}
            className={`flex-1 px-5 py-3 bg-white/80 border border-emerald-100 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 ${
              userMessageCount <= 0 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || userMessageCount <= 0}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 ${
              newMessage.trim() && userMessageCount > 0
                ? 'bg-gradient-to-br from-emerald-600 to-teal-600 hover:shadow-xl hover:shadow-emerald-500/30 text-white hover:scale-105'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>

      {/* Profile Modal */}
      {showProfileModal && (
        <ProfileModal match={match} onClose={() => setShowProfileModal(false)} />
      )}
    </div>
  );
}