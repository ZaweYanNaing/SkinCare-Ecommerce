import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, User, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-toastify';

interface Expert {
  ExpertID: number;
  Name: string;
  Specialization: string;
  Bio: string;
  Avatar: string | null;
  Status: 'active' | 'busy' | 'offline';
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
  ExpertName?: string;
  Specialization?: string;
  ExpertAvatar?: string;
  UnreadCount: number;
  UpdatedAt: string;
}

const Consult = () => {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'experts' | 'chat'>('experts');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Get current user from localStorage
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const customerID = currentUser.id;

  useEffect(() => {
    if (customerID) {
      loadExperts();
      loadConversations();
    }
  }, [customerID]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (activeConversation) {
      loadMessages();
      startPolling();
    } else {
      stopPolling();
    }

    return () => stopPolling();
  }, [activeConversation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const startPolling = () => {
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

  const loadExperts = async () => {
    try {
      const response = await fetch('http://localhost/chat/experts.php');
      const data = await response.json();
      if (data.success) {
        setExperts(data.data);
      }
    } catch (error) {
      console.error('Error loading experts:', error);
    }
  };

  const loadConversations = async () => {
    try {
      const response = await fetch(`http://localhost/chat/conversations.php?customerID=${customerID}`);
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
          setMessages(prev => [...prev, ...data.data]);
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
          senderType: 'customer'
        })
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const startConversation = async (expertID?: number) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost/chat/conversations.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerID,
          expertID
        })
      });

      const data = await response.json();
      if (data.success) {
        await loadConversations();
        const conversation = conversations.find(c => c.ConversationID === data.data.conversationID);
        if (conversation) {
          setActiveConversation(conversation);
          setView('chat');
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Failed to start conversation');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeConversation) return;

    try {
      const response = await fetch('http://localhost/chat/messages.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationID: activeConversation.ConversationID,
          senderType: 'customer',
          senderID: customerID,
          messageText: newMessage.trim()
        })
      });

      const data = await response.json();
      if (data.success) {
        setMessages(prev => [...prev, data.data]);
        setNewMessage('');
        loadConversations(); // Update conversation list
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

  if (!customerID) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <MessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Please Sign In</h2>
          <p className="text-gray-600">You need to be signed in to consult with our experts.</p>
        </div>
      </div>
    );
  }

  if (view === 'chat' && activeConversation) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto bg-white shadow-lg">
          {/* Chat Header */}
          <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setView('experts')}
                className="text-gray-500 hover:text-gray-700"
              >
                ←
              </button>
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                {activeConversation.ExpertAvatar ? (
                  <img src={activeConversation.ExpertAvatar} alt="" className="w-10 h-10 rounded-full" />
                ) : (
                  <User className="w-5 h-5 text-blue-600" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {activeConversation.ExpertName || 'Waiting for Expert'}
                </h3>
                <p className="text-sm text-gray-500">
                  {activeConversation.Specialization || 'General Consultation'}
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
          <div className="h-96 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.MessageID}
                className={`flex ${message.SenderType === 'customer' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.SenderType === 'customer'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-900'
                }`}>
                  <p className="text-sm">{message.MessageText}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs opacity-75">{formatTime(message.SentAt)}</span>
                    {message.SenderType === 'customer' && (
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
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Skincare Consultation</h1>
          <p className="text-gray-600">Get expert advice from our certified skincare specialists</p>
        </div>

        {/* My Conversations */}
        {conversations.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">My Conversations</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {conversations.map((conversation) => (
                <div
                  key={conversation.ConversationID}
                  onClick={() => {
                    setActiveConversation(conversation);
                    setView('chat');
                  }}
                  className="bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        {conversation.ExpertName || 'Waiting for Expert'}
                      </h3>
                      <p className="text-sm text-gray-500">{conversation.Specialization}</p>
                    </div>
                    {conversation.UnreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                        {conversation.UnreadCount}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span className="capitalize">{conversation.Status}</span>
                    <span>{new Date(conversation.UpdatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Available Experts */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Experts</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {experts.map((expert) => (
              <div key={expert.ExpertID} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    {expert.Avatar ? (
                      <img src={expert.Avatar} alt={expert.Name} className="w-16 h-16 rounded-full" />
                    ) : (
                      <User className="w-8 h-8 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{expert.Name}</h3>
                    <p className="text-sm text-blue-600">{expert.Specialization}</p>
                    <div className="flex items-center space-x-1 mt-1">
                      <div className={`w-2 h-2 rounded-full ${
                        expert.Status === 'active' ? 'bg-green-500' : 
                        expert.Status === 'busy' ? 'bg-yellow-500' : 'bg-gray-500'
                      }`} />
                      <span className="text-xs text-gray-500 capitalize">{expert.Status}</span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-4">{expert.Bio}</p>
                <button
                  onClick={() => startConversation(expert.ExpertID)}
                  disabled={loading || expert.Status !== 'active'}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {expert.Status === 'active' ? 'Start Consultation' : 'Currently Unavailable'}
                </button>
              </div>
            ))}
          </div>

          {/* Quick Consultation Button */}
          <div className="mt-8 text-center">
            <button
              onClick={() => startConversation()}
              disabled={loading}
              className="bg-green-600 text-white py-3 px-8 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Starting...' : 'Quick Consultation (Any Available Expert)'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Consult;