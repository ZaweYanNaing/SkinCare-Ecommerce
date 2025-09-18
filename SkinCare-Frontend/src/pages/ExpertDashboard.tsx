import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, User, CheckCircle2, LogOut } from 'lucide-react';
import { toast } from 'react-toastify';

interface Expert {
  ExpertID: number;
  Name: string;
  Email: string;
  Specialization: string;
}

interface Message {
  MessageID: number;
  ConversationID: number;
  SenderType: 'customer' | 'expert';
  SenderID: number;
  MessageText: string;
  MessageType: 'text' | 'image';
  IsRead: number;
  SentAt: string;
  SenderName: string;
  SenderAvatar?: string;
}

interface Conversation {
  ConversationID: number;
  CustomerID: number;
  ExpertID: number | null;
  Status: 'waiting' | 'active' | 'closed';
  CustomerName?: string;
  UnreadCount: number;
  UpdatedAt: string;
}

const ExpertDashboard = () => {
  const [expert, setExpert] = useState<Expert | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Check if expert is already logged in
    const savedExpert = localStorage.getItem('expert');
    if (savedExpert) {
      setExpert(JSON.parse(savedExpert));
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn && expert) {
      loadConversations();
      startConversationPolling();
    }
    return () => stopPolling();
  }, [isLoggedIn, expert]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (activeConversation) {
      loadMessages();
      startMessagePolling();
    } else {
      stopPolling();
    }
  }, [activeConversation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const startConversationPolling = () => {
    const interval = setInterval(() => {
      if (expert) {
        loadConversations();
      }
    }, 5000);
    return () => clearInterval(interval);
  };

  const startMessagePolling = () => {
    stopPolling();
    pollIntervalRef.current = setInterval(() => {
      if (activeConversation) {
        loadMessages(true);
      }
    }, 2000);
  };

  const stopPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Attempting login with:', loginForm);
      
      const response = await fetch('http://localhost/chat/experts.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);
      
      if (data.success) {
        setExpert(data.data);
        setIsLoggedIn(true);
        localStorage.setItem('expert', JSON.stringify(data.data));
        toast.success('Login successful!');
      } else {
        toast.error(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed - please check your connection');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setExpert(null);
    setIsLoggedIn(false);
    setConversations([]);
    setActiveConversation(null);
    setMessages([]);
    localStorage.removeItem('expert');
    stopPolling();
  };

  const loadConversations = async () => {
    if (!expert) return;

    try {
      const response = await fetch(`http://localhost/chat/conversations.php?expertID=${expert.ExpertID}`);
      const data = await response.json();
      if (data.success) {
        setConversations(data.data);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const loadMessages = async (isPolling = false) => {
    if (!activeConversation) return;

    try {
      const lastMessageID = isPolling && messages.length > 0 ? messages[messages.length - 1].MessageID : 0;
      const response = await fetch(`http://localhost/chat/messages.php?conversationID=${activeConversation.ConversationID}&lastMessageID=${lastMessageID}`);
      const data = await response.json();
      
      if (data.success) {
        if (isPolling && data.data.length > 0) {
          // Only add new messages that don't already exist
          setMessages(prev => {
            const existingIds = new Set(prev.map(msg => msg.MessageID));
            const newMessages = data.data.filter(msg => !existingIds.has(msg.MessageID));
            return newMessages.length > 0 ? [...prev, ...newMessages] : prev;
          });
          markMessagesAsRead();
        } else if (!isPolling) {
          setMessages(data.data);
          markMessagesAsRead();
        }
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const markMessagesAsRead = async () => {
    if (!activeConversation) return;

    try {
      await fetch('http://localhost/chat/messages.php', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationID: activeConversation.ConversationID,
          senderType: 'expert'
        })
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const acceptConversation = async (conversationID: number) => {
    if (!expert) return;

    try {
      const response = await fetch('http://localhost/chat/conversations.php', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationID,
          expertID: expert.ExpertID,
          status: 'active'
        })
      });

      const data = await response.json();
      if (data.success) {
        loadConversations();
        toast.success('Conversation accepted!');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Failed to accept conversation');
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeConversation || !expert) return;

    try {
      const response = await fetch('http://localhost/chat/messages.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationID: activeConversation.ConversationID,
          senderType: 'expert',
          senderID: expert.ExpertID,
          messageText: newMessage.trim()
        })
      });

      const data = await response.json();
      if (data.success) {
        // Check if message already exists before adding
        setMessages(prev => {
          const messageExists = prev.some(msg => msg.MessageID === data.data.MessageID);
          return messageExists ? prev : [...prev, data.data];
        });
        setNewMessage('');
        loadConversations();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-8">
            <MessageCircle className="mx-auto h-12 w-12 text-blue-600 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900">Expert Login</h2>
            <p className="text-gray-600">Sign in to your expert dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                required
                value={loginForm.email}
                onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="expert@skincare.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                required
                value={loginForm.password}
                onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            <p>Demo credentials:</p>
            <p>Email: sarah@skincare.com</p>
            <p>Password: hello</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{expert?.Name}</h3>
                  <p className="text-sm text-gray-500">{expert?.Specialization}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="text-gray-500 hover:text-gray-700"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <h4 className="font-medium text-gray-900 mb-3">Conversations</h4>
              <div className="space-y-2">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.ConversationID}
                    onClick={() => setActiveConversation(conversation)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      activeConversation?.ConversationID === conversation.ConversationID
                        ? 'bg-blue-50 border border-blue-200'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h5 className="font-medium text-gray-900">
                        {conversation.CustomerName || 'Customer'}
                      </h5>
                      {conversation.UnreadCount > 0 && (
                        <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                          {conversation.UnreadCount}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        conversation.Status === 'waiting' ? 'bg-yellow-100 text-yellow-800' :
                        conversation.Status === 'active' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {conversation.Status}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(conversation.UpdatedAt).toLocaleDateString()}
                      </span>
                    </div>
                    {conversation.Status === 'waiting' && !conversation.ExpertID && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          acceptConversation(conversation.ConversationID);
                        }}
                        className="mt-2 w-full bg-blue-600 text-white text-xs py-1 px-2 rounded hover:bg-blue-700"
                      >
                        Accept
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {activeConversation ? (
            <>
              {/* Chat Header */}
              <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {activeConversation.CustomerName || 'Customer'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Conversation #{activeConversation.ConversationID}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    activeConversation.Status === 'active' ? 'bg-green-500' : 
                    activeConversation.Status === 'waiting' ? 'bg-yellow-500' : 'bg-gray-500'
                  }`} />
                  <span className="text-sm text-gray-500 capitalize">{activeConversation.Status}</span>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.MessageID}
                    className={`flex ${message.SenderType === 'expert' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.SenderType === 'expert'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-900'
                    }`}>
                      <p className="text-sm">{message.MessageText}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs opacity-75">{formatTime(message.SentAt)}</span>
                        {message.SenderType === 'expert' && (
                          <CheckCircle2 className={`w-3 h-3 ${message.IsRead ? 'text-blue-200' : 'text-blue-400'}`} />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="border-t p-4">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Type your message..."
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
                <p className="text-gray-500">Choose a conversation from the sidebar to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpertDashboard;