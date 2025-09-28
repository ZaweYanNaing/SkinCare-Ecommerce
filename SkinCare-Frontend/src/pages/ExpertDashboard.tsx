import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, User, CheckCircle2, LogOut, Settings } from 'lucide-react';
import { toast } from 'react-toastify';

interface Expert {
  ExpertID: number;
  Name: string;
  Email: string;
  Specialization: string;
  Bio?: string;
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
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    specialization: '',
    bio: '',
    status: 'active' as 'active' | 'busy' | 'offline',
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isLoggingOutRef = useRef(false);

  // Mobile detection
  useEffect(() => {
    const checkIsMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setIsMobileSidebarOpen(false);
      }
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Close mobile sidebar when conversation changes
  useEffect(() => {
    if (isMobile && activeConversation) {
      setIsMobileSidebarOpen(false);
    }
  }, [activeConversation, isMobile]);

  useEffect(() => {
    // Check if expert is already logged in
    const savedExpert = localStorage.getItem('expert');
    if (savedExpert) {
      const expertData = JSON.parse(savedExpert);
      setExpert(expertData);
      setIsLoggedIn(true);
      // Initialize profile form with expert data
      setProfileForm({
        name: expertData.Name || '',
        email: expertData.Email || '',
        specialization: expertData.Specialization || '',
        bio: expertData.Bio || '',
        status: expertData.Status || 'active',
      });
      // Set expert status to active when logging in
      setExpertStatus(expertData.ExpertID, expertData.Status || 'active');
    }

    // Add beforeunload event listener - only set offline if actually logging out
    const handleBeforeUnload = () => {
      // Only set offline if we're actually logging out, not just refreshing
      if (isLoggingOutRef.current) {
        const currentExpert = localStorage.getItem('expert');
        if (currentExpert) {
          const expertData = JSON.parse(currentExpert);
          const data = JSON.stringify({
            expertID: expertData.ExpertID,
            status: 'offline',
          });
          navigator.sendBeacon('http://localhost/chat/expert-status.php', data);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      stopHeartbeat();
    };
  }, []);

  useEffect(() => {
    if (isLoggedIn && expert) {
      loadConversations();
      startConversationPolling();
      startHeartbeat(); // Start heartbeat to keep expert active
    }
    return () => {
      stopPolling();
      stopHeartbeat();
    };
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

  const startHeartbeat = () => {
    stopHeartbeat();
    // Send heartbeat every 2 minutes to keep expert status active
    heartbeatIntervalRef.current = setInterval(() => {
      sendHeartbeat();
    }, 120000); // 2 minutes
  };

  const stopHeartbeat = () => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  };

  const sendHeartbeat = async () => {
    if (!expert) return;

    try {
      // Send heartbeat with current status (don't override if busy)
      const currentStatus = expert.Status === 'busy' ? 'busy' : 'active';
      await fetch('http://localhost/chat/expert-status.php', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expertID: expert.ExpertID,
          status: currentStatus,
        }),
      });
    } catch (error) {
      console.error('Error sending heartbeat:', error);
    }
  };

  const setExpertStatus = async (expertID: number, status: string) => {
    try {
      await fetch('http://localhost/chat/expert-status.php', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expertID,
          status,
        }),
      });
    } catch (error) {
      console.error('Error setting expert status:', error);
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
        body: JSON.stringify(loginForm),
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (data.success) {
        const expertData = { ...data.data, Status: 'active' };
        setExpert(expertData);
        setIsLoggedIn(true);
        localStorage.setItem('expert', JSON.stringify(expertData));
        // Initialize profile form
        setProfileForm({
          name: expertData.Name || '',
          email: expertData.Email || '',
          specialization: expertData.Specialization || '',
          bio: expertData.Bio || '',
          status: 'active',
        });
        // Set expert status to active upon successful login
        await setExpertStatus(expertData.ExpertID, 'active');
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

  const handleLogout = async () => {
    // Set the flag to indicate we're logging out
    isLoggingOutRef.current = true;

    if (expert) {
      try {
        // Update expert status to offline in the database
        await setExpertStatus(expert.ExpertID, 'offline');
      } catch (error) {
        console.error('Error updating expert status:', error);
      }
    }

    // Stop heartbeat and polling
    stopHeartbeat();
    stopPolling();

    // Clear state and localStorage
    setExpert(null);
    setIsLoggedIn(false);
    setConversations([]);
    setActiveConversation(null);
    setMessages([]);
    localStorage.removeItem('expert');

    toast.success('Logged out successfully');
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
      const response = await fetch(
        `http://localhost/chat/messages.php?conversationID=${activeConversation.ConversationID}&lastMessageID=${lastMessageID}`,
      );
      const data = await response.json();

      if (data.success) {
        if (isPolling && data.data.length > 0) {
          // Only add new messages that don't already exist
          setMessages((prev) => {
            const existingIds = new Set(prev.map((msg) => msg.MessageID));
            const newMessages = data.data.filter((msg: { MessageID: number }) => !existingIds.has(msg.MessageID));
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
          senderType: 'expert',
        }),
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
          status: 'active',
        }),
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
          messageText: newMessage.trim(),
        }),
      });

      const data = await response.json();
      if (data.success) {
        // Check if message already exists before adding
        setMessages((prev) => {
          const messageExists = prev.some((msg) => msg.MessageID === data.data.MessageID);
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

  const handleStatusChange = async (newStatus: 'active' | 'busy') => {
    if (!expert) return;

    try {
      await setExpertStatus(expert.ExpertID, newStatus);
      const updatedExpert = { ...expert, Status: newStatus };
      setExpert(updatedExpert);
      setProfileForm((prev) => ({ ...prev, status: newStatus }));
      localStorage.setItem('expert', JSON.stringify(updatedExpert));
      toast.success(`Status updated to ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const openProfileModal = async () => {
    if (expert) {
      // Refresh expert data to get latest Bio
      try {
        const response = await fetch(`http://localhost/chat/expert-profile.php?expertID=${expert.ExpertID}`);
        const data = await response.json();
        if (data.success) {
          const updatedExpert = { ...expert, ...data.data };
          setExpert(updatedExpert);
          localStorage.setItem('expert', JSON.stringify(updatedExpert));
          setProfileForm({
            name: updatedExpert.Name || '',
            email: updatedExpert.Email || '',
            specialization: updatedExpert.Specialization || '',
            bio: updatedExpert.Bio || '',
            status: updatedExpert.Status || 'active',
          });
        } else {
          // Fallback to current expert data
          setProfileForm({
            name: expert.Name || '',
            email: expert.Email || '',
            specialization: expert.Specialization || '',
            bio: expert.Bio || '',
            status: expert.Status || 'active',
          });
        }
      } catch (error) {
        console.error('Error fetching expert profile:', error);
        // Fallback to current expert data
        setProfileForm({
          name: expert.Name || '',
          email: expert.Email || '',
          specialization: expert.Specialization || '',
          bio: expert.Bio || '',
          status: expert.Status || 'active',
        });
      }
    }
    setShowProfileModal(true);
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expert) return;

    setLoading(true);
    try {
      const response = await fetch('http://localhost/chat/expert-profile.php', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expertID: expert.ExpertID,
          name: profileForm.name,
          email: profileForm.email,
          specialization: profileForm.specialization,
          bio: profileForm.bio,
          status: profileForm.status,
        }),
      });

      const data = await response.json();
      if (data.success) {
        const updatedExpert = {
          ...expert,
          Name: profileForm.name,
          Email: profileForm.email,
          Specialization: profileForm.specialization,
          Bio: profileForm.bio,
          Status: profileForm.status,
        };
        setExpert(updatedExpert);
        localStorage.setItem('expert', JSON.stringify(updatedExpert));
        setShowProfileModal(false);
        toast.success('Profile updated successfully!');
      } else {
        toast.error(data.message || 'Failed to update profile');
      }
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 sm:p-8">
          <div className="text-center mb-6 sm:mb-8">
            <MessageCircle className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-blue-600 mb-4" />
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Expert Login</h2>
            <p className="text-gray-600 text-sm sm:text-base">Sign in to your expert dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 sm:space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                required
                value={loginForm.email}
                onChange={(e) => setLoginForm((prev) => ({ ...prev, email: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                placeholder="expert@skincare.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                required
                value={loginForm.password}
                onChange={(e) => setLoginForm((prev) => ({ ...prev, password: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-4 sm:mt-6 text-center text-xs sm:text-sm text-gray-600">
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
      {/* Mobile Overlay */}
      {isMobile && isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      <div className="flex h-screen">
        {/* Sidebar */}
        <div className={`
          ${isMobile ? 'fixed top-0 left-0 h-full z-50' : 'relative'} 
          ${isMobile && !isMobileSidebarOpen ? '-translate-x-full' : 'translate-x-0'}
          w-80 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300
        `}>
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
                  <div className="flex items-center space-x-1 mt-1">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        expert?.Status === 'active' ? 'bg-green-500' : expert?.Status === 'busy' ? 'bg-yellow-500' : 'bg-gray-500'
                      }`}
                    ></div>
                    <span
                      className={`text-xs font-medium capitalize ${
                        expert?.Status === 'active' ? 'text-green-600' : expert?.Status === 'busy' ? 'text-yellow-600' : 'text-gray-600'
                      }`}
                    >
                      {expert?.Status || 'offline'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={openProfileModal}
                  className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100"
                  title="Edit Profile"
                >
                  <Settings className="w-4 h-4" />
                </button>
                <button onClick={handleLogout} className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100" title="Logout">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Status Selector */}
            <div className="mt-3">
              <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
              <select
                value={expert?.Status || 'active'}
                onChange={(e) => handleStatusChange(e.target.value as 'active' | 'busy')}
                className="w-full text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="active">🟢 Available</option>
                <option value="busy">🟡 Busy</option>
              </select>
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
                      activeConversation?.ConversationID === conversation.ConversationID ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h5 className="font-medium text-gray-900">{conversation.CustomerName || 'Customer'}</h5>
                      {conversation.UnreadCount > 0 && (
                        <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">{conversation.UnreadCount}</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          conversation.Status === 'waiting'
                            ? 'bg-yellow-100 text-yellow-800'
                            : conversation.Status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {conversation.Status}
                      </span>
                      <span className="text-xs text-gray-500">{new Date(conversation.UpdatedAt).toLocaleDateString()}</span>
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
                    <h3 className="font-semibold text-gray-900">{activeConversation.CustomerName || 'Customer'}</h3>
                    <p className="text-sm text-gray-500">Conversation #{activeConversation.ConversationID}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      activeConversation.Status === 'active'
                        ? 'bg-green-500'
                        : activeConversation.Status === 'waiting'
                          ? 'bg-yellow-500'
                          : 'bg-gray-500'
                    }`}
                  />
                  <span className="text-sm text-gray-500 capitalize">{activeConversation.Status}</span>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((message) => (
                  <div key={message.MessageID} className={`flex ${message.SenderType === 'expert' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.SenderType === 'expert' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-900'
                      }`}
                    >
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

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Edit Profile</h3>
              <button onClick={() => setShowProfileModal(false)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleProfileUpdate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={profileForm.name}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={profileForm.email}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, email: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                <input
                  type="text"
                  required
                  value={profileForm.specialization}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, specialization: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Dermatology, Anti-aging, Acne Treatment"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, bio: e.target.value }))}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tell customers about your expertise and experience..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={profileForm.status}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, status: e.target.value as 'active' | 'busy' }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">🟢 Available</option>
                  <option value="busy">🟡 Busy</option>
                </select>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpertDashboard;
